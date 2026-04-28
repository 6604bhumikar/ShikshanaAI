"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectCommunityService = exports.approveCommunityService = exports.listPendingCommunitiesService = exports.updatePayoutStatusService = exports.listPayoutsService = exports.updateSettingsService = exports.getSettingsService = exports.softDeleteUserService = exports.verifyUserService = exports.updateUserStatusService = exports.listUsersService = exports.getCoursesForModeration = exports.getDashboardStats = exports.updateCourseStatus = void 0;
const axios_1 = __importDefault(require("axios"));
const dashboard_model_1 = require("../models/dashboard.model");
const moderation_model_1 = require("../models/moderation.model");
const settings_model_1 = require("../models/settings.model");
const payout_model_1 = require("../models/payout.model");
const community_model_1 = require("../models/community.model");
const CONTENT_SERVICE_URL = process.env.CONTENT_SERVICE_URL || "http://localhost:5002";
const updateCourseStatus = async (courseId, status, adminId, reason) => {
    const response = await axios_1.default.patch(`${CONTENT_SERVICE_URL}/internal/courses/${courseId}/status`, { status });
    await moderation_model_1.ModerationLog.create({
        courseId,
        action: status === "published" ? "approved" : "rejected",
        performedBy: adminId,
        reason,
    });
    return response.data;
};
exports.updateCourseStatus = updateCourseStatus;
const getDashboardStats = async () => {
    const [totalUsers, totalCourses, pendingApprovals, revenueResult, payments, logs, recentCourses] = await Promise.all([
        dashboard_model_1.ExternalUser.countDocuments(),
        dashboard_model_1.ExternalCourse.countDocuments(),
        dashboard_model_1.ExternalCourse.countDocuments({ status: "review" }),
        dashboard_model_1.ExternalPayment.aggregate([
            { $match: { status: { $in: ["success", "paid"] } } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        dashboard_model_1.ExternalPayment.find({ status: { $in: ["success", "paid"] } })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),
        moderation_model_1.ModerationLog.find().sort({ createdAt: -1 }).limit(5).lean(),
        dashboard_model_1.ExternalCourse.find().sort({ createdAt: -1 }).limit(5).lean(),
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
    const monthMap = new Map(monthBuckets.map((bucket) => [`${bucket.year}-${bucket.month}`, bucket]));
    payments.forEach((payment) => {
        const createdAt = payment.createdAt ? new Date(payment.createdAt) : null;
        if (!createdAt)
            return;
        const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
        const bucket = monthMap.get(key);
        if (bucket) {
            bucket.total += Number(payment.amount || 0);
        }
    });
    const recentActivities = [
        ...logs.map((log) => ({
            type: "course",
            description: `Course ${log.action} by admin`,
            timestamp: log.createdAt,
        })),
        ...payments.map((payment) => ({
            type: "payment",
            description: `Payment received for course ${payment.courseId}`,
            timestamp: payment.createdAt,
        })),
        ...recentCourses.map((course) => ({
            type: "course",
            description: `Course submitted: ${course.title}`,
            timestamp: course.createdAt,
        })),
    ]
        .filter((activity) => activity.timestamp)
        .sort((a, b) => new Date(String(b.timestamp)).getTime() - new Date(String(a.timestamp)).getTime())
        .slice(0, 8);
    return {
        totalUsers,
        totalCourses,
        pendingApprovals,
        pendingCommunities: await community_model_1.Community.countDocuments({ status: "pending" }),
        revenue: revenueResult[0]?.total || 0,
        monthlyRevenue: monthBuckets.map((bucket) => bucket.total),
        recentActivities,
    };
};
exports.getDashboardStats = getDashboardStats;
const getCoursesForModeration = async (status = "review") => {
    const courses = await dashboard_model_1.ExternalCourse.find({ status }).sort({ createdAt: -1 }).lean();
    const teacherIds = Array.from(new Set(courses.map((course) => String(course.teacherId)).filter(Boolean)));
    const teachers = teacherIds.length
        ? await dashboard_model_1.ExternalUser.find({ _id: { $in: teacherIds } }).lean()
        : [];
    const teacherMap = new Map(teachers.map((teacher) => [String(teacher._id), teacher]));
    return courses.map((course) => ({
        ...course,
        teacher: teacherMap.get(String(course.teacherId))
            ? {
                name: teacherMap.get(String(course.teacherId)).name,
                email: teacherMap.get(String(course.teacherId)).email,
            }
            : null,
        totalLessons: (course.units || []).reduce((sum, unit) => sum + ((unit?.lessons || []).length || 0), 0),
    }));
};
exports.getCoursesForModeration = getCoursesForModeration;
const listUsersService = async () => {
    const users = await dashboard_model_1.ExternalUser.find().sort({ createdAt: -1 }).lean();
    return users;
};
exports.listUsersService = listUsersService;
const updateUserStatusService = async (userId, isBlocked) => {
    const user = await dashboard_model_1.ExternalUser.findByIdAndUpdate(userId, { isBlocked }, { new: true }).lean();
    if (!user) {
        throw new Error("User not found");
    }
    return user;
};
exports.updateUserStatusService = updateUserStatusService;
const verifyUserService = async (userId) => {
    const user = await dashboard_model_1.ExternalUser.findByIdAndUpdate(userId, { isVerified: true }, { new: true }).lean();
    if (!user) {
        throw new Error("User not found");
    }
    return user;
};
exports.verifyUserService = verifyUserService;
const softDeleteUserService = async (userId) => {
    const user = await dashboard_model_1.ExternalUser.findByIdAndDelete(userId).lean();
    if (!user) {
        throw new Error("User not found");
    }
    return user;
};
exports.softDeleteUserService = softDeleteUserService;
const getSettingsService = async () => {
    let settings = await settings_model_1.Settings.findOne().lean();
    if (!settings) {
        settings = (await settings_model_1.Settings.create({})).toObject();
    }
    return settings;
};
exports.getSettingsService = getSettingsService;
const updateSettingsService = async (payload) => {
    const settings = await settings_model_1.Settings.findOneAndUpdate({}, payload, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
    }).lean();
    return settings;
};
exports.updateSettingsService = updateSettingsService;
const listPayoutsService = async () => {
    const payouts = await payout_model_1.Payout.find().sort({ createdAt: -1 }).lean();
    const teacherIds = Array.from(new Set(payouts.map((payout) => payout.teacherId)));
    const teachers = teacherIds.length
        ? await dashboard_model_1.ExternalUser.find({ _id: { $in: teacherIds } }).lean()
        : [];
    const teacherMap = new Map(teachers.map((teacher) => [String(teacher._id), teacher]));
    return payouts.map((payout) => ({
        ...payout,
        teacher: teacherMap.get(String(payout.teacherId)) || null,
    }));
};
exports.listPayoutsService = listPayoutsService;
const updatePayoutStatusService = async (payoutId, status) => {
    const payout = await payout_model_1.Payout.findByIdAndUpdate(payoutId, { status }, { new: true }).lean();
    if (!payout) {
        throw new Error("Payout not found");
    }
    return payout;
};
exports.updatePayoutStatusService = updatePayoutStatusService;
const listPendingCommunitiesService = async () => {
    const communities = await community_model_1.Community.find({ status: "pending" }).sort({ createdAt: -1 }).lean();
    const teacherIds = Array.from(new Set(communities.map((community) => community.teacherId)));
    const teachers = teacherIds.length
        ? await dashboard_model_1.ExternalUser.find({ _id: { $in: teacherIds } }).lean()
        : [];
    const teacherMap = new Map(teachers.map((teacher) => [String(teacher._id), teacher]));
    return communities.map((community) => ({
        ...community,
        teacher: teacherMap.get(String(community.teacherId))
            ? {
                name: teacherMap.get(String(community.teacherId)).name,
                email: teacherMap.get(String(community.teacherId)).email,
            }
            : null,
    }));
};
exports.listPendingCommunitiesService = listPendingCommunitiesService;
const approveCommunityService = async (communityId) => {
    const community = await community_model_1.Community.findByIdAndUpdate(communityId, { status: "approved" }, { new: true }).lean();
    if (!community) {
        throw new Error("Community not found");
    }
    return community;
};
exports.approveCommunityService = approveCommunityService;
const rejectCommunityService = async (communityId) => {
    const community = await community_model_1.Community.findByIdAndUpdate(communityId, { status: "rejected" }, { new: true }).lean();
    if (!community) {
        throw new Error("Community not found");
    }
    return community;
};
exports.rejectCommunityService = rejectCommunityService;
