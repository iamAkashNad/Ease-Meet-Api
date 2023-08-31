const getSubject = (purpose) => {
    if(purpose === "email-verify") return "[IMPORTENT] Email Verification";
    else if(purpose === "forgot-pass") return "[IMPORTENT] Forgot Password";
    return "Email from EaseMeet!"
};

module.exports = getSubject;
