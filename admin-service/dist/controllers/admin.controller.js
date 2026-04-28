"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectCommunity = exports.approveCommunity = exports.listPendingCommunities = exports.patchPayout = exports.listPayouts = exports.updateSettings = exports.getSettings = exports.deleteUser = exports.verifyUser = exports.patchUserStatus = exports.listUsers = exports.rejectCourseAction = exports.approveCourseAction = exports.patchCourseStatus = exports.listCourses = exports.getDashboard = void 0;
const admin_service_1 = require("../services/admin.service");
const getDashboard = async (_req, res) => {
    const stats = await (0, admin_service_1.getDashboardStats)();
    res.json({ stats });
};
exports.getDashboard = getDashboard;
const listCourses = async (req, res) => {
    const status = typeof req.query.status === "string" ? req.query.status : "review";
    const courses = await (0, admin_service_1.getCoursesForModeration)(status);
    res.json({ courses });
};
exports.listCourses = listCourses;
const patchCourseStatus = async (req, res) => {
    const adminId = req.headers["x-user-id"];
    const { status, reason } = req.body;
    if (!["published", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }
    const result = await (0, admin_service_1.updateCourseStatus)(req.params.id, status, adminId, reason);
    res.json(result);
};
exports.patchCourseStatus = patchCourseStatus;
const approveCourseAction = async (req, res) => {
    const adminId = req.headers["x-user-id"];
    const result = await (0, admin_service_1.updateCourseStatus)(req.params.id, "published", adminId);
    res.json(result);
};
exports.approveCourseAction = approveCourseAction;
const rejectCourseAction = async (req, res) => {
    const adminId = req.headers["x-user-id"];
    const { reason } = req.body;
    const result = await (0, admin_service_1.updateCourseStatus)(req.params.id, "rejected", adminId, reason);
    res.json(result);
};
exports.rejectCourseAction = rejectCourseAction;
const listUsers = async (_req, res) => {
    const users = await (0, admin_service_1.listUsersService)();
    res.json({ users });
};
exports.listUsers = listUsers;
const patchUserStatus = async (req, res) => {
    const user = await (0, admin_service_1.updateUserStatusService)(req.params.id, Boolean(req.body.isBlocked));
    res.json({ user });
};
exports.patchUserStatus = patchUserStatus;
const verifyUser = async (req, res) => {
    const user = await (0, admin_service_1.verifyUserService)(req.params.id);
    res.json({ user });
};
exports.verifyUser = verifyUser;
const deleteUser = async (req, res) => {
    await (0, admin_service_1.softDeleteUserService)(req.params.id);
    res.json({ success: true });
};
exports.deleteUser = deleteUser;
const getSettings = async (_req, res) => {
    const settings = await (0, admin_service_1.getSettingsService)();
    res.json({ settings });
};
exports.getSettings = getSettings;
const updateSettings = async (req, res) => {
    const settings = await (0, admin_service_1.updateSettingsService)(req.body);
    res.json({ settings });
};
exports.updateSettings = updateSettings;
const listPayouts = async (_req, res) => {
    const payouts = await (0, admin_service_1.listPayoutsService)();
    res.json({ payouts });
};
exports.listPayouts = listPayouts;
const patchPayout = async (req, res) => {
    const payout = await (0, admin_service_1.updatePayoutStatusService)(req.params.id, req.body.status);
    res.json({ payout });
};
exports.patchPayout = patchPayout;
const listPendingCommunities = async (_req, res) => {
    const communities = await (0, admin_service_1.listPendingCommunitiesService)();
    res.json(communities);
};
exports.listPendingCommunities = listPendingCommunities;
const approveCommunity = async (req, res) => {
    const community = await (0, admin_service_1.approveCommunityService)(req.params.id);
    res.json({ community });
};
exports.approveCommunity = approveCommunity;
const rejectCommunity = async (req, res) => {
    const community = await (0, admin_service_1.rejectCommunityService)(req.params.id);
    res.json({ community });
};
exports.rejectCommunity = rejectCommunity;
