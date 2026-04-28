"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const enrollment_controller_1 = require("../controllers/enrollment.controller");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
router.post("/enroll", role_middleware_1.requireStudent, enrollment_controller_1.enroll);
router.get("/internal/check/:courseId", enrollment_controller_1.checkEnrollment);
exports.default = router;
