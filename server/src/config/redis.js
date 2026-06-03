import Redis from "ioredis";

class RedisClient {
  static instance = null;

  static getInstance() {
    if (process.env.NODE_ENV === "test") {
      return null;
    }

    if (this.instance) {
      console.log("Using existing Redis connection");
      return this.instance;
    }

    this.instance = process.env.REDIS_URL
      ? new Redis(process.env.REDIS_URL)
      : new Redis();

    this.instance.on("connect", () => {
      console.log("Redis connected");
    });

    this.instance.on("ready", () => {
      console.log("Redis ready");
    });

    this.instance.on("error", (err) => {
      console.error("Redis error:", {
        message: err?.message,
        code: err?.code,
      });
    });

    this.instance.on("reconnecting", () => {
      console.warn("Redis reconnecting");
    });

    return this.instance;
  }

  static async ping(timeoutMs = 500) {
    const redis = this.getInstance();

    if (!redis) {
      return { ok: false, reason: "disabled" };
    }

    try {
      const pong = await Promise.race([
        redis.ping(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), timeoutMs),
        ),
      ]);

      return { ok: pong === "PONG" };
    } catch (error) {
      return {
        ok: false,
        reason: error?.message || "ping_failed",
      };
    }
  }

  static async get(key) {
    const redis = this.getInstance();
    if (!redis) {
      return null;
    }

    return redis.get(key);
  }

  static async set(key, value, ...args) {
    const redis = this.getInstance();
    if (!redis) {
      return null;
    }

    return redis.set(key, value, ...args);
  }

  static async del(key) {
    const redis = this.getInstance();
    if (!redis) {
      return null;
    }

    return redis.del(key);
  }

  static async close() {
    if (!this.instance) {
      return;
    }

    const redis = this.instance;
    this.instance = null;

    try {
      await redis.quit();
      console.log("Redis connection closed");
    } catch (error) {
      console.error("Redis close error:", {
        message: error?.message,
        code: error?.code,
      });
      redis.disconnect();
    }
  }
}

export default RedisClient;
