
import { Request, Response, NextFunction } from "express";

export const requireTeacher = (req: Request, res: Response, next: NextFunction) => {
  const role = req.headers["x-user-role"];
  if (role !== "teacher") {
    return res.status(403).json({ message: "Teacher access required" });
  }
  next();
  console.log("Role received:", role);
};
