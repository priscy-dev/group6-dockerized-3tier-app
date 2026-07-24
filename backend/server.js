import { config } from "dotenv";
import app from "./app.js";
import environment from "./config/environment.js";
import logger from "./lib/logger.js";
import connectDB from "./db/connect.js";
config();

await connectDB(environment.DATABASE_URL);

const server = app.listen(environment.PORT, () => {
  logger.info(
    `🚀 Server running at http://${environment.HOST}:${environment.PORT}`,
  );
});

const shutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    logger.info("Server closed.");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
