import jwt from "jsonwebtoken";
import { catchAsyncError } from "./catchAsyncError.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import User from "../models/User.js";
export const isAuthenticated = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) return next(new ErrorHandler("Login Please Before Use it", 401));

  const decoded = jwt.verify(token, process.env.JWT_SECERETE);
  req.user = await User.findById(decoded._id);
  next();
});

export const AuthorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return next(new ErrorHandler("You are not allowed to Acess it", 403));
  next();
};

export const AuthorizeSubscriber = (req, res, next) => {
  if (req.user.subscription.status !== "active" && req.user.role !== "admin")
    return next(
      new ErrorHandler("Only Valid Subscriber can acess the resource", 404)
    );
  next();
};
