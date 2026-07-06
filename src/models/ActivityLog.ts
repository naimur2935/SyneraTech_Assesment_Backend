import { Schema, model, Document, Types } from "mongoose";

export interface IActivityLog extends Document {
  task: Types.ObjectId;
  activity: string;
  timestamp: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>({
  task: { type: Schema.Types.ObjectId, ref: "Task", required: true },
  activity: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default model<IActivityLog>("ActivityLog", ActivityLogSchema);
