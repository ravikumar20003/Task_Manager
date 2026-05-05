const { body } = require("express-validator");

const signupRules = [
  body("name").trim().isLength({ min: 2, max: 80 }).withMessage("Name must be between 2 and 80 characters"),
  body("email").trim().isEmail().withMessage("Enter a valid email").normalizeEmail(),
  body("password").isLength({ min: 6, max: 128 }).withMessage("Password must be between 6 and 128 characters"),
  body("role").optional().isIn(["ADMIN", "MEMBER"]).withMessage("Role must be ADMIN or MEMBER"),
];

const loginRules = [
  body("email").trim().isEmail().withMessage("Enter a valid email").normalizeEmail(),
  body("password").isLength({ min: 6, max: 128 }).withMessage("Password must be between 6 and 128 characters"),
];

module.exports = { signupRules, loginRules };
