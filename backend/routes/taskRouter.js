import express from "express";
import {
  createTask,
  getTask,
  getAllTasks,
  deleteTask,
  updateTask,
} from "../controllers/tasksController.js";
const router = express.Router();

router.route("/").post(createTask).get(getAllTasks);
router.route("/:id").get(getTask).delete(deleteTask).patch(updateTask);

export default router;
