const { Router } = require("express");
const { updateProfileName, sendVerificationCodeForForgotPassword, updatePassword, addOffHours, getOffHours, deleteOffHour, getProfile } = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const { validName, validPassword } = require("../validations/auth.validations").validations;

const router = Router();

router.get("/", authMiddleware, getProfile);

router.patch("/update", authMiddleware, validName(), updateProfileName);

router.get("/password/forgot", sendVerificationCodeForForgotPassword);

router.patch("/password/forgot", validPassword(), updatePassword);

router.get("/off-hours", authMiddleware, getOffHours);

router.post("/off-hours/add", authMiddleware, addOffHours);

router.delete("/off-hours/:offHourId", authMiddleware, deleteOffHour);

module.exports = router;
