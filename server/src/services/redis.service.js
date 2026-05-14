import RedisClient from "../config/redis.js";

export const setCache = async (key, value, ttl = 60) => {
  try {
    const stringValue = JSON.stringify(value);
    await RedisClient.set(key, stringValue, "EX", ttl);
  } catch (error) {
    console.log("Redis SET error:", error);
  }
};

export const getCache = async (key) => {
  try {
    const data = await RedisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.log("Redis GET error:", error);
    return null;
  }
};

export const delCache = async (key) => {
  try {
    await RedisClient.del(key);
  } catch (error) {
    console.log("Redis DEL error:", error);
  }
};
