import { Router } from "express";
import {
  approveCommunity,
  approveCourseAction,
  deleteUser,
  getDashboard,
  getSettings,
  listCourses,
  listPendingCommunities,
  listPayouts,
  listUsers,
  patchCourseStatus,
  patchPayout,
  patchUserStatus,
  rejectCommunity,
  rejectCourseAction,
  updateSettings,
  verifyUser,
} from "../controllers/admin.controller";
import { requireAdmin } from "../middleware/role.middleware";

const router = Router();

router.get("/dashboard", requireAdmin, getDashboard);
router.get("/courses", requireAdmin, listCourses);
router.patch("/courses/:id/status", requireAdmin, patchCourseStatus);
router.patch("/courses/:id/approve", requireAdmin, approveCourseAction);
router.patch("/courses/:id/reject", requireAdmin, rejectCourseAction);

router.get("/users", requireAdmin, listUsers);
router.patch("/users/:id/status", requireAdmin, patchUserStatus);
router.patch("/users/:id/verify", requireAdmin, verifyUser);
router.patch("/users/:id/delete", requireAdmin, deleteUser);

router.get("/settings", requireAdmin, getSettings);
router.put("/settings", requireAdmin, updateSettings);

router.get("/payouts", requireAdmin, listPayouts);
router.patch("/payouts/:id", requireAdmin, patchPayout);

router.get("/communities/pending", requireAdmin, listPendingCommunities);
router.post("/communities/:id/approve", requireAdmin, approveCommunity);
router.delete("/communities/:id/reject", requireAdmin, rejectCommunity);

export default router;
