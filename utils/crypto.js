const crypto = require("crypto");

// ❌ REMOVE THIS — totally wrong & useless here
// const { model } = require("mongoose");

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const hashOTP = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

// ❌ YOU WROTE: model.exports (WRONG)
// ✅ MUST BE:
module.exports = {
  generateOTP,
  hashOTP,
};
