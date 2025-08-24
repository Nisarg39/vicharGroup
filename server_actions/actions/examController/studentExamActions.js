"use server";
import { connectDB } from "../../config/mongoose";
import Exam from "../../models/exam_portal/exam";
import Student from "../../models/student";
import EnrolledStudent from "../../models/exam_portal/enrolledStudent";
import mongoose from "mongoose";
import ExamResult from "../../models/exam_portal/examResult";
// Import models that are referenced in populate operations
import MasterMcqQuestion from "../../models/exam_portal/master_mcq_question";
import College from "../../models/exam_portal/college";
import DefaultNegativeMarkingRule from "../../models/exam_portal/defaultNegativeMarkingRule";
// Import caching utilities
import { getCachedExam, getCachedEligibility, getCachedQuestions, clearExamCache } from "../../utils/cache";
// Import retry handler
import { retryExamSubmission, withRetry } from "../../utils/retryHandler";
// Import safe numeric operations
import {
    safePercentage,
    safeParseNumber,
    standardPercentage,
    safeStandardDeviation,
    safeReduce
} from "../../../utils/safeNumericOperations";
// Import decimal evaluation utilities
import { 
  evaluateAnswer, 
  validateEvaluationConfig 
} from "../../../utils/decimalAnswerEvaluator.js";
import { 
  getEvaluationConfig, 
  logConfigResolution,
  getSafeDefaultConfig 
} from "../../../utils/examEvaluationConfig.js";
import { validateExamDuration } from "../../../utils/examDurationHelpers";
import { getEffectiveExamDuration } from "../../../utils/examTimingUtils";

// Subject normalization function for consistent matching across all exam evaluation logic
function normalizeSubject(subject) {
  if (!subject) return null;
  
  const normalized = subject.toString().toLowerCase().trim();
  
  // Handle math variations - normalize to 'mathematics'
  if (['math', 'maths', 'mathematics'].includes(normalized)) {
    return 'mathematics';
  }
  
  // Handle physics variations - normalize to 'physics'
  if (['phy', 'physics'].includes(normalized)) {
    return 'physics';
  }
  
  // Handle chemistry variations - normalize to 'chemistry' 
  if (['chem', 'chemistry'].includes(normalized)) {
    return 'chemistry';
  }
  
  // Handle biology variations - normalize to 'biology'
  if (['bio', 'biology'].includes(normalized)) {
    return 'biology';
  }
  
  // Return normalized version for any other subjects
  return normalized;
}

// Data type normalization function for consistent comparison
function normalizeStandard(standard) {
  if (!standard) return null;
  return standard.toString().trim();
}


// im getting error - Error: Maximum call stack size exceeded this has happened to me alot of times in this project and to solve it use JSON.parse(JSON.stringify(exam)) wherever needed
// or also use lean() 
// Helper function to get the appropriate negative marking rule for an exam
async function getNegativeMarkingRuleForExam(exam) {
  try {
    // Priority order: Super admin default > Exam's negativeMarks field
    // Note: College-specific rules have been removed - only admin-controlled default rules are used
    
    // 1. Try to find super admin default rule
    const defaultRules = await DefaultNegativeMarkingRule.find({
      stream: exam.stream,
      isActive: true
    }).sort({ priority: -1 });

    for (const rule of defaultRules) {
      // Check for exact match with subject and standard - ENHANCED with normalization
      if (rule.subject && rule.standard) {
        // Normalize exam subjects array for comparison
        const normalizedExamSubjects = (exam.examSubject || []).map(subj => normalizeSubject(subj));
        const normalizedRuleSubject = normalizeSubject(rule.subject);
        const examStandardStr = normalizeStandard(exam.standard);
        const ruleStandardStr = normalizeStandard(rule.standard);
        
        if (normalizedExamSubjects.includes(normalizedRuleSubject) && 
            ruleStandardStr === examStandardStr) {
          return {
            source: "super_admin_default",
            negativeMarks: rule.negativeMarks,
            positiveMarks: rule.positiveMarks,
            description: rule.description || `Default rule: ${rule.stream} > ${rule.standard}th > ${rule.subject}`,
            defaultRuleId: rule._id
          };
        }
      }
      // Check for subject-specific rule without standard requirement (e.g., MHT-CET subject rules)
      else if (rule.subject && !rule.standard) {
        // Normalize exam subjects array for comparison
        const normalizedExamSubjects = (exam.examSubject || []).map(subj => normalizeSubject(subj));
        const normalizedRuleSubject = normalizeSubject(rule.subject);
        
        if (normalizedExamSubjects.includes(normalizedRuleSubject)) {
          return {
            source: "super_admin_default",
            negativeMarks: rule.negativeMarks,
            positiveMarks: rule.positiveMarks,
            description: rule.description || `Default rule: ${rule.stream} > ${rule.subject}`,
            defaultRuleId: rule._id
          };
        }
      }
      // Check for standard-specific rule
      else if (!rule.subject && rule.standard) {
        const examStandardStr = normalizeStandard(exam.standard);
        const ruleStandardStr = normalizeStandard(rule.standard);
        
        if (ruleStandardStr === examStandardStr) {
          return {
            source: "super_admin_default",
            negativeMarks: rule.negativeMarks,
            positiveMarks: rule.positiveMarks,
            description: rule.description || `Default rule: ${rule.stream} > ${rule.standard}th`,
            defaultRuleId: rule._id
          };
        }
      }
      // Check for stream-wide rule
      else if (!rule.subject && !rule.standard) {
        return {
          source: "super_admin_default",
          negativeMarks: rule.negativeMarks,
          positiveMarks: rule.positiveMarks,
          description: rule.description || `Default rule: ${rule.stream}`,
          defaultRuleId: rule._id
        };
      }
    }

    // 2. Fallback to exam's negativeMarks field
    return {
      source: "exam_specific",
      negativeMarks: exam.negativeMarks || 0,
      positiveMarks: exam.positiveMarks || exam.marks || 4, // Use exam's positive marks or default to 4
      description: exam.negativeMarks > 0 ? `Exam-specific: -${exam.negativeMarks} marks per wrong answer` : "No negative marking",
      ruleId: null,
      defaultRuleId: null
    };

  } catch (error) {
    console.error("Error getting negative marking rule:", error);
    // Fallback to exam's negativeMarks
    return {
      source: "exam_specific",
      negativeMarks: exam.negativeMarks || 0,
      positiveMarks: exam.positiveMarks || exam.marks || 4, // Use exam's positive marks or default to 4
      description: "Fallback to exam setting",
      ruleId: null,
      defaultRuleId: null
    };
  }
}

// Helper function to determine section name from question and exam context
function getQuestionSection(exam, question) {
  // For JEE Advanced and similar exams with section-specific rules
  if (question.section !== undefined && question.section !== null) {
    // Map numeric section to string
    const sectionMap = {
      1: "Section A",
      2: "Section B", 
      3: "Section C"
    };
    return sectionMap[question.section] || "All";
  }
  
  // If exam has a section field, use that
  if (exam.section) {
    return exam.section;
  }
  
  // Default to "All" for backward compatibility
  return "All";
}

// PERFORMANCE OPTIMIZATION: Bulk fetch all marking rules for exam to eliminate N+1 queries
async function getBulkNegativeMarkingRules(exam) {
  try {
    // Fetch ALL relevant marking rules for the exam in a single query
    const markingRules = await DefaultNegativeMarkingRule.find({
      stream: exam.stream,
      isActive: true
    }).sort({ priority: -1 }).lean(); // Use lean() for better performance

    // Create a lookup map for efficient rule matching
    const ruleMap = {
      examWideRules: [],
      questionTypeRules: {},
      subjectRules: {},
      sectionRules: {},
      combinedRules: {}
    };

    // Organize rules by type for efficient lookup
    for (const rule of markingRules) {
      const key = `${rule.questionType || 'ALL'}_${rule.subject || 'ALL'}_${rule.standard || 'ALL'}_${rule.section || 'All'}`;
      
      if (!ruleMap.combinedRules[key]) {
        ruleMap.combinedRules[key] = [];
      }
      ruleMap.combinedRules[key].push(rule);

      // Also categorize for fallback matching
      if (!rule.questionType && !rule.subject && !rule.standard) {
        ruleMap.examWideRules.push(rule);
      }
    }

    return { markingRules, ruleMap };
  } catch (error) {
    console.error("🚨 Error fetching bulk marking rules:", error);
    console.error("🚨 Exam details:", { stream: exam?.stream, _id: exam?._id, examName: exam?.examName });
    // Return empty structure for fallback  
    return { 
      markingRules: [], 
      ruleMap: { 
        examWideRules: [], 
        combinedRules: {},
        questionTypeRules: {},
        subjectRules: {},
        sectionRules: {}
      } 
    };
  }
}

