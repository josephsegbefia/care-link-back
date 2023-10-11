const mongoose = require("mongoose");
const { Schema, model } = mongoose;

// remember to add more fields
const userProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    gender: { type: String, enum: ["Male", "Female"] },
    age: { type: Number },
    appointments: [{ type: Schema.Types.ObjectId, ref: "Appointemnt" }]
  },
  {
    timestamps: true
  }
);

module.exports = model("UserProfile", userProfileSchema);
