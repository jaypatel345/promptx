import Redis from "ioredis";

let redis;

if (process.env.NODE_ENV !== "test") {
  // ioredis supports REDIS_URL and standard host/port envs via constructor options.
  // Default `new Redis()` will use 127.0.0.1:6379.
  redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : new Redis();

  redis.on("connect", () => {
    console.log("Redis connected");
  });

  redis.on("ready", () => {
    console.log("Redis ready");
  });

  redis.on("error", (err) => {
    // Prevent "Unhandled error event" crashes/noise and keep logs actionable.
    console.error("Redis error:", {
      message: err?.message,
      code: err?.code,
    });
  });

  redis.on("reconnecting", () => {
    console.warn("Redis reconnecting");
  });
}

export const pingRedis = async (timeoutMs = 500) => {
  if (!redis) return { ok: false, reason: "disabled" };

  try {
    const pong = await Promise.race([
      redis.ping(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), timeoutMs),
      ),
    ]);
    return { ok: pong === "PONG" };
  } catch (error) {
    return { ok: false, reason: error?.message || "ping_failed" };
  }
};

export default redis;
