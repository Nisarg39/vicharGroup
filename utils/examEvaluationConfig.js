/**
 * Exam Evaluation Configuration System
 * 
 * Provides hierarchical configuration for decimal answer evaluation
 * with stream-specific defaults and subject-specific overrides.
 */

/**
 * Default stream-specific evaluation configurations
 */
const STREAM_DEFAULTS = {
  // Joint Entrance Examination - High precision required
  'JEE': {
    tolerance: 0.01,
    toleranceType: 'absolute',
    description: 'JEE Main/Advanced - High precision numerical evaluation'
  },
  
  // National Eligibility cum Entrance Test - Moderate precision
  'NEET': {
    tolerance: 0.05,
    toleranceType: 'absolute',
    description: 'NEET - Moderate precision for medical entrance'
  },
  
  // Maharashtra Common Entrance Test
  'MHT-CET': {
    tolerance: 0.02,
    toleranceType: 'absolute',
    description: 'MHT-CET - Moderate precision for state entrance'
  },
  
  // Central Board of Secondary Education
  'CBSE': {
    tolerance: 0.1,
    toleranceType: 'absolute',
    description: 'CBSE - Standard board exam precision'
  },
  
  // Practice and mock tests - More lenient
  'Practice': {
    tolerance: 0.2,
    toleranceType: 'absolute',
    description: 'Practice tests - Lenient evaluation for learning'
  },
  
  // State Board exams - Moderate precision
  'State Board': {
    tolerance: 0.1,
    toleranceType: 'absolute',
    description: 'State Board - Standard precision'
  },
  
  // Default fallback configuration
  'default': {
    tolerance: 0.1,
    toleranceType: 'absolute',
    description: 'Default configuration - Standard precision'
  }
};

/**
 * Subject-specific evaluation overrides
 * These override stream defaults when specified
 */
const SUBJECT_OVERRIDES = {
  'Physics': {
    'JEE': {
      tolerance: 2, // 2% tolerance for physics calculations
      toleranceType: 'percentage',
      description: 'JEE Physics - Percentage-based tolerance for complex calculations'
    },
    'NEET': {
      tolerance: 0.05,
      toleranceType: 'absolute',
      description: 'NEET Physics - Absolute tolerance'
    },
    'default': {
      tolerance: 0.1,
      toleranceType: 'absolute',
      description: 'Physics default - Standard absolute tolerance'
    }
  },
  
  'Chemistry': {
    'JEE': {
      tolerance: 0.01,
      toleranceType: 'absolute',
      description: 'JEE Chemistry - High precision for stoichiometry'
    },
    'NEET': {
      tolerance: 0.02,
      toleranceType: 'absolute',
      description: 'NEET Chemistry - Moderate precision'
    },
    'default': {
      tolerance: 0.05,
      toleranceType: 'absolute',
      description: 'Chemistry default - Moderate precision'
    }
  },
  
  'Mathematics': {
    'JEE': {
      tolerance: 0.001,
      toleranceType: 'absolute',
      description: 'JEE Mathematics - Very high precision'
    },
    'CBSE': {
      tolerance: 0.01,
      toleranceType: 'absolute',
      description: 'CBSE Mathematics - High precision'
    },
    'default': {
      tolerance: 0.01,
      toleranceType: 'absolute',
      description: 'Mathematics default - High precision'
    }
  },
  
  'Biology': {
    'NEET': {
      tolerance: 0.1,
      toleranceType: 'absolute',
      description: 'NEET Biology - Standard tolerance for biological calculations'
    },
    'default': {
      tolerance: 0.1,
      toleranceType: 'absolute',
      description: 'Biology default - Standard tolerance'
    }
  }
};

/**
 * Question-type specific configurations
 */
const QUESTION_TYPE_CONFIGS = {
  'mcq': {
    useNumericalEvaluation: false,
    description: 'MCQ questions use exact string matching'
  },
  
  'numerical': {
    useNumericalEvaluation: true,
    description: 'Numerical questions use tolerance-based evaluation'
  },
  
  'fill-in-blank': {
    useNumericalEvaluation: true, // Will fallback to string if not numerical
    description: 'Fill-in-blank questions use intelligent evaluation'
  },
  
  'short-answer': {
    useNumericalEvaluation: true, // Will fallback to string if not numerical
    description: 'Short answer questions use intelligent evaluation'
  }
};

/**
 * Gets the evaluation configuration for a specific exam and question
 * @param {Object} exam - Exam object containing stream and other metadata
 * @param {Object} question - Question object containing subject and type
 * @returns {Object} - Complete evaluation configuration
 */
