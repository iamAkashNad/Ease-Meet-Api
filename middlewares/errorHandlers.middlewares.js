exports.resourceNotFound = (req, res, next) => {
    res.status(404).json({ success: false, message: "Resource not Found!" });
};

exports.defaultErrorHandler = (error, req, res, next) => {
    const errorResponse = {
        success: false,
        message: error.status ? error.message : "Something went wrong Internally!",
    };
    if(error.status === 422) errorResponse.fields = req.fields;
    
    res.status(error.status || 500).json(errorResponse);
};
