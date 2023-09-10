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
  } else if (purpose === "meet-schedule") {
    return `
      <section>
          <h4>Hello ${data.name},</h4>
          <p>This is a email regerding to your appintment which is scheduled!</p>
          <p>${data.admin_name} is actually have schedule an appointment. So, we schedule the appointment on behalf of ${data.admin_name}!</p>
          <section>
            <h4>Appointment Details</h4>
            <hr />
            <p>Date: ${data.date}</p>
            <hr />
            <p>Time: ${data.time}</p>
            <hr />
            <p>Duration: ${data.duration} hours</p>
            <hr />
          </section>
          <p style="font-weight: bold;">Note: If you want to communicate with him you can visit our site or mail him directly to ${data.admin_email} for pre-appointment discuss or like that.</p>
      </section>
    `;
  } else if (purpose === "meet-cancel") {
    return `
      <section>
          <h4>Hello ${data.name},</h4>
          <p>This is a email regerding to your scheduled appintment which is cancel by ${data.cancelBy}!</p>
          <p>${data.user_name} is cancel the appointment for some reason.</p>
          <section>
            <h4>Appointment Details</h4>
            <hr />
            <p>Date: ${data.date}</p>
            <hr />
            <p>Time: ${data.time}</p>
            <hr />
            <p>Duration: ${data.duration} hours</p>
            <hr />
          </section>
          <p style="font-weight: bold;">Note: If you want to communicate with him about why he/she cancel the appointment, mail him directly to ${data.user_email}.</p>
      </section>
    `;
  }
};

module.exports = getTamplate;
