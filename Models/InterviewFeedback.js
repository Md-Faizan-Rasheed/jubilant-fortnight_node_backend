const mongoose = require("mongoose");

const InterviewFeedbackSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId, // or String if you use custom IDs
      ref: "Student", // optional, if you have a Student model
      required: true,
      index: true
    },

    difficulty: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },

    fairness: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },

    aiQuality: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },

    overallExperience: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },

    technicalIssues: {
      type: Boolean,
      default: false
    },

    comments: {
      type: String,
      maxlength: 500,
      trim: true
    }
  },
  {
    timestamps: true // createdAt, updatedAt
  }
);

// export default mongoose.model("InterviewFeedback", InterviewFeedbackSchema);
module.exports = mongoose.model("InterviewFeedback", InterviewFeedbackSchema);