// OPTIMIZED: Get marking rule for specific question using pre-fetched bulk data
function getNegativeMarkingRuleFromBulk(exam, question, bulkRuleData) {
  try {
    // CRITICAL: Validate input parameters
    if (!bulkRuleData || !bulkRuleData.ruleMap) {
      console.error('🚨 CRITICAL: Invalid bulkRuleData passed to getNegativeMarkingRuleFromBulk:', bulkRuleData);
      throw new Error('Invalid bulk rule data structure');
    }
    
    if (!exam || !question) {
      console.error('🚨 CRITICAL: Missing exam or question data:', { exam: !!exam, question: !!question });
      throw new Error('Missing required exam or question data');
    }
    
    const { ruleMap } = bulkRuleData;
    
    // Determine question type
    let questionType = 'MCQ'; // Default
    if (question.userInputAnswer) {
      questionType = 'Numerical';
    } else if (question.isMultipleAnswer) {
      questionType = 'MCMA';
    }
    
    // Determine section for this question
    const questionSection = getQuestionSection(exam, question);
    const questionSubject = question.subject;

    // Enhanced Priority order for rule matching - using pre-organized rule map
    const searchKeys = [
      // Section + Question type + Subject + Standard specific (highest priority)
      `${questionType}_${questionSubject || 'ALL'}_${exam.standard || 'ALL'}_${questionSection}`,
      // Section + Question type + Subject specific
      `${questionType}_${questionSubject || 'ALL'}_ALL_${questionSection}`,
      // Section + Question type + Standard specific
      `${questionType}_ALL_${exam.standard || 'ALL'}_${questionSection}`,
      // Section + Question type specific
      `${questionType}_ALL_ALL_${questionSection}`,
      // Question type + Subject + Standard specific
      `${questionType}_${questionSubject || 'ALL'}_${exam.standard || 'ALL'}_All`,
      // Question type + Subject specific
      `${questionType}_${questionSubject || 'ALL'}_ALL_All`,
      // Question type + Standard specific
      `${questionType}_ALL_${exam.standard || 'ALL'}_All`,
      // Question type specific
      `${questionType}_ALL_ALL_All`,
      // Subject + Standard specific (no question type)
      `ALL_${questionSubject || 'ALL'}_${exam.standard || 'ALL'}_All`,
      // Subject specific
      `ALL_${questionSubject || 'ALL'}_ALL_All`,
      // Standard specific
      `ALL_ALL_${exam.standard || 'ALL'}_All`,
      // Stream-wide rule
      `ALL_ALL_ALL_All`
    ];

    // Find the first matching rule using priority order
    for (const searchKey of searchKeys) {
      const rules = ruleMap.combinedRules[searchKey];
      if (rules && rules.length > 0) {
        const rule = rules[0]; // Take highest priority rule
        
        // Validate the match with normalized subjects if applicable
        if (rule.subject && questionSubject) {
          const normalizedQuestionSubject = normalizeSubject(questionSubject);
          const normalizedRuleSubject = normalizeSubject(rule.subject);
          if (normalizedQuestionSubject !== normalizedRuleSubject) {
            continue; // Skip this rule and try next
          }
        }

        // Validate standard match if applicable
        if (rule.standard) {
          const examStandardStr = normalizeStandard(exam.standard);
          const ruleStandardStr = normalizeStandard(rule.standard);
          if (ruleStandardStr !== examStandardStr) {
            continue; // Skip this rule and try next
          }
        }

        return {
          source: "super_admin_default",
          negativeMarks: rule.negativeMarks,
          positiveMarks: rule.positiveMarks,
          description: rule.description || `Optimized rule: ${rule.stream} > ${questionType}`,
          partialMarkingEnabled: rule.partialMarkingEnabled,
          partialMarkingRules: rule.partialMarkingRules,
          questionType: questionType,
          appliedRule: rule
        };
      }
    }

    // Fallback to exam's negativeMarks field if no specific rule found
    if (exam.negativeMarks !== undefined && exam.negativeMarks !== null) {
      return {
        source: "exam_specific",
        negativeMarks: exam.negativeMarks,
        positiveMarks: question.marks || 4,
        description: `Exam default: ${exam.negativeMarks} negative marks`,
        partialMarkingEnabled: false,
        partialMarkingRules: null,
        questionType: questionType
      };
    }

    // Final fallback
    return {
      source: "exam_specific",
      negativeMarks: 1,
      positiveMarks: 4,
      description: "System default: 1 negative mark, 4 positive marks",
      partialMarkingEnabled: false,
      partialMarkingRules: null,
      questionType: questionType
    };

  } catch (error) {
    console.error("Error getting marking rule from bulk data:", error);
    // System fallback
    return {
      source: "exam_specific",
      negativeMarks: 1,
      positiveMarks: 4,
      description: "Error fallback: 1 negative mark, 4 positive marks",
      partialMarkingEnabled: false,
      partialMarkingRules: null,
      questionType: 'MCQ'
    };
  }
}

