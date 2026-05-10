import express from "express";
import {
  getAllUsers,
  deleteUser,
  updateUser,
  createUser,
  getUser,
} from "../controllers/usersController.js";
const router = express.Router();

router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);
export default router;
