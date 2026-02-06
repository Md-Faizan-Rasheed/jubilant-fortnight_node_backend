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
  service: "gmail",   // 👈 IMPORTANT
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App Password
  },
  connectionTimeout: 10 * 1000, // 10 seconds
  greetingTimeout: 10 * 1000,
  socketTimeout: 10 * 1000,
});

module.exports = transporter;
