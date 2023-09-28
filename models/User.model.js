const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        // Use a regular expression to check for a 10-digit number
        return /^\d{10}$/.test(v);
      },
      message: "Phone number must be a 10-digit number without alphabets"
    }
  }
});

module.exports = model("User", userSchema);
