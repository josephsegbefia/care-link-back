const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const crypto = require("crypto");
const { sendVerificationMail } = require("../config/sendVerificationMail");
const { sendPasswordResetEmail } = require("../config/sendPasswordResetEmail");

const router = express.Router();
const saltRounds = 10;

// Signup new users
router.post("/signup", (req, res, next) => {
  const { firstName, lastName, email, password, phone } = req.body;

  //   Check if email or password are provided as empty strings

  if (
    email === "" ||
    password === "" ||
    firstName === "" ||
    lastName === "" ||
    phone === ""
  ) {
    res.status(400).json({ message: "All fields must be filled" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Provide a valid email address" });
    return;
  }

  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      message:
        "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter"
    });
    return;
  }

  User.findOne({ email })
    .then((foundUser) => {
      if (foundUser) {
        res.status(400).json({ message: "User already exists." });
        return;
      }

      // if email is unique, proceed to hash the password
      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);

      // Create the new user in the database
      // We return a pending promise
      return User.create({
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        emailToken: crypto.randomBytes(64).toString("hex"),
        passwordResetToken: crypto.randomBytes(64).toString("hex")
      });
    })
    .then((createdUser) => {
      const {
        email,
        firstName,
        lastName,
        phone,
        emailToken,
        passwordResetToken,
        _id
      } = createdUser;

      //   Create a user object without the password ans send to the client
      const user = {
        email,
        firstName,
        lastName,
        phone,
        emailToken,
        passwordResetToken,
        _id
      };
      sendVerificationMail(user);
      res.status(201).json({ user: user });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    });
});

// Login route
router.post("/login", (req, res, next) => {
  const { email, password } = req.body;

  if (email === "" || password === "") {
    res.status(400).json({ message: "Provide email and password." });
    return;
  }

  //   Check the users collection if a user with the same email exisits
  User.findOne({ email }).then((foundUser) => {
    if (!foundUser) {
      // If
    }
  });
});

router.post("/verify-email", async (req, res, next) => {
  try {
    const emailToken = req.body.emailToken;
    if (!emailToken)
      return res.status(404).json({ message: "Email Token not found." });

    const user = await User.findOne({ emailToken });
    if (user) {
      user.emailToken = null;
      user.isVerified = true;
      await user.save();

      res.status(200).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isVerified: user.isVerified
      });
    } else {
      res.status(404).json("Email verification failed, invalid token");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
});

router.post("/password-reset", async (req, res, next) => {
  try {
    const { passwordResetToken, password } = req.body;
    if (!passwordResetToken) {
      return res.status(404).json({ message: "Password token not found" });
    }

    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!passwordRegex.test(password)) {
      res.status(400).json({
        message:
          "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter."
      });
      return;
    }

    const user = await User.findOne({ passwordResetToken });
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);

    user.password = hashedPassword;
    user.passwordResetToken = crypto.randomBytes(64).toString("hex");
    await user.save();
    res.status(200).json({ message: "Password updated!" });
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
});

router.post("/password-reset-email", async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      sendPasswordResetEmail(user);
      res.status(200).json({
        user: user,
        message: "Password reset email sent to your email"
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "Email not Found" });
  }
});

module.exports = router;
