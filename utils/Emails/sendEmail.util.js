const transporter = require("./getEmailTransporter.util");
const getSubject = require("./getSubject.util");
const getTamplate = require("./getTemplate.util");

const sendEmail = (purpose, data) => {
    const subject = getSubject(purpose);
    const html = getTamplate(purpose, data);
    return transporter.sendMail({
        from: "Team EaseMeet <no-reply@easemeet.com>",
        to: `${data.name} <${data.email}>`,
        subject,
        html
    });
};

module.exports = sendEmail;
