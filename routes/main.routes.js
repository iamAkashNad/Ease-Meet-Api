const { Router } = require("express");

const authMiddleware = require("../middlewares/auth.middleware");

const { getUpcomingAppoinments, scheduleAppointment, getAllUsers } = require("../controllers/main.controller");

const { meetValidation } = require("../validations/meet.validation");

const router = Router();

router.get("/", authMiddleware, getAllUsers);

router.get("/appointments", authMiddleware, getUpcomingAppoinments);

router.post("/appointments/schedule", authMiddleware, meetValidation(), scheduleAppointment);

module.exports = router;
