
const express = require('express');
const router = express.Router();
const Job = require('../Models/Job');
const ensureAuthenticated = require('../Middlewares/Auth');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const User = require('../Models/User.Models'); // ✅ Import User model
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const bcrypt = require('bcrypt');
const twilio = require("twilio");
// const { default: mongoose } = require('mongoose');
const mongoose = require("mongoose");
const Student = require("../Models/Studentdetails.Model"); // Adjust path as needed
// const User = require('../Models/User.Models');
// Import dotenv and configure it at the top of the file
// const admin  = require("../Firebaseconfig.js")
require('dotenv').config();


// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_ACCOUNT_TOKEN);

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware for validation error handling
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// // Add a new job ***
// router.post('/add',async (req, res) => {
//     const {jobTitle, status, plainTextJobDescription, questions, userId } = req.body;

//     if (!userId) {
//         return res.status(400).json({ error: "User ID is required." });
//     }
//     if (!jobTitle || !status || !plainTextJobDescription) {
//         return res.status(400).json({ error: "Missing required fields (jobTitle, status, plainTextJobDescription)." });
//     }
//     if (!Array.isArray(questions) || questions.some(q => !q.questionText)) {
//         return res.status(400).json({ error: "Each question must have a 'questionText' property." });
//     }
//     console.log("Job type",typeof(Job));

//         try {
//             const newJob = new Job({
//                 jobTitle,
//                 status,
//                 plainTextJobDescription,
//                 questions,
//                 userId,
//                 createdAt: new Date()
//             });
// const user = await User.findById(userId);

// console.log("user", user);
// if (user.usage.jobsCreated >= user.limits.maxJobs) {
//   return res.status(403).json({
//     success: false,
//     message: "Job limit reached. Upgrade your plan."
//   });
// }

// const updatedUser = await User.findOneAndUpdate(
//   {
//     _id: userId,
//     $expr: { $lt: ["$usage.jobsCreated", "$limits.maxJobs"] }
//   },
//   { $inc: { "usage.jobsCreated": 1 } },
//   { new: true }
// );

// if (!updatedUser) {
//   return res.status(403).json({
//     success: false,
//     message: "Job limit reached"
//   });
// }

//             await newJob.save();
//             res.status(201).json({ message: 'Job created successfully!', job: newJob });
//         } catch (error) {
//             console.error(error);
//             res.status(500).json({ error: error.message || 'Error adding job' });
//         }
//     }
// );


router.post("/add", ensureAuthenticated, async (req, res) => {
  const { jobTitle, status, plainTextJobDescription, questions,userId } = req.body;
  // const userId = req.user.id; // 🔐 FROM TOKEN

  // ✅ Validation
  if (!jobTitle || !status || !plainTextJobDescription) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields"
    });
  }

  if (!Array.isArray(questions) || questions.some(q => !q.questionText)) {
    return res.status(400).json({
      success: false,
      message: "Each question must contain questionText"
    });
  }

  try {
    // 🔐 Atomic quota check + increment
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        $expr: { $lt: ["$usage.jobsCreated", "$limits.maxJobs"] }
      },
      { $inc: { "usage.jobsCreated": 1 } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(403).json({
        success: false,
        message: "Job limit reached. Upgrade your plan."
      });
    }

    // ✅ Create job ONLY after quota is reserved
    const newJob = new Job({
      jobTitle,
      status,
      plainTextJobDescription,
      questions,
      userId,
      createdAt: new Date()
    });

    await newJob.save();

    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      job: newJob
    });

  } catch (error) {
    console.error("Add job error:", error);

    // 🛡 rollback quota if job save fails
    await User.updateOne(
      { _id: userId },
      { $inc: { "usage.jobsCreated": -1 } }
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create job"
    });
  }
});



