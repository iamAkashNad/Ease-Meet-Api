const { validationResult } = require("express-validator");

const User = require("../models/user.model");
const OffHour = require("../models/offhour.model");
const Appointment = require("../models/appointment.model");

const forwardError = require("../utils/forwardError.util");
const { getQueryForOffHour, getQueryForAppointment } = require("../utils/getQuery.util");

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
    })
      .sort({ start: 1 })
      .populate("admin", "-password -util")
      .populate("guest", "-password -util");

    const appointmentDocs = appointments.map((appointment) => {
      return {
        ...appointment._doc,
        admin: {
          ...appointment.admin._doc,
        },
        guest: {
          ...appointment.guest._doc,
        },
      };
    });

    res.json({
      success: true,
      message: "Upcoming Appoinments",
      appointments: appointmentDocs,
    });
  } catch (error) {
    next(error);
  }
};

exports.scheduleAppointment = async (req, res, next) => {
  const { errors } = validationResult(req);

  if (errors.length > 0) {
    req.fields = errors.map((error) => error.path);
    return forwardError(errors[0].msg, 422, next);
  }

  const { title, agenda, start, guest } = req.body;
  let duration = +req.body.duration;
  const startTime = new Date(start);
  if (startTime == "Invalid Date") {
    return forwardError(
      "Please enter a valid start time for the appointment.",
      422,
      next
    );
  }

  if (isNaN(duration))
    return forwardError(
      "Please enter a valid duration for the appointment.",
      422,
      next
    );
  if (duration > 3)
    return forwardError(
      "Appointment can't be more then 3 hours long!",
      422,
      next
    );
  if (duration !== 1 && duration !== 2 && duration !== 3)
    return forwardError(
      "The appointment can only be 1 or 2 or 3 hours long.",
      422,
      next
    );

  const startMilli = startTime.getTime();
  const endMilli = startMilli + 1000 * 60 * 60 * duration;

  const startHour = startTime.getHours();
  const endHour = new Date(endMilli).getHours();
  if (startHour >= 21 || startHour <= 6 || endHour >= 21 || endHour <= 6)
    return forwardError(
      "You can't schedule appointment with anyone in between 9:00 PM to 7:00 AM.",
      400,
      next
    );

  if (req.userId === guest)
    return forwardError(
      "Admin and guest of the appointment can't be same.",
      422,
      next
    );

  try {
    const offHoursForAdmin = await OffHour.find(
      getQueryForOffHour(req.userId, startMilli, endMilli)
    ).select("_id");
    if (offHoursForAdmin.length > 0)
      forwardError(
        "Fail to schedule the appointment - You have off hour at that time!",
        400
      );

    const appointmentsForAdmin = await Appointment.find(
      getQueryForAppointment(req.userId, startMilli, endMilli)
    ).select("_id");

    if (appointmentsForAdmin.length > 0)
      forwardError(
        "Fail to schedule the appointment - You have already an appointment at that time!",
        400
      );

    const user = await User.findById(guest);
    if (!user)
      forwardError("Guest's account not found for schedule appointment.", 404);

    if (!user.verified)
      forwardError(
        "Guest isn't verified, So you can't have an appointment with that user.",
        400
      );

    const offHoursForGuest = await OffHour.find(
      getQueryForOffHour(guest, startMilli, endMilli)
    ).select("_id");

    if (offHoursForGuest.length > 0)
      forwardError(
        "Fail to schedule the appointment - The guest has off hour at that time!",
        400
      );

    const appointmentsForGuest = await Appointment.find(
      getQueryForAppointment(guest, startMilli, endMilli)
    ).select("_id");

    if (appointmentsForGuest.length > 0)
      forwardError(
        "Fail to schedule the appointment - The guest is busy!",
        400
      );

    const appointment = new Appointment({
      title,
      agenda,
      admin: req.userId,
      guest,
      start: startMilli,
      end: endMilli,
    });
    const savedAppointment = await (
      await (await appointment.save()).populate("admin", "-password -util")
    ).populate("guest", "-password -util");

    res.status(201).json({
      success: true,
      message: "Appointment scheduled Successfully!",
      appointment: {
        ...savedAppointment._doc,
        admin: {
          ...savedAppointment.admin._doc,
        },
        guest: {
          ...savedAppointment.guest._doc,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
