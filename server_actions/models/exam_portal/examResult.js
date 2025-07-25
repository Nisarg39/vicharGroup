import mongoose from "mongoose";

const ExamResultSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  attemptNumber: {
    type: Number,
    required: true,
  },
  answers: {
    type: Map,
    of: mongoose.Schema.Types.Mixed, // Can be string, array, or any other type
    default: {},
  },
  score: {
    type: Number,
    required: true,
    default: 0,
  },
  totalMarks: {
    type: Number,
    required: true,
  },
  timeTaken: {
    type: Number, // in seconds
    required: true,
  },
  completedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  isOfflineSubmission: {
    type: Boolean,
    default: false,
  },
  questionAnalysis: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "master_mcq_question",
      required: true,
    },
    status: {
      type: String,
      enum: ["correct", "incorrect", "unattempted"],
      required: true,
    },
    marks: {
      type: Number,
      required: true,
    },
    userAnswer: {
      type: mongoose.Schema.Types.Mixed, // Can be string, array, or null
    },
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed, // Can be string or array
    },
  }],
  statistics: {
    correctAnswers: {
      type: Number,
      default: 0,
    },
    incorrectAnswers: {
      type: Number,
      default: 0,
    },
    unattempted: {
      type: Number,
      default: 0,
    },
    accuracy: {
      type: Number, // percentage
      default: 0,
    },
  },
  // Negative marking rule information used for this exam
  negativeMarkingInfo: {
    ruleUsed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NegativeMarkingRule",
    },
    defaultRuleUsed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DefaultNegativeMarkingRule",
    },
    negativeMarks: {
      type: Number,
      default: 0,
    },
    ruleDescription: String,
    ruleSource: {
      type: String,
      enum: ["college_specific", "college_default", "super_admin_default", "exam_specific"],
      default: "exam_specific"
    }
  },
  // Additional metadata
  deviceInfo: {
    userAgent: String,
    screenResolution: String,
    timezone: String,
  },
  submissionMetadata: {
    isOffline: {
      type: Boolean,
      default: false,
    },
    syncAttempts: {
      type: Number,
      default: 0,
    },
    lastSyncAttempt: Date,
    syncStatus: {
      type: String,
      enum: ["pending", "synced", "failed"],
      default: "pending",
    },
  },
}, {
  timestamps: true,
});

// Remove the old unique index and add a new one for (exam, student, attemptNumber)
// ExamResultSchema.index({ exam: 1, student: 1 }, { unique: true });
ExamResultSchema.index({ exam: 1, student: 1, attemptNumber: 1 }, { unique: true });
ExamResultSchema.index({ student: 1, completedAt: -1 });
ExamResultSchema.index({ exam: 1, completedAt: -1 });
ExamResultSchema.index({ "submissionMetadata.syncStatus": 1 });

// Virtual for percentage score
ExamResultSchema.virtual('percentage').get(function() {
  return this.totalMarks > 0 ? ((this.score / this.totalMarks) * 100).toFixed(2) : 0;
});

// Method to check if result is passing
ExamResultSchema.methods.isPassing = function(passingPercentage = 40) {
  return parseFloat(this.percentage) >= passingPercentage;
};

// Method to get performance category
ExamResultSchema.methods.getPerformanceCategory = function() {
  const percentage = parseFloat(this.percentage);
  if (percentage >= 90) return "Excellent";
  if (percentage >= 80) return "Very Good";
  if (percentage >= 70) return "Good";
  if (percentage >= 60) return "Average";
  if (percentage >= 50) return "Below Average";
  return "Poor";
};

// Static method to get exam statistics
ExamResultSchema.statics.getExamStatistics = async function(examId) {
  const results = await this.find({ exam: examId });
  
  if (results.length === 0) {
    return {
      totalStudents: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      passRate: 0,
      averageTime: 0,
    };
  }

  const scores = results.map(r => r.score);
  const passingResults = results.filter(r => r.isPassing());
  const times = results.map(r => r.timeTaken);

  return {
    totalStudents: results.length,
    averageScore: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2),
    highestScore: Math.max(...scores),
    lowestScore: Math.min(...scores),
    passRate: ((passingResults.length / results.length) * 100).toFixed(2),
    averageTime: (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2),
  };
};

// Static method to get student performance over time
ExamResultSchema.statics.getStudentPerformance = async function(studentId) {
  const results = await this.find({ student: studentId })
    .populate('exam', 'examName examSubject stream standard')
    .sort({ completedAt: 1 });

  return results.map(result => ({
    examName: result.exam.examName,
    examSubject: result.exam.examSubject,
    stream: result.exam.stream,
    standard: result.exam.standard,
    score: result.score,
    totalMarks: result.totalMarks,
    percentage: result.percentage,
    timeTaken: result.timeTaken,
    completedAt: result.completedAt,
    performanceCategory: result.getPerformanceCategory(),
  }));
};

const ExamResult = mongoose.models?.ExamResult || mongoose.model("ExamResult", ExamResultSchema);
export default ExamResult; 