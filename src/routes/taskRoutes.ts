import { Router } from "express";
import { getTasks, createTask, updateTask, deleteTask, toggleTaskStatus } from "../controllers/taskController";

const router = Router();

router.get("/", getTasks);
router.post("/", createTask);
router.patch("/:id", updateTask);
router.patch("/:id/toggle", toggleTaskStatus);
router.delete("/:id", deleteTask);

export default router;
