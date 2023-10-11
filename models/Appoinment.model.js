const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const appointmentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "user" },
    doctorId: { type: Schema.Types.ObjectId, ref: "doctor" },
    date: { type: String }
  },
  {
    timestamps: true
  }
);

module.exports = model("Appointment", appointmentSchema);
