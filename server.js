import app from "./app.js";
import connecttoMongo from "./config/db.js";
import cloudinary from "cloudinary";
import Razorpay from "razorpay";
import nodeCron from "node-cron";
import Stats from "./models/Stats.js";
connecttoMongo();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDNAIRY_CLIENT_NAME,
  api_key: process.env.CLOUDNAIRY_API_KEY,
  api_secret: process.env.CLOUDNAIRY_API_SECERETE,
});

export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRETE,
});

nodeCron.schedule("0 0 0 1 * *", async () => {
  try {
    await Stats.create({});
  } catch (error) {
    console.log(error);
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is Running on the port no ${process.env.PORT}`);
});
