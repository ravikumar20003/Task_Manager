const cookieName = process.env.AUTH_COOKIE_NAME || "ttm_token";

const sameSite = process.env.COOKIE_SAMESITE || (process.env.NODE_ENV === "production" ? "none" : "lax");

const authCookieName = cookieName;

const authCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite,
  maxAge,
  path: "/",
});

const setAuthCookie = (res, token, maxAge) => {
  res.cookie(cookieName, token, authCookieOptions(maxAge));
};

const clearAuthCookie = (res) => {
  res.clearCookie(cookieName, authCookieOptions(0));
};

module.exports = { authCookieName, authCookieOptions, setAuthCookie, clearAuthCookie };
