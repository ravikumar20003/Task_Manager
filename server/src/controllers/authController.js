const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { authCookieName, clearAuthCookie, setAuthCookie } = require("../utils/cookies");
const { createSession, destroySession } = require("../services/sessionService");

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const signup = async (req, res) => {
  const { name, email, password, role } = req.validated;
  const existing = await User.findOne({ email });

  if (existing) return res.status(409).json({ message: "Email already in use" });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: role || "MEMBER",
  });

  const session = await createSession(user);
  setAuthCookie(res, session.token, session.maxAge);

  res.status(201).json({ user: serializeUser(user) });
};

const login = async (req, res) => {
  const { email, password } = req.validated;
  const user = await User.findOne({ email }).select("+passwordHash");

  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: "Invalid credentials" });

  const session = await createSession(user);
  setAuthCookie(res, session.token, session.maxAge);

  res.json({ user: serializeUser(user) });
};

const logout = async (req, res) => {
  await destroySession(req.cookies?.[authCookieName]);
  clearAuthCookie(res);
  res.json({ message: "Logged out" });
};

const me = async (req, res) => {
  res.json({ user: serializeUser(req.user) });
};

module.exports = { signup, login, logout, me };
