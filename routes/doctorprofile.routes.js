const express = require("express");
const Doctor = require("../models/Doctor.model");
const DocProfile = require("../models/DocProfile.model");

const router = express.Router();

router.get("/doc/:docId", (req, res, next) => {
  const { docId } = req.params;
  DocProfile.findOne({ doctor: docId })
    .select("-password -passwordResetToken -emailToken -__v")
    .populate("doctor", "-password -passwordResetToken -emailToken -__v")
    .then((profile) => {
      res.status(200).json(profile);
    });
});

module.exports = router;
