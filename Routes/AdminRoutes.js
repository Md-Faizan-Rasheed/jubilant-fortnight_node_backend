// routes/admin.js
const express = require("express");
const router = express.Router();

const Student = require("../Models/Studentdetails.Model");
const InterviewSession = require("../Models/InterviewSession.Models");
const InterviewReport = require("../Models/InterviewReport.Models");
const Job = require("../Models/Job");
const Payment = require("../Models/Payment");
const User = require("../Models/User.Models");
const InterviewFeedback = require("../Models/InterviewFeedback");

router.get("/stats", async (req, res) => {
  try {
    // counts
    const [
      totalStudents,
      totalInterviews,
      pendingReviews,
      activeJobs,
      revenueAgg,
      completedInterviews
    ] = await Promise.all([
      Student.countDocuments({}),
      InterviewSession.countDocuments({}),
      InterviewReport.countDocuments({}), // adjust if your field differs
      Job.countDocuments({ status: "Published" }), // adjust if your field differs
      Payment.aggregate([
        { $match: { status: "PAID" } }, // adjust if your field differs
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      InterviewSession.countDocuments({ status: "completed" }) // adjust if your field differs
    ]);

    const totalRevenue = revenueAgg?.[0]?.total || 0;

    // success rate = completed interviews / total interviews * 100
    const successRate =
      totalInterviews > 0 ? Math.round((completedInterviews / totalInterviews) * 100) : 0;

    // optional: recent activity (example from latest interviews + payments)
    const recentSessions = await InterviewSession.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title createdAt status");

    const recentPayments = await Payment.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("amount createdAt status");

    const recentActivity = [
      ...recentSessions.map((s) => ({
        action: `Interview ${s.status || "updated"}`,
        time: s.createdAt,
        type: s.status === "completed" ? "success" : "info"
      })),
      ...recentPayments.map((p) => ({
        action: `Payment ${p.status || "received"} ($${p.amount})`,
        time: p.createdAt,
        type: p.status === "PAID" ? "success" : "warning"
      }))
    ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5)
      .map((item) => ({
        ...item,
        time: new Date(item.time).toLocaleString()
      }));

    // optional: top performers from InterviewReport
    const topPerformers = await InterviewReport.aggregate([
      { $match: { overallRating: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: "$candidateId",
          avgScore: { $avg: "$overallRating" },
          interviews: { $sum: 1 }
        }
      },
      { $sort: { avgScore: -1 } },
      { $limit: 5 }
    ]);

    // map student names
    const studentIds = topPerformers.map((t) => t._id);
    const students = await Student.find({ _id: { $in: studentIds } }).select("studentName");

    const topPerformersWithNames = topPerformers.map((t) => {
      const student = students.find((s) => s._id.toString() === t._id.toString());
      return {
        name: student?.studentName || "Unknown",
        score: Number(t.avgScore.toFixed(1)),
        interviews: t.interviews
      };
    });

    res.json({
      totalStudents,
      totalInterviews,
      pendingReviews,
      successRate,
      activeJobs,
      totalRevenue,
      recentActivity,
      topPerformers: topPerformersWithNames
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
});


// Reports
router.get("/reports", async (req, res) => {
  try {
    const reports = await InterviewReport.find({})
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reports" });
  }
});

// Feedback
router.get("/feedback", async (req, res) => {
    console.log("Fetching feedback");
  try {
    const feedback = await InterviewFeedback.find({})
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch feedback" });
  }
});

// Jobs
router.get("/jobs", async (req, res) => {
  try {
    const jobs = await Job.find({})
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

// Payments
router.get("/payments", async (req, res) => {
  try {
    const payments = await Payment.find({})
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payments" });
  }
});

// Users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({})
      .select("company_name email field_of_work emp_size createdAt")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});


// IMPORTANT: adjust foreignField names if your schema differs
// - InterviewSession uses candidateId or studentId?
// - InterviewReport uses candidateId (as shown in your sample)

router.get("/students", async (req, res) => {
  try {
    const students = await Student.aggregate([
      {
        $lookup: {
          from: "interviewsessions",
          localField: "_id",
          foreignField: "candidateId", // change to "studentId" if that is your field
          as: "sessions"
        }
      },
      {
        $lookup: {
          from: "interviewreports",
          localField: "_id",
          foreignField: "candidateId", // change if needed
          as: "reports"
        }
      },
      {
        $addFields: {
          totalInterviews: { $size: "$sessions" },
          avgScore: {
            $ifNull: [{ $avg: "$reports.overallRating" }, 0]
          }
        }
      },
      {
        $addFields: {
          performance: {
            $switch: {
              branches: [
                { case: { $gte: ["$avgScore", 8] }, then: "excellent" },
                { case: { $gte: ["$avgScore", 6] }, then: "good" },
                { case: { $gte: ["$avgScore", 4] }, then: "average" }
              ],
              default: "poor"
            }
          }
        }
      },
      {
        $project: {
          id: "$_id",
          name: 1,
          email: 1,
          phone: 1,
          location: 1,
          status: 1,
          skills: 1,
          registeredDate: "$createdAt",
          totalInterviews: 1,
          avgScore: { $round: ["$avgScore", 1] },
          performance: 1
        }
      },
      { $sort: { registeredDate: -1 } }
    ]);

    res.json(students);
  } catch (err) {
    console.error("admin/students error:", err);
    res.status(500).json({ message: "Failed to fetch students" });
  }
});



router.get("/interviews", async (req, res) => {
  try {
    const interviews = await InterviewSession.aggregate([
      {
        $lookup: {
          from: "students",
          localField: "studentId",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "jobs",
          localField: "jobId",
          foreignField: "_id",
          as: "job"
        }
      },
      { $unwind: { path: "$job", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          studentName: { $ifNull: ["$student.studentName", "$student.studentName"] },
          jobTitle: "$job.jobTitle",
          scheduledAt: "$scheduledAt",
          createdAt: "$createdAt",
          durationMinutes: {
            $cond: [
              { $and: [{ $ifNull: ["$startedAt", false] }, { $ifNull: ["$endedAt", false] }] },
              {
                $floor: {
                  $divide: [{ $subtract: ["$endedAt", "$startedAt"] }, 1000 * 60]
                }
              },
              null
            ]
          },
          overallRating: "$overallRating",
        //   score: {
        //     $arrayElemAt: ["$interviewreports.scores", 0]
        //   },
        score:{ $ifNull: ["$interviewreports.overallRating", "$interviewreports.overallRating"] },

          status: "$status",
          type: "$type"
        }
      },
      { $sort: { createdAt: -1 } }
    ]);
    console.log("Fetched interviews:", interviews);

    res.json(interviews);
  } catch (err) {
    console.error("admin/interviews error:", err);
    res.status(500).json({ message: "Failed to fetch interviews" });
  }
});



module.exports = router;
