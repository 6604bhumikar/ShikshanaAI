
import { Request, Response, NextFunction } from "express";

export const requireStudent = (req: Request, res: Response, next: NextFunction) => {
  const role = req.headers["x-user-role"];
  if (role !== "student") {
    return res.status(403).json({ message: "Student access required" });
  }
  next();
};
