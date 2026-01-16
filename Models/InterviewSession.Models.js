const mongoose = require("mongoose");
const { Schema } = mongoose;

const InterviewSessionSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "students", // change if your model name differs
      index: true,
    },

    jobId: {
      type: Schema.Types.ObjectId,
      // required: true,
      required:false,
      ref: "jobs",
      index: true,
    },

    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
      required: true,
    },

    transcript: [
      {
        speaker: {
          type: String, // "candidate" | "ai" | "interviewer"
          required: true,
          trim: true,
        },
        message: {
          type: String,
          required: true,
          trim: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    startedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },

    endedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// Helpful compound index for faster lookups
InterviewSessionSchema.index({ studentId: 1, jobId: 1 });

module.exports = mongoose.model("InterviewSession", InterviewSessionSchema);
