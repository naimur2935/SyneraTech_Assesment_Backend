import { Request, Response } from "express";
import ActivityLog from "../models/ActivityLog";

export const getLogs = async (_req: Request, res: Response) => {
  try {
    const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(100);
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch activity logs", error });
  }
};
