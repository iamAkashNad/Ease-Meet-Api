const { Router } = require("express");
const { updateProfileName, sendVerificationCodeForForgotPassword, updatePassword } = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const { validName, validPassword } = require("../validations/auth.validations").validations;

const router = Router();

router.patch("/update", authMiddleware, validName(), updateProfileName);

router.get("/password/forgot", sendVerificationCodeForForgotPassword);

router.patch("/password/forgot", validPassword(), updatePassword);

module.exports = router;
