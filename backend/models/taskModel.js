import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A Task Title must have a Title"],
      maxlength: [50, "A Task Title must be less or equal to 50 charecters"],
      minlength: [3, "A Task Title must be more or equal to 3 charecters"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      required: [true, "A Task must have a status"],
      enum: ["todo", "in-progress", "blocked", "review", "done", "cancelled"],
      default: "todo",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    dueDate: { type: Date },
    createdBy: {
      type: String,
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: String,
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