// DEPRECATED - keeping for backward compatibility only, DO NOT USE in performance-critical code
// Enhanced helper function to get negative marking rule for a specific question type
export async function getNegativeMarkingRuleForQuestion(exam, question) {
  try {
    // Determine question type
    let questionType = 'MCQ'; // Default
    if (question.userInputAnswer) {
      questionType = 'Numerical';
    } else if (question.isMultipleAnswer) {
      questionType = 'MCMA';
    }
    
    // Determine section for this question
    const questionSection = getQuestionSection(exam, question);

    // Enhanced Priority order for rule matching (includes section-specific rules):
    // 1. Section + Question type + Subject + Standard specific (highest priority)
    // 2. Section + Question type + Subject specific
    // 3. Section + Question type + Standard specific
    // 4. Section + Question type specific
    // 5. Question type + Subject + Standard specific
    // 6. Question type + Subject specific
    // 7. Question type + Standard specific  
    // 8. Question type specific
    // 9. Section + Subject + Standard specific
    // 10. Section + Subject specific
    // 11. Section + Standard specific
    // 12. Section specific
    // 13. Subject + Standard specific
    // 14. Subject specific
    // 15. Standard specific
    // 16. Stream-wide rule
    // 17. Exam's negativeMarks field

    const defaultRules = await DefaultNegativeMarkingRule.find({
      stream: exam.stream,
      isActive: true
    }).sort({ priority: -1 });

    // Get question's subject if available
    const questionSubject = question.subject;

    for (const rule of defaultRules) {
      const ruleSection = rule.section || "All";
      const isRuleSectionMatch = (ruleSection === "All" || ruleSection === questionSection);
      
      // 1. Section + Question type + Subject + Standard specific (highest priority)
      if (isRuleSectionMatch && rule.questionType === questionType && rule.subject && rule.standard && rule.section && rule.section !== "All") {
        const normalizedQuestionSubject = normalizeSubject(questionSubject);
        const normalizedRuleSubject = normalizeSubject(rule.subject);
        const examStandardStr = normalizeStandard(exam.standard);
        const ruleStandardStr = normalizeStandard(rule.standard);
        
        if (normalizedQuestionSubject === normalizedRuleSubject && 
            ruleStandardStr === examStandardStr) {
          return {
            source: "super_admin_default",
            negativeMarks: rule.negativeMarks,
            positiveMarks: rule.positiveMarks,
            description: rule.description || `${questionType} rule: ${rule.stream} > ${rule.standard}th > ${rule.subject} > ${rule.section}`,
            defaultRuleId: rule._id,
            partialMarkingEnabled: rule.partialMarkingEnabled,
            partialMarkingRules: rule.partialMarkingRules
          };
        }
      }
      // 2. Section + Question type + Subject specific
      else if (isRuleSectionMatch && rule.questionType === questionType && rule.subject && !rule.standard && rule.section && rule.section !== "All") {
        const normalizedQuestionSubject = normalizeSubject(questionSubject);
        const normalizedRuleSubject = normalizeSubject(rule.subject);
        
        if (normalizedQuestionSubject === normalizedRuleSubject) {
          return {
            source: "super_admin_default",
            negativeMarks: rule.negativeMarks,
            positiveMarks: rule.positiveMarks,
            description: rule.description || `${questionType} rule: ${rule.stream} > ${rule.subject} > ${rule.section}`,
            defaultRuleId: rule._id,
            partialMarkingEnabled: rule.partialMarkingEnabled,
            partialMarkingRules: rule.partialMarkingRules
          };
        }
      }
      // 3. Section + Question type + Standard specific
      else if (isRuleSectionMatch && rule.questionType === questionType && !rule.subject && rule.standard && rule.section && rule.section !== "All") {
        const examStandardStr = normalizeStandard(exam.standard);
        const ruleStandardStr = normalizeStandard(rule.standard);
        
        if (ruleStandardStr === examStandardStr) {
          return {
            source: "super_admin_default",
            negativeMarks: rule.negativeMarks,
            positiveMarks: rule.positiveMarks,
            description: rule.description || `${questionType} rule: ${rule.stream} > ${rule.standard}th > ${rule.section}`,
            defaultRuleId: rule._id,
            partialMarkingEnabled: rule.partialMarkingEnabled,
            partialMarkingRules: rule.partialMarkingRules
          };
        }
      }
      // 4. Section + Question type specific
      else if (isRuleSectionMatch && rule.questionType === questionType && !rule.subject && !rule.standard && rule.section && rule.section !== "All") {
        return {
          source: "super_admin_default",
          negativeMarks: rule.negativeMarks,
          positiveMarks: rule.positiveMarks,
          description: rule.description || `${questionType} rule: ${rule.stream} > ${rule.section}`,
          defaultRuleId: rule._id,
          partialMarkingEnabled: rule.partialMarkingEnabled,
          partialMarkingRules: rule.partialMarkingRules
        };
      }
      // 5. Question type + Subject + Standard specific (no section specified or "All")
      else if (rule.questionType === questionType && rule.subject && rule.standard && (!rule.section || rule.section === "All")) {
        const normalizedQuestionSubject = normalizeSubject(questionSubject);
        const normalizedRuleSubject = normalizeSubject(rule.subject);
        const examStandardStr = normalizeStandard(exam.standard);
        const ruleStandardStr = normalizeStandard(rule.standard);
        
        if (normalizedQuestionSubject === normalizedRuleSubject && 
            ruleStandardStr === examStandardStr) {
          return {
            source: "super_admin_default",
            negativeMarks: rule.negativeMarks,
            positiveMarks: rule.positiveMarks,
            description: rule.description || `${questionType} rule: ${rule.stream} > ${rule.standard}th > ${rule.subject}`,
            defaultRuleId: rule._id,
            partialMarkingEnabled: rule.partialMarkingEnabled,
            partialMarkingRules: rule.partialMarkingRules
          };
        }
      }
      // 6. Question type + Subject specific (no section specified or "All")
      else if (rule.questionType === questionType && rule.subject && !rule.standard && (!rule.section || rule.section === "All")) {
        const normalizedQuestionSubject = normalizeSubject(questionSubject);
        const normalizedRuleSubject = normalizeSubject(rule.subject);
        
        if (normalizedQuestionSubject === normalizedRuleSubject) {
          return {
            source: "super_admin_default",
            negativeMarks: rule.negativeMarks,
            positiveMarks: rule.positiveMarks,
            description: rule.description || `${questionType} rule: ${rule.stream} > ${rule.subject}`,
            defaultRuleId: rule._id,
            partialMarkingEnabled: rule.partialMarkingEnabled,
            partialMarkingRules: rule.partialMarkingRules,
            appliedRule: rule
          };
        }
      }
      // 6.5. Subject specific (no question type, no standard, no section) - FOR MHT-CET RULES
      else if (!rule.questionType && rule.subject && !rule.standard && (!rule.section || rule.section === "All")) {
        const normalizedQuestionSubject = normalizeSubject(questionSubject);
        const normalizedRuleSubject = normalizeSubject(rule.subject);
        
        if (normalizedQuestionSubject === normalizedRuleSubject) {
          return {
            source: "super_admin_default",
            negativeMarks: rule.negativeMarks,
            positiveMarks: rule.positiveMarks,
            description: rule.description || `Subject rule: ${rule.stream} > ${rule.subject}`,
            defaultRuleId: rule._id,
            partialMarkingEnabled: rule.partialMarkingEnabled,
            partialMarkingRules: rule.partialMarkingRules,
            appliedRule: rule
          };
        }
      }
      // 7. Question type + Standard specific (no section specified or "All")
      else if (rule.questionType === questionType && !rule.subject && rule.standard && (!rule.section || rule.section === "All")) {
        const examStandardStr = normalizeStandard(exam.standard);
        const ruleStandardStr = normalizeStandard(rule.standard);
        
        if (ruleStandardStr === examStandardStr) {
          return {
            source: "super_admin_default",
            negativeMarks: rule.negativeMarks,
            positiveMarks: rule.positiveMarks,
            description: rule.description || `${questionType} rule: ${rule.stream} > ${rule.standard}th`,
            defaultRuleId: rule._id,
            partialMarkingEnabled: rule.partialMarkingEnabled,
            partialMarkingRules: rule.partialMarkingRules
          };
        }
      }
      // 8. Question type specific (stream-wide, no section specified or "All")
      else if (rule.questionType === questionType && !rule.subject && !rule.standard && (!rule.section || rule.section === "All")) {
        return {
          source: "super_admin_default",
          negativeMarks: rule.negativeMarks,
          positiveMarks: rule.positiveMarks,
          description: rule.description || `${questionType} rule: ${rule.stream}`,
          defaultRuleId: rule._id,
          partialMarkingEnabled: rule.partialMarkingEnabled,
          partialMarkingRules: rule.partialMarkingRules
        };
      }
      // 9. Section + Subject + Standard specific (no question type)
      else if (isRuleSectionMatch && !rule.questionType && rule.subject && rule.standard && rule.section && rule.section !== "All") {
        const normalizedQuestionSubject = normalizeSubject(questionSubject);
        const normalizedRuleSubject = normalizeSubject(rule.subject);
        const examStandardStr = normalizeStandard(exam.standard);
        const ruleStandardStr = normalizeStandard(rule.standard);
        
        if (normalizedQuestionSubject === normalizedRuleSubject && 
            ruleStandardStr === examStandardStr) {
          return {
            source: "super_admin_default",
            negativeMarks: rule.negativeMarks,
            positiveMarks: rule.positiveMarks,
            description: rule.description || `Section rule: ${rule.stream} > ${rule.standard}th > ${rule.subject} > ${rule.section}`,
            defaultRuleId: rule._id,
            partialMarkingEnabled: rule.partialMarkingEnabled,
            partialMarkingRules: rule.partialMarkingRules
          };
        }
      }
      // 10. Section + Subject specific (no question type)
      else if (isRuleSectionMatch && !rule.questionType && rule.subject && !rule.standard && rule.section && rule.section !== "All") {
        const normalizedQuestionSubject = normalizeSubject(questionSubject);
        const normalizedRuleSubject = normalizeSubject(rule.subject);
        
        if (normalizedQuestionSubject === normalizedRuleSubject) {
          return {
            source: "super_admin_default",
            negativeMarks: rule.negativeMarks,
            positiveMarks: rule.positiveMarks,
            description: rule.description || `Section rule: ${rule.stream} > ${rule.subject} > ${rule.section}`,
            defaultRuleId: rule._id,
            partialMarkingEnabled: rule.partialMarkingEnabled,
            partialMarkingRules: rule.partialMarkingRules
          };
        }
      }
      // 11. Section + Standard specific (no question type)
      else if (isRuleSectionMatch && !rule.questionType && !rule.subject && rule.standard && rule.section && rule.section !== "All") {
        const examStandardStr = normalizeStandard(exam.standard);
        const ruleStandardStr = normalizeStandard(rule.standard);
        
        if (ruleStandardStr === examStandardStr) {
          return {
            source: "super_admin_default",
            negativeMarks: rule.negativeMarks,
            positiveMarks: rule.positiveMarks,
            description: rule.description || `Section rule: ${rule.stream} > ${rule.standard}th > ${rule.section}`,
            defaultRuleId: rule._id,
            partialMarkingEnabled: rule.partialMarkingEnabled,
            partialMarkingRules: rule.partialMarkingRules
          };
        }
      }
      // 12. Section specific (no question type, no subject, no standard)
      else if (isRuleSectionMatch && !rule.questionType && !rule.subject && !rule.standard && rule.section && rule.section !== "All") {
        return {
          source: "super_admin_default",
          negativeMarks: rule.negativeMarks,
          positiveMarks: rule.positiveMarks,
          description: rule.description || `Section rule: ${rule.stream} > ${rule.section}`,
          defaultRuleId: rule._id,
          partialMarkingEnabled: rule.partialMarkingEnabled,
          partialMarkingRules: rule.partialMarkingRules
        };
      }
      // 13. Subject + Standard specific (no question type, no section specified or "All")
      else if (!rule.questionType && rule.subject && rule.standard && (!rule.section || rule.section === "All")) {
        const normalizedQuestionSubject = normalizeSubject(questionSubject);
        const normalizedRuleSubject = normalizeSubject(rule.subject);
        const examStandardStr = normalizeStandard(exam.standard);
        const ruleStandardStr = normalizeStandard(rule.standard);
        
        if (normalizedQuestionSubject === normalizedRuleSubject && 
            ruleStandardStr === examStandardStr) {
          return {
            source: "super_admin_default",
            negativeMarks: rule.negativeMarks,
            positiveMarks: rule.positiveMarks,
            description: rule.description || `Subject rule: ${rule.stream} > ${rule.standard}th > ${rule.subject}`,
            defaultRuleId: rule._id,
            partialMarkingEnabled: rule.partialMarkingEnabled,
            partialMarkingRules: rule.partialMarkingRules
          };
        }
      }
      // 14. Subject specific (no question type, no section specified or "All")
      else if (!rule.questionType && rule.subject && !rule.standard && (!rule.section || rule.section === "All")) {
        const normalizedQuestionSubject = normalizeSubject(questionSubject);
        const normalizedRuleSubject = normalizeSubject(rule.subject);
        
        if (normalizedQuestionSubject === normalizedRuleSubject) {
          return {
            source: "super_admin_default",
            negativeMarks: rule.negativeMarks,
            positiveMarks: rule.positiveMarks,
            description: rule.description || `Subject rule: ${rule.stream} > ${rule.subject}`,
            defaultRuleId: rule._id,
            partialMarkingEnabled: rule.partialMarkingEnabled,
            partialMarkingRules: rule.partialMarkingRules
          };
        }
      }
      // 15. Standard specific (no question type, no subject, no section specified or "All")
      else if (!rule.questionType && !rule.subject && rule.standard && (!rule.section || rule.section === "All")) {
        const examStandardStr = normalizeStandard(exam.standard);
        const ruleStandardStr = normalizeStandard(rule.standard);
        
        if (ruleStandardStr === examStandardStr) {
          return {
            source: "super_admin_default",
            negativeMarks: rule.negativeMarks,
            positiveMarks: rule.positiveMarks,
            description: rule.description || `Standard rule: ${rule.stream} > ${rule.standard}th`,
            defaultRuleId: rule._id,
            partialMarkingEnabled: rule.partialMarkingEnabled,
            partialMarkingRules: rule.partialMarkingRules
          };
        }
      }
      // 16. Stream-wide rule (no question type, no subject, no standard, no section specified or "All")
      else if (!rule.questionType && !rule.subject && !rule.standard && (!rule.section || rule.section === "All")) {
        return {
          source: "super_admin_default",
          negativeMarks: rule.negativeMarks,
          positiveMarks: rule.positiveMarks,
          description: rule.description || `Stream rule: ${rule.stream}`,
          defaultRuleId: rule._id,
          partialMarkingEnabled: rule.partialMarkingEnabled,
          partialMarkingRules: rule.partialMarkingRules
        };
      }
    }

    // 17. Fallback to exam's negativeMarks field
    return {
      source: "exam_specific",
      negativeMarks: exam.negativeMarks || 0,
      positiveMarks: null,
      description: exam.negativeMarks > 0 ? `Exam-specific: -${exam.negativeMarks} marks per wrong answer` : "No negative marking",
      ruleId: null,
      defaultRuleId: null,
      partialMarkingEnabled: false,
      partialMarkingRules: null
    };

  } catch (error) {
    console.error("Error getting negative marking rule for question:", error);
    // Fallback to exam's negativeMarks
    return {
      source: "exam_specific",
      negativeMarks: exam.negativeMarks || 0,
      positiveMarks: null,
      description: "Fallback to exam setting",
      ruleId: null,
      defaultRuleId: null,
      partialMarkingEnabled: false,
      partialMarkingRules: null
    };
  }
}

