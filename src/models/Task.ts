import { Schema, model, Document } from "mongoose";

export type TaskStatus = "To Do" | "In Progress" | "Done";

export interface ITask extends Document {
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["To Do", "In Progress", "Done"],
      default: "To Do",
    },
  },
  { timestamps: true }
);

export default model<ITask>("Task", TaskSchema);
