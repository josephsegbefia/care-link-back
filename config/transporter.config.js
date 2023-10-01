const nodemailer = require("nodemailer");

const createMailTransporter = () => {
  const transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  return transporter;
};

module.exports = { createMailTransporter };
