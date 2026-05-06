import express from "express";
import { setCache, delCache, getCache } from "../services/redis.service.js";

const router = express.Router();

router.get("/test-cache", async (req, res) => {
  const key = "test:user";

  //try cache
  const cached = await getCache(key);
  if (cached) {
    return res.json({
      source: "cache",
      data: cached,
    });
  }
  const data = {
    name: "Jay",
    role: "Backend Developer",
    time: new Date(),
  };
  await setCache(key, data, 30);

  return res.json({
    source: "db",
    data,
  });
});

export default router;