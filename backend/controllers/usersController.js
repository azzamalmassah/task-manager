import {
  createOne,
  deleteOne,
  updateOne,
  getAll,
  getOne,
} from "./handlerFactory.js";
import User from "../models/usersModel.js";
//this cotroller is for admin to manage users, user can not access this controller;
export const createUser = createOne(User);
export const getUser = getOne(User);
export const getAllUsers = getAll(User);
export const deleteUser = deleteOne(User);
export const updateUser = updateOne(User);

export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