router.get('/api/all-jobs', ensureAuthenticated, async (req, res) => {
    const userId = req.userId;
    try {
        const jobs = await Job.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json(jobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Error fetching jobs' });
    }
});


router.post('/api/user-id', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ userId: user._id });
    } catch (error) {
        console.error("Error in /jobs/api/user-id:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// // Route for deleting a job *****
// router.delete('/api/delete-job/:id', ensureAuthenticated, async (req, res) => {
//     const { id } = req.params;  // Get the job ID from the URL parameter
// console.log("Backend Side job Id",id)
//     try {
//         // Find the job by ID and delete it
//         const job = await Job.findById(id);
//         const userId = await Job.findById(id).select("userId");
//         // console.log("userId",userId.userId);

//         const user = await User.findById(userId.userId);

//         if (!job) {
//             return res.status(404).json({ message: 'Job not found' });
//         }

//         // Optionally check if the user owns the job (if userId is stored in job)
//         if (job.userId.toString() !== req.userId) {
//             return res.status(403).json({ message: 'Not authorized to delete this job' });
//         }

//         console.log("user",typeof(user.usage.jobsCreated));
//         if (user.usage.jobsCreated <= 0) {
//           return res.status(403).json({
//             success: false,
//             message: "You have no jobs to delete."
//           });
//         }       

// const updatedUser = await User.findOneAndUpdate(
//   {
//     _id: userId.userId,
//     $expr: { $lt: ["$usage.jobsCreated", "$limits.maxJobs"] }
//   },
//   { $inc: { "usage.jobsCreated": -1 } },
//   { new: true }
// );

// if (!updatedUser) {
//   return res.status(403).json({
//     success: false,
//     message: "You have no jobs to delete."
//   });
// }


//         await Job.findByIdAndDelete(id);  // Delete the job from the database

//         return res.status(200).json({ message: 'Job deleted successfully' });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: 'Error deleting job', error: error.message });
//     }
// });


router.delete("/api/delete-job/:id", ensureAuthenticated, async (req, res) => {
  const jobId = req.params.id;
const job = await Job.findById(jobId);
        const userId = await Job.findById(jobId).select("userId");
        // console.log("userId",userId.userId);
  try {
    // 🔐 Find job owned by user
    const job = await Job.findOne({ _id: jobId, userId: userId.userId });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or not authorized"
      });
    }

    // 🔐 Safe decrement (never below zero)
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId.userId,
        "usage.jobsCreated": { $gt: 0 }
      },
      { $inc: { "usage.jobsCreated": -1 } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(403).json({
        success: false,
        message: "No jobs left to delete"
      });
    }

    // ✅ Delete job
    await job.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully"
    });

  } catch (error) {
    console.error("Delete job error:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting job"
    });
  }
});



// get user details
router.get('/api/users/:userId', async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user data" });
    }
  });


//   Update User Details 
 router.put('/api/users/:userId', async (req, res) => {
    try {
      const updatedUser = await User.findByIdAndUpdate(req.params.userId, req.body, { new: true });
      if (!updatedUser) return res.status(404).json({ message: "User not found" });
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Error updating user data" });
    }
  });

