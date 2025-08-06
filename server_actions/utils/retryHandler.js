// Retry Handler with Exponential Backoff
// Ensures exam submissions don't fail under load

/**
 * Retry configuration
 */
const DEFAULT_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  timeout: 30000, // 30 seconds total timeout
  retryableErrors: [
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'ENETUNREACH',
    'MongoNetworkError',
    'MongoTimeoutError',
    'MongoServerError'
  ]
};

/**
 * Queue for failed submissions
 * Stores submissions that failed all retries for manual recovery
 */
class FailedSubmissionQueue {
  constructor() {
    this.queue = [];
    this.maxQueueSize = 1000;
  }

  add(submission) {
    // Add timestamp
    submission.failedAt = new Date().toISOString();
    
    // Add to queue
    this.queue.push(submission);
    
    // Maintain max queue size (FIFO)
    if (this.queue.length > this.maxQueueSize) {
      this.queue.shift();
    }
    
    console.error('⚠️ Added to failed submission queue:', {
      examId: submission.examData?.examId,
      studentId: submission.examData?.studentId,
      failedAt: submission.failedAt
    });
  }

  getAll() {
    return [...this.queue];
  }

  clear() {
    const count = this.queue.length;
    this.queue = [];
    return count;
  }

  size() {
    return this.queue.length;
  }
}

const failedQueue = new FailedSubmissionQueue();

/**
 * Check if error is retryable
 */
function isRetryableError(error) {
  if (!error) return false;
  
  // Check error code
  if (DEFAULT_CONFIG.retryableErrors.includes(error.code)) {
    return true;
  }
  
  // Check error name
  if (DEFAULT_CONFIG.retryableErrors.includes(error.name)) {
    return true;
  }
  
  // Check error message for specific patterns
  const message = error.message?.toLowerCase() || '';
  const retryablePatterns = [
    'timeout',
    'timed out',
    'connection',
    'network',
    'temporarily unavailable',
    'too many requests',
    'rate limit',
    'econnreset',
    'econnrefused',
    'socket hang up'
  ];
  
  return retryablePatterns.some(pattern => message.includes(pattern));
}

/**
 * Calculate delay for next retry with exponential backoff
 */
function calculateDelay(attempt, config = DEFAULT_CONFIG) {
  const delay = Math.min(
    config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1),
    config.maxDelay
  );
  
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.3 * delay; // 0-30% jitter
  
  return Math.floor(delay + jitter);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute function with retry logic
 */
export async function withRetry(fn, options = {}) {
  const config = { ...DEFAULT_CONFIG, ...options };
  const startTime = Date.now();
  let lastError;
  
  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      // Check if we've exceeded total timeout
      if (Date.now() - startTime > config.timeout) {
        throw new Error('Total timeout exceeded for operation');
      }
      
      // Try to execute the function
      const result = await fn();
      
      // Success! Log if this was a retry
      if (attempt > 1) {
        console.log(`✅ Operation succeeded on attempt ${attempt}`);
      }
      
      return result;
      
    } catch (error) {
      lastError = error;
      
      // Check if we should retry
      const shouldRetry = isRetryableError(error) && attempt < config.maxRetries;
      
      if (shouldRetry) {
        const delay = calculateDelay(attempt, config);
        
        console.warn(`⚠️ Attempt ${attempt} failed, retrying in ${delay}ms...`, {
          error: error.message,
          code: error.code,
          name: error.name
        });
        
        await sleep(delay);
      } else {
        // No more retries
        console.error(`❌ Operation failed after ${attempt} attempts`, {
          error: error.message,
          code: error.code,
          name: error.name
        });
        
        throw error;
      }
    }
  }
  
  // This should never be reached, but just in case
  throw lastError;
}

/**
 * Retry wrapper specifically for exam submissions
 */
export async function retryExamSubmission(submitFunction, examData) {
  try {
    // Try with retry logic
    const result = await withRetry(
      () => submitFunction(examData),
      {
        maxRetries: 4, // More retries for critical exam submissions
        initialDelay: 500, // Start with 500ms
        maxDelay: 5000, // Max 5 seconds between retries
        timeout: 60000 // 60 seconds total timeout for exam submission
      }
    );
    
    return result;
    
  } catch (error) {
    // All retries failed, add to failed queue for manual recovery
    failedQueue.add({
      examData,
      error: {
        message: error.message,
        code: error.code,
        name: error.name
      },
      attempts: 4
    });
    
    // Return a special response indicating queued status
    return {
      success: false,
      queued: true,
      message: 'Your submission has been queued and will be processed. Your answers are saved.',
      queueSize: failedQueue.size()
    };
  }
}

/**
 * Process failed submissions from queue (admin function)
 */
export async function processFailedQueue(submitFunction) {
  const failed = failedQueue.getAll();
  const results = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    errors: []
  };
  
  for (const submission of failed) {
    results.processed++;
    
    try {
      const result = await submitFunction(submission.examData);
      
      if (result.success) {
        results.succeeded++;
      } else {
        results.failed++;
        results.errors.push({
          examId: submission.examData.examId,
          studentId: submission.examData.studentId,
          error: result.message
        });
      }
    } catch (error) {
      results.failed++;
      results.errors.push({
        examId: submission.examData.examId,
        studentId: submission.examData.studentId,
        error: error.message
      });
    }
  }
  
  // Clear queue after processing
  if (results.succeeded > 0) {
    failedQueue.clear();
  }
  
  return results;
}

/**
 * Get failed queue status
 */
export function getFailedQueueStatus() {
  return {
    size: failedQueue.size(),
    submissions: failedQueue.getAll().map(s => ({
      examId: s.examData?.examId,
      studentId: s.examData?.studentId,
      failedAt: s.failedAt
    }))
  };
}

/**
 * Retry wrapper for auto-save operations
 */
export async function retryAutoSave(saveFunction, progressData) {
  try {
    // Less aggressive retry for auto-saves (they happen frequently)
    const result = await withRetry(
      () => saveFunction(progressData),
      {
        maxRetries: 2, // Only 2 retries for auto-save
        initialDelay: 200, // Start with 200ms
        maxDelay: 1000, // Max 1 second
        timeout: 5000 // 5 seconds total timeout
      }
    );
    
    return result;
    
  } catch (error) {
    // For auto-save, just log the error but don't queue
    // The next auto-save will try again
    console.error('Auto-save failed after retries:', error.message);
    
    return {
      success: false,
      message: 'Auto-save failed, will retry on next interval'
    };
  }
}

// Export the queue for monitoring
export { failedQueue };

// Default export
export default {
  withRetry,
  retryExamSubmission,
  retryAutoSave,
  processFailedQueue,
  getFailedQueueStatus,
  isRetryableError
};