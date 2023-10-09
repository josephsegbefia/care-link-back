const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" }
  },
  {
    timestamps: true
  }
);
