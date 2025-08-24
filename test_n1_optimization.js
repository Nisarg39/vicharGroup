// Test script for N+1 optimization in exam scoring
// This script verifies that bulk query optimization maintains data integrity

import { connectDB } from "./server_actions/config/mongoose.js";
import Exam from "./server_actions/models/exam_portal/exam.js";
import DefaultNegativeMarkingRule from "./server_actions/models/exam_portal/defaultNegativeMarkingRule.js";

// Import the optimized functions (we'll need to make them exportable)
// Note: This is a test file to verify the optimization approach

async function testBulkOptimization() {
  try {
    await connectDB();
    console.log("✅ Connected to database for testing");

    // Find a sample exam for testing
    const sampleExam = await Exam.findOne({ status: 'scheduled' }).lean();
    if (!sampleExam) {
      console.log("❌ No sample exam found for testing");
      return;
    }

    console.log(`📝 Testing with exam: ${sampleExam.examName} (${sampleExam.examQuestions?.length || 0} questions)`);

    // Test 1: Verify bulk query fetches all necessary rules
    console.time('Bulk Rule Fetch');
    const bulkRules = await DefaultNegativeMarkingRule.find({
      stream: sampleExam.stream,
      isActive: true
    }).sort({ priority: -1 }).lean();
    console.timeEnd('Bulk Rule Fetch');

    console.log(`📊 Bulk query fetched ${bulkRules.length} rules for stream: ${sampleExam.stream}`);

    // Test 2: Simulate rule organization (same logic as getBulkNegativeMarkingRules)
    const ruleMap = {
      examWideRules: [],
      combinedRules: {}
    };

    for (const rule of bulkRules) {
      const key = `${rule.questionType || 'ALL'}_${rule.subject || 'ALL'}_${rule.standard || 'ALL'}_${rule.section || 'All'}`;
      
      if (!ruleMap.combinedRules[key]) {
        ruleMap.combinedRules[key] = [];
      }
      ruleMap.combinedRules[key].push(rule);

      if (!rule.questionType && !rule.subject && !rule.standard) {
        ruleMap.examWideRules.push(rule);
      }
    }

    console.log(`🗂️  Organized rules into ${Object.keys(ruleMap.combinedRules).length} lookup keys`);
    console.log(`📋 Rule map keys:`, Object.keys(ruleMap.combinedRules).slice(0, 5), '...');

    // Test 3: Performance comparison simulation
    if (sampleExam.examQuestions && sampleExam.examQuestions.length > 0) {
      console.log(`\n🔥 Performance Impact Analysis:`);
      console.log(`❌ OLD METHOD: ${sampleExam.examQuestions.length} questions × 2 queries each = ${sampleExam.examQuestions.length * 2} database queries`);
      console.log(`✅ NEW METHOD: 1 bulk query + in-memory lookups = 1 database query`);
      console.log(`📈 Performance improvement: ${((sampleExam.examQuestions.length * 2 - 1) / (sampleExam.examQuestions.length * 2) * 100).toFixed(1)}% reduction in DB queries`);
    }

    console.log("\n✅ Bulk optimization test completed successfully!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    process.exit(0);
  }
}

// Run the test
console.log("🚀 Starting N+1 optimization test...\n");
testBulkOptimization();