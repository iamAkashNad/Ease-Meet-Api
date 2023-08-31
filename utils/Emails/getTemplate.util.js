const getTamplate = (purpose, data) => {
  if (purpose === "email-verify") {
    return `
            <section>
                <h4>Hello ${data.name},</h4>
                <p>This is the OTP for verification of your email which will be expires in 30 minutes.</p>
                <p>[ ${data.code} ]</p>
                <p style="font-weight: bold;">Note: If you are not the one who suppose to get this email, please ignore this mail.</p>
            </section>
        `;
  } else if (purpose === "forgot-pass") {
    return `
      <section>
          <h4>Hello ${data.name},</h4>
          <p>This is the OTP for forgot your password which will be expires in 10 minutes.</p>
          <p>[ ${data.code} ]</p>
          <p style="font-weight: bold;">Note: If you are not trying to forgot the password, please ignore this mail. And also not give this OTP to other because by this your account password can be reset.</p>
      </section>
    `;
  }
};

module.exports = getTamplate;
