import express from "express";
import {
  getAllUsers,
  deleteUser,
  updateUser,
  createUser,
  getUser,
} from "../controllers/usersController.js";
import {
  signup,
  login,
  protect,
  forgotPassword,
  resetPassword,
  updatePassword,
  restrictTo,
} from "../controllers/authController.js";

const router = express.Router();
//Public routes
router.post("/login", login);
router.post("/signup", signup);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword/:token", resetPassword);
//protected routes
router.use(protect);
router.route("/updateMyPassword").patch(updatePassword);
router
  .route("/")
  .get(restrictTo("admin", "department-manager"), getAllUsers)
  .post(restrictTo("admin", "department-manager"), createUser);
router
  .route("/:id")
  .get(restrictTo("admin", "department-manager"), getUser)
  .patch(restrictTo("admin", "department-manager"), updateUser)
  .delete(restrictTo("admin", "department-manager"), deleteUser);
export default router;
