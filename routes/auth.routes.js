const { Router } = require("express");

const { signupValidation, loginValidation } = require("../validations/auth.validations");

const { signup, login, sendVerificationCode, verifyEmail } = require("../controllers/auth.controller");

const router = Router();

router.post("/signup", signupValidation(), signup);

router.get("/signup/verify", sendVerificationCode);

router.post("/signup/verify", verifyEmail);

router.post("/login", loginValidation(), login);

module.exports = router;