export async function checkExamEligibility(details) {
  /**
   * checkExamEligibility(details)
   * Flow:
   * 1. Validate examId and studentId
   * 2. Check cache for eligibility result
   * 3. Fetch the exam and check if it exists
   * 4. Check if the exam is active (status: 'active' or 'scheduled')
   * 5. Fetch the student's enrollment in the college
   * 6. Check if the student is enrolled, allocated the subject, and in the correct class
   * 7. Cache successful eligibility results
   * 8. Return eligibility result
   */
  
  // Try to get cached eligibility first
  const cachedResult = await getCachedEligibility(
    details.examId,
    details.studentId,
    async () => {
      // This function is only called if not in cache
      return await checkExamEligibilityUncached(details);
    }
  );
  
  return cachedResult;
}

// Uncached version of checkExamEligibility
async function checkExamEligibilityUncached(details) {
  try {
    await connectDB();

    // 1. Validate examId and studentId
    if (!mongoose.Types.ObjectId.isValid(details.examId)) {
      return {
        success: false,
        message: "Invalid exam ID",
      };
    }
    if (!mongoose.Types.ObjectId.isValid(details.studentId)) {
      return {
        success: false,
        message: "Invalid student ID",
      };
    }

    // 2. Fetch the exam with caching
    const exam = await getCachedExam(details.examId, async () => {
      return await Exam.findById(details.examId)
        .populate("college")
        .populate("examQuestions")
        .lean();
    });
    
    if (!exam) {
      return {
        success: false,
        message: "Exam not found",
      };
    }

    // 3. Check if the exam is active
    
    if (exam.examStatus !== "active" || exam.status !== "scheduled") {
      return {
        success: false,
        message:
          "Exam is not active, Please go to classroom to check the exam status",
      };
    }

    // 3.5. Check if exam has questions
    if (!exam.examQuestions || exam.examQuestions.length === 0) {
      return {
        success: false,
        message: "This exam has no questions assigned. Please contact your administrator.",
      };
    }

    // 4. Fetch the student's enrollment in the college
    const college = exam.college;
    
    const enrolledStudent = await EnrolledStudent.findOne({
      college: college._id,
      student: details.studentId,
    }).lean(); // Added .lean() for performance

    // 5. Check if the student is enrolled by checking the allocated stream and class
    const isStreamMatch = enrolledStudent?.allocatedStreams.includes(exam.stream);
    const isClassMatch =
      enrolledStudent?.class === `${exam.standard}` ||
      enrolledStudent?.class === `${exam.standard}th`;
    const isEnrolled =
      enrolledStudent &&
      isStreamMatch &&
      isClassMatch;


    if (!isEnrolled) {
      return {
        success: false,
        message: "You are not enrolled in this exam",
      };
    }

    // 6. Get preview of marking rules that would be applied to this exam
    const previewMarkingRules = await getNegativeMarkingRuleForExam(exam);
    
    // 6.5. Get subject-specific marking rules for better preview
    const subjectMarkingMap = {};
    let isSubjectWise = false;
    
    if (exam.examQuestions && exam.examQuestions.length > 0) {
      // PERFORMANCE OPTIMIZATION: Bulk fetch marking rules for eligibility preview
      const eligibilityBulkRules = await getBulkNegativeMarkingRules(exam);
      
      // Get unique subjects and their marking rules
      const uniqueSubjects = [...new Set(exam.examQuestions.map(q => q.subject).filter(Boolean))];
      
      for (const subject of uniqueSubjects) {
        // Find a question from this subject to get its marking rule
        const sampleQuestion = exam.examQuestions.find(q => q.subject === subject);
        if (sampleQuestion) {
          // OPTIMIZED: Use bulk data instead of individual queries
          const subjectRule = getNegativeMarkingRuleFromBulk(exam, sampleQuestion, eligibilityBulkRules);
          subjectMarkingMap[subject] = {
            correct: subjectRule.positiveMarks || previewMarkingRules.positiveMarks,
            incorrect: -Math.abs(subjectRule.negativeMarks || previewMarkingRules.negativeMarks),
            unanswered: 0
          };
        }
      }
      
      // Check if subjects have different marking schemes
      const markingValues = Object.values(subjectMarkingMap);
      if (markingValues.length > 1) {
        const uniquePositiveMarks = [...new Set(markingValues.map(v => v.correct))];
        isSubjectWise = uniquePositiveMarks.length > 1;
      }
    }
    
    // Add marking rules to exam object for Instructions component
    const examWithMarkingRules = {
      ...exam,
      markingRulePreview: {
        positiveMarks: previewMarkingRules.positiveMarks,
        negativeMarks: previewMarkingRules.negativeMarks,
        ruleDescription: previewMarkingRules.description,
        ruleSource: previewMarkingRules.source,
        hasMarkingRules: true,
        isSubjectWise: isSubjectWise,
        subjects: isSubjectWise ? subjectMarkingMap : {}
      }
    };

    // 7. Return eligibility result
    return {
      success: true,
      message: "You are eligible to give this exam",
      exam: examWithMarkingRules,
    };
  } catch (error) {
    console.error("Error checking exam eligibility:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      examId: details.examId,
      studentId: details.studentId
    });
    return {
      success: false,
      message: `Error checking exam eligibility: ${error.message}`,
    };
  }
}

export async function submitExamResult(examData) {
  /**
   * EMERGENCY QUEUE SYSTEM - submitExamResult(examData)
   * 
   * CRITICAL CHANGE: This function now uses the emergency submission queue
   * to eliminate data loss during concurrent auto-submits.
   * 
   * NEW Flow:
   * 1. Queue submission immediately (INSTANT response to student)
   * 2. Background worker processes using existing scoring logic
   * 3. Zero data loss with comprehensive error handling
   * 4. Students get immediate confirmation, results processed in background
   * 
   * BACKWARD COMPATIBILITY:
   * - For testing/development: can fall back to synchronous processing
   * - API response format unchanged for frontend compatibility
   * - All scoring logic preserved exactly as before
   */
  
  // Check if emergency queue system should be used (default: enabled in production)
  const useQueueSystem = process.env.EXAM_QUEUE_ENABLED !== 'false' && 
                          process.env.NODE_ENV === 'production';
  
  if (useQueueSystem) {
    // EMERGENCY QUEUE SYSTEM - Immediate response with background processing
    try {
      const { queueExamSubmission } = await import('../../utils/examSubmissionQueue.js');
      
      // Get request context for better queue management
      const context = {
        isAutoSubmit: examData.isAutoSubmit || false,
        isManualSubmit: !examData.isAutoSubmit,
        timeRemaining: examData.timeRemaining || 0,
        examEnded: examData.examEnded || false,
        userAgent: examData.userAgent,
        screenResolution: examData.screenResolution,
        timezone: examData.timezone,
        sessionId: examData.sessionId,
        ipAddress: examData.ipAddress
      };
      
      const queueResult = await queueExamSubmission(examData, context);
      
      if (queueResult.success) {
        // CRITICAL: Return immediate success with queue tracking info
        return {
          success: true,
          message: "Your exam has been submitted successfully! Your results are being processed and will be available shortly.",
          isQueued: true,
          submissionId: queueResult.submissionId,
          estimatedProcessingTime: queueResult.estimatedProcessingTime,
          result: {
            // Provide placeholder values for frontend compatibility
            // Actual results will be available via status API
            isProcessing: true,
            submissionId: queueResult.submissionId,
            message: "Processing your answers in the background...",
            completedAt: new Date(),
            timeTaken: examData.timeTaken,
            warnings: examData.warnings || 0
          }
        };
      } else {
        // Queue system failed, fall back to synchronous processing
        console.warn('Queue system failed, falling back to synchronous processing:', queueResult.message);
        return await retryExamSubmission(submitExamResultInternal, examData);
      }
      
    } catch (queueError) {
      // Queue system error, fall back to synchronous processing
      console.error('Queue system error, falling back to synchronous processing:', queueError.message);
      return await retryExamSubmission(submitExamResultInternal, examData);
    }
  } else {
    // FALLBACK: Use original synchronous processing for development/testing
    return await retryExamSubmission(submitExamResultInternal, examData);
  }
}

