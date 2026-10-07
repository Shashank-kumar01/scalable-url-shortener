import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";

import { Short } from "./controllers/short.js";
import { Redirect } from "./controllers/redirect.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = Number(process.env.PORT) || 3000;

const limit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(limit);
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/short", Short);
app.get("/:route", Redirect);

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ msg: "Internal server error" });
});

const start = async () => {
  if (!process.env.MONGODB_URL) {
    throw new Error("MONGODB_URL is missing from .env");
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB connected successfully");

    app.listen(port, "0.0.0.0", () => {
      console.log(`Server started on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

start();
