const { Router } = require("express");

const { signupValidation } = require("../validations/auth.validations");

const { signup } = require("../controllers/auth.controller");

const router = Router();

router.post("/signup", signupValidation(), signup);

module.exports = router;
