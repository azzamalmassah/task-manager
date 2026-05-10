import express from "express";
import taskRouter from "./routes/taskRouter.js";
import userRouter from "./routes/userRouter.js";
import globalErrorHandler from "./controllers/erorrController.js";
const app = express();
app.use(express.json());

app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/users", userRouter);
app.use(globalErrorHandler);
export default app;
