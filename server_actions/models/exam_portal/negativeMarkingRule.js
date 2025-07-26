import mongoose from "mongoose";

const NegativeMarkingRuleSchema = new mongoose.Schema({
    college: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "College",
        required: true,
    },
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
    description: {
        type: String, // e.g., "-0.25 for each wrong answer"
        required: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    priority: {
        type: Number,
        default: 0, // Higher priority rules override lower ones
    }
}, {
    timestamps: true
});

// Compound index to ensure unique rules per college-stream-standard-subject combination
NegativeMarkingRuleSchema.index({ 
    college: 1, 
    stream: 1, 
    standard: 1, 
    subject: 1 
}, { 
    unique: true,
    partialFilterExpression: { isActive: true }
});

const NegativeMarkingRule = mongoose.models?.NegativeMarkingRule || mongoose.model("NegativeMarkingRule", NegativeMarkingRuleSchema);
export default NegativeMarkingRule;
