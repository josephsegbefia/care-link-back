const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const doctorSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  emailToken: { type: String },
  passwordResetToken: { type: String }
});

module.exports = model("Doctor", doctorSchema);
