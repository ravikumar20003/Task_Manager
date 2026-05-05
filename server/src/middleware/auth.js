const User = require("../models/User");
const { authCookieName } = require("../utils/cookies");
const { verifySession } = require("../services/sessionService");

const requireAuth = async (req, res, next) => {
  const token = req.cookies?.[authCookieName];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = await verifySession(token);
    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { requireAuth };
