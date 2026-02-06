
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const twilio = require("twilio");
// const { default: mongoose } = require('mongoose');
const {setAuthCookie} = require('../Controllers/StudentController');
const jwt = require("jsonwebtoken");


const mongoose = require("mongoose");
const Student = require("../Models/Studentdetails.Model"); // Adjust path as needed
const InterviwewReport = require("../Models/InterviewReport.Models"); // Adjust path as needed
const JWT_SECRET = process.env.JWT_SECRET
const { transporter } = require("../utils/mailers");
const otpUtils = require("../utils/crypto");
const { generateOTP, hashOTP } = otpUtils;


const {
  sendOtpHandler,
//   verifyOtpHandler,
  checkAuth,
  logout,
} = require("../Controllers/StudentController");
// Import dotenv and configure it at the top of the file
require('dotenv').config();


// router.post("/send-otp", sendOtpHandler);
// router.post("/verify-otp", verifyOtpHandler);
router.get("/check-auth", checkAuth);
router.post("/logout", logout);



// router.post("/send-otp", async (req, res) => {
//   const { phoneNumber } = req.body;

//   if (!phoneNumber) {
//     return res.status(400).json({
//       success: false,
//       error: "Phone number is required",
//     });
//   }

//   console.log("📲 [DUMMY] Sending OTP to:", phoneNumber);

//  let student = await Student.findOne({ phoneNumber });
//     if (!student) {
//       student = await Student.create({ phoneNumber });
//     }

//   // Simulate delay (optional)
//   setTimeout(() => {

//     setAuthCookie(res, student);
//     // res.json({ success: true, studentId: student._id });
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
//     // do it in real scenario
//     // ✅ Generate JWT
//   const token = jwt.sign({ id: Student._id, phone: Student.phoneNumber }, JWT_SECRET, {
//     expiresIn: "7d",
//   });

//   // ✅ Set cookie
//   res.cookie("token", token, {
//     // httpOnly: true,
//     // secure: process.env.NODE_ENV === "production",
//     // sameSite: "strict",
//      httpOnly: true,
//   secure: true,
//   sameSite: "none",
//     maxAge: 7 * 24 * 60 * 60 * 1000,
//   });

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




// // Store OTP temporarily (in production, use Redis or database)
// // For now, using in-memory storage for simplicity
// const otpStore = new Map();

// // OTP expiry time in milliseconds (5 minutes)
// const OTP_EXPIRY = 5 * 60 * 1000;

// /**
//  * Generate a 6-digit OTP
//  */
// function generateOTP() {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// }

// /**
//  * Send OTP using Firebase Authentication
//  * POST /send-otp
//  * Body: { phoneNumber: string }
//  */
// router.post("/send-otp", async (req, res) => {
//   const { phoneNumber } = req.body;

//   if (!phoneNumber) {
//     return res.status(400).json({
//       success: false,
//       error: "Phone number is required",
//     });
//   }

//   try {
//     console.log("📲 Sending OTP to:", phoneNumber);

//     // Format phone number (ensure it has country code)
//     let formattedPhone = phoneNumber.trim();
//     if (!formattedPhone.startsWith("+")) {
//       // Assuming Indian numbers, add +91 prefix
//       formattedPhone = `+91${formattedPhone.replace(/^0+/, "")}`;
//     }

//     // Generate OTP
//     const otp = generateOTP();
    
//     // Store OTP with expiry time
//     otpStore.set(formattedPhone, {
//       otp: otp,
//       expiresAt: Date.now() + OTP_EXPIRY,
//       attempts: 0
//     });

//     // Send OTP via SMS using Firebase (requires Twilio/other SMS provider integration)
//     // For Firebase Auth, you typically use client-side reCAPTCHA verification
//     // But for server-side, we can use a custom SMS provider

//     // Option 1: Using Firebase Custom Token + SMS Provider
//     // You'll need to integrate with an SMS service like Twilio, MSG91, etc.
//     // For now, returning the OTP for testing (REMOVE IN PRODUCTION!)
    
//     console.log(`✅ OTP generated for ${formattedPhone}: ${otp}`);

//     // In production, send OTP via SMS service here
//     // Example with a hypothetical SMS service:
//     // await sendSMS(formattedPhone, `Your OTP is: ${otp}. Valid for 5 minutes.`);

//     return res.json({
//       success: true,
//       message: "OTP sent successfully",
//       // REMOVE THIS IN PRODUCTION! Only for testing
//       otp: process.env.NODE_ENV === 'development' ? otp : undefined
//     });

//   } catch (error) {
//     console.error("❌ Error sending OTP:", error);
//     return res.status(500).json({
//       success: false,
//       error: error.message || "Failed to send OTP",
//     });
//   }
// });


