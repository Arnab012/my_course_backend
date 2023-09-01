import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import cloudinary from "cloudinary";
import User from "../models/User.js";
import crypto from "crypto";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/SendEmail.js";
import getDataUri from "../utils/DataURi.js";

import Stats from "../models/Stats.js";

import Course from "../models/Course.js";
export const registeruser = catchAsyncError(async (req, res, next) => {
  const file = req.file;

  const { name, email, password } = req.body;

  if (!name || !email || !password || !file)
    return next(new ErrorHandler("Please enter all the Fields", 400));

  let user = await User.findOne({ email });
  if (user) return next(new ErrorHandler("User already Exit", 409));

  //   uplode file on cloudnairy
  const fileUrl = getDataUri(file);

  const mycloud = await cloudinary.v2.uploader.upload(fileUrl.content);
  user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    },
  });

  sendToken(res, user, "Registered SucessFully", 201);
});

export const loginctrl = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  //   const file = req.file;

  if (!email || !password)
    return next(new ErrorHandler("Please enter all the Fields", 400));
  const user = await User.findOne({ email }).select("+password");
  if (!user)
    return next(new ErrorHandler("Try to Login with Right Creditionsals", 401));

  const isMatch = await user.comparePassword(password);
  if (!isMatch)
    return next(new ErrorHandler("Try to Login with Right Creditionsals", 401));
  sendToken(res, user, `Welcome back ${user.name}`, 200);
});

export const logoutctrl = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "LoggedOut SucessFully wish to Come back Again",
    });
});

export const getmyprofile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    message: "User Fetch SucessFully",
    user,
  });
});

export const changepassword = catchAsyncError(async (req, res, next) => {
  const { oldpassword, newpassword } = req.body;
  if (!oldpassword || !newpassword)
    return next(new ErrorHandler("Please enter all the Fields", 400));
  const user = await User.findById(req.user._id).select("+password");
  const isMatch = await user.comparePassword(oldpassword);
  if (!isMatch) return next(new ErrorHandler("Incorrect Old  Password", 401));

  user.password = newpassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password Update SucessFully",
    user,
  });
});

// Update Profile
export const UpadteProfile = catchAsyncError(async (req, res, next) => {
  const { name, email } = req.body;

  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (email) user.email = email;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile Update SucessFully",
    user,
  });
});

// update profile picture

export const upateprofilepicture = catchAsyncError(async (req, res, next) => {
  const file = req.file;

  const user = await User.findById(req.user._id);
  const fileUrl = getDataUri(file);

  const mycloud = await cloudinary.v2.uploader.upload(fileUrl.content);

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  user.avatar = {
    public_id: mycloud.public_id,
    url: mycloud.secure_url,
  };
  await user.save();
  res.status(200).json({
    success: true,
    message: "Profile Updated SucessFully",
  });
});

export const forgetpasswordctrl = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return next(new ErrorHandler("USer not Found", 400));
  const resetToken = await user.getresetToken();
  await user.save();
  const url = `${process.env.Frontend_URl}/resetPassword/${resetToken}`;
  const message = `Click on  the link to Reset your Password ${url}.If You not request then  please ignore`;
  // send Token via email
  await sendEmail(user.email, "Your Course Reset Password", message);

  res.status(200).json({
    success: true,
    message: `Reset Token has been sent to ${user.email}`,
  });
});

export const resetpassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;
  const ResetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    ResetPasswordToken,
    ResetPasswordExpire: {
      $gt: Date.now(),
    },
  });

  if (!user)
    return next(new ErrorHandler("Token is invalid  or has been expire", 401));

  user.password = req.body.password;
  user.ResetPasswordToken = undefined;
  user.ResetPasswordExpire = undefined;
  await user.save();
  res.status(200).json({
    success: true,
    message: `Password has been Reset SucessFully`,
  });
});

export const atttoplaylistctrl = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const course = await Course.findById(req.body.id);
  if (!course) return next(new ErrorHandler("Invalid Course Id", 404));

  const itemExit = user.playlist.find((item) => {
    if (item.course.toString() === course._id.toString()) return true;
  });

  if (itemExit) return next(new ErrorHandler("Item Already Exit", 409));
  user.playlist.push({
    course: course._id,
    poster: course.poster.url,
  });

  await user.save();
  res.status(200).json({
    success: true,
    message: `Course Added SucessFully`,
  });
});

export const removefromplaylistctrl = catchAsyncError(
  async (req, res, next) => {
    const user = await User.findById(req.user._id);
    const course = await Course.findById(req.query.id);
    if (!course) return next(new ErrorHandler("Invalid Course Id", 404));

    const newplaylist = user.playlist.filter((item) => {
      if (item.course.toString() !== course._id.toString()) return item;
    });

    user.playlist = newplaylist;
    await user.save();
    res.status(200).json({
      success: true,
      message: `Course Remove From Playlist  SucessFully`,
    });
  }
);

// Admin Routes

export const getallusers = catchAsyncError(async (req, res, next) => {
  const user = await User.find({});

  res.status(200).json({
    success: true,
    message: "All Users Are Fetched Sucessfully",
    user,
  });
});

export const updateUserrole = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorHandler("User Not Found", 404));
  if (user.role === "user") user.role = "admin";
  else user.role = "user";

  await user.save();

  res.status(200).json({
    success: true,
    message: `user Role has been Updated  to ${user.role} Sucessfully`,
  });
});

export const deleteUserprofile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorHandler("User Not Found", 404));
  await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  //subscription calcelled

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User HAs been Deleted SucessFully",
  });
});

export const deletemyprofilebyuser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  //subscription calcelled

  await user.deleteOne();

  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Account  HAs been Deleted SucessFully",
    });
});

User.watch().on("change", async () => {
  const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(1);

  const subscription = await User.find({ "subscription.status": "active" });
  stats[0].users = await User.countDocuments();
  stats[0].subscription = subscription.length;
  stats[0].createdAt = new Date(Date.now());

  await stats[0].save();
});
