const { Router } = require("express");

const { signupValidation, loginValidation } = require("../validations/auth.validations");

const { signup, login } = require("../controllers/auth.controller");

const router = Router();

router.post("/signup", signupValidation(), signup);

router.post("/login", loginValidation(), login);

module.exports = router;
