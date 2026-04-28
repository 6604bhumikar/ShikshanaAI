
import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

export const assignRequestId = (req: Request, res: Response, next: NextFunction) => {
  const requestId = uuidv4();
  (req as any).requestId = requestId;
  res.setHeader("x-request-id", requestId);
  next();
};
