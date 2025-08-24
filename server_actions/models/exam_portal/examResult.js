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
  warnings: {
    type: Number,
    default: 0,
  },
  // Navigation tracking for NSE-style question states
  visitedQuestions: [{
    type: Number, // question index
  }],
  markedQuestions: [{
    type: Number, // question index  
  }],
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
      enum: ["correct", "incorrect", "unattempted", "partially_correct"],
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
    negativeMarkingRule: {
      type: String, // Description of the negative marking rule applied
    },
    mcmaDetails: {
      totalCorrectOptions: { type: Number },
      correctSelected: { type: Number },
      wrongSelected: { type: Number },
      partialCredit: { type: Boolean }
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
    // Additional detailed stats for performance analysis
    totalQuestionsAttempted: {
      type: Number,
      default: 0,
    },
    markedForReview: {
      type: Number,
      default: 0,
    },
    changedAnswers: {
      type: Number,
      default: 0,
    },
    averageTimePerQuestion: {
      type: Number, // in seconds
      default: 0,
    },
  },
  // Negative marking rule information used for this exam
  negativeMarkingInfo: {
    // Note: ruleUsed removed - college-specific rules no longer exist
    defaultRuleUsed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DefaultNegativeMarkingRule",
    },
    positiveMarks: {
      type: Number,
      default: 4, // Default positive marks per question
    },
    negativeMarks: {
      type: Number,
      default: 0,
    },
    ruleDescription: String,
    ruleSource: {
      type: String,
      enum: ["super_admin_default", "exam_specific"],
      default: "exam_specific"
    }
  },
  // Subject-wise performance tracking
  subjectPerformance: [{
    subject: {
      type: String,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    attempted: {
      type: Number,
      default: 0,
    },
    correct: {
      type: Number,
      default: 0,
    },
    incorrect: {
      type: Number,
      default: 0,
    },
    unanswered: {
      type: Number,
      default: 0,
    },
    marks: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0,
    },
    accuracy: {
      type: Number, // percentage
      default: 0,
    },
    difficultyBreakdown: {
      easy: {
        attempted: { type: Number, default: 0 },
        correct: { type: Number, default: 0 },
      },
      medium: {
        attempted: { type: Number, default: 0 },
        correct: { type: Number, default: 0 },
      },
      hard: {
        attempted: { type: Number, default: 0 },
        correct: { type: Number, default: 0 },
      },
    },
  }],
  
  // Comparative performance data
  comparativeStats: {
    classAverage: {
      type: Number,
      default: 0,
    },
    streamAverage: {
      type: Number,
      default: 0,
    },
    collegeAverage: {
      type: Number,
      default: 0,
    },
    percentileRank: {
      type: Number,
      default: 0,
    },
    rank: {
      type: Number,
      default: 0,
    },
    totalStudentsAppeared: {
      type: Number,
      default: 0,
    },
    betterThanPercentage: {
      type: Number,
      default: 0,
    },
    topScore: {
      type: Number,
      default: 0,
    },
    bottomScore: {
      type: Number,
      default: 0,
    },
  },
  
  // Performance insights and recommendations
  performanceInsights: {
    strengths: [{
      type: String,
    }],
    improvements: [{
      type: String,
    }],
    recommendations: [{
      type: String,
    }],
    studyPattern: {
      type: String,
    },
    performanceCategory: {
      type: String,
      enum: ["Outstanding", "Excellent", "Good", "Average", "Below Average", "Needs Improvement"],
      default: "Average",
    },
  },
  
  // PDF report metadata
  pdfReport: {
    generated: {
      type: Boolean,
      default: false,
    },
    generatedAt: {
      type: Date,
    },
    filePath: {
      type: String,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    lastDownloaded: {
      type: Date,
    },
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
    // Progressive computation metadata
    computationSource: {
      type: String,
      enum: ["server_computation", "progressive_direct", "hybrid"],
      default: "server_computation",
    },
    processingTime: {
      type: Number, // in milliseconds
      default: null,
    },
    validationHash: {
      type: String, // SHA-256 hash for integrity verification
    },
    engineVersion: {
      type: String, // Version of progressive computation engine
    },
    directStorageUsed: {
      type: Boolean,
      default: false,
    },
    validationLayers: [{
      type: String,
      enum: ["hash", "statistical", "spot_check", "security", "temporal"]
    }],
    performanceMetrics: {
      validationTime: { type: Number }, // ms
      storageTime: { type: Number }, // ms
      totalProcessingTime: { type: Number }, // ms
      concurrentSubmissions: { type: Number },
      serverLoad: { type: Number }
    }
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

// Performance-optimized indexes for direct storage
ExamResultSchema.index({ "submissionMetadata.computationSource": 1, completedAt: -1 });
ExamResultSchema.index({ "submissionMetadata.directStorageUsed": 1, createdAt: -1 });
ExamResultSchema.index({ exam: 1, "submissionMetadata.processingTime": 1 }); // For performance monitoring
ExamResultSchema.index({ "submissionMetadata.validationHash": 1 }); // For hash verification queries

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

// Static method for optimized direct storage submission
ExamResultSchema.statics.createDirectSubmission = async function(progressiveData) {
  const examResult = new this({
    exam: progressiveData.examId,
    student: progressiveData.studentId,
    attemptNumber: progressiveData.attemptNumber || 1,
    answers: progressiveData.answers,
    score: progressiveData.finalScore,
    totalMarks: progressiveData.totalMarks,
    timeTaken: progressiveData.timeTaken,
    completedAt: progressiveData.completedAt,
    warnings: progressiveData.warnings || 0,
    
    // Pre-computed analysis
    questionAnalysis: progressiveData.questionAnalysis,
    statistics: {
      correctAnswers: progressiveData.correctAnswers,
      incorrectAnswers: progressiveData.incorrectAnswers,
      unattempted: progressiveData.unattempted,
      accuracy: progressiveData.accuracy || 0,
      totalQuestionsAttempted: progressiveData.correctAnswers + progressiveData.incorrectAnswers
    },
    
    // Subject performance
    subjectPerformance: progressiveData.subjectPerformance || [],
    
    // Navigation data
    visitedQuestions: progressiveData.visitedQuestions || [],
    markedQuestions: progressiveData.markedQuestions || [],
    
    // Progressive computation metadata
    submissionMetadata: {
      isOffline: false,
      syncStatus: 'synced',
      computationSource: 'progressive_direct',
      processingTime: progressiveData.processingTime,
      validationHash: progressiveData.computationHash,
      engineVersion: progressiveData.engineVersion,
      directStorageUsed: true,
      validationLayers: progressiveData.validationLayers || [],
      performanceMetrics: progressiveData.performanceMetrics || {}
    }
  });
  
  // Optimized save with write concern for performance
  await examResult.save({ 
    writeConcern: { w: 1, j: true },
    maxTimeMS: 5000 // 5 second timeout
  });
  
  return examResult;
};

// Static method to get performance analytics for direct storage
ExamResultSchema.statics.getDirectStorageAnalytics = async function(timeRange = 24) {
  const startTime = new Date(Date.now() - (timeRange * 60 * 60 * 1000));
  
  const analytics = await this.aggregate([
    {
      $match: {
        createdAt: { $gte: startTime },
        'submissionMetadata.directStorageUsed': true
      }
    },
    {
      $group: {
        _id: null,
        totalDirectSubmissions: { $sum: 1 },
        averageProcessingTime: { $avg: '$submissionMetadata.processingTime' },
        maxProcessingTime: { $max: '$submissionMetadata.processingTime' },
        minProcessingTime: { $min: '$submissionMetadata.processingTime' },
        sub15msSubmissions: {
          $sum: {
            $cond: [
              { $lte: ['$submissionMetadata.processingTime', 15] },
              1, 0
            ]
          }
        }
      }
    }
  ]);
  
  const result = analytics[0] || {
    totalDirectSubmissions: 0,
    averageProcessingTime: 0,
    maxProcessingTime: 0,
    minProcessingTime: 0,
    sub15msSubmissions: 0
  };
  
  result.performanceTargetAchieved = result.totalDirectSubmissions > 0 ? 
    (result.sub15msSubmissions / result.totalDirectSubmissions * 100).toFixed(2) + '%' : '0%';
    
  return result;
};

const ExamResult = mongoose.models?.ExamResult || mongoose.model("ExamResult", ExamResultSchema);
export default ExamResult; 