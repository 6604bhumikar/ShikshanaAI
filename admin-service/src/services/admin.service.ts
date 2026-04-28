import axios from "axios";
import { ExternalCourse, ExternalPayment, ExternalUser } from "../models/dashboard.model";
import { ModerationLog } from "../models/moderation.model";
import { Settings } from "../models/settings.model";
import { Payout } from "../models/payout.model";
import { Community } from "../models/community.model";

const CONTENT_SERVICE_URL = process.env.CONTENT_SERVICE_URL || "http://localhost:5002";

export const updateCourseStatus = async (
  courseId: string,
  status: "published" | "rejected",
  adminId: string,
  reason?: string
) => {
  const response = await axios.patch(
    `${CONTENT_SERVICE_URL}/internal/courses/${courseId}/status`,
    { status }
  );

  await ModerationLog.create({
    courseId,
    action: status === "published" ? "approved" : "rejected",
    performedBy: adminId,
    reason,
  });

  return response.data;
};

export const getDashboardStats = async () => {
  const [totalUsers, totalCourses, pendingApprovals, revenueResult, payments, logs, recentCourses] =
    await Promise.all([
      ExternalUser.countDocuments(),
      ExternalCourse.countDocuments(),
      ExternalCourse.countDocuments({ status: "review" }),
      ExternalPayment.aggregate([
        { $match: { status: { $in: ["success", "paid"] } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      ExternalPayment.find({ status: { $in: ["success", "paid"] } })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      ModerationLog.find().sort({ createdAt: -1 }).limit(5).lean(),
      ExternalCourse.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

  const monthBuckets = Array.from({ length: 6 }, (_, index) => {
    const monthDate = new Date();
    monthDate.setDate(1);
    monthDate.setMonth(monthDate.getMonth() - (5 - index));

    return {
      year: monthDate.getFullYear(),
      month: monthDate.getMonth(),
      total: 0,
    };
  });

  const monthMap = new Map(
    monthBuckets.map((bucket) => [`${bucket.year}-${bucket.month}`, bucket])
  );

  payments.forEach((payment: any) => {
    const createdAt = payment.createdAt ? new Date(payment.createdAt) : null;
    if (!createdAt) return;

    const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
    const bucket = monthMap.get(key);
    if (bucket) {
      bucket.total += Number(payment.amount || 0);
    }
  });

  const recentActivities = [
    ...logs.map((log: any) => ({
      type: "course",
      description: `Course ${log.action} by admin`,
      timestamp: log.createdAt,
    })),
    ...payments.map((payment: any) => ({
      type: "payment",
      description: `Payment received for course ${payment.courseId}`,
      timestamp: payment.createdAt,
    })),
    ...recentCourses.map((course: any) => ({
      type: "course",
      description: `Course submitted: ${course.title}`,
      timestamp: course.createdAt,
    })),
  ]
    .filter((activity) => activity.timestamp)
    .sort(
      (a, b) =>
        new Date(String(b.timestamp)).getTime() - new Date(String(a.timestamp)).getTime()
    )
    .slice(0, 8);

  return {
    totalUsers,
    totalCourses,
    pendingApprovals,
    pendingCommunities: await Community.countDocuments({ status: "pending" }),
    revenue: revenueResult[0]?.total || 0,
    monthlyRevenue: monthBuckets.map((bucket) => bucket.total),
    recentActivities,
  };
};

export const getCoursesForModeration = async (status = "review") => {
  const courses = await ExternalCourse.find({ status }).sort({ createdAt: -1 }).lean();

  const teacherIds = Array.from(
    new Set(courses.map((course: any) => String(course.teacherId)).filter(Boolean))
  );

  const teachers = teacherIds.length
    ? await ExternalUser.find({ _id: { $in: teacherIds } }).lean()
    : [];

  const teacherMap = new Map(teachers.map((teacher: any) => [String(teacher._id), teacher]));

  return courses.map((course: any) => ({
    ...course,
    teacher: teacherMap.get(String(course.teacherId))
      ? {
          name: teacherMap.get(String(course.teacherId)).name,
          email: teacherMap.get(String(course.teacherId)).email,
        }
      : null,
    totalLessons: (course.units || []).reduce(
      (sum: number, unit: any) => sum + ((unit?.lessons || []).length || 0),
      0
    ),
  }));
};

export const listUsersService = async () => {
  const users = await ExternalUser.find().sort({ createdAt: -1 }).lean();
  return users;
};

export const updateUserStatusService = async (userId: string, isBlocked: boolean) => {
  const user = await ExternalUser.findByIdAndUpdate(
    userId,
    { isBlocked },
    { new: true }
  ).lean();

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const verifyUserService = async (userId: string) => {
  const user = await ExternalUser.findByIdAndUpdate(
    userId,
    { isVerified: true },
    { new: true }
  ).lean();

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const softDeleteUserService = async (userId: string) => {
  const user = await ExternalUser.findByIdAndDelete(userId).lean();
  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const getSettingsService = async () => {
  let settings = await Settings.findOne().lean();
  if (!settings) {
    settings = (await Settings.create({})).toObject();
  }

  return settings;
};

export const updateSettingsService = async (payload: any) => {
  const settings = await Settings.findOneAndUpdate({}, payload, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  }).lean();

  return settings;
};

export const listPayoutsService = async () => {
  const payouts = await Payout.find().sort({ createdAt: -1 }).lean();
  const teacherIds = Array.from(new Set(payouts.map((payout: any) => payout.teacherId)));
  const teachers = teacherIds.length
    ? await ExternalUser.find({ _id: { $in: teacherIds } }).lean()
    : [];
  const teacherMap = new Map(teachers.map((teacher: any) => [String(teacher._id), teacher]));

  return payouts.map((payout: any) => ({
    ...payout,
    teacher: teacherMap.get(String(payout.teacherId)) || null,
  }));
};

export const updatePayoutStatusService = async (payoutId: string, status: string) => {
  const payout = await Payout.findByIdAndUpdate(payoutId, { status }, { new: true }).lean();
  if (!payout) {
    throw new Error("Payout not found");
  }

  return payout;
};

export const listPendingCommunitiesService = async () => {
  const communities = await Community.find({ status: "pending" }).sort({ createdAt: -1 }).lean();
  const teacherIds = Array.from(new Set(communities.map((community: any) => community.teacherId)));
  const teachers = teacherIds.length
    ? await ExternalUser.find({ _id: { $in: teacherIds } }).lean()
    : [];
  const teacherMap = new Map(teachers.map((teacher: any) => [String(teacher._id), teacher]));

  return communities.map((community: any) => ({
    ...community,
    teacher: teacherMap.get(String(community.teacherId))
      ? {
          name: teacherMap.get(String(community.teacherId)).name,
          email: teacherMap.get(String(community.teacherId)).email,
        }
      : null,
  }));
};

export const approveCommunityService = async (communityId: string) => {
  const community = await Community.findByIdAndUpdate(
    communityId,
    { status: "approved" },
    { new: true }
  ).lean();

  if (!community) {
    throw new Error("Community not found");
  }

  return community;
};

export const rejectCommunityService = async (communityId: string) => {
  const community = await Community.findByIdAndUpdate(
    communityId,
    { status: "rejected" },
    { new: true }
  ).lean();

  if (!community) {
    throw new Error("Community not found");
  }

  return community;
};
