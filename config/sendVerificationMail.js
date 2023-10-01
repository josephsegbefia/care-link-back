const { createMailTransporter } = require("./transporter.config");

const sendVerificationMail = (user) => {
  const transporter = createMailTransporter();

  const mailOptions = {
    from: '"CareLink" <joeelorm@outlook.com',
    to: user.email,
    html: `<p> Welcome to CareLink, ${user.firstName}, thank you for signing up to use our app. Please use the link below to verify your email to complete the signup process.
        <a href = http://127.0.0.1:5173/verify-email?emailtToken=${user.emailToken}>Verify Email</a>
        </p>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Verfication sent");
    }
  });
};

module.exports = { sendVerificationMail };
