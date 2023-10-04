const { createMailTransporter } = require("./transporter.config");

const sendDocVerificationMail = (doc) => {
  const transporter = createMailTransporter();

  const mailOptions = {
    from: '"CareLink" <joeelorm@outlook.com>',
    to: doc.email,
    html: `<p>
            Hello 👋 Dr. ${doc.lastName}, thank you for signing up as a doctor on our app to provide medical care to our users.Please click on the link below to verify account.
            <a href = http://127.0.0.1:5173/verify-email?emailToken=${doc.emailToken}>Verify Email</a>
         </p>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Verification sent");
    }
  });
};

module.exports = { sendDocVerificationMail };
