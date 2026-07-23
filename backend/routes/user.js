import express from "express";
import {
  registerUser,
  login,
  userProfile,
  logOut,
} from "../controllers/user.js";

import { isAuth } from "../middleware/authenticate.js";

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(login);
router.route("/profile").get(isAuth, userProfile);
router.route("/logout").post(logOut);

export default router;