// Internal function that does the actual submission
// EXPORTED for use by ExamSubmissionWorker to maintain exact scoring logic
export async function submitExamResultInternal(examData) {
  try {
    await connectDB();

    const {
      examId,
      studentId,
      answers,
      totalMarks,
      timeTaken,
      completedAt,
      isOfflineSubmission = false,
      visitedQuestions = [],
      markedQuestions = [],
      warnings = 0 // Extract warnings from exam data
    } = examData;

    // 1. Validate exam data
    if (!mongoose.Types.ObjectId.isValid(examId) || !mongoose.Types.ObjectId.isValid(studentId)) {
      return {
        success: false,
        message: "Invalid exam or student ID",
      };
    }

    // 2. Fetch exam details and check attempt limit
    const exam = await Exam.findById(examId).populate("examQuestions");
    if (!exam) {
      return {
        success: false,
        message: "Exam not found",
      };
    }

    // Fetch student details with college information
    const student = await Student.findById(studentId).populate('college');
    if (!student) {
      return {
        success: false,
        message: "Student not found",
      };
    }

    const maxAttempts = exam.reattempt || 1;
    const previousAttempts = await ExamResult.countDocuments({ exam: examId, student: studentId });
    if (previousAttempts >= maxAttempts) {
      return {
        success: false,
        message: `You have reached the maximum allowed attempts (${maxAttempts}) for this exam.`,
      };
    }

    // Enhanced helper function to normalize answers with backward compatibility
    const normalizeAnswer = (answer, question) => {
      try {
        if (!answer) return null;
        
        // For MCQ questions, maintain existing array/string normalization
        if (question.isMultipleAnswer || (Array.isArray(answer) && answer.length > 0)) {
          // Handle MCMA - normalize array elements
          return Array.isArray(answer) ? 
            answer.map(a => String(a).trim().toLowerCase()) : 
            [String(answer).trim().toLowerCase()];
        }
        
        // For single answers (MCQ or numerical), return as trimmed string
        return String(answer).trim();
        
      } catch (error) {
        console.error('Error in normalizeAnswer:', error);
        return String(answer || '').trim();
      }
    };
    
    // Helper function to evaluate if answers match using advanced decimal comparison
    const evaluateAnswerMatch = (userAnswer, correctAnswer, question) => {
      try {
        // Get evaluation configuration for this specific exam and question
        let evaluationConfig = getEvaluationConfig(exam, question);
        
        // Validate configuration
        if (!validateEvaluationConfig(evaluationConfig)) {
          console.warn('Invalid evaluation config, using safe defaults for question:', question._id);
          evaluationConfig = getSafeDefaultConfig();
        }
        
        // Use the enhanced evaluation function
        const evaluationResult = evaluateAnswer(userAnswer, correctAnswer, question, evaluationConfig);
        
        // Log evaluation details for debugging in development
        if (evaluationResult.evaluationType === 'numerical' && process.env.NODE_ENV === 'development') {
          logConfigResolution(evaluationConfig, exam, question);
          console.log(`Question ${question._id} numerical evaluation:`, {
            userAnswer,
            correctAnswer,
            result: evaluationResult.isMatch,
            evaluationType: evaluationResult.evaluationType,
            tolerance: evaluationConfig.tolerance,
            difference: evaluationResult.details?.difference
          });
        }
        
        return evaluationResult;
        
      } catch (error) {
        console.error('Error in evaluateAnswerMatch:', error);
        
        // Fallback to simple string comparison for safety
        const userStr = String(userAnswer || '').trim().toLowerCase();
        const correctStr = String(correctAnswer || '').trim().toLowerCase();
        
        return {
          isMatch: userStr === correctStr,
          evaluationType: 'fallback_string',
          details: {
            error: error.message,
            userValue: userAnswer,
            correctValue: correctAnswer
          }
        };
      }
    };

    // 3. Calculate detailed score with question-specific negative marking
    let finalScore = 0;
    let correctAnswersCount = 0;
    let incorrectAnswers = 0;
    let unattempted = 0;
    const questionAnalysis = [];

    // PERFORMANCE OPTIMIZATION: Fetch all marking rules once to eliminate N+1 queries
    console.time('BulkMarkingRulesFetch');
    const bulkMarkingRules = await getBulkNegativeMarkingRules(exam);
    console.timeEnd('BulkMarkingRulesFetch');
    console.log(`📊 Bulk fetched ${bulkMarkingRules?.markingRules?.length || 0} marking rules for ${exam.examQuestions?.length || 0} questions`);
    
    // CRITICAL: Validate bulk rules data structure
    if (!bulkMarkingRules || !bulkMarkingRules.ruleMap || !bulkMarkingRules.markingRules) {
      console.error('🚨 CRITICAL: Invalid bulk marking rules structure:', bulkMarkingRules);
      throw new Error('Failed to fetch marking rules for exam scoring');
    }

    // Process each question with its specific negative marking rule (OPTIMIZED)
    console.time('QuestionScoring');
    for (const question of exam.examQuestions) {
      const userAnswer = answers[question._id];
      const questionMarks = question.marks || 4;
      
      // Get question-specific negative marking rule (OPTIMIZED - no DB query)
      const questionNegativeMarkingRule = getNegativeMarkingRuleFromBulk(exam, question, bulkMarkingRules);
      
      // CRITICAL: Validate rule structure before using it
      if (!questionNegativeMarkingRule || typeof questionNegativeMarkingRule !== 'object') {
        console.error('🚨 CRITICAL: Invalid marking rule returned for question:', question._id, questionNegativeMarkingRule);
        throw new Error(`Failed to get marking rule for question ${question._id}`);
      }
      
      // Get admin-configured marks using robust fallback logic
      const adminPositiveMarks = questionNegativeMarkingRule?.positiveMarks || questionMarks || 4;
      const adminNegativeMarks = questionNegativeMarkingRule?.negativeMarks !== undefined ? questionNegativeMarkingRule.negativeMarks : 1;
      
      // LOG for debugging
      if (exam.examQuestions.indexOf(question) < 3) { // Log first 3 questions only
        console.log(`📝 Question ${exam.examQuestions.indexOf(question) + 1} marks: +${adminPositiveMarks}, -${adminNegativeMarks}, rule: ${questionNegativeMarkingRule?.source}`);
      }

      if (!userAnswer || (Array.isArray(userAnswer) && userAnswer.length === 0)) {
        unattempted++;
        const correctAnswer = question.isMultipleAnswer ? question.multipleAnswer : question.answer;
        questionAnalysis.push({
          questionId: question._id,
          status: "unattempted",
          marks: 0,
          userAnswer: null,
          correctAnswer: correctAnswer,
          negativeMarkingRule: questionNegativeMarkingRule?.description || 'Unknown rule',
        });
      } else if (question.isMultipleAnswer) {
        // MCMA (Multiple Choice Multiple Answer) logic - JEE Advanced Rules
        const questionCorrectAnswers = question.multipleAnswer || [];
        const normalizedUserAnswer = normalizeAnswer(userAnswer, question);
        const normalizedCorrectAnswers = normalizeAnswer(questionCorrectAnswers, question);
        
        // For MCMA, we still use the traditional array comparison as decimal evaluation
        // doesn't apply to multiple choice scenarios
        
        // Analyze user's selections
        const correctSelected = normalizedUserAnswer.filter(ans => normalizedCorrectAnswers.includes(ans));
        const wrongSelected = normalizedUserAnswer.filter(ans => !normalizedCorrectAnswers.includes(ans));
        const totalCorrectOptions = normalizedCorrectAnswers.length;
        const correctSelectedCount = correctSelected.length;
        
        let marksAwarded = 0;
        let status = "";
        
        // JEE Advanced MCMA Marking Scheme:
        if (normalizedUserAnswer.length === 0) {
          // Zero Marks: 0 if no options are chosen
          marksAwarded = 0;
          status = "unattempted";
          unattempted++;
        } else if (wrongSelected.length > 0) {
          // Negative Marks: Use admin-configured rule for MCMA wrong selections
          marksAwarded = -adminNegativeMarks; // Use admin-configured negative marking
          status = "incorrect";
          incorrectAnswers++;
        } else if (correctSelectedCount === totalCorrectOptions) {
          // Full Marks: Use admin-configured positive marks if ALL correct options chosen
          marksAwarded = adminPositiveMarks; // Use admin-configured positive marks
          status = "correct";
          correctAnswersCount++;
        } else if (correctSelectedCount > 0) {
          // Partial Marks: Use admin-configured partial marking rules
          if (questionNegativeMarkingRule.partialMarkingEnabled && questionNegativeMarkingRule.partialMarkingRules) {
            // Use admin-configured partial marking rules
            if (totalCorrectOptions >= 4 && correctSelectedCount === 3) {
              marksAwarded = questionNegativeMarkingRule.partialMarkingRules.threeOutOfFour || 3;
            } else if (totalCorrectOptions >= 3 && correctSelectedCount === 2) {
              marksAwarded = questionNegativeMarkingRule.partialMarkingRules.twoOutOfThree || 2;
            } else if (totalCorrectOptions >= 2 && correctSelectedCount === 1) {
              marksAwarded = questionNegativeMarkingRule.partialMarkingRules.oneOutOfTwo || 1;
            } else {
              // Proportional based on admin positive marks for other scenarios
              marksAwarded = Math.floor((correctSelectedCount / totalCorrectOptions) * adminPositiveMarks);
            }
          } else {
            // Fallback: If partial marking not configured, use proportional marking
            marksAwarded = Math.floor((correctSelectedCount / totalCorrectOptions) * adminPositiveMarks);
          }
          status = "partially_correct";
          // Don't increment correctAnswersCount for partial marks
        } else {
          // This shouldn't happen, but fallback
          marksAwarded = 0;
          status = "unattempted";
          unattempted++;
        }
        
        finalScore += marksAwarded;
        questionAnalysis.push({
          questionId: question._id,
          status: status,
          marks: marksAwarded,
          userAnswer: normalizedUserAnswer,
          correctAnswer: normalizedCorrectAnswers,
          negativeMarkingRule: questionNegativeMarkingRule?.description || 'Unknown rule',
          mcmaDetails: {
            totalCorrectOptions: totalCorrectOptions,
            correctSelected: correctSelected.length,
            wrongSelected: wrongSelected.length,
            partialCredit: marksAwarded > 0 && marksAwarded < questionMarks
          }
        });
      } else {
        // MCQ (Single Choice) or Numerical logic with enhanced evaluation
        const evaluationResult = evaluateAnswerMatch(userAnswer, question.answer, question);
        
        if (evaluationResult.isMatch) {
          // Correct answer - use admin-configured positive marks
          finalScore += adminPositiveMarks;
          correctAnswersCount++;
          questionAnalysis.push({
            questionId: question._id,
            status: "correct",
            marks: adminPositiveMarks,
            userAnswer: evaluationResult.details?.userValue || userAnswer,
            correctAnswer: evaluationResult.details?.correctValue || question.answer,
            negativeMarkingRule: questionNegativeMarkingRule?.description || 'Unknown rule',
            evaluationType: evaluationResult.evaluationType,
            evaluationDetails: evaluationResult.details,
            isNumericalEvaluation: evaluationResult.evaluationType === 'numerical'
          });
        } else {
          // Incorrect answer - apply negative marking
          finalScore -= adminNegativeMarks;
          incorrectAnswers++;
          questionAnalysis.push({
            questionId: question._id,
            status: "incorrect",
            marks: -adminNegativeMarks,
            userAnswer: evaluationResult.details?.userValue || userAnswer,
            correctAnswer: evaluationResult.details?.correctValue || question.answer,
            negativeMarkingRule: questionNegativeMarkingRule?.description || 'Unknown rule',
            evaluationType: evaluationResult.evaluationType,
            evaluationDetails: evaluationResult.details,
            isNumericalEvaluation: evaluationResult.evaluationType === 'numerical',
            numericalDifference: evaluationResult.details?.difference
          });
        }
      }
    }
    console.timeEnd('QuestionScoring');

    // 4. Get exam-wide negative marking summary for legacy compatibility
    // OPTIMIZATION: Use first rule from bulk data instead of separate query
    const examNegativeMarkingRule = bulkMarkingRules.ruleMap.examWideRules.length > 0
      ? {
          source: "super_admin_default",
          negativeMarks: bulkMarkingRules.ruleMap.examWideRules[0].negativeMarks,
          positiveMarks: bulkMarkingRules.ruleMap.examWideRules[0].positiveMarks,
          description: bulkMarkingRules.ruleMap.examWideRules[0].description || "Exam-wide default rule"
        }
      : {
          source: "exam_specific",
          negativeMarks: exam.negativeMarks || 1,
          positiveMarks: 4,
          description: "Exam fallback rule"
        };

    // 5. Calculate subject-wise performance (OPTIMIZED - reuse bulk data)
    console.time('SubjectPerformanceCalculation');
    const subjectPerformance = {};
    
    for (let index = 0; index < exam.examQuestions.length; index++) {
      const question = exam.examQuestions[index];
      const subject = question.subject || 'Unknown';
      const questionResult = questionAnalysis[index];
      
      // OPTIMIZED: Get question-specific marking rule (no DB query - reuse bulk data)
      const questionNegativeMarkingRule = getNegativeMarkingRuleFromBulk(exam, question, bulkMarkingRules);
      const questionMaxMarks = questionNegativeMarkingRule.positiveMarks || question.marks || 4;
      
      if (!subjectPerformance[subject]) {
        subjectPerformance[subject] = {
          subject: subject,
          totalQuestions: 0,
          attempted: 0,
          correct: 0,
          incorrect: 0,
          unanswered: 0,
          marks: 0,
          totalMarks: 0,
          accuracy: 0
        };
      }
      
      const subjectStats = subjectPerformance[subject];
      subjectStats.totalQuestions++;
      subjectStats.totalMarks += questionMaxMarks;
      
      if (questionResult.status === 'correct' || questionResult.status === 'partially_correct') {
        subjectStats.attempted++;
        subjectStats.correct++;
        subjectStats.marks += questionResult.marks;
      } else if (questionResult.status === 'incorrect') {
        subjectStats.attempted++;
        subjectStats.incorrect++;
        subjectStats.marks += questionResult.marks; // This will be negative for incorrect answers
      } else {
        subjectStats.unanswered++;
      }
    }
    console.timeEnd('SubjectPerformanceCalculation');
    
    // Calculate accuracy and percentage for each subject - Fixed double rounding
    Object.values(subjectPerformance).forEach(subject => {
      subject.accuracy = safePercentage(subject.correct, subject.attempted, 2);
      subject.percentage = standardPercentage(subject.marks, subject.totalMarks, 2);
    });

    // 6. Create new exam result (do not overwrite)
    const examResult = new ExamResult({
      exam: examId,
      student: studentId,
      attemptNumber: previousAttempts + 1,
      answers,
      visitedQuestions,
      markedQuestions,
      warnings, // Save warnings count
      score: finalScore,
      totalMarks: exam.totalMarks || totalMarks,
      timeTaken,
      completedAt: new Date(completedAt),
      isOfflineSubmission,
      questionAnalysis,
      statistics: {
        correctAnswers: correctAnswersCount,
        incorrectAnswers,
        unattempted,
        accuracy: (correctAnswersCount / exam.examQuestions.length) * 100,
        totalQuestionsAttempted: correctAnswersCount + incorrectAnswers,
      },
      subjectPerformance: Object.values(subjectPerformance),
      negativeMarkingInfo: {
        ruleUsed: null, // College-specific rules no longer exist
        defaultRuleUsed: examNegativeMarkingRule.defaultRuleId,
        positiveMarks: examNegativeMarkingRule.positiveMarks || 4, // Include positive marks from marking rule
        negativeMarks: examNegativeMarkingRule.negativeMarks,
        ruleDescription: "Question-specific rules applied (see questionAnalysis for details)",
        ruleSource: examNegativeMarkingRule.source
      },
    });
    await examResult.save();
    // 7. Update exam with result
    exam.examResults.push(examResult._id);
    await exam.save();

    // Extract college details
    const collegeDetails = student.college ? {
      collegeName: student.college.collegeName,
      collegeCode: student.college.collegeCode,
      collegeLogo: student.college.collegeLogo,
      collegeLocation: student.college.collegeLocation
    } : null;


    return {
      success: true,
      message: "Exam submitted successfully",
      result: {
        score: finalScore,
        totalMarks: exam.totalMarks || totalMarks,
        percentage: ((finalScore / (exam.totalMarks || totalMarks)) * 100).toFixed(2),
        correctAnswers: correctAnswersCount,
        incorrectAnswers,
        unattempted,
        timeTaken,
        completedAt: examResult.completedAt,
        warnings, // Include warnings in the result
        questionAnalysis, // Include questionAnalysis in immediate response
        negativeMarkingRule: {
          negativeMarks: examNegativeMarkingRule.negativeMarks,
          description: "Question-specific rules applied",
          source: examNegativeMarkingRule.source
        },
        collegeDetails, // Add college details to result
      },
    };
  } catch (error) {
    console.error("Error submitting exam result:", error);
    return {
      success: false,
      message: "Error submitting exam result",
    };
  }
}

