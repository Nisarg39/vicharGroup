import mongoose from "mongoose";

const ExamSubmissionQueueSchema = new mongoose.Schema({
  // Core submission identifiers
  submissionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: true,
    index: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student", 
    required: true,
    index: true
  },
  
  // Queue status and processing info
  status: {
    type: String,
    enum: ["queued", "processing", "completed", "failed", "retrying"],
    default: "queued",
    required: true,
    index: true
  },
  priority: {
    type: Number,
    default: 1,
    index: true // Higher numbers = higher priority
  },
  
  // Original submission data (preserved exactly as submitted)
  submissionData: {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    answers: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      required: true
    },
    totalMarks: {
      type: Number,
      required: true
    },
    timeTaken: {
      type: Number, // in seconds
      required: true
    },
    completedAt: {
      type: Date,
      required: true
    },
    isOfflineSubmission: {
      type: Boolean,
      default: false
    },
    visitedQuestions: [{
      type: Number
    }],
    markedQuestions: [{
      type: Number
    }],
    warnings: {
      type: Number,
      default: 0
    },
    deviceInfo: {
      userAgent: String,
      screenResolution: String,
      timezone: String
    }
  },

  // Processing metadata
  processing: {
    startedAt: Date,
    completedAt: Date,
    processingTimeMs: Number,
    workerId: String, // For identifying which worker processed this
    attempts: {
      type: Number,
      default: 0
    },
    maxAttempts: {
      type: Number,
      default: 3
    },
    lastAttemptAt: Date,
    nextRetryAt: Date
  },

  // Error tracking and debugging
  errors: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    attempt: Number,
    error: {
      message: String,
      stack: String,
      code: String
    },
    context: mongoose.Schema.Types.Mixed // Additional context for debugging
  }],

  // Final result reference (once processing is complete)
  examResult: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExamResult"
  },

  // Student notification tracking
  notification: {
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: Date,
    type: {
      type: String,
      enum: ["immediate_confirmation", "processing_complete", "processing_failed"],
      default: "immediate_confirmation"
    },
    message: String
  },

  // Performance and monitoring data
  metrics: {
    queueWaitTimeMs: Number, // Time spent in queue before processing
    totalProcessingTimeMs: Number, // Total time from queue to completion
    scoringTimeMs: Number, // Time spent on scoring computation
    databaseTimeMs: Number, // Time spent on database operations
    bulkRulesLoadTimeMs: Number, // Time to load marking rules
    questionProcessingTimeMs: Number // Time for question-by-question processing
  },

  // Audit trail
  audit: {
    queuedAt: {
      type: Date,
      default: Date.now
    },
    queuedBy: String, // IP address or system identifier
    sessionId: String, // For tracking user sessions
    submissionContext: {
      isAutoSubmit: Boolean,
      isManualSubmit: Boolean,
      timeRemainingWhenSubmitted: Number,
      examEndedDuringSubmission: Boolean
    }
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
ExamSubmissionQueueSchema.index({ status: 1, priority: -1, createdAt: 1 }); // Queue processing order
ExamSubmissionQueueSchema.index({ exam: 1, student: 1 }); // Find submissions by exam/student
ExamSubmissionQueueSchema.index({ status: 1, "processing.nextRetryAt": 1 }); // Retry processing
ExamSubmissionQueueSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 }); // Auto-delete after 7 days

// Virtual for total processing time
ExamSubmissionQueueSchema.virtual('totalProcessingTime').get(function() {
  if (this.processing.startedAt && this.processing.completedAt) {
    return this.processing.completedAt - this.processing.startedAt;
  }
  return 0;
});

// Methods for queue management
ExamSubmissionQueueSchema.methods.markAsProcessing = function(workerId) {
  this.status = "processing";
  this.processing.startedAt = new Date();
  this.processing.workerId = workerId;
  this.processing.attempts += 1;
  this.processing.lastAttemptAt = new Date();
  return this.save();
};

