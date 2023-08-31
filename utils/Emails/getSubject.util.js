const getSubject = (purpose) => {
    if(purpose === "email-verify") return "[IMPORTENT] Email Verification";
    return "Email from EaseMeet!"
};

module.exports = getSubject;
