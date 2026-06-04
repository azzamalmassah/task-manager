import {
  createOne,
  getOne,
  getAll,
  deleteOne,
  updateOne,
} from "./handlerFactory.js";
import Task from "../models/taskModel.js";

export const getTask = getOne(Task);
export const getAllTasks = getAll(Task);
export const deleteTask = deleteOne(Task);
export const updateTask = updateOne(Task);
export const createTask = createOne(Task);
