import { Router } from "express";
import { getTasks, createTask, toggleTaskStatus } from "../controllers/taskController";

const router = Router();

router.get("/", getTasks);
router.post("/", createTask);
router.patch("/:id/toggle", toggleTaskStatus);

export default router;
