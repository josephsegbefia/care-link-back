const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

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
        password: hashedPassword
      });
    })
    .then((createdUser) => {
      const { email, firstName, lastName, phone, _id } = createdUser;

      //   Create a user object without the password ans send to the client
      const user = { email, firstName, lastName, phone, _id };
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

module.exports = router;