// /**
//  * Verify OTP and create Firebase custom token
//  * POST /verify-otp
//  * Body: { phoneNumber: string, otp: string }
//  */
// router.post("/verify-otp", async (req, res) => {
//   const { phoneNumber, otp } = req.body;

//   if (!phoneNumber || !otp) {
//     return res.status(400).json({
//       success: false,
//       error: "Phone number and OTP are required",
//     });
//   }

//   try {
//     console.log("🔐 Verifying OTP for:", phoneNumber);

//     // Format phone number
//     let formattedPhone = phoneNumber.trim();
//     if (!formattedPhone.startsWith("+")) {
//       formattedPhone = `+91${formattedPhone.replace(/^0+/, "")}`;
//     }

//     // Check if OTP exists
//     const storedOTPData = otpStore.get(formattedPhone);

//     if (!storedOTPData) {
//       return res.status(400).json({
//         success: false,
//         error: "OTP not found or expired. Please request a new OTP.",
//       });
//     }

//     // Check if OTP is expired
//     if (Date.now() > storedOTPData.expiresAt) {
//       otpStore.delete(formattedPhone);
//       return res.status(400).json({
//         success: false,
//         error: "OTP has expired. Please request a new OTP.",
//       });
//     }

//     // Check attempt limit (max 3 attempts)
//     if (storedOTPData.attempts >= 3) {
//       otpStore.delete(formattedPhone);
//       return res.status(429).json({
//         success: false,
//         error: "Too many failed attempts. Please request a new OTP.",
//       });
//     }

//     // Verify OTP
//     if (storedOTPData.otp !== otp) {
//       // Increment attempts
//       storedOTPData.attempts += 1;
//       otpStore.set(formattedPhone, storedOTPData);

//       return res.status(400).json({
//         success: false,
//         error: "Invalid OTP",
//         attemptsRemaining: 3 - storedOTPData.attempts
//       });
//     }

//     // OTP is valid - create Firebase custom token
//     const uid = formattedPhone; // Use phone number as UID

//     // Create or update user in Firebase
//     let userRecord;
//     try {
//       userRecord = await admin.auth().getUserByPhoneNumber(formattedPhone);
//     } catch (error) {
//       // User doesn't exist, create new user
//       userRecord = await admin.auth().createUser({
//         phoneNumber: formattedPhone,
//         uid: uid
//       });
//     }

//     // Generate custom token
//     const customToken = await admin.auth().createCustomToken(userRecord.uid);

//     // Clear OTP from store
//     otpStore.delete(formattedPhone);

//     console.log(`✅ OTP verified successfully for ${formattedPhone}`);

//     return res.json({
//       success: true,
//       message: "OTP verified successfully",
//       token: customToken,
//       user: {
//         uid: userRecord.uid,
//         phoneNumber: userRecord.phoneNumber
//       }
//     });

//   } catch (error) {
//     console.error("❌ Error verifying OTP:", error);
//     return res.status(500).json({
//       success: false,
//       error: error.message || "Failed to verify OTP",
//     });
//   }
// });

// /**
//  * Resend OTP
//  * POST /resend-otp
//  * Body: { phoneNumber: string }
//  */
// router.post("/resend-otp", async (req, res) => {
//   const { phoneNumber } = req.body;

//   if (!phoneNumber) {
//     return res.status(400).json({
//       success: false,
//       error: "Phone number is required",
//     });
//   }

//   try {
//     let formattedPhone = phoneNumber.trim();
//     if (!formattedPhone.startsWith("+")) {
//       formattedPhone = `+91${formattedPhone.replace(/^0+/, "")}`;
//     }

//     // Clear old OTP if exists
//     otpStore.delete(formattedPhone);

//     // Generate new OTP
//     const otp = generateOTP();
    
//     otpStore.set(formattedPhone, {
//       otp: otp,
//       expiresAt: Date.now() + OTP_EXPIRY,
//       attempts: 0
//     });

//     console.log(`🔄 OTP resent to ${formattedPhone}: ${otp}`);

//     // Send OTP via SMS service here (in production)

//     return res.json({
//       success: true,
//       message: "OTP resent successfully",
//       otp: process.env.NODE_ENV === 'development' ? otp : undefined
//     });

//   } catch (error) {
//     console.error("❌ Error resending OTP:", error);
//     return res.status(500).json({
//       success: false,
//       error: error.message || "Failed to resend OTP",
//     });
//   }
// });


