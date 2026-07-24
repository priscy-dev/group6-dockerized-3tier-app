import crypto from "crypto";
import { configDotenv } from "dotenv";
import { promisify } from "util";
import jsonWebToken from "jsonwebtoken";
import environment from "../config/environment.js";
import console from "node:console";

configDotenv();
const PRIV_KEY = environment.PRIVATE_KEY;

const pbkdf2 = promisify(crypto.pbkdf2);

async function createPassword(password) {
  try {
    const salt = crypto.randomBytes(32).toString("hex");

    const genhash = (
      await pbkdf2(password, salt, 10000, 64, "sha512")
    ).toString("hex");

    return {
      salt: salt,
      hash: genhash,
    };
  } catch (error) {
    console.error(`password can not be created ${error}`);
  }
}

async function validatePassword(password, salt, hash) {
  const verifyhash = (
    await pbkdf2(password, salt, 10000, 64, "sha512")
  ).toString("hex");

  return hash === verifyhash;
}

function issueJWT(user) {
  const _id = user._id;
  const expiresIn = "1h";

  const payload = {
    sub: _id,
    iat: Math.floor(Date.now() / 1000),
  };

  const signedToken = jsonWebToken.sign(payload, PRIV_KEY, {
    expiresIn: expiresIn,
    algorithm: "RS512",
  });

  return {
    token: signedToken,
    expiresIn: expiresIn,
  };
}

export { createPassword, validatePassword, issueJWT };
