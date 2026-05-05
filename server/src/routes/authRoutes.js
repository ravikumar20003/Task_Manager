const { Router } = require("express");
const { login, logout, me, signup } = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { loginRules, signupRules } = require("../validators/authValidators");

const router = Router();

router.post("/signup", signupRules, validate, signup);
router.post("/login", loginRules, validate, login);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

module.exports = router;
