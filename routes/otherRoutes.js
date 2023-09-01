import express from "express";
import {
  adminstatsctrl,
  contactcontroll,
  courserequestctrl,
} from "../controllers/ContscatControlles.js";
import { AuthorizeAdmin, isAuthenticated } from "../middlewares/Auth.js";

const router = express.Router();

router.post("/contact", contactcontroll);
router.post("/courserequest", courserequestctrl);

// get admin dashboard stats
router.get("/admin/stats", isAuthenticated, AuthorizeAdmin, adminstatsctrl);

export default router;
