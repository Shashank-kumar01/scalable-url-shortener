import { nanoid } from "nanoid";
import { URLSchema } from "../model/model.js";
import { redis } from "../model/redis.js";

export const Short = async (req, res) => {
  const originalURL = req.body?.original?.trim();

  // 1. Check if URL was provided
  if (!originalURL) {
    return res.status(400).json({
      msg: "URL is required"
    });
  }

  // 2. Validate URL
  let parsedURL;

  try {
    parsedURL = new URL(originalURL);
  } catch {
    return res.status(400).json({
      msg: "Invalid URL provided"
    });
  }

  // 3. Only allow HTTP/HTTPS
  if (!["http:", "https:"].includes(parsedURL.protocol)) {
    return res.status(400).json({
      msg: "Only HTTP and HTTPS URLs are supported"
    });
  }

  const cacheKey = `short:${originalURL}`;
  const lockKey = `lock:${originalURL}`;

  let lockAcquired = false;

  try {
    // 4. Check Redis cache first
    const cachedShort = await redis.get(cacheKey);

    if (cachedShort) {
      return res.status(200).json({
        url: cachedShort,
        msg: "Short URL already exists"
      });
    }

    // 5. Acquire Redis lock
    const lockResult = await redis.set(
      lockKey,
      "1",
      "PX",
      5000,
      "NX"
    );

    if (lockResult !== "OK") {
      return res.status(409).json({
        msg: "This URL is currently being processed. Try again."
      });
    }

    lockAcquired = true;

    // 6. Check MongoDB
    const exists = await URLSchema
      .findOne({ original: originalURL })
      .lean();

    if (exists) {
      await redis.set(
        cacheKey,
        exists.short,
        "EX",
        86400
      );

      return res.status(200).json({
        url: exists.short,
        msg: "Short URL already exists"
      });
    }

    // 7. Generate short ID
    const uid = nanoid(7);

    // 8. Save to MongoDB
    await URLSchema.create({
      original: originalURL,
      short: uid
    });

    // 9. Save in Redis cache
    await redis.set(
      cacheKey,
      uid,
      "EX",
      86400
    );

    // 10. Send response
    return res.status(201).json({
      msg: "URL generated",
      url: uid
    });

  } catch (error) {

    console.error("Shorten URL error:", error);

    // Handle duplicate URL
    if (error?.code === 11000) {
      const existing = await URLSchema
        .findOne({ original: originalURL })
        .lean();

      if (existing) {
        await redis.set(
          cacheKey,
          existing.short,
          "EX",
          86400
        );

        return res.status(200).json({
          url: existing.short,
          msg: "Short URL already exists"
        });
      }
    }

    // Return actual error message while debugging
    return res.status(500).json({
      msg: error.message || "Internal server error"
    });

  } finally {

    // Release Redis lock
    if (lockAcquired) {
      await redis.del(lockKey).catch((error) => {
        console.error(
          "Failed to release Redis lock:",
          error.message
        );
      });
    }
  }
};