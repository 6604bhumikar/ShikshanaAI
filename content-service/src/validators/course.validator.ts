
import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3).optional(),
  description: z.string().min(10),
  category: z.string().optional(),
  price: z.coerce.number().optional(),
  isFree: z.coerce.boolean().optional(),
  isSequential: z.coerce.boolean().optional(),
  level: z.string().optional(),
  language: z.string().optional(),
  thumbnail: z.string().optional()
});
