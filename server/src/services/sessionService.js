const { randomUUID } = require("crypto");
const { getRedisClient } = require("../config/redis");
const { signToken, tokenTtlSeconds, verifyToken } = require("../utils/token");

const sessionKey = (jti) => `team-task-manager:session:${jti}`;

const createSession = async (user) => {
  const jti = randomUUID();
  const token = signToken(user, jti);
  const redis = getRedisClient();

  if (redis) {
    await redis.set(sessionKey(jti), user._id.toString(), { EX: tokenTtlSeconds });
  }

  return {
    token,
    maxAge: tokenTtlSeconds * 1000,
  };
};

const verifySession = async (token) => {
  const payload = verifyToken(token);
  const redis = getRedisClient();

  if (redis) {
    const storedUserId = await redis.get(sessionKey(payload.jti));
    if (storedUserId !== payload.sub) {
      throw new Error("Session expired");
    }
  }

  return payload;
};

const destroySession = async (token) => {
  if (!token) return;

  try {
    const payload = verifyToken(token);
    const redis = getRedisClient();
    if (redis && payload.jti) {
      await redis.del(sessionKey(payload.jti));
    }
  } catch {
    // Cookie clearing should still happen even when the token is expired.
  }
};

module.exports = { createSession, verifySession, destroySession };
