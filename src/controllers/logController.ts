import { Request, Response } from "express";
import mongoose from "mongoose";
import ActivityLog from "../models/ActivityLog";
import { getFallbackLogs } from "../lib/fallbackStore";

const useFallbackStore = () => {
  const state = mongoose.connection.readyState;
  return state !== mongoose.ConnectionStates.connected && state !== mongoose.ConnectionStates.connecting;
};

export const getLogs = async (_req: Request, res: Response) => {
  try {
    if (useFallbackStore()) {
      return res.status(200).json(getFallbackLogs());
    }

    const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(100);
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch activity logs", error });
  }
};
