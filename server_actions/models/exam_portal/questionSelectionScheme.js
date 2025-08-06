import mongoose from "mongoose";

const QuestionSelectionSchemeSchema = new mongoose.Schema({
    schemeName: {
        type: String,
        required: true,
        unique: true
    },
    examType: {
        type: String,
        required: true,
        enum: ["JEE", "NEET", "MHT-CET"]
    },
    description: {
        type: String,
        default: ""
    },
    isActive: {
        type: Boolean,
        default: true
    },
    subjectRules: [{
        subject: {
            type: String,
            required: true
        },
        standard: {
            type: String,
            required: true,
            enum: ["11", "12"]
        },
        totalQuestions: {
            type: Number,
            required: true,
            min: 0
        },
        difficultyDistribution: {
            easy: {
                type: Number,
                default: 0,
                min: 0
            },
            medium: {
                type: Number,
                default: 0,
                min: 0
            },
            hard: {
                type: Number,
                default: 0,
                min: 0
            }
        },
        // Topic-wise distribution for finer control
        topicDistribution: [{
            topic: String,
            questionsRequired: {
                type: Number,
                min: 0,
                default: 0
            },
            standard: {
                type: String,
                enum: ["11", "12"],
                required: false
            }
        }],
        // Section-wise distribution (only for exams that have sections like MHT-CET)
        sectionDistribution: {
            sectionA: {
                type: Number,
                default: 0,
                min: 0
            },
            sectionB: {
                type: Number,
                default: 0,
                min: 0
            }
        },
        // Priority for question selection (1-5, 5 being highest)
        selectionPriority: {
            type: Number,
            default: 3,
            min: 1,
            max: 5
        }
    }],
    totalSchemeQuestions: {
        type: Number,
        required: true,
        min: 1
    },
    // Exam-specific configuration
    examConfiguration: {
        hasSections: {
            type: Boolean,
            default: function() {
                // JEE has Section A (MCQs) and Section B (Numerical), NEET and MHT-CET don't have sections
                return this.examType === "JEE";
            }
        },
        hasQuestionTypes: {
            type: Boolean,
            default: function() {
                // JEE has numerical questions in Section B, others are mainly MCQs
                return this.examType === "JEE";
            }
        },
        supportedSections: [{
            type: String,
            enum: ["Section A", "Section B"]
        }],
        supportedQuestionTypes: [{
            type: String,
            enum: ["MCQ", "Numerical", "Integer Type"]
        }]
    },
    createdBy: {
        type: String,
        default: "Super Admin"
    },
    // Automatic question selection settings
    autoSelectionEnabled: {
        type: Boolean,
        default: true
    },
    // Fallback strategy when exact matching fails
    fallbackStrategy: {
        type: String,
        enum: ["RELAX_DIFFICULTY", "RELAX_TOPIC", "RELAX_STANDARD", "MANUAL_SELECTION"],
        default: "RELAX_DIFFICULTY"
    },
    // Minimum question pool size requirement per rule
    minimumPoolSize: {
        type: Number,
        default: 10,
        min: 1
    },
    // Usage statistics
    usageStats: {
        timesUsed: {
            type: Number,
            default: 0
        },
        lastUsedAt: {
            type: Date
        },
        successfulApplications: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Add validation to ensure difficulty distribution adds up correctly
QuestionSelectionSchemeSchema.pre('save', function(next) {
    console.log('=== SCHEMA VALIDATION START ===');
    
    try {
        this.subjectRules.forEach((rule, index) => {
            console.log(`Validating rule ${index + 1}: ${rule.subject} Class ${rule.standard}`);
            console.log(`  Total questions: ${rule.totalQuestions}`);
            console.log(`  Difficulty distribution:`, rule.difficultyDistribution);
            
            const difficultySum = (rule.difficultyDistribution.easy || 0) + 
                                (rule.difficultyDistribution.medium || 0) + 
                                (rule.difficultyDistribution.hard || 0);
            
            console.log(`  Difficulty sum: ${difficultySum}`);
            
            // If all difficulties are 0, it means no difficulty restriction - this is valid
            const hasNoDifficultyRestriction = 
                (rule.difficultyDistribution.easy || 0) === 0 && 
                (rule.difficultyDistribution.medium || 0) === 0 && 
                (rule.difficultyDistribution.hard || 0) === 0;
            
            console.log(`  Has no difficulty restriction: ${hasNoDifficultyRestriction}`);
            
            // Only validate sum if there are difficulty restrictions
            if (!hasNoDifficultyRestriction && difficultySum !== rule.totalQuestions) {
                console.log(`  VALIDATION FAILED: Difficulty sum (${difficultySum}) != total questions (${rule.totalQuestions})`);
                return next(new Error(`${rule.subject} Class ${rule.standard}: Sum of difficulty distribution (${difficultySum}) must equal total questions (${rule.totalQuestions})`));
            }
            
            console.log(`  Difficulty validation PASSED`);

            // For JEE, validate section distribution
            if (this.examType === "JEE" && rule.sectionDistribution) {
                const sectionSum = (rule.sectionDistribution.sectionA || 0) + (rule.sectionDistribution.sectionB || 0);
                console.log(`  Section sum: ${sectionSum}`);
                if (sectionSum !== rule.totalQuestions) {
                    console.log(`  SECTION VALIDATION FAILED: Section sum (${sectionSum}) != total questions (${rule.totalQuestions})`);
                    return next(new Error(`${rule.subject} Class ${rule.standard}: Sum of section distribution (${sectionSum}) must equal total questions (${rule.totalQuestions})`));
                }
                console.log(`  Section validation PASSED`);
            }
        });

        const totalSubjectQuestions = this.subjectRules.reduce((sum, rule) => sum + rule.totalQuestions, 0);
        console.log(`Total subject questions: ${totalSubjectQuestions}`);
        console.log(`Total scheme questions: ${this.totalSchemeQuestions}`);
        
        // Only validate total if both totals are greater than 0
        if (totalSubjectQuestions > 0 && this.totalSchemeQuestions > 0 && totalSubjectQuestions !== this.totalSchemeQuestions) {
            console.log(`TOTAL VALIDATION FAILED: Subject total (${totalSubjectQuestions}) != scheme total (${this.totalSchemeQuestions})`);
            return next(new Error(`Sum of all subject-standard questions (${totalSubjectQuestions}) must equal total scheme questions (${this.totalSchemeQuestions})`));
        }
        
        console.log('=== SCHEMA VALIDATION PASSED ===');
        next();
    } catch (error) {
        console.error('=== SCHEMA VALIDATION ERROR ===', error);
        return next(error);
    }
});

// Create compound index for faster queries
QuestionSelectionSchemeSchema.index({ examType: 1, isActive: 1 });
QuestionSelectionSchemeSchema.index({ schemeName: 1, examType: 1 });

const QuestionSelectionScheme = mongoose.models?.QuestionSelectionScheme || 
    mongoose.model("QuestionSelectionScheme", QuestionSelectionSchemeSchema);

export default QuestionSelectionScheme;