import { Request, Response } from "express";
import {
  approveCommunityService,
  getCoursesForModeration,
  getDashboardStats,
  getSettingsService,
  listPendingCommunitiesService,
  listPayoutsService,
  listUsersService,
  rejectCommunityService,
  softDeleteUserService,
  updateCourseStatus,
  updatePayoutStatusService,
  updateSettingsService,
  updateUserStatusService,
  verifyUserService,
} from "../services/admin.service";

export const getDashboard = async (_req: Request, res: Response) => {
  const stats = await getDashboardStats();
  res.json({ stats });
};

export const listCourses = async (req: Request, res: Response) => {
  const status = typeof req.query.status === "string" ? req.query.status : "review";
  const courses = await getCoursesForModeration(status);
  res.json({ courses });
};

export const patchCourseStatus = async (req: Request, res: Response) => {
  const adminId = req.headers["x-user-id"] as string;
  const { status, reason } = req.body;

  if (!["published", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const result = await updateCourseStatus(
    req.params.id,
    status as "published" | "rejected",
    adminId,
    reason
  );

  res.json(result);
};

export const approveCourseAction = async (req: Request, res: Response) => {
  const adminId = req.headers["x-user-id"] as string;
  const result = await updateCourseStatus(req.params.id, "published", adminId);
  res.json(result);
};

export const rejectCourseAction = async (req: Request, res: Response) => {
  const adminId = req.headers["x-user-id"] as string;
  const { reason } = req.body;
  const result = await updateCourseStatus(req.params.id, "rejected", adminId, reason);
  res.json(result);
};

export const listUsers = async (_req: Request, res: Response) => {
  const users = await listUsersService();
  res.json({ users });
};

export const patchUserStatus = async (req: Request, res: Response) => {
  const user = await updateUserStatusService(req.params.id, Boolean(req.body.isBlocked));
  res.json({ user });
};

export const verifyUser = async (req: Request, res: Response) => {
  const user = await verifyUserService(req.params.id);
  res.json({ user });
};

export const deleteUser = async (req: Request, res: Response) => {
  await softDeleteUserService(req.params.id);
  res.json({ success: true });
};

export const getSettings = async (_req: Request, res: Response) => {
  const settings = await getSettingsService();
  res.json({ settings });
};

export const updateSettings = async (req: Request, res: Response) => {
  const settings = await updateSettingsService(req.body);
  res.json({ settings });
};

export const listPayouts = async (_req: Request, res: Response) => {
  const payouts = await listPayoutsService();
  res.json({ payouts });
};

export const patchPayout = async (req: Request, res: Response) => {
  const payout = await updatePayoutStatusService(req.params.id, req.body.status);
  res.json({ payout });
};

export const listPendingCommunities = async (_req: Request, res: Response) => {
  const communities = await listPendingCommunitiesService();
  res.json(communities);
};

export const approveCommunity = async (req: Request, res: Response) => {
  const community = await approveCommunityService(req.params.id);
  res.json({ community });
};

export const rejectCommunity = async (req: Request, res: Response) => {
  const community = await rejectCommunityService(req.params.id);
  res.json({ community });
};
