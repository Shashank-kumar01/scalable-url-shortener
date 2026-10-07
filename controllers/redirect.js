import { URLSchema } from "../model/model.js";
import { redis } from "../model/redis.js";

export const Redirect = async (req, res) => {
  const param = req.params.route?.trim();

  if (!param) {
    return res.status(400).json({ msg: "Short code is required" });
  }

  try {
    const cacheKey = `redirect:${param}`;
    const cachedURL = await redis.get(cacheKey);

    if (cachedURL) {
      console.log("Redis hit");
      return res.redirect(302, cachedURL);
    }

    const url = await URLSchema.findOne({ short: param }).lean();

    if (!url) {
      return res.status(404).json({ msg: "URL not found" });
    }

    await redis.set(cacheKey, url.original, "EX", 86400);

    return res.redirect(302, url.original);
  } catch (error) {
    console.error("Redirect error:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};
