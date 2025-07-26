import mongoose from "mongoose";

const DefaultNegativeMarkingRuleSchema = new mongoose.Schema({
    stream: {
        type: String,
        required: true,
    },
    standard: {
        type: String,
        required: false, // Optional for stream-wide rules
    },
    subject: {
        type: String,
        required: false, // Optional for subject-specific rules
    },
    negativeMarks: {
        type: Number,
        required: true,
        default: 0,
    },
    positiveMarks: {
        type: Number,
        required: false,
        default: 4, // Default for most competitive exams
    },
    description: {
        type: String,
        required: false,
    },
    examType: {
        type: String, // e.g., "JEE Main", "NEET", "MHT-CET"
        required: false,
    },
    conductedBy: {
        type: String, // e.g., "NTA", "State CET Cell"
        required: false,
    },
    questionType: {
        type: String, // e.g., "MCQ", "Numerical"
        required: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    priority: {
        type: Number,
        default: 0, // Higher priority rules override lower ones
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin", // Super admin who created this rule
        required: true,
    }
}, {
    timestamps: true
});

// Compound index to ensure unique rules per stream-standard-subject-questionType combination
DefaultNegativeMarkingRuleSchema.index({ 
    stream: 1, 
    standard: 1, 
    subject: 1, 
    questionType: 1
}, { 
    unique: true,
    partialFilterExpression: { isActive: true }
});

const DefaultNegativeMarkingRule = mongoose.models?.DefaultNegativeMarkingRule || mongoose.model("DefaultNegativeMarkingRule", DefaultNegativeMarkingRuleSchema);
export default DefaultNegativeMarkingRule;

