const parseRedisUrl = (redisUrl) => {
  const url = new URL(redisUrl);

  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username: url.username ? decodeURIComponent(url.username) : undefined,
    password: url.password ? decodeURIComponent(url.password) : undefined,
    db: url.pathname ? Number(url.pathname.replace("/", "") || 0) : 0,
    tls: url.protocol === "rediss:" ? {} : undefined,
  };
};

export const getBullMQConnection = () => {
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    return {
      ...parseRedisUrl(redisUrl),
      maxRetriesPerRequest: null,
    };
  }

  return {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT || 6379),
    maxRetriesPerRequest: null,
  };
};
