import express from "express";
import {
  UpadteProfile,
  atttoplaylistctrl,
  changepassword,
  deleteUserprofile,
  deletemyprofilebyuser,
  forgetpasswordctrl,
  getallusers,
  getmyprofile,
  loginctrl,
  logoutctrl,
  registeruser,
  removefromplaylistctrl,
  resetpassword,
  upateprofilepicture,
  updateUserrole,
} from "../controllers/userControllers.js";
import { AuthorizeAdmin, isAuthenticated } from "../middlewares/Auth.js";
import singleUplode from "../middlewares/multer.js";

const router = express.Router();

router.post("/register", singleUplode, registeruser);
router.post("/login", loginctrl);
router.get("/logout", logoutctrl);
router.get("/me", isAuthenticated, getmyprofile);
router.delete("/me", isAuthenticated, deletemyprofilebyuser);

router.put("/changepassword", isAuthenticated, changepassword);
router.put("/upateprofile", isAuthenticated, UpadteProfile);
router.put(
  "/upateprofilepicture",
  isAuthenticated,
  singleUplode,
  upateprofilepicture
);
router.post("/forgetpassword", forgetpasswordctrl);
router.put("/resetpassword/:token", resetpassword);
router.post("/attoplayliist", isAuthenticated, atttoplaylistctrl);
router.delete("/removefromplaylist", isAuthenticated, removefromplaylistctrl);

// Admin Routes All

router.get("/admin/users", isAuthenticated, AuthorizeAdmin, getallusers);
router.put("/admin/users/:id", isAuthenticated, AuthorizeAdmin, updateUserrole);
router.delete(
  "/admin/users/:id",
  isAuthenticated,
  AuthorizeAdmin,
  deleteUserprofile
);

export default router;
