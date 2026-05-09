import { createOne, getOne, getAll, deleteOne } from "./handlerFactory.js";
import Task from "../models/taskModel.js";

export const createTask = createOne(Task);
export const getTask = getOne(Task);
export const getAllTasks = getAll(Task);
export const deleteTask = deleteOne(Task);
