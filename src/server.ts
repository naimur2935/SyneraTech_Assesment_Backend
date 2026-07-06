import express from "express";
import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import cors from "cors";
import dotenv from "dotenv";
import type { Server } from "http";
import { connectDB } from "./config/db";
import taskRoutes from "./routes/taskRoutes";
import logRoutes from "./routes/logRoutes";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
let server: Server | undefined;

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
  
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/tasks", taskRoutes);
app.use("/api/logs", logRoutes);

const shutdown = (): void => {
  if (server) {
    server.close(() => {
      console.log("Server closed.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
  } catch (error) {
    console.warn("MongoDB connection failed. Continuing without database access using the in-memory fallback store.", error);
  }

  if (process.env.VERCEL !== "1") {
    server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    server.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use. Please stop the existing server and try again.`);
        process.exit(0);
      }

      console.error("Server error:", error);
      process.exit(1);
    });
  }
};

void startServer();

export { app };
export default app;