function getEvaluationConfig(exam, question) {
  try {
    // Initialize with default configuration
    let config = { ...STREAM_DEFAULTS.default };
    
    // Extract relevant properties with fallbacks
    const stream = exam?.stream || exam?.category || 'default';
    const subject = question?.subject || '';
    const questionType = question?.type || question?.questionType || 'numerical';
    
    // Step 1: Apply stream-specific defaults with enhanced case-insensitive matching
    let streamKey = Object.keys(STREAM_DEFAULTS).find(key => 
      key.toLowerCase() === stream.toLowerCase()
    );
    
    // Fallback to exact match if case-insensitive didn't work
    if (!streamKey) {
      streamKey = STREAM_DEFAULTS[stream] ? stream : null;
    }
    
    if (streamKey && STREAM_DEFAULTS[streamKey]) {
      config = { ...config, ...STREAM_DEFAULTS[streamKey] };
    }
    
    // Step 2: Apply subject-specific overrides if available
    if (subject && SUBJECT_OVERRIDES[subject]) {
      const subjectConfig = SUBJECT_OVERRIDES[subject];
      
      // Check for stream-specific subject override with enhanced case-insensitive matching
      let subjectStreamKey = Object.keys(subjectConfig).find(key =>
        key.toLowerCase() === stream.toLowerCase()
      );
      
      // Fallback to exact match if case-insensitive didn't work
      if (!subjectStreamKey) {
        subjectStreamKey = subjectConfig[stream] ? stream : null;
      }
      
      if (subjectStreamKey && subjectConfig[subjectStreamKey]) {
        config = { ...config, ...subjectConfig[subjectStreamKey] };
      } else if (subjectConfig.default) {
        config = { ...config, ...subjectConfig.default };
      }
    }
    
    // Step 3: Apply question-type specific settings
    const questionTypeConfig = QUESTION_TYPE_CONFIGS[questionType] || 
                               QUESTION_TYPE_CONFIGS['numerical'];
    
    config = { ...config, ...questionTypeConfig };
    
    // Step 4: Add metadata for debugging and logging
    config.resolvedFor = {
      stream: streamKey || 'default',
      subject: subject || 'unspecified',
      questionType: questionType,
      examId: exam?._id || exam?.id || 'unknown'
    };
    
    // Step 5: Validate configuration
    if (!validateConfig(config)) {
      console.warn('Invalid configuration resolved, using safe defaults:', config);
      config = getSafeDefaultConfig();
    }
    
    return config;
    
  } catch (error) {
    console.error('Error resolving evaluation configuration:', error);
    return getSafeDefaultConfig();
  }
}

/**
 * Gets a safe default configuration for error cases
 * @returns {Object} - Safe default configuration
 */
function getSafeDefaultConfig() {
  return {
    tolerance: 0.1,
    toleranceType: 'absolute',
    useNumericalEvaluation: true,
    description: 'Safe default configuration',
    resolvedFor: {
      stream: 'default',
      subject: 'unspecified',
      questionType: 'numerical',
      examId: 'unknown'
    }
  };
}

/**
 * Validates a configuration object
 * @param {Object} config - Configuration to validate
 * @returns {boolean} - True if configuration is valid
 */
function validateConfig(config) {
  if (!config || typeof config !== 'object') {
    return false;
  }
  
  // Check tolerance
  if (typeof config.tolerance !== 'number' || 
      config.tolerance < 0 || 
      !isFinite(config.tolerance)) {
    return false;
  }
  
  // Check tolerance type
  const validToleranceTypes = ['absolute', 'percentage'];
  if (config.toleranceType && !validToleranceTypes.includes(config.toleranceType)) {
    return false;
  }
  
  // Check useNumericalEvaluation
  if (config.useNumericalEvaluation !== undefined && 
      typeof config.useNumericalEvaluation !== 'boolean') {
    return false;
  }
  
  return true;
}

/**
 * Gets all available stream configurations
 * @returns {Object} - All stream default configurations
 */
function getAvailableStreams() {
  return { ...STREAM_DEFAULTS };
}

/**
 * Gets all available subject overrides
 * @returns {Object} - All subject-specific overrides
 */
function getSubjectOverrides() {
  return { ...SUBJECT_OVERRIDES };
}

/**
 * Creates a custom configuration for specific requirements
 * @param {Object} options - Configuration options
 * @returns {Object} - Custom configuration
 */
function createCustomConfig(options) {
  const baseConfig = getSafeDefaultConfig();
  
  return {
    ...baseConfig,
    ...options,
    description: options.description || 'Custom configuration'
  };
}

/**
 * Logs configuration resolution details for debugging
 * @param {Object} config - Resolved configuration
 * @param {Object} exam - Exam object
 * @param {Object} question - Question object
 */
function logConfigResolution(config, exam, question) {
  console.log('Evaluation configuration resolved:', {
    config: {
      tolerance: config.tolerance,
      toleranceType: config.toleranceType,
      useNumericalEvaluation: config.useNumericalEvaluation,
      description: config.description
    },
    resolvedFor: config.resolvedFor,
    exam: {
      id: exam?._id || exam?.id,
      stream: exam?.stream || exam?.category,
      title: exam?.title
    },
    question: {
      id: question?._id || question?.id,
      subject: question?.subject,
      type: question?.type || question?.questionType
    }
  });
}

module.exports = {
  getEvaluationConfig,
  getSafeDefaultConfig,
  validateConfig,
  getAvailableStreams,
  getSubjectOverrides,
  createCustomConfig,
  logConfigResolution,
  STREAM_DEFAULTS,
  SUBJECT_OVERRIDES,
  QUESTION_TYPE_CONFIGS
};