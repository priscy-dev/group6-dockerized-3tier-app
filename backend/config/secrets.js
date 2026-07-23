import fs from "fs/promises";
import process from "node:process";
import console from "node:console";
import { config } from "dotenv";

config();

console.log(process.cwd());

const SECRET_PATH = "/run/secrets";
const CONFIG_PATH = "/run/configs/app_config";

// Local dev fallback config
const devConfig = {
  app: {
    port: process.env.PORT || 7000,
    nodeEnv: "development",
    logLevel: "info",
    client_url: "http://localhost:5173",
  },
  mongo: {
    host: process.env.MONGO_HOST || "127.0.0.1", // Changed from "mongodb" to "127.0.0.1"
    port: process.env.MONGO_PORT || 27017,
    authSource: "admin",
  },
};

// Load non-sensitive config
async function loadConfig() {
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    // ✅ Fall back to devConfig in local development
    if (process.env.NODE_ENV !== "production") {
      console.warn("No Docker config found, using local dev config");
      return devConfig;
    }
    throw new Error("Failed to load app config", { cause: error });
  }
}

// Load a single Docker secret with env var fallback
// Load a single Docker secret with env var fallback
async function readSecret(name) {
  const envKey = name.toUpperCase();

  // Detect Docker
  const isDocker = await fs
    .access("/.dockerenv")
    .then(() => true)
    .catch(() => false);

  // 1. If running inside Docker → use secrets
  if (isDocker) {
    try {
      return (await fs.readFile(`${SECRET_PATH}/${name}`, "utf8")).trim();
    } catch (error) {
      throw new Error(`Docker secret "${name}" not found`, { cause: error });
    }
  }

  // 2. If running locally → return env value if present, or empty string for optional secrets
  if (process.env[envKey] !== undefined) {
    return process.env[envKey];
  }

  // Mandatory secrets (JWT keys) should still throw if missing
  if (name.startsWith("jwt_")) {
    throw new Error(
      `Secret "${name}" not found (expected env var ${envKey} in development)`,
    );
  }

  // Optional secrets (like DB credentials for local unauthenticated Mongo) return ""
  return "";
}

// Load everything once at startup
async function loadSecrets() {
  const [config, jwtPrivateKey, jwtPublicKey, mongoPassword, mongoUsername] =
    await Promise.all([
      loadConfig(),
      readSecret("jwt_private_key"),
      readSecret("jwt_public_key"),
      readSecret("db_password"),
      readSecret("db_username"),
    ]);

  return {
    // From config.json
    port: config.app.port,
    logLevel: config.app.logLevel,
    nodeEnv: config.app.nodeEnv,
    clientUrl: config.app.client_url,
    mongo: {
      host: config.mongo.host,
      port: config.mongo.port,
      authSource: config.mongo.authSource,
    },

    // From Docker secrets
    jwtPrivateKey,
    jwtPublicKey,
    mongoPassword,
    mongoUsername,
  };
}

export { loadSecrets };
