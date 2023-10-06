const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const docProfilesToApproveSchema = new Schema({
  docProfileIds: [{ type: Schema.Types.ObjectId, ref: "DocProfile" }]
});

module.exports = model("docProfilesToApprove", docProfilesToApproveSchema);
