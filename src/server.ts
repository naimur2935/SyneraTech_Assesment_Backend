import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import taskRoutes from "./routes/taskRoutes";
import logRoutes from "./routes/logRoutes";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/tasks", taskRoutes);
app.use("/api/logs", logRoutes);

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
  } catch (error) {
    console.warn("MongoDB connection failed. Continuing without database access.", error);
  }

  if (process.env.VERCEL !== "1") {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
};

void startServer();

export { app };
export default app;
