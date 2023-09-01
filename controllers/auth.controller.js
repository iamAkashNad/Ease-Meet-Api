const { hash, compare } = require("bcryptjs");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const User = require("../models/user.model");

const getCode = require("../utils/getCode.util");
const forwardError = require("../utils/forwardError.util");
const sendEmail = require("../utils/Emails/sendEmail.util");

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

exports.sendVerificationCode = async (req, res, next) => {
  const { email } = req.query;
  try {
    const existingUser = await User.findOne({ email });
    if(!existingUser) forwardError("Please check the email - the one you entered wasn't present in our database.", 404);

    if(existingUser.verified) forwardError("Your email was already verified!", 400);

    const code = getCode();
    existingUser.util = {
      code,
      expiresIn: Date.now() + 1000 * 60 * 30
    };

    await existingUser.save();
    sendEmail("email-verify", { name: existingUser.name, email: existingUser.email, code }).catch(() => {});

    res.json({ success: true, message: "Verification code send Successfully!" });
  } catch(error) {
    next(error);
  }
};

exports.verifyEmail = async (req, res, next) => {
  const { code, email } = req.body;

  try {
    const existingUser = await User.findOne({ "util.code": code, email });
    if(!existingUser) forwardError("Verification fails - Incorrect code Entered!", 422);
    
    if(existingUser.verified) forwardError("Your email was already verified!", 400);

    if(Date.now() >= existingUser.util.expiresIn) forwardError("Verification fails - Code Expires!", 422);

    existingUser.util = null;
    existingUser.verified = true;
    await existingUser.save();
    res.json({ success: true, message: "User Verified!" });
  } catch(error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const { errors } = validationResult(req);
  if (errors.length > 0) {
    req.fields = errors.map((error) => error.path);
    return forwardError(errors[0].msg, 422, next);
  }

  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) forwardError("Please enter a valid credentials!", 400);

    const isMatched = await compare(password, existingUser.password);
    if (!isMatched) forwardError("Please enter a valid credentials!", 400);

    if(existingUser.util) {
      existingUser.util = null;
      await existingUser.save();
    }

    const token = jwt.sign(
      { userId: existingUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );
    res.json({
      success: true,
      message: "Login Successful!",
      token,
      userId: existingUser._id,
    });
  } catch (error) {
    next(error);
  }
};
