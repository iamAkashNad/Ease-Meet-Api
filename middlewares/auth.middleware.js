const { verify } = require("jsonwebtoken");
const forwardError = require("../utils/forwardError.util");

const authMiddleware = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer"))
    forwardError("User not Authenticated!", 401);

  const token = authHeader.split(" ")[1];
  let payload;
  try {
    payload = verify(token, process.env.JWT_SECRET);
  } catch (error) {
    forwardError("User not Authenticated!", 401);
  }

  if (!payload) forwardError("User not Authenticated!", 401);
  req.userId = payload.userId;
  next();
};

module.exports = authMiddleware;
