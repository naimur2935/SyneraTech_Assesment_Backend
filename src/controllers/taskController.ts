import { Request, Response } from "express";
import mongoose from "mongoose";
import Task from "../models/Task";
import ActivityLog from "../models/ActivityLog";
import {
  createFallbackTask,
  getFallbackLogs,
  getFallbackTasks,
  toggleFallbackTaskStatus,
  updateFallbackTask,
  deleteFallbackTask,
} from "../lib/fallbackStore";

const useFallbackStore = () => {
  const state = mongoose.connection.readyState;
  return state !== mongoose.ConnectionStates.connected && state !== mongoose.ConnectionStates.connecting;
};

export const getTasks = async (_req: Request, res: Response) => {
  try {
    if (useFallbackStore()) {
      return res.status(200).json(getFallbackTasks());
    }

    const tasks = await Task.find().sort({ createdAt: 1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks", error });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    if (useFallbackStore()) {
      const task = createFallbackTask(title, description);
      return res.status(201).json(task);
    }

    const task = await Task.create({ title, description, status: "To Do" });

    await ActivityLog.create({
      task: task._id,
      activity: `Task "${task.title}" was created`,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Failed to create task", error });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    if (useFallbackStore()) {
      const result = updateFallbackTask(id, title, description);
      if (!result) {
        return res.status(404).json({ message: "Task not found" });
      }
      return res.status(200).json(result.task);
    }

    const task = await Task.findByIdAndUpdate(
      id,
      { title, description },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await ActivityLog.create({
      task: task._id,
      activity: `Task "${task.title}" was updated`,
    });

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Failed to update task", error });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (useFallbackStore()) {
      const result = deleteFallbackTask(id);
      if (!result) {
        return res.status(404).json({ message: "Task not found" });
      }
      return res.status(200).json({ id: result.taskId });
    }

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await ActivityLog.create({
      task: task._id,
      activity: `Task "${task.title}" was deleted`,
    });

    res.status(200).json({ id: task._id });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete task", error });
  }
};

export const toggleTaskStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (useFallbackStore()) {
      const result = toggleFallbackTaskStatus(id);

      if (!result) {
        return res.status(404).json({ message: "Task not found" });
      }

      return res.status(200).json(result);
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const previousStatus = task.status;
    const nextStatus = task.status === "To Do" ? "In Progress" : task.status === "In Progress" ? "Done" : "Done";

    if (previousStatus === nextStatus) {
      return res.status(200).json({ task, unchanged: true });
    }

    task.status = nextStatus;
    await task.save();

    const log = await ActivityLog.create({
      task: task._id,
      activity: `Task "${task.title}" shifted to ${nextStatus}`,
    });

    res.status(200).json({ task, log });
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle task status", error });
  }
};
