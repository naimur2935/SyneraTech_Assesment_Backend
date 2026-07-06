import { Request, Response } from "express";
import Task, { TaskStatus } from "../models/Task";
import ActivityLog from "../models/ActivityLog";

// Defines the fixed forward progression of a task's lifecycle.
const STATUS_FLOW: Record<TaskStatus, TaskStatus> = {
  "To Do": "In Progress",
  "In Progress": "Done",
  Done: "Done", // Already at the final stage; toggling has no further effect.
};

export const getTasks = async (_req: Request, res: Response) => {
  try {
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

/**
 * Core automation engine.
 * Every status toggle performs two operations together:
 *   1. Update the task's status in the database.
 *   2. Automatically generate a timestamped activity log for that change.
 */
export const toggleTaskStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const previousStatus = task.status;
    const nextStatus = STATUS_FLOW[previousStatus];

    if (previousStatus === nextStatus) {
      // Already Done - nothing to do, but respond cleanly rather than erroring.
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
