/**
 * Integration Example: How to use the enhanced negative marking system
 * Shows how to integrate section-specific rules and auto-configuration
 */

import { autoConfigureExamRules, detectExamPattern, validateExamPattern } from './examPatternDetection.js';

/**
 * Example 1: Auto-configure rules for a JEE Advanced exam
 */
export async function exampleJeeAdvancedAutoConfig() {
  const examDetails = {
    examName: "JEE Advanced Physics Paper 1",
    examType: "JEE Advanced", 
    stream: "JEE",
    standard: "12",
    conductedBy: "IIT"
  };
  
  const adminId = "507f1f77bcf86cd799439011"; // Mock admin ID
  
  console.log("🔍 Detecting exam pattern...");
  const detectedPattern = detectExamPattern(examDetails);
  console.log("Detected:", detectedPattern);
  
  console.log("🚀 Auto-configuring rules...");
  const configResult = await autoConfigureExamRules(examDetails, adminId);
  console.log("Configuration result:", configResult);
  
  return configResult;
}

/**
 * Example 2: Manual pattern application for JEE Main
 */
export async function exampleJeeMainManualConfig() {
  const examDetails = {
    examName: "JEE Main Mock Test 1",
    stream: "JEE", 
    standard: "12"
  };
  
  // Would typically call createStandardRules() with JEE_MAIN pattern
  console.log("📋 Manual configuration for JEE Main pattern");
  console.log("Rules to apply:");
  console.log("- MCQ: +4 correct, -1 incorrect");
  console.log("- Numerical: +4 correct, 0 incorrect");
  
  return { success: true, message: "Manual configuration ready" };
}

/**
 * Example 3: Section-specific rule matching demonstration
 */
export function exampleSectionRuleMatching() {
  // Mock questions with different sections
  const questions = [
    {
      _id: "q1",
      subject: "Physics",
      section: 1, // Will map to "Section A"
      userInputAnswer: false,
      isMultipleAnswer: false
    },
    {
      _id: "q2", 
      subject: "Physics",
      section: 2, // Will map to "Section B" 
      userInputAnswer: true,
      isMultipleAnswer: false
    },
    {
      _id: "q3",
      subject: "Chemistry",
      // No section field - will default to "All"
      userInputAnswer: false,
      isMultipleAnswer: false
    }
  ];
  
  console.log("📊 Section Rule Matching Examples:");
  
  questions.forEach(question => {
    let questionType = question.userInputAnswer ? 'Numerical' : 
                      question.isMultipleAnswer ? 'MCMA' : 'MCQ';
    
    // Determine section
    let section = "All";
    if (question.section !== undefined && question.section !== null) {
      const sectionMap = { 1: "Section A", 2: "Section B", 3: "Section C" };
      section = sectionMap[question.section] || "All";
    }
    
    console.log(`${question._id}: ${questionType} in ${section}`);
    console.log(`  → Rule priority: Section + QuestionType + Subject matches first`);
    console.log(`  → Fallback: QuestionType + Subject, then broader rules`);
  });
  
  return { success: true, questions };
}

/**
 * Example 4: Backward compatibility demonstration
 */
export function exampleBackwardCompatibility() {
  console.log("🔄 Backward Compatibility Examples:");
  
  // Old style questions (no section)
  const oldQuestion = {
    _id: "old_q1",
    subject: "Mathematics",
    userInputAnswer: false,
    isMultipleAnswer: false
    // No section field
  };
  
  // New style questions (with section)
  const newQuestion = {
    _id: "new_q1", 
    subject: "Mathematics",
    userInputAnswer: false,
    isMultipleAnswer: false,
    section: 1 // Section A
  };
  
  console.log("Old question (no section):");
  console.log(`  → Defaults to section "All"`);
  console.log(`  → Uses existing rules without modification`);
  
  console.log("New question (with section):");
  console.log(`  → Maps to "Section A"`); 
  console.log(`  → Can use section-specific rules if available`);
  console.log(`  → Falls back to general rules if no section-specific rules exist`);
  
  return { 
    success: true, 
    compatibility: "Full backward compatibility maintained"
  };
}

/**
 * Example 5: Complete workflow for exam creation
 */
export async function exampleCompleteWorkflow() {
  console.log("🔧 Complete Exam Creation Workflow:");
  
  const examDetails = {
    examName: "JEE Advanced Mock Test - All Sections",
    examType: "JEE Advanced",
    stream: "JEE", 
    standard: "12",
    subjects: ["Physics", "Chemistry", "Mathematics"]
  };
  
  console.log("Step 1: Detect exam pattern");
  const pattern = detectExamPattern(examDetails);
  console.log(`✅ Detected: ${pattern?.detectedPattern || 'No standard pattern'}`);
  
  console.log("Step 2: Validate exam structure (mock)");
  // In real implementation, would call validateExamPattern with actual exam
  console.log("✅ Validation: Checking question types and sections");
  
  console.log("Step 3: Apply or suggest rules");
  if (pattern?.autoApplyRules) {
    console.log("✅ Auto-applying standard rules");
  } else {
    console.log("⚠️ Manual rule configuration required");
  }
  
  console.log("Step 4: Rule hierarchy example");
  console.log("Priority order (highest to lowest):");
  console.log("  1. Section + QuestionType + Subject + Standard");
  console.log("  2. Section + QuestionType + Subject");  
  console.log("  3. Section + QuestionType + Standard");
  console.log("  4. Section + QuestionType");
  console.log("  5. QuestionType + Subject + Standard");
  console.log("  6. QuestionType + Subject");
  console.log("  7. QuestionType + Standard");
  console.log("  8. QuestionType"); 
  console.log("  9. Section + Subject + Standard");
  console.log("  10. Section + Subject");
  console.log("  11. Section + Standard");
  console.log("  12. Section");
  console.log("  13. Subject + Standard");
  console.log("  14. Subject");
  console.log("  15. Standard");
  console.log("  16. Stream");
  console.log("  17. Exam fallback");
  
  return {
    success: true,
    workflow: "Complete workflow demonstrated"
  };
}

// Usage examples
if (import.meta.url === new URL(import.meta.url).href) {
  // Run examples if file is executed directly
  console.log("🚀 Running integration examples...\n");
  
  try {
    await exampleJeeAdvancedAutoConfig();
    console.log("\n" + "=".repeat(50) + "\n");
    
    await exampleJeeMainManualConfig(); 
    console.log("\n" + "=".repeat(50) + "\n");
    
    exampleSectionRuleMatching();
    console.log("\n" + "=".repeat(50) + "\n");
    
    exampleBackwardCompatibility();
    console.log("\n" + "=".repeat(50) + "\n");
    
    await exampleCompleteWorkflow();
    console.log("\n🎉 All examples completed successfully!");
    
  } catch (error) {
    console.error("❌ Example failed:", error);
  }
}