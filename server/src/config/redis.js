import Redis from "ioredis";

let redis;

if (process.env.NODE_ENV !== "test") {

  redis = new Redis();

  redis.on("connect", () => {

    console.log("Redis connected");

  });

}

export default redis;