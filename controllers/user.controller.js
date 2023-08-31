const { compare, hash } = require("bcryptjs");
const { validationResult, body } = require("express-validator");

const User = require("../models/user.model");
const OffHour = require("../models/offhour.model");

const forwardError = require("../utils/forwardError.util");
const getCode = require("../utils/getCode.util");
const sendEmail = require("../utils/Emails/sendEmail.util");

exports.updateProfileName = async (req, res, next) => {
  const { errors } = validationResult(req);

  if (errors.length > 0) {
    req.fields = errors.map((error) => error.path);
    return forwardError(errors[0].msg, 422, next);
  }

  const { name, password } = req.body;
  try {
    const user = await User.findById(req.userId);
    if (!user) forwardError("User not Found!", 404);

    const isMatched = await compare(password, user.password);
    if (!isMatched) forwardError("Please enter correct credentials", 422);

    if (user.name !== name) {
      user.name = name;
      await user.save();
    }

    res.json({ success: true, message: "User name is updated Successfully!" });
  } catch (error) {
    next(error);
  }
};

exports.sendVerificationCodeForForgotPassword = async (req, res, next) => {
  const { email } = req.query;

  try {
    const user = await User.findOne({ email });
    if (!user)
      forwardError(
        "Please check the email - the one you entered wasn't present in our database.",
        404
      );
    if (!user.verified)
      forwardError("Your email wasn't verified - please verify it first!", 400);

    const code = getCode();
    user.util = {
      fp_code: code,
      expiresIn: Date.now() + 1000 * 60 * 10,
    };
    await user.save();
    sendEmail("forgot-pass", { name: user.name, email, code }).catch(() => {});
    res.json({ success: true, message: "Code send Successfully!" });
  } catch (error) {
    next(error);
  }
};

exports.updatePassword = async (req, res, next) => {
  const { errors } = validationResult(req);

  if (errors.length > 0) {
    req.fields = errors.map((error) => error.path);
    return forwardError(errors[0].msg, 422, next);
  }

  const { code, password, email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      forwardError(
        "Please check the email - the one you entered wasn't present in our database.",
        404
      );
    if (!user.verified)
      forwardError("Your email wasn't verified - please verify it first!", 400);

    const util = user.util;
    user.util = null;
    if (!util || util.fp_code !== code || Date.now() >= util.expiresIn) {
      await user.save();
      forwardError(
        !util
          ? "Please sent code first for reset the password!"
          : util.fp_code !== code
          ? "Invalid Code - Reset password fails!"
          : "Code Expires - Reset password fails!",
        400
      );
    }
    const hashedPassword = await hash(password, 12);
    user.password = hashedPassword;
    await user.save();
    res.json({ success: true, message: "Password updated Successfully!" });
  } catch (error) {
    next(error);
  }
};

exports.getOffHours = async (req, res, next) => {
  try {
    const offHours = await OffHour.find({ user: req.userId }).sort({
      start: 1,
    });
    res.json({
      success: true,
      message: "Off hours fetched Successfully!",
      offHours: offHours.map((offHour) => offHour._doc),
    });
  } catch (error) {
    next(error);
  }
};

exports.addOffHours = async (req, res, next) => {
  const { start, end, flag } = req.body;
  const startTime = new Date(start);
  const endTime = new Date(end);
  if (startTime == "Invalid Date" || endTime == "Invalid Date") {
    return forwardError(
      "Please enter a valid date-time for your offhours",
      422,
      next
    );
  }

  const startMilli = startTime.getTime();
  const endMilli = endTime.getTime();
  if (startMilli >= endMilli) {
    return forwardError(
      "Invalid Interval - your offhour ends before start or at the same time!",
      422,
      next
    );
  }

  if (startMilli <= Date.now() + 1000 * 60 * 15) {
    return forwardError(
      "You can't set your off time in the past time or near present time [Means under 15 minutes] - It should only be in the future!",
      422,
      next
    );
  }

  try {
    const offHours = await OffHour.find({ user: req.userId });
    const mergeIndex = offHours.findIndex(
      (offHour) =>
        (offHour.start <= startMilli && startMilli <= offHour.end) ||
        (offHour.start <= endMilli && endMilli <= offHour.end)
    );

    if (mergeIndex >= 0)
      forwardError(
        "Fail to add Off Hour to your list - Your atleast one of the off hour have some shared time with current one!",
        422
      );

    const offHour = new OffHour({
      start: startMilli,
      end: endMilli,
      user: req.userId,
    });

    await offHour.save();
    res.status(201).json({
      success: true,
      message: "Adding off hour to the user Successful!",
      offHour: offHour._doc,
    });
  } catch (error) {
    next(error);
  }
};
