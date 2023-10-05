const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const docProfileSchema = new Schema(
  {
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor" },
    phone: {
      type: String,
      validate: {
        validator: function (v) {
          // Use a regular expression to check for a 10-digit number
          return /^\d{10}$/.test(v);
        },
        message: "Phone number must be a 10-digit number without alphabets"
      }
    },
    specialty: { type: String },
    subSpecialty: { type: String },
    expYears: { type: Number },
    gender: { type: String },
    dob: { type: Date },
    profilePicUrl: { type: String },
    address: { type: String },
    boardCerts: [{ type: String }],
    boardCertsUrls: [{ type: String }],
    medicalLicenseNum: { type: String },
    medSchAttended: { type: String },
    residencyProg: { type: String },
    fellowshipProg: { type: String },
    yearGrad: { type: Date },
    currHospitalAffiliation: { type: String },
    prevWorkExp: { type: String },
    workingHrs: { type: String },
    appointmentDays: [{ type: String }],
    //   ratings: { type: Schema.Types.ObjectId, ref: "Ratings" },
    languagesSpoken: [{ type: String }],
    patientHistory: [{ type: Schema.Types.ObjectId, ref: "User" }],
    additionalInfo: { type: String }
  },
  {
    timestamps: true
  }
);

module.exports = model("DoctorProfile", docProfileSchema);
