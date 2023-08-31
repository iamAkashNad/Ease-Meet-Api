const Appointment = require("../models/appointment.model");

exports.getUpcomingAppoinments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({
        $or: [
          {
            admin: req.userId,
            start: { $gte: Date.now() },
          },
          {
            guest: req.userId,
            start: { $gte: Date.now() },
          },
        ],
      }).sort({ start: 1 });

    res.json({ success: true, message: "Upcoming Appoinments", appointments });
  } catch (error) {
    next(error);
  }
};
