"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCourseSchema = void 0;
const zod_1 = require("zod");
exports.createCourseSchema = zod_1.z.object({
    title: zod_1.z.string().min(3),
    slug: zod_1.z.string().min(3).optional(),
    description: zod_1.z.string().min(10),
    category: zod_1.z.string().optional(),
    price: zod_1.z.coerce.number().optional(),
    isFree: zod_1.z.coerce.boolean().optional(),
    isSequential: zod_1.z.coerce.boolean().optional(),
    level: zod_1.z.string().optional(),
    language: zod_1.z.string().optional(),
    thumbnail: zod_1.z.string().optional()
});