export async function getExamQuestions(examId) {
  /**
   * getExamQuestions(examId)
   * Flow:
   * 1. Validate exam ID
   * 2. Fetch exam with populated questions
   * 3. Return questions for caching
   */
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return {
        success: false,
        message: "Invalid exam ID",
      };
    }

    const exam = await Exam.findById(examId)
      .populate("examQuestions")
      .select("examQuestions examName examDurationMinutes totalMarks negativeMarks stream");

    if (!exam) {
      return {
        success: false,
        message: "Exam not found",
      };
    }

    // Calculate effective duration and validate
    const effectiveDuration = getEffectiveExamDuration(exam);
    const durationValidation = validateExamDuration(exam.stream, effectiveDuration);
    
    // Use JSON.parse(JSON.stringify()) to break circular references
    const cleanExam = JSON.parse(JSON.stringify({
      _id: exam._id,
      examName: exam.examName,
      examDurationMinutes: effectiveDuration, // Use effective duration
      totalMarks: exam.totalMarks,
      negativeMarks: exam.negativeMarks,
      stream: exam.stream,
      questions: exam.examQuestions,
      durationInfo: {
        configured: exam.examDurationMinutes,
        effective: effectiveDuration,
        validation: durationValidation
      }
    }));

    return {
      success: true,
      message: "Questions fetched successfully",
      exam: cleanExam,
    };
  } catch (error) {
    console.error("Error fetching exam questions:", error);
    return {
      success: false,
      message: "Error fetching exam questions",
    };
  }
}

