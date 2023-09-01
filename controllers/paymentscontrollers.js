import { catchAsyncError } from "../middlewares/catchAsyncError.js";

import { instance } from "../server.js";
import crypto from "crypto";
import Payment from "../models/payment.js";
import User from "../models/User.js";
import ErrorHandler from "../utils/ErrorHandler.js";

export const buysubscription = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user.role === "admin")
    return next(new ErrorHandler("Admin can not buy subscription", 403));

  const plain_id = process.env.PLAIN_ID || "plan_MWuNE7XS9kZ7s7";
  const subscription = await instance.subscriptions.create({
    plan_id: plain_id,
    customer_notify: 1,
    total_count: 12,
  });

  user.subscription.id = subscription.id;
  user.subscription.status = subscription.status;

  await user.save();

  res.status(200).json({
    success: true,
    subscriptionId: subscription.id,
  });
});

export const paymentverificationctrl = catchAsyncError(
  async (req, res, next) => {
    const {
      razorpay_signature,
      razorpay_subscription_id,
      razorpay_payment_id,
    } = req.body;

    const user = await User.findById(req.user_id);
    const subscription_id = user.subscription.id;

    const generated_signature = crypto
      .createHmac("sha-256", process.env.RAZORPAY_API_SECRETE)
      .update(razorpay_payment_id + "|" + subscription_id, "utf-8")
      .digest("hex");

    const Authentic = generated_signature === razorpay_signature;

    if (!Authentic)
      return res.redirect(`${process.env.Frontend_URl}/paymentfail`);

    await Payment.create({
      razorpay_signature,
      razorpay_subscription_id,
      razorpay_payment_id,
    });

    user.subscription.status = "active";
    await user.save();
    res.redirect(
      `${process.env.Frontend_URl}/paymentsuccess?reference=${razorpay_payment_id}`
    );
  }
);

export const getRazorPayKey = catchAsyncError(async (req, res, next) => {
  res.status(200).json({
    success: true,
    Key: process.env.RAZORPAY_API_KEY,
  });
});

export const cancelsubscription = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const subscriptionId = user.subscription.id;
  let refund = false;
  await instance.subscriptions.cancel(subscriptionId);

  const payment = await Payment.findOne({
    razorpay_subscription_id: subscriptionId,
  });

  const gap = Date.now() - payment.createdAt;
  const refundTime = process.env.REFUND_DAYS * 24 * 60 * 60 * 1000;

  if (refundTime > gap) {
  await instance.payments.refund(payment.razorpay_payment_id);
  refund: true;
  }

  await payment.remove();
  user.subscription.id = undefined;
  user.subscription.status = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: refund
      ? "Subscritption is cancelled SucessFully you will get back you refund with in 7 days"
      : "subscription is Cancelled SucessFully.But no refund will be iniated because it is already 7 days",
  });
});
