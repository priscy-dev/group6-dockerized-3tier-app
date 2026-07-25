import pino from "pino";
import environment from "../config/environment.js";

const logger = pino({
  level: environment.LOG_LEVEL,
  // Containers write JSON to stdout for Docker/CloudWatch. Set LOG_PRETTY=true
  // only for a local Node.js run where the dev dependency is installed.
  transport: process.env.LOG_PRETTY === "true"
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
          ignore: "pid,hostname",
        },
      }
    : undefined,
});

export default logger;
