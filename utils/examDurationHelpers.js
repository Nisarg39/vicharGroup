/**
 * Exam Duration Configuration Helper Functions
 * Handles different exam types with custom duration logic
 */

// Duration configurations for different exam types
export const EXAM_DURATION_CONFIGS = {
  NEET: {
    totalDuration: 180, // 3 hours in minutes
    subjectTimings: {
      Physics: { duration: 60, unlockDelay: 0 },
      Chemistry: { duration: 60, unlockDelay: 0 },
      Biology: { duration: 60, unlockDelay: 0 } // No locking - all subjects available immediately
    }
  },
  JEE: {
    totalDuration: 180, // 3 hours
    subjectTimings: {
      Physics: { duration: 60, unlockDelay: 0 },
      Chemistry: { duration: 60, unlockDelay: 0 },
      Mathematics: { duration: 60, unlockDelay: 0 } // Use consistent naming
    }
  },
  'MHT-CET': {
    totalDuration: 180, // 3 hours total
    subjectTimings: {
      Physics: { duration: 60, unlockDelay: 0 },
      Chemistry: { duration: 60, unlockDelay: 0 },
      Biology: { duration: 60, unlockDelay: 90 }, // Bio unlocks after 90 min
      Mathematics: { duration: 60, unlockDelay: 90 }, // Mathematics unlocks after 90 min
      // Handle common variations of Mathematics subject name
      Maths: { duration: 60, unlockDelay: 90 },
      Math: { duration: 60, unlockDelay: 90 }
    }
  }
};

/**
 * Get effective duration for an exam based on its stream
 * @param {Object} exam - Exam object with examDurationMinutes and stream
 * @returns {number} - Duration in minutes
 */
export const getEffectiveExamDuration = (exam) => {
  if (!exam) return 180; // Default 3 hours
  
  // Use explicit duration if set
  if (exam.examDurationMinutes && exam.examDurationMinutes > 0) {
    return exam.examDurationMinutes;
  }
  
  // Use stream-based configuration with case-insensitive lookup
  const streamConfig = EXAM_DURATION_CONFIGS[exam.stream] || 
                      EXAM_DURATION_CONFIGS[exam.stream?.toUpperCase()];
  if (streamConfig) {
    return streamConfig.totalDuration;
  }
  
  // Fallback to 3 hours
  return 180;
};

// STABLE CACHE: Prevent object recreation on every call
const _scheduleCache = new Map();
const _cacheTTL = 30000; // 30 second cache TTL

/**
 * FIXED: Get subject unlock schedule for competitive exams with stable object references
 * @param {Object} exam - Exam object  
 * @param {Date} startTime - When the exam started (for practice exams) or student start time (for scheduled exams)
 * @returns {Object} - Subject access configuration (STABLE REFERENCES)
 */
