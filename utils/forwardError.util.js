const forwardError = (msg, status, next) => {
    const error = new Error(msg);
    error.status = status;
    if(!next) throw error;
    next(error);
};

module.exports = forwardError;
