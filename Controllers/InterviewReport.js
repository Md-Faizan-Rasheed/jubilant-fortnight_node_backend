

const InterviewReportSchema = require("../Models/InterviewReport.Models");

function extractAIReport(content) {
  if (!content || typeof content !== "string") {
    return { structured: null, reportText: "" };
  }

  let structured = null;
  let reportText = "";

  try {
    const jsonMatch = content.match(
      /```json([\s\S]*?)```|(\{[\s\S]*?"recommendation"[\s\S]*?\})/
    );

    if (jsonMatch) {
      const jsonString = jsonMatch[1] || jsonMatch[2];
      structured = JSON.parse(jsonString);
    }

    const reportSplit = content.split("PART 2: HUMAN-READABLE REPORT");

    if (reportSplit.length > 1) {
      reportText = reportSplit[1].trim();
    } else {
      reportText = content.replace(jsonMatch?.[0] || "", "").trim();
    }

    return { structured, reportText };
  } catch (error) {
    console.error("AI parsing failed:", error);
    return { structured: null, reportText: content };
  }
}

async function saveInterviewReport({
  aiContent,
  sessionId,
  candidateId,
  jobId,
  jobTitle
}) {
  const { structured, reportText } = extractAIReport(aiContent);

  if (!structured || !structured.overallRating || !structured.recommendation) {
    throw new Error("AI response parsing failed or incomplete");
  }

  const reportDoc = new InterviewReportSchema({
    sessionId,
    candidateId,
    jobId,
    jobTitle,
    aiModel: "gpt-4o",
    promptVersion: "v2",
    generatedAt: new Date(),
    overallRating: structured.overallRating,
    scores: {
      technical: structured.scores?.technical ?? null,
      communication: structured.scores?.communication ?? null,
      problemSolving: structured.scores?.problemSolving ?? null,
    },
    strengths: structured.strengths || [],
    weaknesses: structured.weaknesses || [],
    areasForDevelopment: structured.areasForDevelopment || [],
    highlights: structured.highlights || [],
    recommendation: {
      decision: structured.recommendation.decision,
      confidence: structured.recommendation.confidence ?? null,
    },
    rawReportText: reportText,
  });

  return await reportDoc.save();
}

module.exports = {
  saveInterviewReport
};