export async function syncOfflineSubmissions(studentId, submissions) {
  /**
   * syncOfflineSubmissions(studentId, submissions)
   * Flow:
   * 1. Validate submissions array
   * 2. Process each submission
   * 3. Return sync results
   */
  try {
    await connectDB();

    if (!Array.isArray(submissions) || submissions.length === 0) {
      return {
        success: false,
        message: "No submissions to sync",
      };
    }

    const results = [];
    const errors = [];

    for (const submission of submissions) {
      try {
        const result = await submitExamResult({
          ...submission,
          studentId,
          isOfflineSubmission: true,
        });

        if (result.success) {
          results.push({
            examId: submission.examId,
            status: "synced",
            result: result.result,
          });
        } else {
          errors.push({
            examId: submission.examId,
            error: result.message,
          });
        }
      } catch (error) {
        errors.push({
          examId: submission.examId,
          error: error.message,
        });
      }
    }

    return {
      success: true,
      message: `Synced ${results.length} submissions successfully`,
      results,
      errors,
    };
  } catch (error) {
    console.error("Error syncing offline submissions:", error);
    return {
      success: false,
      message: "Error syncing offline submissions",
    };
  }
}

export async function getStudentExamResult(studentId, examId) {
  /**
   * getStudentExamResult(studentId, examId)
   * Flow:
   * 1. Validate student ID and exam ID
   * 2. Fetch specific exam result for student
   * 3. Return result with exam details
   */
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(examId)) {
      return {
        success: false,
        message: "Invalid student ID or exam ID",
      };
    }

    const result = await ExamResult.findOne({ 
      student: studentId,
      exam: examId 
    }).populate({
      path: "exam",
      select: "examName examSubject stream standard completedAt",
    }).populate({
      path: "negativeMarkingInfo.defaultRuleUsed", 
      select: "negativeMarks description stream standard subject examType isActive"  
    }).populate({
      path: "student",
      populate: {
        path: "college",
        select: "collegeName collegeCode collegeLogo collegeLocation"
      }
    });

    if (!result) {
      return {
        success: false,
        message: "No result found for this exam",
      };
    }

    // Properly serialize result to avoid circular references
    const resultObj = result.toObject();
    
    // Extract college details
    const collegeDetails = resultObj.student?.college ? {
      collegeName: resultObj.student.college.collegeName,
      collegeCode: resultObj.student.college.collegeCode,
      collegeLogo: resultObj.student.college.collegeLogo,
      collegeLocation: resultObj.student.college.collegeLocation
    } : null;

    
    const cleanResult = {
      _id: resultObj._id,
      exam: resultObj.exam,
      examName: resultObj.exam.examName,
      examSubject: resultObj.exam.examSubject,
      stream: resultObj.exam.stream,
      standard: resultObj.exam.standard,
      score: resultObj.score,
      totalMarks: resultObj.totalMarks,
      percentage: ((resultObj.score / resultObj.totalMarks) * 100).toFixed(2),
      timeTaken: resultObj.timeTaken,
      completedAt: resultObj.completedAt,
      isOfflineSubmission: resultObj.isOfflineSubmission,
      statistics: resultObj.statistics,
      questionAnalysis: resultObj.questionAnalysis,
      negativeMarkingInfo: resultObj.negativeMarkingInfo ? {
        negativeMarks: resultObj.negativeMarkingInfo.negativeMarks,
        ruleDescription: resultObj.negativeMarkingInfo.ruleDescription,
        ruleSource: resultObj.negativeMarkingInfo.ruleSource,
        ruleUsed: null, // College-specific rules no longer exist
        defaultRuleUsed: resultObj.negativeMarkingInfo.defaultRuleUsed ? {
          _id: resultObj.negativeMarkingInfo.defaultRuleUsed._id,
          negativeMarks: resultObj.negativeMarkingInfo.defaultRuleUsed.negativeMarks,
          description: resultObj.negativeMarkingInfo.defaultRuleUsed.description,
          stream: resultObj.negativeMarkingInfo.defaultRuleUsed.stream,
          standard: resultObj.negativeMarkingInfo.defaultRuleUsed.standard,
          subject: resultObj.negativeMarkingInfo.defaultRuleUsed.subject,
          examType: resultObj.negativeMarkingInfo.defaultRuleUsed.examType
        } : null
      } : null,
      collegeDetails, // Add college details to result
    };

    return {
      success: true,
      message: "Result fetched successfully",
      result: cleanResult,
    };
  } catch (error) {
    console.error("Error fetching student exam result:", error);
    return {
      success: false,
      message: "Error fetching exam result",
    };
  }
}

export async function getStudentExamResults(studentId) {
  /**
   * getStudentExamResults(studentId)
   * Flow:
   * 1. Validate student ID
   * 2. Fetch all exam results for student
   * 3. Return results with exam details
   */
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return {
        success: false,
        message: "Invalid student ID",
      };
    }

    const results = await ExamResult.find({ student: studentId })
      .populate({
        path: "exam",
        select: "examName examSubject stream standard completedAt",
      })
      .populate({
        path: "negativeMarkingInfo.defaultRuleUsed", 
        select: "negativeMarks description stream standard subject examType isActive"
      })
      .sort({ completedAt: -1 });

    // Properly serialize results to avoid circular references
    const cleanResults = results.map((result) => {
      const resultObj = result.toObject();
      return {
        _id: resultObj._id,
        exam: resultObj.exam,
        examName: resultObj.exam.examName,
        examSubject: resultObj.exam.examSubject,
        stream: resultObj.exam.stream,
        standard: resultObj.exam.standard,
        score: resultObj.score,
        totalMarks: resultObj.totalMarks,
        percentage: ((resultObj.score / resultObj.totalMarks) * 100).toFixed(2),
        timeTaken: resultObj.timeTaken,
        completedAt: resultObj.completedAt,
        isOfflineSubmission: resultObj.isOfflineSubmission,
        statistics: resultObj.statistics,
        questionAnalysis: resultObj.questionAnalysis,
        negativeMarkingInfo: resultObj.negativeMarkingInfo ? {
          negativeMarks: resultObj.negativeMarkingInfo.negativeMarks,
          ruleDescription: resultObj.negativeMarkingInfo.ruleDescription,
          ruleSource: resultObj.negativeMarkingInfo.ruleSource,
          ruleUsed: null, // College-specific rules no longer exist
          defaultRuleUsed: resultObj.negativeMarkingInfo.defaultRuleUsed ? {
            _id: resultObj.negativeMarkingInfo.defaultRuleUsed._id,
            negativeMarks: resultObj.negativeMarkingInfo.defaultRuleUsed.negativeMarks,
            description: resultObj.negativeMarkingInfo.defaultRuleUsed.description,
            stream: resultObj.negativeMarkingInfo.defaultRuleUsed.stream,
            standard: resultObj.negativeMarkingInfo.defaultRuleUsed.standard,
            subject: resultObj.negativeMarkingInfo.defaultRuleUsed.subject,
            examType: resultObj.negativeMarkingInfo.defaultRuleUsed.examType
          } : null
        } : null,
      };
    });

    return {
      success: true,
      message: "Results fetched successfully",
      results: cleanResults,
    };
  } catch (error) {
    console.error("Error fetching student exam results:", error);
    return {
      success: false,
      message: "Error fetching exam results",
    };
  }
}

export async function getAllExamAttempts(studentId, examId) {
  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(examId)) {
      return { success: false, message: "Invalid student ID or exam ID" };
    }
    const results = await ExamResult.find({ student: studentId, exam: examId })
      .sort({ completedAt: -1 })
      .lean();
    
    
    // Simple serialization without population for now
    const cleanResults = results.map((result) => {
      return {
        _id: result._id,
        score: result.score,
        totalMarks: result.totalMarks,
        percentage: ((result.score / result.totalMarks) * 100).toFixed(2),
        timeTaken: result.timeTaken,
        completedAt: result.completedAt,
        statistics: result.statistics,
        questionAnalysis: result.questionAnalysis,
        attemptNumber: result.attemptNumber,
        negativeMarkingInfo: result.negativeMarkingInfo ? {
          negativeMarks: result.negativeMarkingInfo.negativeMarks,
          ruleDescription: result.negativeMarkingInfo.ruleDescription,
          ruleSource: result.negativeMarkingInfo.ruleSource
        } : null
      };
    });
    
    return {
      success: true,
      attempts: cleanResults,
    };
  } catch (error) {
    console.error("getAllExamAttempts error:", error);
    return { success: false, message: "Error fetching attempts: " + error.message };
  }
}

