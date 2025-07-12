import mongoose from "mongoose";

const ExamSchema = new mongoose.Schema({
        college: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "College",
          required: true,
        },
        examName: {
          type: String,
          required: true,
        },
        examDate: {
          type: Date,
        },
        examTime: {
          type: String,
        },
        examInstructions: {
          type: String,
        },
        examQuestions: {
          type: [mongoose.Schema.Types.ObjectId],
          ref: "master_mcq_question",
        },
        examResults: {
          type: [mongoose.Schema.Types.ObjectId],
          ref: "Result",
        },
        examStatus: {
          type: String,
          enum: ["active", "inactive"],
          default: "inactive",
        },
        // Additional fields from reference
        examAvailability: {
          type: String,
          required: true,
          enum: ["scheduled", "practice"],
        },
        reattempt: {
          type: Number,
          default: 0,
        },
        stream: {
          type: String,
          required: true,
        },
        standard: {
          type: String,
          required: true,
        },
        examType: {
          type: String,
        },
        examSubject: {
          type: [String],
          required: true,
        },
        examGroup: {
          type: String,
          default: null,
        },
        status: {
          type: String,
          required: true,
          enum: ["draft", "in progress", "completed", "cancelled", "scheduled"],
          default: "draft",
        },
        totalMarks: {
          type: Number,
          default: 0,
        },
        passingMarks: {
          type: Number,
          default: 0,
        },
        startTime: {
          type: Date,
        },
        endTime: {
          type: Date,
        },
        examDurationMinutes: {
          type: Number,
          required: true, // in minutes
        },
        negativeMarks: {
          type: Number,
          default: 0,
        },
        questionShuffle: {
          type: Boolean,
          default: false,
        },
        section: {
          type: String,
          enum: ["Section A", "Section B"],
        }
      },
);

const Exam = mongoose.models?.Exam || mongoose.model("Exam", ExamSchema);
export default Exam;
