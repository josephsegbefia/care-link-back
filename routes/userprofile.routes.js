const express = require("express");
const User = require("../models/User.model");
const UserProfile = require("../models/UserProfile.model");

const router = express.Router();

router.get("/user/:userId", (req, res, next) => {
  const { userId } = req.params;

  UserProfile.findOne({ user: userId })
    .select("-password -passwordResetToken -emailToken -__v")
    .populate("user", "-password -passwordResetToken -emailToken -__v")
    .then((profile) => {
      res.status(200).json(profile);
    });
});

router.post("/user/:userId/profile/:profileId/edit", async (req, res, next) => {
  try {
    const { userId, profileId } = req.params;

    const { gender, age } = req.body;
    const userProfile = await UserProfile.findOne({
      user: userId,
      _id: profileId
    });

    if (!userProfile) {
      return res
        .status(404)
        .json({ message: "The user profile does not exist" });
    }

    // Update the fields
    userProfile.age = age;
    userProfile.gender = gender;

    const updatedUserProfile = await userProfile.save();

    res.status(200).json({
      message: "Profile updated successfully",
      profile: updatedUserProfile
    });
  } catch (error) {
    console.log(error, "Error updating the profile");
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
