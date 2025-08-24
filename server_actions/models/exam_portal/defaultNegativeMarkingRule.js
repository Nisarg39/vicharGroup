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
    section: {
        type: String, // e.g., "Section A", "Section B", "All"
        required: false, // Optional for section-specific rules
        enum: ["Section A", "Section B", "Section C", "All"],
        default: "All"
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
    // MCMA Partial Marking Configuration
    partialMarkingEnabled: {
        type: Boolean,
        default: false, // Enable partial marking for MCMA questions
    },
    partialMarkingRules: {
        // Marks awarded for partial correct answers in MCMA
        threeOutOfFour: { type: Number, default: 3 }, // 3 correct out of 4+
        twoOutOfThree: { type: Number, default: 2 },  // 2 correct out of 3+
        oneOutOfTwo: { type: Number, default: 1 },    // 1 correct out of 2+
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

// Compound index to ensure unique rules per stream-standard-subject-questionType-section combination
DefaultNegativeMarkingRuleSchema.index({ 
    stream: 1, 
    standard: 1, 
    subject: 1, 
    questionType: 1,
    section: 1
}, { 
    unique: true,
    partialFilterExpression: { isActive: true }
});

// PERFORMANCE INDEX: Optimized for bulk query fetch pattern used in exam scoring
DefaultNegativeMarkingRuleSchema.index({ 
    stream: 1, 
    isActive: 1,
    priority: -1  // Descending to match the sort order in getBulkNegativeMarkingRules
}, {
    name: 'bulk_fetch_optimized'
});

// PERFORMANCE INDEX: Additional index for efficient rule lookup during exam scoring
DefaultNegativeMarkingRuleSchema.index({ 
    stream: 1,
    questionType: 1,
    subject: 1,
    standard: 1,
    isActive: 1
}, {
    name: 'exam_scoring_lookup'
});

const DefaultNegativeMarkingRule = mongoose.models?.DefaultNegativeMarkingRule || mongoose.model("DefaultNegativeMarkingRule", DefaultNegativeMarkingRuleSchema);
export default DefaultNegativeMarkingRule;