ExamSubmissionQueueSchema.methods.markAsCompleted = function(examResultId, metrics = {}) {
  this.status = "completed";
  this.processing.completedAt = new Date();
  this.examResult = examResultId;
  this.metrics = { ...this.metrics, ...metrics };
  
  // Calculate processing time
  if (this.processing.startedAt) {
    this.processing.processingTimeMs = new Date() - this.processing.startedAt;
  }
  
  return this.save();
};

ExamSubmissionQueueSchema.methods.markAsFailed = function(error, shouldRetry = true) {
  const now = new Date();
  
  // Add error to errors array
  this.errors.push({
    timestamp: now,
    attempt: this.processing.attempts,
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code
    }
  });

  if (shouldRetry && this.processing.attempts < this.processing.maxAttempts) {
    // Schedule retry with exponential backoff
    const backoffMs = Math.min(1000 * Math.pow(2, this.processing.attempts), 300000); // Max 5 minutes
    this.processing.nextRetryAt = new Date(now.getTime() + backoffMs);
    this.status = "retrying";
  } else {
    // Max attempts reached or retry not requested
    this.status = "failed";
  }

  return this.save();
};

// Static methods for queue operations
ExamSubmissionQueueSchema.statics.getNextQueuedSubmission = function(workerId) {
  const now = new Date();
  
  return this.findOneAndUpdate(
    {
      $or: [
        { status: "queued" },
        { 
          status: "retrying", 
          "processing.nextRetryAt": { $lte: now }
        }
      ]
    },
    {
      status: "processing",
      "processing.startedAt": now,
      "processing.workerId": workerId,
      $inc: { "processing.attempts": 1 },
      "processing.lastAttemptAt": now
    },
    {
      sort: { priority: -1, createdAt: 1 }, // High priority first, then FIFO
      new: true
    }
  );
};

// CRITICAL: Batch processing method for Vercel cron-based processing
ExamSubmissionQueueSchema.statics.getBatchQueuedSubmissions = function(batchSize = 20, cronJobId = null) {
  const now = new Date();
  
  return this.updateMany(
    {
      $or: [
        { status: "queued" },
        { 
          status: "retrying", 
          "processing.nextRetryAt": { $lte: now }
        }
      ]
    },
    {
      status: "processing",
      "processing.startedAt": now,
      "processing.workerId": cronJobId || `cron-${Date.now()}`,
      $inc: { "processing.attempts": 1 },
      "processing.lastAttemptAt": now
    },
    {
      sort: { priority: -1, createdAt: 1 }, // High priority first, then FIFO
      limit: batchSize
    }
  ).then(() => {
    // Return the updated documents
    return this.find({
      status: "processing",
      "processing.workerId": cronJobId || `cron-${Date.now()}`,
      "processing.lastAttemptAt": { $gte: new Date(now.getTime() - 5000) } // Within last 5 seconds
    }).limit(batchSize).sort({ priority: -1, createdAt: 1 });
  });
};

ExamSubmissionQueueSchema.statics.getQueueStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        avgWaitTime: { $avg: "$metrics.queueWaitTimeMs" }
      }
    }
  ]);
};

ExamSubmissionQueueSchema.statics.getFailedSubmissions = function(limit = 10) {
  return this.find({ 
    status: { $in: ["failed", "retrying"] }
  })
  .sort({ "processing.lastAttemptAt": -1 })
  .limit(limit)
  .populate("exam", "examName")
  .populate("student", "name email");
};

// Static method to clean up old completed submissions
ExamSubmissionQueueSchema.statics.cleanupOldSubmissions = function(daysOld = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.deleteMany({
    status: "completed",
    "processing.completedAt": { $lt: cutoffDate }
  });
};

// Pre-save middleware to set queue wait time when processing starts
ExamSubmissionQueueSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'processing' && !this.metrics.queueWaitTimeMs) {
    this.metrics.queueWaitTimeMs = new Date() - this.createdAt;
  }
  next();
});

const ExamSubmissionQueue = mongoose.models?.ExamSubmissionQueue || 
  mongoose.model("ExamSubmissionQueue", ExamSubmissionQueueSchema);

export default ExamSubmissionQueue;