import type { TaskStatus } from "../models/Task";

export interface FallbackTask {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface FallbackLog {
  _id: string;
  task: string;
  activity: string;
  timestamp: Date;
}

const STATUS_FLOW: Record<TaskStatus, TaskStatus> = {
  "To Do": "In Progress",
  "In Progress": "Done",
  Done: "Done",
};

let fallbackTasks: FallbackTask[] = [];
let fallbackLogs: FallbackLog[] = [];
let nextTaskId = 1;
let nextLogId = 1;

const cloneTask = (task: FallbackTask): FallbackTask => ({
  ...task,
  createdAt: new Date(task.createdAt),
  updatedAt: new Date(task.updatedAt),
});

const cloneLog = (log: FallbackLog): FallbackLog => ({
  ...log,
  timestamp: new Date(log.timestamp),
});

export const getFallbackTasks = (): FallbackTask[] =>
  fallbackTasks.map(cloneTask).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

export const getFallbackLogs = (): FallbackLog[] =>
  fallbackLogs
    .map(cloneLog)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 100);

export const createFallbackTask = (title: string, description: string): FallbackTask => {
  const now = new Date();
  const task: FallbackTask = {
    _id: `fallback-task-${nextTaskId++}`,
    title,
    description,
    status: "To Do",
    createdAt: now,
    updatedAt: now,
  };

  fallbackTasks.push(task);
  fallbackLogs.push({
    _id: `fallback-log-${nextLogId++}`,
    task: task._id,
    activity: `Task "${task.title}" was created`,
    timestamp: now,
  });

  return cloneTask(task);
};

export const toggleFallbackTaskStatus = (
  id: string
): { task: FallbackTask; log?: FallbackLog; unchanged: boolean } | null => {
  const task = fallbackTasks.find((item) => item._id === id);

  if (!task) {
    return null;
  }

  const previousStatus = task.status;
  const nextStatus = STATUS_FLOW[previousStatus];

  if (previousStatus === nextStatus) {
    return { task: cloneTask(task), unchanged: true };
  }

  task.status = nextStatus;
  task.updatedAt = new Date();

  const log: FallbackLog = {
    _id: `fallback-log-${nextLogId++}`,
    task: task._id,
    activity: `Task "${task.title}" shifted to ${nextStatus}`,
    timestamp: task.updatedAt,
  };

  fallbackLogs.push(log);

  return { task: cloneTask(task), log: cloneLog(log), unchanged: false };
};
