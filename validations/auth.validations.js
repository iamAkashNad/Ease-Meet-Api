const { body } = require("express-validator");

const isEmail = () => {
  return body("email", "Please enter a valid email")
    .trim()
    .notEmpty()
    .isEmail()
    .toLowerCase();
};

const validPassword = () => {
  return body("password", "Please enter secure password")
    .trim()
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage("Please enter password which contains minimum 6 characters.");
};

const validName = () => {
  return body("name", "Please enter a name")
    .trim()
    .notEmpty()
    .isLength({ min: 3 })
    .withMessage("The name must contains minimum 3 characters")
    .custom((name) => {
      for (let i = 0; i < name.length; i++) {
        const char = name[i];
        if (
          ("A" > char || char > "Z") &&
          ("a" > char || char > "z") &&
          char !== " "
        )
          throw new Error("Name must only contains alphabets & white spaces.");
      }
      return true;
    });
};

exports.signupValidation = () => [validName(), isEmail(), validPassword()];

exports.loginValidation = () => [isEmail(), validPassword()];
