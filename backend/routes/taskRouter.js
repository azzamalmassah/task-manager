import express from "express";
import {
  createTask,
  getTask,
  getAllTasks,
  deleteTask,
  updateTask,
} from "../controllers/tasksController.js";
import { protect, restrictTo } from "../controllers/authController.js";
const router = express.Router();

router.use(protect);
router
  .route("/")
  .post(restrictTo("admin", "department-manager"), createTask)
  .get(restrictTo("admin", "department-manager"), getAllTasks);
router
  .route("/:id")
  .get(restrictTo("admin", "department-manager", "user"), getTask)
  .delete(restrictTo("admin"), deleteTask)
  .patch(
    restrictTo("admin", "department-manager", "user", "employee"),
    updateTask,
  );

export default router;
