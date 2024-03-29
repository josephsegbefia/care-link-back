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

// Edit a doctors profile
router.post("/doc/:docId/profile/:profileId/edit", async (req, res, next) => {
  try {
    const { docId, profileId } = req.params;
    const {
      phone,
      specialty,
      subSpecialty,
      gender,
      dob,
      profilePicUrl,
      address,
      boardCerts,
      boardCertsUrls,
      medicalLicenseNum,
      medSchAttended,
      residencyProg,
      fellowshipProg,
      yearGrad,
      currHospitalAffiliation,
      prevWorkExp,
      workingHrs,
      appointmentDays,
      languagesSpoken,
      patientHistory,
      additionalInfo
    } = req.body;
    const docProfile = await DocProfile.findOne({
      doctor: docId,
      _id: profileId
    });

    if (!docProfile) {
      return res
        .status(404)
        .json({ message: "The doctor profile does not exist" });
    }

    // update the fields

    docProfile.phone = phone;
    docProfile.specialty = specialty;
    docProfile.subSpecialty = subSpecialty;
    docProfile.gender = gender;
    docProfile.dob = dob;
    docProfile.profilePicUrl = profilePicUrl;
    docProfile.address = address;
    docProfile.boardCerts = boardCerts;
    docProfile.boardCertsUrls = boardCertsUrls;
    docProfile.medicalLicenseNum = medicalLicenseNum;
    docProfile.medSchAttended = medSchAttended;
    docProfile.residencyProg = residencyProg;
    docProfile.fellowshipProg = fellowshipProg;
    docProfile.yearGrad = yearGrad;
    docProfile.currHospitalAffiliation = currHospitalAffiliation;
    docProfile.prevWorkExp = prevWorkExp;
    docProfile.workingHrs = workingHrs;
    docProfile.appointmentDays = appointmentDays;
    docProfile.languagesSpoken = languagesSpoken;
    docProfile.patientHistory = patientHistory;
    docProfile.additionalInfo = additionalInfo;

    const updatedDocProfile = await docProfile.save();

    // If a profileToApprove document exists and the updatedDocProfile ID is not in the array

    res.status(200).json({
      message:
        "Update successful. Please wait for changes to be approved. Thank you",
      profile: updatedDocProfile
    });
  } catch (error) {
    console.log(error, "Error updating the profile");
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Delete a doctor profile

router.delete("/doc/:docId/profile/:profileId", async (req, res, next) => {
  try {
    const { docId, profileId } = req.params;

    const deletedProfile = await DocProfile.findByIdAndDelete(profileId);

    if (!deletedProfile) {
      return res.status(404).json({ message: "Profile does not exist" });
    }

    await Doctor.findByIdAndDelete(docId);
    res.json({ message: "Doctor account and profile deleted successfully" });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

module.exports = router;
