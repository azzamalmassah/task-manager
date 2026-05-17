import dotenv from "dotenv";
dotenv.config({ path: "./.env", override: true });

import app from "./app.js";
import mongoose from "mongoose";

//connect DB

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Database is connected");
    });
    await mongoose.connect(`${process.env.DB_STRING}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
connectDB();

// connect server

const port = Number(process.env.PORT) || 5000;

const server = app.listen(port, () => {
  console.log(`server is up an running on port ${port}`);
});
