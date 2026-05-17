import express from "express";
import {
  getAllUsers,
  deleteUser,
  updateUser,
  createUser,
  getUser,
} from "../controllers/usersController.js";
import { signup, login, protect } from "../controllers/authController.js";

const router = express.Router();
//Public routes
router.post("/login", login);
router.post("/signup", signup);
//protected routes
router.use(protect);
router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);
export default router;
