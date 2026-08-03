import express from "express";
import {
  registerUser,
  login,
  userProfile,
  updateUserProfile,
  logOut,
} from "../controllers/user.js";

import { isAuth } from "../middleware/authenticate.js";

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(login);
router.route("/profile").get(isAuth, userProfile).put(isAuth, updateUserProfile);
router.route("/logout").post(logOut);

export default router;
