"use server";

/**
 * Exam Pattern Detection and Auto-Configuration Service
 * Automatically detects competitive exam patterns and applies standard marking rules
 */

import { connectDB } from "../config/mongoose";
import DefaultNegativeMarkingRule from "../models/exam_portal/defaultNegativeMarkingRule";

// Standard competitive exam patterns
const EXAM_PATTERNS = {
  JEE_MAIN: {
    patterns: [
      /jee\s*main/i,
      /joint\s*entrance\s*examination\s*main/i,
      /nta\s*jee/i
    ],
    stream: "JEE",
    examType: "JEE Main",
    conductedBy: "NTA",
    rules: [
      {
        questionType: "MCQ",
        negativeMarks: 1,
        positiveMarks: 4,
        section: "All",
        description: "JEE Main MCQ: +4 for correct, -1 for incorrect"
      },
      {
        questionType: "Numerical",
        negativeMarks: 0,
        positiveMarks: 4,
        section: "All",
        description: "JEE Main Numerical: +4 for correct, 0 for incorrect"
      }
    ]
  },
  
  JEE_ADVANCED: {
    patterns: [
      /jee\s*advanced/i,
      /joint\s*entrance\s*examination\s*advanced/i,
      /iit\s*jee/i
    ],
    stream: "JEE",
    examType: "JEE Advanced",
    conductedBy: "IIT",
    rules: [
      // Section A - MCQ Rules
      {
        questionType: "MCQ",
        negativeMarks: 1,
        positiveMarks: 3,
        section: "Section A",
        description: "JEE Advanced Section A MCQ: +3 for correct, -1 for incorrect"
      },
      // Section B - Numerical Rules
      {
        questionType: "Numerical",
        negativeMarks: 0,
        positiveMarks: 4,
        section: "Section B",
        description: "JEE Advanced Section B Numerical: +4 for correct, 0 for incorrect"
      },
      // Section C - MCMA Rules (if exists)
      {
        questionType: "MCMA",
        negativeMarks: 2,
        positiveMarks: 4,
        section: "Section C",
        partialMarkingEnabled: true,
        partialMarkingRules: {
          threeOutOfFour: 3,
          twoOutOfThree: 2,
          oneOutOfTwo: 1
        },
        description: "JEE Advanced Section C MCMA: +4 for all correct, partial marks available, -2 for wrong selection"
      }
    ]
  },
  
  NEET: {
    patterns: [
      /neet/i,
      /national\s*eligibility\s*cum\s*entrance\s*test/i,
      /medical\s*entrance/i
    ],
    stream: "Medical",
    examType: "NEET",
    conductedBy: "NTA",
    rules: [
      {
        questionType: "MCQ",
        negativeMarks: 1,
        positiveMarks: 4,
        section: "All",
        description: "NEET MCQ: +4 for correct, -1 for incorrect"
      }
    ]
  },
  
  MHT_CET: {
    patterns: [
      /mht[\s\-]*cet/i,
      /maharashtra\s*common\s*entrance\s*test/i,
      /state\s*cet/i
    ],
    stream: "MHT-CET",
    examType: "MHT-CET",
    conductedBy: "State CET Cell",
    rules: [
      {
        questionType: "MCQ",
        negativeMarks: 1,
        positiveMarks: 4,
        section: "All",
        description: "MHT-CET MCQ: +4 for correct, -1 for incorrect"
      }
    ]
  }
};

/**
 * Detects exam pattern based on exam name and attributes
 * @param {Object} examDetails - Exam details containing name, stream, type etc.
 * @returns {Object|null} - Detected pattern or null if no pattern matches
 */
