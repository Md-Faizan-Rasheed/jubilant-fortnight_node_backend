const mongoose = require("mongoose");
const { Schema } = mongoose;

const InterviewReportSchema = new Schema(
  {
    /* ===================== Relationships ===================== */
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "InterviewSession",
      required: true,
      index: true,
    },

    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },

    jobTitle: {
      type: String,
      // required: true,
        required:false,
      trim: true,
    },

    /* ===================== AI Metadata ===================== */
    aiModel: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    promptVersion: {
      type: String,
      required: true,
      trim: true,
    },

    generatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    /* ===================== Scores ===================== */
    overallRating: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
      index: true,
    },

    scores: {
      technical: {
        type: Number,
        min: 0,
        max: 10,
      },
      communication: {
        type: Number,
        min: 0,
        max: 10,
      },
      problemSolving: {
        type: Number,
        min: 0,
        max: 10,
      },
    },

    /* ===================== Structured Sections ===================== */
    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    areasForDevelopment: {
      type: [String],
      default: [],
    },

    /* ===================== Final Recommendation ===================== */
    recommendation: {
      decision: {
        type: String,
        enum: [
          "Strongly Recommend",
          "Recommend",
          "Consider",
          "Do Not Recommend",
        ],
        required: true,
        index: true,
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1,
      },
    },

    /* ===================== Raw AI Output ===================== */
    rawReportText: {
      type: String,
      required: true,
      immutable: true, // 🔒 prevents accidental edits
    },

    /* ===================== Optional Extras ===================== */
    highlights: {
      type: [String],
      default: [],
    },

    interviewerNotes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

/* ===================== Indexes ===================== */
InterviewReportSchema.index(
  { candidateId: 1, jobId: 1, sessionId: 1 },
  { unique: true } // prevents duplicate reports per interview
);

module.exports = mongoose.model("InterviewReport", InterviewReportSchema);