router.post("/save-student-details", async (req, res) => {
  try {
    const {
      companyId,
      phoneNumber,
      studentName,
      email,
      adharNumber,
      resumeUrl,
    } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Fields allowed to be updated
    const updateData = {
      companyId,
      studentName,
      email,
      adharNumber,
      resumeUrl,
    };

    // Remove undefined fields (important for PATCH behavior)
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    let student = await Student.findOne({ phoneNumber });

    // 🟢 UPDATE
    if (student) {
      student = await Student.findOneAndUpdate(
        { phoneNumber },
        { $set: updateData },
        { new: true }
      );

      return res.json({
        success: true,
        student_id: student._id,
        message: "Student details updated successfully",
      });
    }

    // 🟢 CREATE
    student = await Student.create({
      phoneNumber,
      ...updateData,
    });

    res.json({
      success: true,
      student_id: student._id,
      message: "Student registered successfully!",
    });
  } catch (error) {
    console.error("Save student error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});



router.post("/check-student", async (req, res) => {
  try {
    const { email } = req.body;

    const student = await Student.findOne({ email });

    if (!student) {
      return res.status(404).json({
        success: false,
        exists: false,
        message:
          "User with this email is not registered. Please register first to sign in successfully."
      });
    }

    return res.json({
      success: true,
      exists: true,
      studentId: student._id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// router.post("/send-otp", async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         error: "Email is required",
//       });
//     }

//     let student = await Student.findOne({ email });
//     if (!student) {
//       student = await Student.create({ email });
//     }

//     const otp = generateOTP();
//     const otpHash = hashOTP(otp);

//     student.otpHash = otpHash;
//     student.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
//     await student.save();

//     await transporter.sendMail({
//       from: `"Your App" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: "Your OTP Code",
//       html: `
//         <h2>Email Verification</h2>
//         <p>Your OTP is:</p>
//         <h1>${otp}</h1>
//         <p>This OTP will expire in 10 minutes.</p>
//       `,
//     });

//     console.log("📧 OTP sent to:", email);

//     return res.json({
//       success: true,
//       message: "OTP sent successfully",
//     });
//   } catch (err) {
//     console.error("Send OTP Error:", err);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to send OTP",
//     });
//   }
// });

// router.post("/verify-otp", async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     if (!email || !otp) {
//       return res.status(400).json({
//         success: false,
//         error: "Email and OTP are required",
//       });
//     }

//     const student = await Student.findOne({ email });

//     if (!student || !student.otpHash) {
//       return res.status(400).json({
//         success: false,
//         error: "OTP not requested",
//       });
//     }

//     if (student.otpExpires < Date.now()) {
//       return res.status(400).json({
//         success: false,
//         error: "OTP expired",
//       });
//     }

//     const hashedOTP = hashOTP(otp);

//     if (hashedOTP !== student.otpHash) {
//       return res.status(400).json({
//         success: false,
//         error: "Invalid OTP",
//       });
//     }

//     // Clear OTP after success
//     student.otpHash = undefined;
//     student.otpExpires = undefined;
//     await student.save();

//     const token = jwt.sign(
//       { id: student._id, email: student.email },
//       JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: true,
//       sameSite: "none",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     return res.json({
//       success: true,
//       studentId: student._id,
//       message: "Email verified successfully",
//     });
//   } catch (err) {
//     console.error("Verify OTP Error:", err);
//     return res.status(500).json({
//       success: false,
//       error: "OTP verification failed",
//     });
//   }
// });





router.patch("/update-skills", async (req, res) => {
  try {
    const { studentId, skills } = req.body;
    console.log("Received skills update:", studentId, skills);
    //Validate studentId
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "StudentId is required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid StudentId"
      });
    }

    // Validate and normalize skills
    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: "Skills must be an array of { skill, level }"
      });
    }

    // Validate each skill object
    const validLevels = ["Beginner", "Intermediate", "Expert"];
    const formattedSkills = skills
      .filter(s => s && s.skill)
      .map(s => ({
        skill: s.skill.trim(),
        level: validLevels.includes(s.level) ? s.level : "Beginner"
      }));

    // Prevent empty update
    if (formattedSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one valid skill is required"
      });
    }

    // Update student document
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { skills: formattedSkills },
      { new: true }
    ).select("studentName skills");

    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // ✅ 6️⃣ Success response
    return res.json({
      success: true,
      message: "Skills updated successfully",
      student: updatedStudent
    });

  } catch (error) {
    console.error("Update skills error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});


router.get("/student-skill/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid studentId"
      });
    }

    const student = await Student.findById(studentId).select("skills studentName");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    return res.json({
      success: true,
      student: {
        id: student._id,
        studentName: student.studentName,
        skills: student.skills || []
      }
    });

  } catch (error) {
    console.error("Fetch student error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});


// GET all interview reports by studentId
router.get("/student-report/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    const reports = await InterviwewReport
      .find({ candidateId: studentId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: reports
    });
  } catch (err) {
    console.error("Fetch student reports error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student interview reports"
    });
  }
});




module.exports = router;

