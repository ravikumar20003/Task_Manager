const jwt = require("jsonwebtoken");

const sevenDaysInSeconds = 7 * 24 * 60 * 60;

const tokenTtlSeconds = Number(process.env.JWT_TTL_SECONDS) || sevenDaysInSeconds;

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required");
  }

  return process.env.JWT_SECRET;
};

const signToken = (user, jti) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
    },
    getJwtSecret(),
    { expiresIn: tokenTtlSeconds, jwtid: jti }
  );

const verifyToken = (token) => jwt.verify(token, getJwtSecret());

module.exports = { tokenTtlSeconds, signToken, verifyToken };
