const { hash } = require("bcryptjs");
const { validationResult } = require("express-validator");

const User = require("../models/user.model");

const forwardError = require("../utils/forwardError.util");

exports.signup = async (req, res, next) => {
  const { errors } = validationResult(req);
  if (errors.length > 0) {
    req.fields = errors.map((error) => error.path);
    return forwardError(errors[0].msg, 422, next);
  }

  const { email, name, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) forwardError("User already exists with that email!", 400);

    const hashedPassword = await hash(password, 12);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res
      .status(201)
      .json({ success: true, message: "User created Successfully!" });
  } catch (error) {
    next(error);
  }
};
