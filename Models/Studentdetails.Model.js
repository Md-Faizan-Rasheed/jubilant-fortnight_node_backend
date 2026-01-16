
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StudentDetailsSchema = new Schema({
     companyId: {
      type: Schema.Types.ObjectId,
      required: true,
      required: false,
      ref: "users",
      index: true,
    },
    phoneNumber: {
        type: Number,
        required: true,
        min: 0,
    },
    studentName: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    adharNumber: {
        type: Number,
    },
    otp: {
        type: String, // keep as String to preserve leading zeros
        required: false,
    },
    resumeUrl: {
        type: String,
        required: false,
        trim: true,
    },
   skills: [
  {
    skill: { type: String, required: true },
    level: { type: String, enum: ["Beginner", "Intermediate", "Expert"], default: "Beginner" }
  }
]

}, { timestamps: true });

const Student = mongoose.model("Student", StudentDetailsSchema);
module.exports = Student;
