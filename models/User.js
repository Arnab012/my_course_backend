import mongoose from "mongoose";
import Validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Your Name"],
  },
  email: {
    type: String,
    required: [true, "Please Enter an Email Id"],
    unique: true,
    validate: Validator.isEmail,
  },

  password: {
    type: String,
    required: [true, "Please Enter Yoour Password"],
    minLength: [6, "Password Must be atleast 6 character"],
    select: false,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },

  subscription: {
    id: String,
    status: String,
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },

  playlist: [
    {
      course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },

      poster: String,
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },

  ResetPasswordToken: String,
  ResetPasswordExpire: String,
});

schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const hashedPassword = await bcrypt.hash(this.password, 12);
  this.password = hashedPassword;
  next();
});

schema.methods.getJWTToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECERETE, {
    expiresIn: "15d",
  });
};
schema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};
schema.methods.getresetToken = async function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.ResetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.ResetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", schema);
export default User;