export function detectExamPattern(examDetails) {
  const { examName, examType, stream, conductedBy } = examDetails;
  
  // Search text includes exam name, type, stream, and conductor
  const searchText = [examName, examType, stream, conductedBy]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  
  // Try to match against known patterns
  for (const [patternName, config] of Object.entries(EXAM_PATTERNS)) {
    const isMatch = config.patterns.some(pattern => pattern.test(searchText));
    
    if (isMatch) {
      return {
        detectedPattern: patternName,
        confidence: "high",
        config: config,
        autoApplyRules: true
      };
    }
  }
  
  // Fallback pattern detection based on stream
  if (stream) {
    const streamLower = stream.toLowerCase();
    if (streamLower.includes('jee')) {
      return {
        detectedPattern: "JEE_GENERIC",
        confidence: "medium",
        config: EXAM_PATTERNS.JEE_MAIN, // Default to JEE Main rules
        autoApplyRules: false // Don't auto-apply, let admin confirm
      };
    }
    
    if (streamLower.includes('medical') || streamLower.includes('neet')) {
      return {
        detectedPattern: "MEDICAL_GENERIC",
        confidence: "medium", 
        config: EXAM_PATTERNS.NEET,
        autoApplyRules: false
      };
    }
  }
  
  return null;
}

/**
 * Creates default negative marking rules for detected pattern
 * @param {string} stream - Exam stream
 * @param {string} standard - Exam standard
 * @param {Object} detectedPattern - Pattern configuration
 * @param {string} createdBy - Admin ID who is creating the rules
 * @returns {Promise<Array>} - Array of created rules
 */
export async function createStandardRules(stream, standard, detectedPattern, createdBy) {
  try {
    await connectDB();
    
    const { config } = detectedPattern;
    const createdRules = [];
    
    for (const ruleTemplate of config.rules) {
      // Check if rule already exists
      const existingRule = await DefaultNegativeMarkingRule.findOne({
        stream: stream,
        standard: standard,
        questionType: ruleTemplate.questionType,
        section: ruleTemplate.section,
        isActive: true
      });
      
      if (!existingRule) {
        const newRule = new DefaultNegativeMarkingRule({
          stream: stream,
          standard: standard,
          subject: null, // Stream-wide rules
          section: ruleTemplate.section,
          negativeMarks: ruleTemplate.negativeMarks,
          positiveMarks: ruleTemplate.positiveMarks,
          partialMarkingEnabled: ruleTemplate.partialMarkingEnabled || false,
          partialMarkingRules: ruleTemplate.partialMarkingRules || {
            threeOutOfFour: 3,
            twoOutOfThree: 2,
            oneOutOfTwo: 1
          },
          description: ruleTemplate.description,
          examType: config.examType,
          conductedBy: config.conductedBy,
          questionType: ruleTemplate.questionType,
          isActive: true,
          priority: 100, // High priority for auto-created rules
          createdBy: createdBy
        });
        
        const savedRule = await newRule.save();
        createdRules.push(savedRule);
      }
    }
    
    return {
      success: true,
      rulesCreated: createdRules.length,
      rules: createdRules,
      pattern: detectedPattern.detectedPattern
    };
  } catch (error) {
    console.error("Error creating standard rules:", error);
    return {
      success: false,
      error: error.message,
      rulesCreated: 0
    };
  }
}

/**
 * Auto-configures marking rules for an exam based on pattern detection
 * @param {Object} examDetails - Exam details
 * @param {string} createdBy - Admin ID
 * @returns {Promise<Object>} - Configuration result
 */
export async function autoConfigureExamRules(examDetails, createdBy) {
  try {
    // Detect pattern
    const detectedPattern = detectExamPattern(examDetails);
    
    if (!detectedPattern) {
      return {
        success: false,
        message: "No standard exam pattern detected",
        suggestions: "Please configure marking rules manually"
      };
    }
    
    // Only auto-apply if confidence is high
    if (detectedPattern.confidence === "high" && detectedPattern.autoApplyRules) {
      const result = await createStandardRules(
        examDetails.stream,
        examDetails.standard,
        detectedPattern,
        createdBy
      );
      
      if (result.success) {
        return {
          success: true,
          message: `Auto-configured ${result.rulesCreated} marking rules for ${detectedPattern.detectedPattern}`,
          detectedPattern: detectedPattern.detectedPattern,
          rulesCreated: result.rulesCreated,
          rules: result.rules.map(rule => ({
            questionType: rule.questionType,
            section: rule.section,
            positiveMarks: rule.positiveMarks,
            negativeMarks: rule.negativeMarks,
            description: rule.description
          }))
        };
      }
    }
    
    // Provide suggestions for manual configuration
    return {
      success: false,
      message: `Detected ${detectedPattern.detectedPattern} pattern but requires manual confirmation`,
      detectedPattern: detectedPattern.detectedPattern,
      confidence: detectedPattern.confidence,
      suggestedRules: detectedPattern.config.rules,
      autoConfigurationAvailable: true
    };
    
  } catch (error) {
    console.error("Error in auto-configuration:", error);
    return {
      success: false,
      message: "Error in auto-configuration: " + error.message
    };
  }
}

