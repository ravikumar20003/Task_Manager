const { createClient } = require("redis");

let redisClient = null;

const cleanEnv = (value) => value?.trim().replace(/^['"]|['"]$/g, "");

const getRedisUrl = () => {
  const redisUrl = cleanEnv(process.env.REDIS_URL);
  if (redisUrl) return redisUrl;

  const host = cleanEnv(process.env.REDIS_HOST);
  const port = cleanEnv(process.env.REDIS_PORT);
  if (!host || !port) return "";

  const username = cleanEnv(process.env.REDIS_USERNAME) || "default";
  const password = cleanEnv(process.env.REDIS_PASSWORD);
  const protocol = cleanEnv(process.env.REDIS_TLS) === "true" ? "rediss" : "redis";
  const auth = password
    ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`
    : "";

  return `${protocol}://${auth}${host}:${port}`;
};

const connectRedis = async () => {
  const redisUrl = getRedisUrl();

  if (!redisUrl) {
    console.warn("Redis environment variables are not set. Redis-backed sessions are disabled.");
    return null;
  }

  redisClient = createClient({
    url: redisUrl,
    socket: {
      connectTimeout: 2000,
      reconnectStrategy: false,
    },
  });
  redisClient.on("error", (error) => {
    if (redisClient?.isOpen) {
      console.error("Redis error:", error.message);
    }
  });

  try {
    await redisClient.connect();
    console.log("Redis connected");
    return redisClient;
  } catch (error) {
    redisClient = null;

    if (process.env.REQUIRE_REDIS === "true") {
      throw error;
    }

    console.warn(`Redis connection failed (${error.message}). Continuing without Redis-backed sessions.`);
    return null;
  }
};

const getRedisClient = () => {
  if (!redisClient?.isOpen) return null;
  return redisClient;
};

module.exports = { connectRedis, getRedisClient };
