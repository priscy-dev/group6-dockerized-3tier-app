import { config as dotenvConfig } from "dotenv";
import process from "node:process";
import { loadSecrets } from "./secrets.js";

if (process.env.NODE_ENV !== "production") {
  dotenvConfig();
}

const config = await loadSecrets();

const { mongoUsername, mongoPassword } = config;
const { host, port, authSource } = config.mongo;

// Only use auth if username and password are non-empty strings
const hasAuth =
  Boolean(mongoUsername?.trim()) && Boolean(mongoPassword?.trim());

const url = hasAuth
  ? `mongodb://${mongoUsername}:${mongoPassword}@${host}:${port}/?authSource=${authSource}`
  : `mongodb://${host}:${port}/`;

console.log("👉 Generated DB URL:", url); // Add this line!
const environment = {
  NODE_ENV: process.env.NODE_ENV || config.nodeEnv,
  PORT: Number(process.env.PORT || config.port),
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  HOST: process.env.HOST || "localhost",
  LOG_LEVEL: process.env.LOG_LEVEL || config.logLevel,

  DATABASE_URL: url || process.env.DATABASE_URL,

  PRIVATE_KEY: config.jwtPrivateKey || process.env.JWT_PRIVATE_KEY,
  PUBLIC_KEY: config.jwtPublicKey || process.env.JWT_PUBLIC_KEY,

  MONGO_USERNAME: config.mongoUsername || "",
  MONGO_PASSWORD: config.mongoPassword || "",
};

environment.isProduction = environment.NODE_ENV === "production";
environment.isDevelopment = environment.NODE_ENV === "development";

export default environment;