/**
 * Gets all available standard patterns for manual selection
 * @returns {Object} - Available patterns with descriptions
 */
export function getAvailablePatterns() {
  const patterns = {};
  
  for (const [key, config] of Object.entries(EXAM_PATTERNS)) {
    patterns[key] = {
      name: key.replace(/_/g, ' '),
      examType: config.examType,
      conductedBy: config.conductedBy,
      stream: config.stream,
      rulesCount: config.rules.length,
      description: `Standard marking scheme for ${config.examType}`,
      rules: config.rules.map(rule => ({
        questionType: rule.questionType,
        section: rule.section,
        positiveMarks: rule.positiveMarks,
        negativeMarks: rule.negativeMarks,
        description: rule.description
      }))
    };
  }
  
  return patterns;
}

/**
 * Validates if current exam matches the expected pattern
 * @param {Object} exam - Exam object with populated questions
 * @param {string} expectedPattern - Expected pattern name
 * @returns {Object} - Validation result with suggestions
 */
export function validateExamPattern(exam, expectedPattern) {
  if (!EXAM_PATTERNS[expectedPattern]) {
    return {
      valid: false,
      message: "Unknown pattern specified"
    };
  }
  
  const patternConfig = EXAM_PATTERNS[expectedPattern];
  const issues = [];
  const suggestions = [];
  
  // Check if exam has questions
  if (!exam.examQuestions || exam.examQuestions.length === 0) {
    issues.push("Exam has no questions assigned");
    suggestions.push("Add questions before applying marking rules");
    return {
      valid: false,
      issues,
      suggestions
    };
  }
  
  // Analyze question types and sections
  const questionStats = {
    MCQ: 0,
    Numerical: 0,
    MCMA: 0,
    sections: new Set()
  };
  
  exam.examQuestions.forEach(question => {
    if (question.userInputAnswer) {
      questionStats.Numerical++;
    } else if (question.isMultipleAnswer) {
      questionStats.MCMA++;
    } else {
      questionStats.MCQ++;
    }
    
    // Track sections
    if (question.section) {
      const sectionName = {1: "Section A", 2: "Section B", 3: "Section C"}[question.section];
      if (sectionName) {
        questionStats.sections.add(sectionName);
      }
    }
  });
  
  // Validate against pattern requirements
  const expectedRules = patternConfig.rules;
  const expectedQuestionTypes = [...new Set(expectedRules.map(r => r.questionType))];
  const expectedSections = [...new Set(expectedRules.map(r => r.section).filter(s => s !== "All"))];
  
  // Check if required question types are present
  expectedQuestionTypes.forEach(type => {
    if (questionStats[type] === 0) {
      issues.push(`Expected ${type} questions but none found`);
    }
  });
  
  // Check sections for advanced exams
  if (expectedPattern === 'JEE_ADVANCED' && expectedSections.length > 0) {
    expectedSections.forEach(section => {
      if (!questionStats.sections.has(section)) {
        issues.push(`Expected ${section} questions but none found`);
        suggestions.push(`Add questions with appropriate section assignment`);
      }
    });
  }
  
  return {
    valid: issues.length === 0,
    issues,
    suggestions,
    questionStats,
    expectedPattern: {
      name: expectedPattern,
      questionTypes: expectedQuestionTypes,
      sections: expectedSections
    }
  };
}

export default {
  detectExamPattern,
  createStandardRules,
  autoConfigureExamRules,
  getAvailablePatterns,
  validateExamPattern
};