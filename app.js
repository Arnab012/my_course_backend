import express from "express";
import ErrormiddleWare from "./middlewares/Error.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import cors from "cors";
dotenv.config({ path: "./config/config.env" });
const app = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.Frontend_URl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
import course from "./routes/CourseRouter.js";
import user from "./routes/UserRoutes.js";

app.use("/api/v1", course);

app.use("/api/v1", user);
import paymentess from "./routes/paymentsRoutes.js";
app.use("/api/v1", paymentess);

import other from "./routes/otherRoutes.js";
app.use("/api/v1", other);

app.use("/", (req, res) => {
  res.send(
    ` <h1>Server is Running fine and wont to go to the frontend <a href=${process.env.Frontend_URl}>Click Here</a></h1>`
  );
});
export default app;

app.use(ErrormiddleWare);
