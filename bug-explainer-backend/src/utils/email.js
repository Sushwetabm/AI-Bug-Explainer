const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "smtp.gmail.com",

    auth: {
      user: process.env.EMAIL_FROM, // Gmail address
      pass: process.env.EMAIL_APP_PASSWORD, // app-specific password
    },
  });

  const mailOptions = {
    from: `"Bug Explainer" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