export const getSubjectUnlockSchedule = (exam, startTime) => {
  if (!exam || !startTime) return { allUnlocked: true, subjectAccess: {}, streamConfig: null };
  
  // STABLE CACHING: Generate cache key based on essential properties
  const now = Date.now();
  const timeMinute = Math.floor(now / 60000); // Cache per minute for stability
  const cacheKey = `${exam._id || exam.stream}_${exam.examAvailability}_${Math.floor(startTime.getTime() / 60000)}_${timeMinute}`;
  
  // Check cache first - prevents object recreation
  const cached = _scheduleCache.get(cacheKey);
  if (cached && (now - cached.timestamp) < _cacheTTL) {
    return cached.result;
  }
  
  // Clean old cache entries periodically
  if (_scheduleCache.size > 100) {
    for (const [key, value] of _scheduleCache.entries()) {
      if ((now - value.timestamp) > _cacheTTL * 2) {
        _scheduleCache.delete(key);
      }
    }
  }
  
  // Check for exact stream match first, then fallback to intelligent matching
  let streamConfig = EXAM_DURATION_CONFIGS[exam.stream];
  
  // If no exact match, use intelligent stream detection
  if (!streamConfig) {
    const stream = exam.stream?.toLowerCase() || '';
    if (stream.includes('neet')) {
      streamConfig = EXAM_DURATION_CONFIGS['NEET'];
    } else if ((stream.includes('mht') && stream.includes('cet')) || 
               (stream.includes('cet') && !stream.includes('jee'))) {
      streamConfig = EXAM_DURATION_CONFIGS['MHT-CET'];
    } else if (stream.includes('jee')) {
      streamConfig = EXAM_DURATION_CONFIGS['JEE'];
    }
  }
  
  if (!streamConfig || !streamConfig.subjectTimings) {
    return { allUnlocked: true };
  }
  
  const currentTime = Date.now();
  const ninetyMinutesMs = 90 * 60 * 1000; // 90 minutes in milliseconds
  
  // FIXED: Handle scheduled vs practice exams differently with comprehensive edge case handling
  let shouldUnlockRestricted = false;
  
  if (exam.examAvailability === 'scheduled' && exam.endTime) {
    // For scheduled exams: unlock when 90 minutes remain until exam.endTime
    const examEndTime = new Date(exam.endTime).getTime();
    const timeRemainingUntilEnd = examEndTime - currentTime;
    
    // EDGE CASE 1: Late start - if student starts with <90min remaining, unlock immediately
    // EDGE CASE 2: Interrupted exams - base on end time, not elapsed time
    // EDGE CASE 3: Cross-midnight exams - handled by Date.getTime() which uses milliseconds since epoch
    shouldUnlockRestricted = timeRemainingUntilEnd <= ninetyMinutesMs;
    
    // EDGE CASE 4: Negative time remaining (exam already ended) - unlock everything
    if (timeRemainingUntilEnd < 0) {
      shouldUnlockRestricted = true;
    }
  } else {
    // For practice exams: unlock after 90 minutes from student start time
    const timeElapsed = currentTime - startTime.getTime();
    shouldUnlockRestricted = timeElapsed >= ninetyMinutesMs;
    
    // EDGE CASE 5: Negative elapsed time (clock issues) - keep locked
    if (timeElapsed < 0) {
      shouldUnlockRestricted = false;
    }
  }
  
  const subjectAccess = {};
  let hasLockedSubjects = false;
  
  Object.entries(streamConfig.subjectTimings).forEach(([subject, config]) => {
    // Check if this subject has unlock restrictions (unlockDelay > 0)
    const hasUnlockDelay = config.unlockDelay > 0;
    
    if (!hasUnlockDelay) {
      // Subject is always unlocked (Physics, Chemistry for MHT-CET)
      subjectAccess[subject] = {
        isLocked: false,
        remainingTime: 0,
        unlockDelay: config.unlockDelay,
        duration: config.duration
      };
    } else {
      // Subject has unlock restrictions (Biology, Maths for MHT-CET)
      const isLocked = !shouldUnlockRestricted;
      
      let remainingTime = 0;
      if (isLocked) {
        if (exam.examAvailability === 'scheduled' && exam.endTime) {
          // For scheduled exams: time until unlock = current time until (endTime - 90min)
          const examEndTime = new Date(exam.endTime).getTime();
          const unlockTime = examEndTime - ninetyMinutesMs;
          remainingTime = Math.max(0, unlockTime - currentTime);
          
          // EDGE CASE: If unlock time is in the past, remaining time should be 0
          if (unlockTime <= currentTime) {
            remainingTime = 0;
          }
        } else {
          // For practice exams: time until unlock = 90min - elapsed time
          const timeElapsed = currentTime - startTime.getTime();
          remainingTime = Math.max(0, ninetyMinutesMs - timeElapsed);
          
          // EDGE CASE: Handle negative elapsed time (clock issues)
          if (timeElapsed < 0) {
            remainingTime = ninetyMinutesMs; // Full 90 minutes remaining
          }
        }
      }
      
      // Create access entry for the configured subject name
      const accessEntry = {
        isLocked,
        remainingTime,
        unlockDelay: config.unlockDelay,
        duration: config.duration
      };
      
      subjectAccess[subject] = accessEntry;
      
      // CRITICAL FIX: For CET exams, create aliases for common subject name variations
      if (streamConfig === EXAM_DURATION_CONFIGS['MHT-CET']) {
        if (subject === 'Mathematics') {
          subjectAccess['Maths'] = { ...accessEntry };
          subjectAccess['Math'] = { ...accessEntry };
        } else if (subject === 'Maths') {
          subjectAccess['Mathematics'] = { ...accessEntry };
          subjectAccess['Math'] = { ...accessEntry };
        } else if (subject === 'Biology') {
          subjectAccess['Bio'] = { ...accessEntry };
          subjectAccess['Botany'] = { ...accessEntry };
          subjectAccess['Zoology'] = { ...accessEntry };
        }
      }
      
      if (isLocked) hasLockedSubjects = true;
    }
  });
  
  // STABLE RESULT: Create consistent object structure and cache it
  const result = {
    allUnlocked: !hasLockedSubjects,
    subjectAccess: subjectAccess,
    streamConfig: streamConfig,
    examType: exam.examAvailability || 'practice'
  };
  
  // Cache the result to prevent recreating objects
  _scheduleCache.set(cacheKey, {
    result: result,
    timestamp: now
  });
  
  return result;
};

