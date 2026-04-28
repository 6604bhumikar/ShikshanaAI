
import { Router } from "express";
import { checkEnrollment, enroll } from "../controllers/enrollment.controller";
import { requireStudent } from "../middleware/role.middleware";

const router = Router();

router.post("/enroll", requireStudent, enroll);
router.get("/internal/check/:courseId", checkEnrollment);
export default router;
