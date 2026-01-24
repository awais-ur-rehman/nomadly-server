import mongoose from "mongoose";
import { logger } from "../utils/logger";

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error({ error }, "MongoDB connection error");
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  logger.error({ error: err }, "MongoDB error");
});

export const closeDatabase = async (): Promise<void> => {
  await mongoose.connection.close();
  logger.info("Database connection closed");
};
