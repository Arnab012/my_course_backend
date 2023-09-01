import express from "express";
import { isAuthenticated } from "../middlewares/Auth.js";
import {
  buysubscription,
  cancelsubscription,
  getRazorPayKey,
  paymentverificationctrl,
} from "../controllers/paymentscontrollers.js";

const router = express.Router();

router.get("/buysubscription", isAuthenticated, buysubscription);
router.get("/razorpaykey", getRazorPayKey);

router.post("/paymentverification", isAuthenticated, paymentverificationctrl);
router.delete("/buysubscription/cancel", isAuthenticated, cancelsubscription);

export default router;
