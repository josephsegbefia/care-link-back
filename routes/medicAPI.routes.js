const express = require("express");
const axios = require("axios");
const crypto = require("crypto");

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
module.exports = router;
