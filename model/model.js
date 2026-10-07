import { Schema, model } from "mongoose";

const urlSchema = new Schema(
  {
    original: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    short: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    }
  },
  { timestamps: true }
);

export const URLSchema = model("URL", urlSchema);
