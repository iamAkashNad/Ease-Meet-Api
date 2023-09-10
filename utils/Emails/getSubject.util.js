const getSubject = (purpose) => {
    if(purpose === "email-verify") return "[IMPORTENT] Email Verification";
    else if(purpose === "forgot-pass") return "[IMPORTENT] Forgot Password";
    else if(purpose === "meet-schedule") return "You have a new Appointment!";
    else if(purpose === "meet-cancel") return "One of your appointment is cancel!";
    return "Email from EaseMeet!"
};

module.exports = getSubject;
