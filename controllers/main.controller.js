const { validationResult } = require("express-validator");

const User = require("../models/user.model");
const OffHour = require("../models/offhour.model");
const Appointment = require("../models/appointment.model");

const forwardError = require("../utils/forwardError.util");
const {
  getQueryForOffHour,
  getQueryForAppointment,
} = require("../utils/getQuery.util");
const sendEmail = require("../utils/Emails/sendEmail.util");

const { convertDate, convertTime } = require("../utils/convertDateTime.util");

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({
      _id: { $ne: req.userId },
      verified: true,
    }).select("-password -util");
    res.json({
      success: true,
      message: "All users fetched Successfully!",
      users: users.map((user) => user._doc),
    });
  } catch (error) {
    next(error);
  }
};

exports.getUpcomingAppoinments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({
      $or: [
        {
          admin: req.userId,
          end: { $gte: Date.now() },
        },
        {
          guest: req.userId,
          end: { $gte: Date.now() },
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

  //Clean Up
  Appointment.deleteMany({
    $or: [
      {
        admin: req.userId,
        end: { $lt: Date.now() },
      },
      {
        guest: req.userId,
        end: { $lt: Date.now() },
      },
    ],
  }).catch(() => {});
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

  if (startTime <= Date.now() + (1000 * 60 * 20)) {
    return forwardError(
      "You can't schedule an appointment in past or under 20 minutes from now - please choose a date in future!",
      400,
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
      "You can't schedule appointment with anyone in between 9:00 PM to 6:59 AM.",
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
    const admin = await User.findById(req.userId).select("verified name email");
    if (!admin.verified) {
      forwardError(
        "You have to be verified for schedule appointments to someone - please verify your email first!",
        400
      );
    }
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

    const user = await User.findById(guest).select("verified name email");
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

    sendEmail("meet-schedule", {
      email: user.email,
      name: user.name,
      admin_name: admin.name,
      admin_email: admin.email,
      date: convertDate(startTime),
      time: convertTime(startTime),
      duration,
    }).catch(() => {});

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

exports.cancelAppointment = async (req, res, next) => {
  const { meetId } = req.params;

  let admin, guest, startTime, endTime;
  try {
    const meet = await Appointment.findById(meetId)
      .populate("admin", "name email")
      .populate("guest", "name email");
    if (!meet) {
      forwardError(
        "Appointment not Found - Seems like there is no appointment with that kind!",
        404
      );
    }

    if (
      meet.guest._id.toString() !== req.userId &&
      meet.admin._id.toString() !== req.userId
    ) {
      forwardError("You are not authorized to cancel this appointment!", 403);
    }

    if (meet.start <= Date.now() && Date.now() <= meet.end) {
      forwardError(
        "The appointment is currently going on - So canceling it, is not possible!",
        400
      );
    }

    if (meet.end < Date.now()) {
      forwardError("The appointment was already done - So, canceling it have no meaning!", 400);
    }

    if (meet.cancel) {
      forwardError("The appointment is already canceled!", 400);
    }

    admin = meet.admin._doc;
    guest = meet.guest._doc;
    startTime = meet.start;
    endTime = meet.end;

    meet.cancel = true;
    await meet.save();

    res
      .status(200)
      .json({ success: true, message: "Appointment canceled Successfully!" });
  } catch (error) {
    return next(error);
  }

  //Send mail to other person (not the one who cancel the appointment)
  //who is also associated with the appointment for notifying him that appointment is canceled.
  try {
    const cancelBy = req.userId === guest._id.toString() ? "guest" : "admin";
    const receipentEmail = cancelBy === "guest" ? admin.email : guest.email;
    const receipentName = cancelBy === "guest" ? admin.name : guest.name;
    const userEmail = cancelBy !== "guest" ? admin.email : guest.email;
    const userName = cancelBy !== "guest" ? admin.name : guest.name;

    const date = convertDate(new Date(startTime));
    const time = convertTime(new Date(startTime));

    sendEmail("meet-cancel", {
      cancelBy,
      email: receipentEmail,
      name: receipentName,
      user_email: userEmail,
      user_name: userName,
      date,
      time,
      duration: (endTime - startTime) / (1000 * 60 * 60),
    }).catch(() => {});
  } catch (error) {}
};
