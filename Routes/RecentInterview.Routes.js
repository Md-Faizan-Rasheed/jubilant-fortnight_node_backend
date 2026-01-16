const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const InterviewReport = require("../Models/InterviewReport.Models");

// GET all interview report summaries for a company
router.get("/by-company/:companyId", async (req, res) => {
  try {
    const companyId = new mongoose.Types.ObjectId(req.params.companyId);

    const result = await InterviewReport.aggregate([
      /* 1️⃣ Join with Student (candidateId → student._id) */
      {
        $lookup: {
          from: "students",               // collection name
          localField: "candidateId",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: "$student" },

      /* 2️⃣ Filter students by companyId */
      {
        $match: {
          "student.companyId": companyId
        }
      },

      /* 3️⃣ Join with Jobs (jobId → jobs._id) */
      {
        $lookup: {
          from: "jobs",                   // collection name
          localField: "jobId",
          foreignField: "_id",
          as: "job"
        }
      },
      { $unwind: "$job" },

      /* 4️⃣ Ensure job belongs to same company */
      {
        $match: {
          "job.userId": companyId
        }
      },

      /* 5️⃣ Shape final response (dict1 format) */
      {
        $project: {
          _id: 0,
          name: "$student.studentName",
          resumeurl:"$student.resumeUrl",
          email:"$student.email",
          job_name: "$job.jobTitle",
          overall_Rating: "$overallRating",
          report: "$rawReportText",
          created_date: "$createdAt"
        }
      },

      /* 6️⃣ Optional: sort latest first */
      {
        $sort: { created_date: -1 }
      }
    ]);

    res.json({
      success: true,
      data: result
    });
 
  } catch (err) {
    console.error("Aggregation fetch error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch interview report data"
    });
  }
});

module.exports = router;
