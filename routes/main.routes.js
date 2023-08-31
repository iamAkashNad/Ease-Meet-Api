const { Router } = require("express");

const authMiddleware = require("../middlewares/auth.middleware");

const { getUpcomingAppoinments } = require("../controllers/main.controller");

const router = Router();

router.get("/appointments", authMiddleware, getUpcomingAppoinments);

module.exports = router;
