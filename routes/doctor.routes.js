const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Doctor = require("../models/Doctor.model");
const DoctorProfile = require("../models/DocProfile.model");
const crypto = require("crypto");
const {
  sendDocVerificationMail
} = require("../config/sendDocVerificationMail");
const { sendPasswordReset } = require("../config/sendPasswordResetEmail");

// const { isAuthenticated } = require("./../middleware/jwt.middleware");
const router = express.Router();
const saltRounds = 10;

// Sign up a new doctor
router.post("/doc-signup", (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  //   Check if fields arent empty
  if (email === "" || password === "" || firstName === "" || lastName === "") {
    res.status(400).json({ message: "Remmeber to fill all fields" });
    return;
  }

  //   Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Provide a valid email address" });
    return;
  }

  //   Validate strong password
  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      message:
        "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter."
    });
    return;
  }

  //   Check if the doctor already exists
  Doctor.findOne({ email }).then((foundDoc) => {
    if (foundDoc) {
      res.status(400).json({ message: "Doctor already exists. Log in" });
      return;
    }

    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);

    return Doctor.create({
      email,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      emailToken: crypto.randomBytes(64).toString("hex"),
      passwordResetToken: crypto.randomBytes(64).toString("hex")
    })
      .then((createdDoc) => {
        const {
          email,
          firstName,
          lastName,
          _id,
          emailToken,
          passwordResetToken,
          isApproved
        } = createdDoc;

        const doc = {
          email,
          firstName,
          lastName,
          _id,
          emailToken,
          passwordResetToken,
          isApproved
        };
        sendDocVerificationMail(doc);
        res.status(201).json({ doc: doc });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
      });
  });
});

// Post '/auth/doc-login'
router.post("/doc-login", (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password are provided as empty strings
  if (email === "" || password === "") {
    res.status(400).json({ message: "Please provide email and password" });
    return;
  }

  Doctor.findOne({ email })
    .then((foundDoc) => {
      if (!foundDoc) {
        res.status(401).json({ message: "Doctor does not exist" });
        return;
      }
      //   Remember to uncomment this when frontend is ready
      //   if (!foundDoc.isVerified) {
      //     res.status(401).json({
      //       message:
      //         "Please verify your account. An email verfication has been sent to your email"
      //     });
      //     return;
      //   }

      const passwordCorrect = bcrypt.compareSync(password, foundDoc.password);
      if (passwordCorrect) {
        const { _id, email, firstName, lastName } = foundDoc;

        const payload = { _id, email, firstName, lastName };
        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: "HS256",
          expiresIn: "8h"
        });
        res.status(200).json({ authToken: authToken });
      } else {
        res.status(401).json({
          message: "Unable to authenticate the user. Wrong email or password"
        });
      }
    })
    .catch((error) =>
      res.status(500).json({ message: "Internal Server Error" })
    );
});

// Verify doctors email
router.post("/doc-verify-email", async (req, res, next) => {
  try {
    const emailToken = req.body.emailToken;
    if (!emailToken)
      return res
        .status(404)
        .json({ message: "Email verification token not found." });

    const doc = await Doctor.findOne({ emailToken });
    if (doc) {
      doc.emailToken = null;
      doc.isVerified = true;
      await doc.save();

      await DoctorProfile.create({
        doctor: doc._id,
        phone: 1234567890,
        specialty: "e.g cardiology",
        subSpecialty: "e.g urology",
        gender: "Male | Female",
        dob: Date.now(),
        profilePicUrl: "https://www.google.com",
        address: "e.g Accra, Ghana",
        boardCerts: ["Cert1", "Cert2"],
        boardCertsUrls: [
          "e.g.",
          "https://www.cert1.com",
          "https://www.cert2.com"
        ],
        medicalLicenseNum: 123456,
        medSchAttended: "e.g.KNUST",
        residencyProg: "e.g KNUST Prog",
        fellowshipProg: "e.g KNUST Prog",
        yearGrad: Date.now(),
        currHospitalAffiliation: "e.g Korle Bu",
        prevWorkExp: "Mamprobi Poly Clinic",
        workingHrs: "Monday - Friday",
        appointmentDays: ["Mon", "Tue", "Wed"],
        languagesSpoken: ["English", "French"],
        patientHistory: [],
        additionalInfo: "Add anything you would like to share here..."
      });

      res.status(200).json({
        _id: doc._id,
        firstName: doc.firstName,
        lastName: doc.lastName,
        email: doc.email,
        isVerified: doc.isVerified,
        isApproved: doc.isApproved
      });
    } else {
      res.status(404).json("Email verification failed, invalid token");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
});

module.exports = router;
