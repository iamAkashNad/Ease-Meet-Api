const { Schema, model } = require("mongoose");

const appointmentSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  agenda: {
    type: String,
    required: true,
  },
  start: {
    type: Number,
    required: true,
  },
  end: {
    type: Number,
    required: true
  },
  admin: {
    type: Schema.ObjectId,
    ref: "User",
    required: true,
  },
  guest: {
    type: Schema.ObjectId,
    ref: "User",
    required: true,
  }
});

module.exports = model("Appointment", appointmentSchema);