export async function getEligibleExamsForStudent(studentId) {
  /**
   * getEligibleExamsForStudent(studentId)
   * Flow:
   * 1. Find all colleges where student is enrolled and approved
   * 2. Get all active exams from those colleges
   * 3. Check eligibility for each exam (stream, class, subject match)
   * 4. Return list of eligible exams with college information
   */
  try {
    await connectDB();

    // 1. Validate studentId
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return {
        success: false,
        message: "Invalid student ID",
      };
    }

    // 2. Find all enrollments for this student that are approved
    const enrollments = await EnrolledStudent.find({
      student: studentId,
      status: 'approved'
    }).populate('college');

    if (!enrollments || enrollments.length === 0) {
      return {
        success: true,
        message: "No college enrollments found",
        scheduledExams: [],
        practiceExams: [],
        totalExams: 0,
        enrollments: [],
      };
    }

    // 3. Get all college IDs where student is enrolled
    const collegeIds = enrollments.map(enrollment => enrollment.college._id);

    // 4. Find all exams from these colleges (include scheduled, completed, cancelled for scheduled availability)
    const allExams = await Exam.find({
      college: { $in: collegeIds },
      $or: [
        { examStatus: 'active', status: { $in: ['scheduled', 'completed', 'cancelled'] } },
        { examStatus: 'inactive', status: { $in: ['scheduled', 'completed', 'cancelled'] } }
      ]
    }).populate('college').populate('examQuestions');

    // 5. Check eligibility for each exam
    const eligibleExams = [];

    for (const exam of allExams) {
      // Find the enrollment for this exam's college
      const enrollment = enrollments.find(enr => 
        enr.college._id.toString() === exam.college._id.toString()
      );

      if (!enrollment) continue;

      // Check eligibility criteria
      const isStreamMatch = enrollment.allocatedStreams.includes(exam.stream);
      const isClassMatch = 
        enrollment.class === `${exam.standard}` ||
        enrollment.class === `${exam.standard}th`;

      // Check subject match - student should have all subjects required by the exam
      let isSubjectMatch = true;
      if (enrollment.allocatedSubjects && enrollment.allocatedSubjects.length > 0 && 
          exam.examSubject && exam.examSubject.length > 0) {
        // Check if all exam subjects are in student's allocated subjects
        isSubjectMatch = exam.examSubject.every(examSubject => 
          enrollment.allocatedSubjects.some(studentSubject => 
            // Case-insensitive comparison and handle variations
            studentSubject.toLowerCase() === examSubject.toLowerCase() ||
            // Handle common abbreviations
            (studentSubject.toLowerCase() === 'physics' && examSubject.toLowerCase() === 'phy') ||
            (studentSubject.toLowerCase() === 'phy' && examSubject.toLowerCase() === 'physics') ||
            (studentSubject.toLowerCase() === 'chemistry' && examSubject.toLowerCase() === 'chem') ||
            (studentSubject.toLowerCase() === 'chem' && examSubject.toLowerCase() === 'chemistry') ||
            (studentSubject.toLowerCase() === 'mathematics' && examSubject.toLowerCase() === 'math') ||
            (studentSubject.toLowerCase() === 'math' && examSubject.toLowerCase() === 'mathematics') ||
            (studentSubject.toLowerCase() === 'mathematics' && examSubject.toLowerCase() === 'maths') ||
            (studentSubject.toLowerCase() === 'maths' && examSubject.toLowerCase() === 'mathematics') ||
            (studentSubject.toLowerCase() === 'biology' && examSubject.toLowerCase() === 'bio') ||
            (studentSubject.toLowerCase() === 'bio' && examSubject.toLowerCase() === 'biology')
          )
        );
      }

      // Check if exam has questions
      const hasQuestions = exam.examQuestions && exam.examQuestions.length > 0;

      // Include exam if stream, class, and subjects match
      if (isStreamMatch && isClassMatch && isSubjectMatch) {
        // Check if student has already exhausted attempts
        const maxAttempts = exam.reattempt || 1;
        const previousAttempts = await ExamResult.countDocuments({ 
          exam: exam._id, 
          student: studentId 
        });

        const canAttempt = previousAttempts < maxAttempts && exam.examStatus === 'active' && hasQuestions;

        eligibleExams.push({
          _id: exam._id,
          examName: exam.examName,
          examInstructions: exam.examInstructions,
          examDurationMinutes: getEffectiveExamDuration(exam),
          totalMarks: exam.totalMarks,
          stream: exam.stream,
          standard: exam.standard,
          examSubject: exam.examSubject,
          startTime: exam.startTime,
          endTime: exam.endTime,
          reattempt: exam.reattempt,
          questionCount: exam.examQuestions.length,
          examAvailability: exam.examAvailability, // Add exam type
          examStatus: exam.examStatus, // Add exam status
          status: exam.status, // Add exam lifecycle status
          college: {
            _id: exam.college._id,
            collegeName: exam.college.collegeName,
            collegeCode: exam.college.collegeCode,
            collegeLogo: exam.college.collegeLogo,
          },
          eligibility: {
            canAttempt,
            attemptsUsed: previousAttempts,
            maxAttempts,
            isStreamMatch,
            isClassMatch,
            isSubjectMatch,
            hasQuestions,
            isActive: exam.examStatus === 'active',
            studentSubjects: enrollment.allocatedSubjects || []
          }
        });
      }
    }

    // 6. Separate scheduled and practice exams
    const scheduledExams = eligibleExams.filter(exam => exam.examAvailability === 'scheduled');
    const practiceExams = eligibleExams.filter(exam => exam.examAvailability === 'practice');

    // Sort scheduled exams by start time (upcoming first)
    scheduledExams.sort((a, b) => {
      if (a.startTime && b.startTime) {
        return new Date(a.startTime) - new Date(b.startTime);
      }
      return 0;
    });

    // Sort practice exams by exam name
    practiceExams.sort((a, b) => a.examName.localeCompare(b.examName));

    return {
      success: true,
      message: `Found ${eligibleExams.length} eligible exams (${scheduledExams.length} scheduled, ${practiceExams.length} practice)`,
      scheduledExams,
      practiceExams,
      totalExams: eligibleExams.length,
      enrollments: enrollments.map(enr => ({
        college: {
          _id: enr.college._id,
          collegeName: enr.college.collegeName,
          collegeCode: enr.college.collegeCode,
          collegeLogo: enr.college.collegeLogo,
        },
        class: enr.class,
        allocatedStreams: enr.allocatedStreams,
        status: enr.status
      }))
    };

  } catch (error) {
    console.error("Error fetching eligible exams:", error);
    return {
      success: false,
      message: `Error fetching eligible exams: ${error.message}`,
    };
  }
}

// Clear exam cache - useful for refreshing exam data
export async function clearExamCacheData(examId) {
  try {
    // Clear server-side cache for this exam
    clearExamCache(examId);
    
    return {
      success: true,
      message: "Exam cache cleared successfully"
    };
  } catch (error) {
    console.error("Error clearing exam cache:", error);
    return {
      success: false,
      message: `Error clearing exam cache: ${error.message}`
    };
  }
}

/**
 * EMERGENCY QUEUE SYSTEM - Check submission status
 * Allows students to track the processing status of their queued submissions
 */
export async function checkSubmissionStatus(submissionId) {
  try {
    const { getSubmissionStatus } = await import('../../utils/examSubmissionQueue.js');
    return await getSubmissionStatus(submissionId);
  } catch (error) {
    console.error("Error checking submission status:", error);
    return {
      success: false,
      message: "Error checking submission status: " + error.message,
      status: null
    };
  }
}

/**
 * EMERGENCY QUEUE SYSTEM - Get queue statistics (admin function)
 */
export async function getQueueStatistics() {
  try {
    const { getQueueStatistics } = await import('../../utils/examSubmissionQueue.js');
    return await getQueueStatistics();
  } catch (error) {
    console.error("Error getting queue statistics:", error);
    return {
      error: error.message
    };
  }
}

/**
 * EMERGENCY QUEUE SYSTEM - Retry failed submission (admin function)
 */
export async function retryFailedSubmission(submissionId) {
  try {
    const { retryFailedSubmission } = await import('../../utils/examSubmissionQueue.js');
    return await retryFailedSubmission(submissionId);
  } catch (error) {
    console.error("Error retrying failed submission:", error);
    return {
      success: false,
      message: "Error retrying submission: " + error.message
    };
  }
}

export async function validateExamAccess(examId, studentId) {
  "use server";
  try {
    await connectDB();

    // 1. Validate IDs
    if (!mongoose.Types.ObjectId.isValid(examId) || !mongoose.Types.ObjectId.isValid(studentId)) {
      return { 
        success: false, 
        message: "Invalid exam or student ID" 
      };
    }

    // 2. Get exam with UTC times from database
    const exam = await Exam.findById(examId).lean();
    if (!exam) {
      return { 
        success: false, 
        message: "Exam not found" 
      };
    }

    // 3. Only validate timing for scheduled exams
    if (exam.examAvailability === 'scheduled' && exam.startTime && exam.endTime) {
      const serverTimeUTC = new Date(); // Server time in UTC
      const examStartUTC = new Date(exam.startTime); // Database time is UTC
      const examEndUTC = new Date(exam.endTime); // Database time is UTC
      
      // 4. Apply 3-minute grace period before official start
      const gracePeriodMs = 3 * 60 * 1000; // 3 minutes in milliseconds
      const graceStartTime = new Date(examStartUTC.getTime() - gracePeriodMs);
      
      // Check if current server time is before the allowed start time
      if (serverTimeUTC < graceStartTime) {
        const timeRemainingMs = graceStartTime - serverTimeUTC;
        const minutesRemaining = Math.ceil(timeRemainingMs / (1000 * 60));
        
        return {
          success: false,
          message: `This exam will be available in ${minutesRemaining} minutes`,
          timeRemaining: timeRemainingMs,
          examStartTime: examStartUTC,
          serverTime: serverTimeUTC,
          violation: "TOO_EARLY"
        };
      }
      
      // Check if current server time is after exam end time
      if (serverTimeUTC > examEndUTC) {
        return {
          success: false,
          message: `This exam has ended`,
          examEndTime: examEndUTC,
          serverTime: serverTimeUTC,
          violation: "TOO_LATE"
        };
      }
    }

    // 5. Perform full eligibility check (includes all other validations)
    const eligibilityCheck = await checkExamEligibility({ examId, studentId });
    if (!eligibilityCheck.success) {
      return {
        success: false,
        message: eligibilityCheck.message,
        violation: "ELIGIBILITY_FAILED"
      };
    }

    // 6. Access granted
    return {
      success: true,
      message: "Access granted to exam",
      exam: exam,
      serverTime: new Date()
    };

  } catch (error) {
    console.error("Error validating exam access:", error);
    return { 
      success: false, 
      message: "Server error during validation. Please try again.",
      violation: "SERVER_ERROR"
    };
  }
}


