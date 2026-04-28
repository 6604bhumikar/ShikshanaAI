
import { Request, Response } from "express";
import { Log } from "../models/log.model";

export const createLog = async (req: Request, res: Response) => {
  const log = await Log.create(req.body);
  res.status(201).json({ success: true, log });
};

export const getLogs = async (req: Request, res: Response) => {
  const { service, level } = req.query;
  const filter: any = {};
  if (service) filter.service = service;
  if (level) filter.level = level;

  const logs = await Log.find(filter).sort({ timestamp: -1 }).limit(200);
  res.json({ success: true, logs });
};
