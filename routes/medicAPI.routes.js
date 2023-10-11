const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const UserProfile = require("../models/UserProfile.model");

const router = express.Router();
const URI = process.env.URI;
const API_URI = process.env.API_URI;
const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;
let authString = "";

async function makeAuthRequest() {
  const secretBytes = Buffer.from(SECRET_KEY, "utf8");
  let computedHashString = "";

  const hmac = crypto.createHmac("md5", secretBytes);
  const dataBytes = Buffer.from(URI, "utf8");
  const computedHash = hmac.update(dataBytes).digest("base64");
  computedHashString = computedHash;

  try {
    const response = await axios.post(URI, "", {
      headers: {
        Authorization: `Bearer ${API_KEY}:${computedHashString}`
      }
    });
    return response.data;

    // Handle the response here
    console.log(response.data);
  } catch (error) {
    // Handle any errors here
    console.error("Error:", error.message);
  }
}
router.post("/get-auth", async (req, res, next) => {
  try {
    authString = await makeAuthRequest();
    console.log(authString);
    res.status(200).json(authString);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/symptoms", async (req, res, next) => {
  try {
    const token = authString.Token;
    const symptoms = await axios.get(
      `${API_URI}/symptoms?token=${token}&language=en-gb`
    );

    res.status(200).json(symptoms.data); // Change the status code to 200 for success
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" }); // Set an appropriate error status code
  }
});

router.post("/user/:profileId/diagnosis", async (req, res, next) => {
  try {
    const tokenString = await makeAuthRequest();
    const { profileId } = req.params;
    const token = tokenString.Token;

    // Ensure that req.body.symptoms is an array
    const symptoms = Array.isArray(req.body.symptoms) ? req.body.symptoms : [];

    const userProfile = await UserProfile.findOne({ _id: profileId });
    const yearOfBirth = new Date(Date.now()).getFullYear() - userProfile.age;
    const gender = userProfile.gender.toLowerCase();

    // Serialize the symptoms array as a JSON-encoded string
    const symptomsString = JSON.stringify(symptoms);

    const diagnosis = await axios.get(
      `${API_URI}/diagnosis?token=${token}&language=en-gb&symptoms=${symptomsString}&gender=${gender}&year_of_birth=${yearOfBirth}`
    );

    res.status(200).json(diagnosis.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get Specialisations for doctors to choose from
router.get("/specialisations", async (req, res, next) => {
  try {
    const tokenString = await makeAuthRequest();
    const token = tokenString.Token;

    const specialisations = await axios.get(
      `${API_URI}/specialisations?token=${token}&language=en-gb`
    );
    res.status(200).json(specialisations.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
