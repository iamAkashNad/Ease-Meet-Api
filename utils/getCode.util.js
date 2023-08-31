const { v4: getID } = require("uuid");

const getCode = () => {
  let code = "";

  while (!code) {
    getID()
      .split("-")
      .forEach((cd) => {
        if (cd.length >= 6) code = cd;
      });
  }

  return code.slice(0, 6);
};

module.exports = getCode;
