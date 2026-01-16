const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const Student = require("../Models/Studentdetails.Model");
// const { sendOtp, verifyOtpCode } = require("..");

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey";

// Utility: create JWT and set as cookie
const setAuthCookie = (res, student) => {
  console.log("Studnet ",student)
  
  const token = jwt.sign(
    { id: student._id, phone: student.phoneNumber },
    JWT_SECRET,
    { expiresIn: "3m" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    // maxAge: 7 * 24 * 60 * 60 * 1000,
     maxAge: 2 * 60 * 1000, // ✅ 2 minutes

  });

  return token;
};

// ✅ Verify OTP → login/signup
const verifyOtpHandler = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    const valid = await verifyOtpCode(phoneNumber, otp);
    if (!valid)
      return res.json({ success: false, message: "Invalid or expired OTP" });

    let student = await Student.findOne({ phoneNumber });
    if (!student) {
      student = await Student.create({ phoneNumber });
    }

    setAuthCookie(res, student);
    res.json({ success: true, studentId: student._id });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Check Auth
// const checkAuth = (req, res) => {
//   try {
//     const token = req.cookies.token;
//     if (!token) return res.json({ success: false });

//     const decoded = jwt.verify(token, JWT_SECRET);
//     res.json({ success: true, user: decoded });
//   } catch {
//     res.json({ success: false });
//   }
// };

const checkAuth = (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "No token found" });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded token:", decoded);
    // ✅ Return decoded info (including _id)
    return res.json({
      success: true,
      user: decoded,
      _id: decoded._id,  // <-- Explicitly include user ID
    });
  } catch (err) {
    console.error("Auth check failed:", err.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

// ✅ Logout
const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
};

// ✅ COMMONJS EXPORT (THIS FIXES THE ERROR)
module.exports = {
//   sendOtpHandler,
  verifyOtpHandler,
  checkAuth,
  logout,
  setAuthCookie
};
