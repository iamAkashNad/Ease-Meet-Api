const { body } = require("express-validator");

const helper = (value, field) => {
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (
      ("A" > char || char > "Z") &&
      ("a" > char || char > "z") &&
      char !== " " &&
      char !== "!" &&
      char !== "?"
    )
      throw new Error(
        `${field} only contains alphabets, whites spaces, '!' & '?'.`
      );
  }
  return true;
};

const isValidTitle = () => {
  return body("title", "Please enter a valid title for the appointment.")
    .trim()
    .notEmpty()
    .isLength({ min: 5, max: 60 })
    .withMessage("Title must contains 5-60 characters.")
    .custom((title) => {
      return helper(title, "title");
    });
};

const isValidAgenda = () => {
  return body("agenda", "Please enter a valid title for the appointment.")
    .trim()
    .notEmpty()
    .isLength({ min: 10, max: 250 })
    .withMessage("Agenda must contains 10-250 characters.")
    .custom((agenda) => {
      return helper(agenda, "agenda");
    });
};

exports.meetValidation = () => [isValidTitle(), isValidAgenda()];
