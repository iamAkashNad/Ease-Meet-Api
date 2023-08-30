const mongoose = require("mongoose");

const connect = async () => {
    await mongoose.connect(process.env.MONGODB_SERVER + "/" + process.env.MONGO_DB);
};

module.exports = connect;
