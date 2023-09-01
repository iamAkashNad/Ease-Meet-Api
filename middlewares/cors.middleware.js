const cors = (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", process.env.ORIGIN);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Authorization,Content-Type");
    next();
};

module.exports = cors;
