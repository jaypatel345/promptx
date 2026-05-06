import redis from "../config/redis.js";

export const setCache = async (key, value, ttl = 60) => {
  try {
    const stringValue = JSON.stringify(value);
    await redis.set(key, stringValue, "EX", ttl);
  } catch (error) {
    console.log("Redis SET error:", error);
  }
};

export const getCache = async (key) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.log("Redis GET error:", error);
    return null;
  }
};

export const delCache = async (key) => {
  try {
    await redis.del(key);
  } catch (error) {
    console.log("Redis DEL error:", error);
  }
};
