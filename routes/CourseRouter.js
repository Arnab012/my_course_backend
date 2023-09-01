import express from "express";
import {
  addlectures,
  createCourse,
  deletecoursectrl,
  deletelecturectrl,
  getCourselectures,
  getallcourses,
} from "../controllers/courseControllers.js";

import singleUplode from "../middlewares/multer.js";
import {
  AuthorizeAdmin,
  isAuthenticated,
  AuthorizeSubscriber,
} from "../middlewares/Auth.js";
const router = express.Router();

router.get("/courses", getallcourses);
router.post(
  "/createcourse",
  isAuthenticated,
  AuthorizeAdmin,
  singleUplode,
  createCourse
);

router.get(
  "/course/:id",
  isAuthenticated,
  AuthorizeSubscriber,
  getCourselectures
);

router.post(
  "/course/:id",
  isAuthenticated,
  AuthorizeAdmin,
  singleUplode,
  addlectures
);

router.delete("/course/:id", isAuthenticated, AuthorizeAdmin, deletecoursectrl);

router.delete("/lecture", isAuthenticated, AuthorizeAdmin, deletelecturectrl);
export default router;
