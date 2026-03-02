import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import config from "./config";
import { connectRedis, disconnectRedis } from "./config/redis.config";

const port = config.port || 5000;

let server: Server;
let shuttingDown = false;

async function main() {
  try {
    await mongoose.connect(config.database_url as string);

    // Connect Redis (optional - won't crash if unavailable)
    try {
      await connectRedis();
    } catch (err) {
      console.warn('⚠️  Redis not available. OTP features will not work.');
    }

    server = app.listen(port, () => {
      console.log(`Milko Server listening on port ${port}`);
    });

    process.on("SIGINT", gracefulShutdown);
    process.on("SIGTERM", gracefulShutdown);
    process.on("uncaughtException", (err) => {
      console.error("Uncaught Exception:", err);
      gracefulShutdown();
    });
    process.on("unhandledRejection", (reason) => {
      console.error("Unhandled Rejection:", reason);
      gracefulShutdown();
    });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

async function gracefulShutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log("Graceful shutdown initiated...");

  try {
    if (server) {
      await new Promise<void>((resolve) => {
        server!.close(() => {
          console.log("HTTP server closed");
          resolve();
        });
      });
    }
    try {
      await disconnectRedis();
    } catch (err) {
      console.warn('Redis disconnect skipped');
    }
    await mongoose.disconnect();
    console.log("All connections closed. Exiting.");
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
}

main();
