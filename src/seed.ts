import dotenv from "dotenv";
import { connectDB } from "./config/db";
import Task from "./models/Task";
import ActivityLog from "./models/ActivityLog";
import mongoose from "mongoose";

dotenv.config();

const sampleTasks = [
  {
    title: "Set up project repository",
    description: "Initialize the MERN + TypeScript boilerplate and push to GitHub.",
  },
  {
    title: "Design database schemas",
    description: "Define Task and ActivityLog schemas with Mongoose.",
  },
  {
    title: "Build activity feed UI",
    description: "Create the live-updating panel that lists recent status changes.",
  },
];

const seed = async () => {
  await connectDB();

  await Task.deleteMany({});
  await ActivityLog.deleteMany({});

  const createdTasks = await Task.insertMany(sampleTasks);

  await ActivityLog.insertMany(
    createdTasks.map((task) => ({
      task: task._id,
      activity: `Task "${task.title}" was created`,
    }))
  );

  console.log(`Seeded ${createdTasks.length} tasks with initial activity logs.`);
  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