// Reset Passsword api
router.post("/api/reset-password", async (req, res) => {
    const { email , resetToken} = req.body;
  
    // Simulated check if the email exists in the database
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: "Email not found" });
      }
    // Generate a reset token (In production, store it in DB)
    // const resetToken = Math.random().toString(36).substr(2);
  
    // Send reset link via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: "mdfaizanrasheed123@gmail.com", pass: "lmrr kqvl vsux rwbm" },
    });
  
    const mailOptions = {
        from: "mdfaizanrasheed123@gmail.com",
        to: email,
        subject: "Password Reset Request",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Password Reset</title>
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      background-color: #f4f4f4;
                      margin: 0;
                      padding: 0;
                  }
                  .container {
                      width: 100%;
                      max-width: 600px;
                      margin: 20px auto;
                      background: #ffffff;
                      border-radius: 10px;
                      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                      overflow: hidden;
                  }
                  .header {
                      background: linear-gradient(90deg, #003366, #006699);
                      padding: 20px;
                      text-align: center;
                  }
                  .header h1 {
                      color: #fff;
                      margin: 0;
                      font-size: 24px;
                  }
                  .content {
                      padding: 20px;
                      text-align: center;
                      color: #333;
                  }
                  .content h2 {
                      margin: 0;
                      font-size: 22px;
                  }
                  .content p {
                      font-size: 16px;
                      line-height: 1.5;
                  }
                  .button {
                      display: inline-block;
                      padding: 12px 24px;
                      margin: 20px auto;
                      font-size: 18px;
                      color: #ffffff;
                      background: #005A9E;
                      text-decoration: none;
                      border-radius: 8px;
                      transition: background 0.3s ease;
                  }
                a{
                color: #fff;
                }
                  .button:hover {
                      background: #00457c;
                  }
                  .footer {
                      padding: 15px;
                      text-align: center;
                      font-size: 14px;
                      color: #777;
                      background-color: #f4f4f4;
                  }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <h1>Password Reset Request</h1>
                  </div>
                  <div class="content">
                      <h2>Hello,</h2>
                      <p>Someone has requested a link to change your password. Click the button below to reset your password.</p>
                      <a href="http://localhost:5173/reset-password/${resetToken}" class="button">Reset My Password</a>
                      <p>If you didn’t request this, please ignore this email.</p>
                      <p>Your password won’t change until you access the link above and create a new one.</p>
                  </div>
                  <div class="footer">
                      &copy; 2025 Your Company. All rights reserved.
                  </div>
              </div>
          </body>
          </html>
        `
      };
      
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) return res.status(500).json({ message: "Error sending email" });
      res.json({ message: "Reset link sent! Check your email." });
    });
  });


//   Update Password in DB api
router.post("/api/update-password", async (req, res) => {
    const SECRET_KEY = process.env.JWT_SECRET; // Use environment variables in production
    try {
      const { resetToken, password } = req.body;
  
      if (!resetToken || !password) {
        return res.status(400).json({ message: "Invalid request" });
      }
  console.log("SECRETE KEY",SECRET_KEY)
      // Verify the token
      let decoded;
      try {
        decoded = jwt.verify(resetToken, SECRET_KEY);
      } catch (error) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }
  
      // Find user by ID from token
      const user = await User.findById(decoded._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Update user's password
      user.password = hashedPassword;
      await user.save();
  
      return res.json({ message: "Password updated successfully!" });
    } catch (error) {
      console.error("Error updating password:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });



router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id); // Find job by ID
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});




// const  accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const serviceid = process.env.TWILIO_SERVICE_ID
// // Import dotenv and configure it at the top of the file
// require('dotenv').config();

// Now access environment variables
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN; 
// const serviceid = process.env.TWILIO_SERVICE_ID;

// Verify environment variables are loaded
// if (!accountSid || !authToken || !serviceid) {
//     console.error('Missing required environment variables for Twilio:');
//     console.error('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID);
//     console.error('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN);
//     console.error('TWILIO_SERVICE_ID:', process.env.TWILIO_SERVICE_ID);
//     console.log("mongo uri",process.env.MONGO_URL);

// }

// const client = twilio( process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
// console.log("client",client)
//  Otp seding 
// router.post("/send-otp", async (req, res) => {
//     const { phoneNumber } = req.body;
// console.log("accountSid",accountSid);
// console.log("authToken",authToken);
// console.log("Service Id",serviceid);
//     if (!phoneNumber) {
//         return res.status(400).json({ error: "Phone number is required" });
//     }

//     // const existingStudent = await Student.findOne({ phoneNumber });
//     // if (existingStudent) {
//     //   return res.json({ success: false, message: "This number is already registered for an interview." });
//     // }

//     try {
//         console.log("Sending OTP to:", phoneNumber);
//         let formattedPhone = phoneNumber.trim();
//         if (!formattedPhone.startsWith("+91")) {
//             formattedPhone = `+91${formattedPhone.replace(/^0+/, "")}`; // Ensure correct format
//         }

//         const response = await client.verify.v2
//             .services("VAb537a6d4151423d68bc44f62cde29b21")
//             // .services(process.env.TWILIO_SERVICE_ID)
//             .verifications.create({ to: formattedPhone, channel: "sms" });
//             console.log("Response",response);
//         res.json({ success: true, message: "OTP sent successfully", response });
//     } catch (error) {
//         console.error("Error sending OTP:", error);
//         res.status(500).json({ error: error.message || "Internal Server Error" });
//     }
// });
  
// // Otp Verification
//   router.post("/verify-otp", async (req, res) => {
//     const { phoneNumber, otp } = req.body;
  
//     try {
//         let formattedPhone = phoneNumber.trim();
//         if (!formattedPhone.startsWith("+91")) {
//             formattedPhone = `+91${formattedPhone.replace(/^0+/, "")}`;
//         }

//         const response = await client.verify.v2
//             .services("VAb537a6d4151423d68bc44f62cde29b21") // Replace with your actual Verify Service SID
//             .verificationChecks.create({
//                 to: formattedPhone,
//                 code: otp,
//             });
//             console.log("Response for verification",response);

//         if (response.status === "approved") {
//             return res.json({ success: true, message: "OTP verified successfully" });
//         } else {
//             return res.status(400).json({ success: false, error: "Invalid OTP" });
//         }
//     } catch (error) {
//         console.error("Error verifying OTP:", error);
//         res.status(500).json({ error: error.message || "Internal Server Error" });
//     }
//   });

// OTP Dummy Routes for Testing

// router.post("/send-otp", async (req, res) => {
//   const { phoneNumber } = req.body;

//   if (!phoneNumber) {
//     return res.status(400).json({
//       success: false,
//       error: "Phone number is required",
//     });
//   }

//   console.log("📲 [DUMMY] Sending OTP to:", phoneNumber);

//   // Simulate delay (optional)
//   setTimeout(() => {
//     return res.json({
//       success: true,
//       message: "OTP sent successfully (dummy)",
//       otp: "123456", // expose only in testing
//     });
//   }, 500);
// });


// router.post("/verify-otp", async (req, res) => {
//   const { phoneNumber, otp } = req.body;

//   if (!phoneNumber || !otp) {
//     return res.status(400).json({
//       success: false,
//       error: "Phone number and OTP are required",
//     });
//   }

//   console.log("🔐 [DUMMY] Verifying OTP for:", phoneNumber);

//   if (otp === "123456") {
//     return res.json({
//       success: true,
//       message: "OTP verified successfully (dummy)",
//     });
//   } else {
//     return res.status(400).json({
//       success: false,
//       error: "Invalid OTP",
//     });
//   }
// });




// Store OTP temporarily (in production, use Redis or database)
// For now, using in-memory storage for simplicity
const otpStore = new Map();

// OTP expiry time in milliseconds (5 minutes)
const OTP_EXPIRY = 5 * 60 * 1000;

/**
 * Generate a 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP using Firebase Authentication
 * POST /send-otp
 * Body: { phoneNumber: string }
 */
router.post("/send-otp", async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({
      success: false,
      error: "Phone number is required",
    });
  }

  try {
    console.log("📲 Sending OTP to:", phoneNumber);

    // Format phone number (ensure it has country code)
    let formattedPhone = phoneNumber.trim();
    if (!formattedPhone.startsWith("+")) {
      // Assuming Indian numbers, add +91 prefix
      formattedPhone = `+91${formattedPhone.replace(/^0+/, "")}`;
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with expiry time
    otpStore.set(formattedPhone, {
      otp: otp,
      expiresAt: Date.now() + OTP_EXPIRY,
      attempts: 0
    });

    // Send OTP via SMS using Firebase (requires Twilio/other SMS provider integration)
    // For Firebase Auth, you typically use client-side reCAPTCHA verification
    // But for server-side, we can use a custom SMS provider

    // Option 1: Using Firebase Custom Token + SMS Provider
    // You'll need to integrate with an SMS service like Twilio, MSG91, etc.
    // For now, returning the OTP for testing (REMOVE IN PRODUCTION!)
    
    console.log(`✅ OTP generated for ${formattedPhone}: ${otp}`);

    // In production, send OTP via SMS service here
    // Example with a hypothetical SMS service:
    // await sendSMS(formattedPhone, `Your OTP is: ${otp}. Valid for 5 minutes.`);

    return res.json({
      success: true,
      message: "OTP sent successfully",
      // REMOVE THIS IN PRODUCTION! Only for testing
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });

  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to send OTP",
    });
  }
});

/**
 * Verify OTP and create Firebase custom token
 * POST /verify-otp
 * Body: { phoneNumber: string, otp: string }
 */
router.post("/verify-otp", async (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return res.status(400).json({
      success: false,
      error: "Phone number and OTP are required",
    });
  }

  try {
    console.log("🔐 Verifying OTP for:", phoneNumber);

    // Format phone number
    let formattedPhone = phoneNumber.trim();
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = `+91${formattedPhone.replace(/^0+/, "")}`;
    }

    // Check if OTP exists
    const storedOTPData = otpStore.get(formattedPhone);

    if (!storedOTPData) {
      return res.status(400).json({
        success: false,
        error: "OTP not found or expired. Please request a new OTP.",
      });
    }

    // Check if OTP is expired
    if (Date.now() > storedOTPData.expiresAt) {
      otpStore.delete(formattedPhone);
      return res.status(400).json({
        success: false,
        error: "OTP has expired. Please request a new OTP.",
      });
    }

    // Check attempt limit (max 3 attempts)
    if (storedOTPData.attempts >= 3) {
      otpStore.delete(formattedPhone);
      return res.status(429).json({
        success: false,
        error: "Too many failed attempts. Please request a new OTP.",
      });
    }

    // Verify OTP
    if (storedOTPData.otp !== otp) {
      // Increment attempts
      storedOTPData.attempts += 1;
      otpStore.set(formattedPhone, storedOTPData);

      return res.status(400).json({
        success: false,
        error: "Invalid OTP",
        attemptsRemaining: 3 - storedOTPData.attempts
      });
    }

    // OTP is valid - create Firebase custom token
    const uid = formattedPhone; // Use phone number as UID

    // Create or update user in Firebase
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByPhoneNumber(formattedPhone);
    } catch (error) {
      // User doesn't exist, create new user
      userRecord = await admin.auth().createUser({
        phoneNumber: formattedPhone,
        uid: uid
      });
    }

    // Generate custom token
    const customToken = await admin.auth().createCustomToken(userRecord.uid);

    // Clear OTP from store
    otpStore.delete(formattedPhone);

    console.log(`✅ OTP verified successfully for ${formattedPhone}`);

    return res.json({
      success: true,
      message: "OTP verified successfully",
      token: customToken,
      user: {
        uid: userRecord.uid,
        phoneNumber: userRecord.phoneNumber
      }
    });

  } catch (error) {
    console.error("❌ Error verifying OTP:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to verify OTP",
    });
  }
});

/**
 * Resend OTP
 * POST /resend-otp
 * Body: { phoneNumber: string }
 */
router.post("/resend-otp", async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({
      success: false,
      error: "Phone number is required",
    });
  }

  try {
    let formattedPhone = phoneNumber.trim();
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = `+91${formattedPhone.replace(/^0+/, "")}`;
    }

    // Clear old OTP if exists
    otpStore.delete(formattedPhone);

    // Generate new OTP
    const otp = generateOTP();
    
    otpStore.set(formattedPhone, {
      otp: otp,
      expiresAt: Date.now() + OTP_EXPIRY,
      attempts: 0
    });

    console.log(`🔄 OTP resent to ${formattedPhone}: ${otp}`);

    // Send OTP via SMS service here (in production)

    return res.json({
      success: true,
      message: "OTP resent successfully",
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });

  } catch (error) {
    console.error("❌ Error resending OTP:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to resend OTP",
    });
  }
});





// Registration Route
router.post("/save-student-details", async (req, res) => {
    const {companyId,phoneNumber, studentName,email,adharNumber,resumeUrl } = req.body;
  
    const existingStudent = await Student.findOne({ phoneNumber });
    if (existingStudent) {
      return res.json({ success: false, message: "This number is already registered for an interview." });
    }
  
    const newStudent = new Student({companyId, phoneNumber, studentName,email, adharNumber,resumeUrl});
    await newStudent.save();
  

  
    res.json({ success: true,student_id:newStudent.id, message: "Student registered successfully!" });
  });
  

  // routes/student.routes.js
router.get("/by-company/:companyId", async (req, res) => {
  try {
    const { companyId } = req.params;

    const students = await Student.find({ companyId });

    res.json({
      success: true,
      students
    });
  } catch (err) {
    console.error("Fetch students error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch students"
    });
  }
});

// router.post("/check-student",async (req, res) => {
//   try {
//     const { phoneNumber } = req.body;

//     const student = await Student.findOne({ phoneNumber });

//     if (!student) {
//       return res.status(404).json({
//         success: false,
//         exists: false,
//         message:
//           "User with this mobile number is not registered. Please register first to sign in successfully."
//       });
//     }

//     return res.json({
//       success: true,
//       exists: true,
//       studentId: student._id  
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error"
//     });
//   }
// })


// router.patch("/update-skills", async (req, res) => {
//   try {
//     const { studentId, skills } = req.body;

//     console.log("Received skills update:", studentId, skills);

//     // 1️⃣ Validate studentId
//     if (!studentId) {
//       return res.status(400).json({
//         success: false,
//         message: "StudentId is required"
//       });
//     }

//     if (!mongoose.Types.ObjectId.isValid(studentId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid StudentId"
//       });
//     }

//     // 2️⃣ Validate and normalize skills
//     if (!skills || !Array.isArray(skills)) {
//       return res.status(400).json({
//         success: false,
//         message: "Skills must be an array of { skill, level }"
//       });
//     }

//     // 3️⃣ Validate each skill object
//     const validLevels = ["Beginner", "Intermediate", "Expert"];
//     const formattedSkills = skills
//       .filter(s => s && s.skill)
//       .map(s => ({
//         skill: s.skill.trim(),
//         level: validLevels.includes(s.level) ? s.level : "Beginner"
//       }));

//     // 4️⃣ Prevent empty update
//     if (formattedSkills.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "At least one valid skill is required"
//       });
//     }

//     // 5️⃣ Update student document
//     const updatedStudent = await Student.findByIdAndUpdate(
//       studentId,
//       { skills: formattedSkills },
//       { new: true }
//     ).select("studentName skills");

//     if (!updatedStudent) {
//       return res.status(404).json({
//         success: false,
//         message: "Student not found"
//       });
//     }

//     // ✅ 6️⃣ Success response
//     return res.json({
//       success: true,
//       message: "Skills updated successfully",
//       student: updatedStudent
//     });

//   } catch (error) {
//     console.error("Update skills error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error"
//     });
//   }
// });



// router.get("/student-skill/:studentId", async (req, res) => {
//   try {
//     const { studentId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(studentId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid studentId"
//       });
//     }

//     const student = await Student.findById(studentId).select("skills studentName");

//     if (!student) {
//       return res.status(404).json({
//         success: false,
//         message: "Student not found"
//       });
//     }

//     return res.json({
//       success: true,
//       student: {
//         id: student._id,
//         studentName: student.studentName,
//         skills: student.skills || []
//       }
//     });

//   } catch (error) {
//     console.error("Fetch student error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error"
//     });
//   }
// });



module.exports = router;

