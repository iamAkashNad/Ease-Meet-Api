const { Schema, model } = require("mongoose");

const offHourSchema = new Schema({
    start: {
        type: Number,
        required: true
    },
    end: {
        type: Number,
        required: true
    },
    flag: String,
    user: {
        type: Schema.ObjectId,
        ref: "User",
        required: true
    }
});

module.exports = model("OffHour", offHourSchema);
