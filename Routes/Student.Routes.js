
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const twilio = require("twilio");
// const { default: mongoose } = require('mongoose');
const {setAuthCookie} = require('../Controllers/StudentController');
const jwt = require("jsonwebtoken");


const mongoose = require("mongoose");
const Student = require("../Models/Studentdetails.Model"); // Adjust path as needed

const JWT_SECRET = process.env.JWT_SECRET

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



router.post("/send-otp", async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({
      success: false,
      error: "Phone number is required",
    });
  }

  console.log("📲 [DUMMY] Sending OTP to:", phoneNumber);

 let student = await Student.findOne({ phoneNumber });
    if (!student) {
      student = await Student.create({ phoneNumber });
    }

  // Simulate delay (optional)
  setTimeout(() => {

    setAuthCookie(res, student);
    // res.json({ success: true, studentId: student._id });
    return res.json({
      success: true,
      message: "OTP sent successfully (dummy)",
      otp: "123456", // expose only in testing
    });
  }, 500);
});


router.post("/verify-otp", async (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return res.status(400).json({
      success: false,
      error: "Phone number and OTP are required",
    });
  }

  console.log("🔐 [DUMMY] Verifying OTP for:", phoneNumber);

  if (otp === "123456") {
    // do it in real scenario
    // ✅ Generate JWT
  const token = jwt.sign({ id: Student._id, phone: Student.phoneNumber }, JWT_SECRET, {
    expiresIn: "7d",
  });

  // ✅ Set cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

    return res.json({
      success: true,
      message: "OTP verified successfully (dummy)",
    });
  } else {
    return res.status(400).json({
      success: false,
      error: "Invalid OTP",
    });
  }
});


// router.post("/save-student-details", async (req, res) => {
//     const {companyId,phoneNumber, studentName,email,adharNumber,resumeUrl } = req.body;
  
//     const existingStudent = await Student.findOne({ phoneNumber });
//     if (existingStudent) {
//       return res.json({ success: false, message: "This number is already registered for an interview." });
//     }
  
//     const newStudent = new Student({companyId, phoneNumber, studentName,email, adharNumber,resumeUrl});
//     await newStudent.save();
  

  
//     res.json({ success: true,student_id:newStudent.id, message: "Student registered successfully!" });
//   });
  

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


router.post("/check-student",async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    const student = await Student.findOne({ phoneNumber });

    if (!student) {
      return res.status(404).json({
        success: false,
        exists: false,
        message:
          "User with this mobile number is not registered. Please register first to sign in successfully."
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
})

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



module.exports = router;

