import Users from "../modules/users.js";
import { createPassword, validatePassword, issueJWT } from "../lib/utils.js";
import environment from "../config/environment.js";

async function registerUser(req, res, next) {
  try {
    const { fullname, username, password, age, sex, weight } = req.body;

    // 1. Guard clause: Check required fields
    if (!username || !password || !fullname) {
      return res.status(400).json({
        success: false,
        msg: "Required fields missing",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        msg: "Password must be at least 8 characters",
      });
    }

    // 2. Check for existing user
    const existingUser = await Users.findOne({ username });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        msg: "User already exists",
      });
    }

    // 3. Create salt and hash
    const { salt, hash } = await createPassword(password);

    // 4. Save user
    const newUser = new Users({
      fullname,
      username,
      age,
      weight,
      salt,
      hash,
      sex: sex || "Others",
    });

    const user = await newUser.save();

    // 5. Issue JWT & Set Cookie
    const { token, expiresIn } = issueJWT(user);

    const isProduction = environment.NODE_ENV === "production";

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      user: {
        id: user._id,
        fullname: user.fullname,
        username: user.username,
        age: user.age,
        weight: user.weight,
        sex: user.sex,
      },
      expiresIn,
    });
  } catch (error) {
    next(error);
  }
}
async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    const user = await Users.findOne({ $or: [{ username }] }).select(
      "+salt +hash",
    );

    if (!user) {
      return res
        .status(400)
        .json({ success: false, msg: "this user does nor exist" });
    }

    const isValid = await validatePassword(password, user.salt, user.hash);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        msg: "you entered the wrong password",
      });
    }

    const tokenObject = issueJWT(user);
    const isProduction = (environment.NODE_ENV = "production");

    res.cookie("jwt", tokenObject.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      user: {
        id: user._id,
        fullname: user.fullname,
        username: user.username,
        age: user.age,
        weight: user.weight,
        sex: user.sex,
      },
      expiresIn: tokenObject.expiresIn,
    });
  } catch (error) {
    next(error);
  }
}

async function userProfile(req, res, next) {
  try {
    const { username } = req.user;
    const user = await Users.findOne({ username }).select("-salt -hash");

    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }
    res.status(200).json({
      success: true,
      user: {
        fullname: user.fullname,
        username: user.username,
        age: user.age,
        weight: user.weight,
        sex: user.sex,
      },
    });
  } catch (error) {
    next(error);
  }
}

function logOut(req, res) {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("jwt", {
    httpOnly: true,
    secure: isProduction, // Must be true to match your HTTPS production setup
    sameSite: "none", // Must match the login config exactly
  });

  return res
    .status(200)
    .json({ success: true, msg: "Logged out successfully" });
}
export { registerUser, login, userProfile, logOut };
