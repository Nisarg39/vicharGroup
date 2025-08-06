// Simple In-Memory Cache for Exam Portal
// Reduces database load for frequently accessed data

class ExamPortalCache {
  constructor() {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
    
    // Start cleanup interval (every 5 minutes)
    this.startCleanup();
  }

  // Generate cache key
  generateKey(prefix, ...args) {
    return `${prefix}:${args.join(':')}`;
  }

  // Set cache with TTL (time to live in seconds)
  set(key, value, ttlSeconds = 300) {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, {
      value,
      expiresAt,
      createdAt: Date.now()
    });
    this.stats.sets++;
    return value;
  }

  // Get from cache
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return null;
    }
    
    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    this.stats.hits++;
    return item.value;
  }

  // Delete from cache
  delete(key) {
    const deleted = this.cache.delete(key);
    if (deleted) this.stats.deletes++;
    return deleted;
  }

  // Clear all cache
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.deletes += size;
  }

  // Clear cache by prefix
  clearByPrefix(prefix) {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        count++;
      }
    }
    this.stats.deletes += count;
    return count;
  }

  // Get cache stats
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;
    
    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      size: this.cache.size
    };
  }

  // Cleanup expired entries
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`Cache cleanup: removed ${cleaned} expired entries`);
    }
  }

  // Start automatic cleanup
  startCleanup() {
    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  // Stop cleanup (for testing)
  stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Create singleton instance
const examCache = new ExamPortalCache();

// Cache wrapper functions for common operations

// Cache exam details (5 minutes)
export async function getCachedExam(examId, fetchFunction) {
  const cacheKey = examCache.generateKey('exam', examId);
  
  // Try to get from cache
  let exam = examCache.get(cacheKey);
  
  if (exam) {
    return exam;
  }
  
  // Not in cache, fetch from database
  exam = await fetchFunction();
  
  if (exam) {
    // Cache for 5 minutes
    examCache.set(cacheKey, exam, 300);
  }
  
  return exam;
}

// Cache student eligibility (10 minutes)
export async function getCachedEligibility(examId, studentId, checkFunction) {
  const cacheKey = examCache.generateKey('eligibility', examId, studentId);
  
  // Try to get from cache
  let eligibility = examCache.get(cacheKey);
  
  if (eligibility) {
    return eligibility;
  }
  
  // Not in cache, check eligibility
  eligibility = await checkFunction();
  
  if (eligibility && eligibility.success) {
    // Cache for 10 minutes if eligible
    examCache.set(cacheKey, eligibility, 600);
  }
  
  return eligibility;
}

// Cache question set (30 minutes)
export async function getCachedQuestions(examId, fetchFunction) {
  const cacheKey = examCache.generateKey('questions', examId);
  
  // Try to get from cache
  let questions = examCache.get(cacheKey);
  
  if (questions) {
    return questions;
  }
  
  // Not in cache, fetch from database
  questions = await fetchFunction();
  
  if (questions && questions.length > 0) {
    // Cache for 30 minutes
    examCache.set(cacheKey, questions, 1800);
  }
  
  return questions;
}

// Cache college details (15 minutes)
export async function getCachedCollege(collegeId, fetchFunction) {
  const cacheKey = examCache.generateKey('college', collegeId);
  
  // Try to get from cache
  let college = examCache.get(cacheKey);
  
  if (college) {
    return college;
  }
  
  // Not in cache, fetch from database
  college = await fetchFunction();
  
  if (college) {
    // Cache for 15 minutes
    examCache.set(cacheKey, college, 900);
  }
  
  return college;
}

// Clear exam-related cache when exam is updated
export function clearExamCache(examId) {
  examCache.clearByPrefix(`exam:${examId}`);
  examCache.clearByPrefix(`questions:${examId}`);
  examCache.clearByPrefix(`eligibility:${examId}`);
}

// Clear student-related cache
export function clearStudentCache(studentId) {
  examCache.clearByPrefix(`eligibility:*:${studentId}`);
}

// Export cache instance for direct access if needed
export { examCache };

// Export default cache operations
export default {
  getCachedExam,
  getCachedEligibility,
  getCachedQuestions,
  getCachedCollege,
  clearExamCache,
  clearStudentCache,
  getStats: () => examCache.getStats(),
  clear: () => examCache.clear()
};