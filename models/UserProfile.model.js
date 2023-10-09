const mongoose = require("mongoose");
const { Schema, model } = mongoose;

// remember to add more fields
const userProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" }
  },
  {
    timestamps: true
  }
);

module.exports = model("UserProfile", userProfileSchema);
