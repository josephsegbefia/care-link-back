const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Doctor = require("../models/Doctor.model");
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
          passwordResetToken
        } = createdDoc;

        const doc = {
          email,
          firstName,
          lastName,
          _id,
          emailToken,
          passwordResetToken
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

module.exports = router;
