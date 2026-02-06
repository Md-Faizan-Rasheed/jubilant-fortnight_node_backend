// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER, // your email
//     pass: process.env.EMAIL_PASS, // app password
//   },
// });


// module.exports = {
//   transporter
// }

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",            // 👈 IMPORTANT for Render
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
});

// Optional but VERY useful for debugging
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Mailer config error:", error);
  } else {
    console.log("✅ Mail server is ready to send emails");
  }
});

module.exports = {
  transporter,
};
