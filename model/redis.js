import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is missing from .env");
}

export const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 2,
  enableReadyCheck: true
});

redis.on("connect", () => console.log("Redis connecting..."));
redis.on("ready", () => console.log("Redis connected successfully"));
redis.on("error", (error) => console.error("Redis error:", error.message));