/**
 * Validate if exam duration is appropriate for the stream
 * @param {string} stream - Exam stream (NEET, JEE, etc.)
 * @param {number} duration - Duration in minutes
 * @returns {Object} - Validation result
 */
export const validateExamDuration = (stream, duration) => {
  const streamConfig = EXAM_DURATION_CONFIGS[stream];
  
  if (!streamConfig) {
    return {
      isValid: true,
      message: "Custom duration allowed for this stream"
    };
  }
  
  const recommendedDuration = streamConfig.totalDuration;
  
  if (duration < 60) {
    return {
      isValid: false,
      message: "Exam duration should be at least 60 minutes"
    };
  }
  
  if (duration !== recommendedDuration) {
    return {
      isValid: true,
      warning: `Recommended duration for ${stream} is ${recommendedDuration} minutes`
    };
  }
  
  return {
    isValid: true,
    message: "Duration matches stream recommendation"
  };
};

/**
 * Calculate time remaining for subject unlock
 * @param {Object} subjectAccess - Subject access object
 * @param {string} subject - Subject name
 * @returns {number} - Minutes until unlock
 */
export const getSubjectUnlockTime = (subjectAccess, subject) => {
  if (!subjectAccess || !subjectAccess[subject]) return 0;
  
  const access = subjectAccess[subject];
  if (!access.isLocked) return 0;
  
  return Math.ceil(access.remainingTime / 1000 / 60);
};

/**
 * Calculate end time based on start time and exam duration
 * @param {string} startTime - Start time in datetime-local format
 * @param {string} stream - Exam stream (NEET, JEE, MHT-CET, etc.)
 * @param {number} customDuration - Custom duration in minutes (optional)
 * @returns {string} - End time in datetime-local format
 */
export const calculateEndTime = (startTime, stream, customDuration = null) => {
  if (!startTime) return '';
  
  // Use custom duration if provided, otherwise get from stream config with case-insensitive lookup
  const duration = customDuration || (EXAM_DURATION_CONFIGS[stream] || EXAM_DURATION_CONFIGS[stream?.toUpperCase()])?.totalDuration || 180;
  
  const startDate = new Date(startTime);
  const endDate = new Date(startDate.getTime() + (duration * 60 * 1000));
  
  // Format to datetime-local format
  const year = endDate.getFullYear();
  const month = String(endDate.getMonth() + 1).padStart(2, '0');
  const day = String(endDate.getDate()).padStart(2, '0');
  const hours = String(endDate.getHours()).padStart(2, '0');
  const minutes = String(endDate.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Calculate duration in minutes based on start and end times
 * @param {string} startTime - Start time in datetime-local format
 * @param {string} endTime - End time in datetime-local format
 * @returns {number} - Duration in minutes
 */
export const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  
  // Check if dates are valid
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;
  
  // Calculate difference in milliseconds and convert to minutes
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  // Return 0 if end time is before start time
  return Math.max(0, diffMinutes);
};

/**
 * Format duration for display
 * @param {number} minutes - Duration in minutes
 * @returns {string} - Formatted duration string
 */
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${mins}m`;
};

/**
 * Get time-based exam access rules
 * @param {Object} exam - Exam object
 * @returns {Object} - Access rules
 */
export const getExamAccessRules = (exam) => {
  if (!exam) return {};
  
  const streamConfig = EXAM_DURATION_CONFIGS[exam.stream] || 
                      EXAM_DURATION_CONFIGS[exam.stream?.toUpperCase()];
  if (!streamConfig) return {};
  
  return {
    hasSubjectTimings: !!streamConfig.subjectTimings,
    restrictedSubjects: Object.keys(streamConfig.subjectTimings).filter(
      subject => streamConfig.subjectTimings[subject].unlockDelay > 0
    ),
    totalDuration: streamConfig.totalDuration
  };
};