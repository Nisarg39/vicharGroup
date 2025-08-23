import mongoose from 'mongoose';
import ExamResult from '../models/exam_portal/examResult.js';
import DefaultNegativeMarkingRule from '../models/exam_portal/defaultNegativeMarkingRule.js';

// Test script to verify the positiveMarks fix is working correctly
async function testPositiveMarksFix() {
  try {
    console.log('🧪 Starting test to verify positiveMarks fix...');
    
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('📦 Connected to MongoDB');
    }

    // Test 1: Check database schema compliance
    console.log('\n📋 Test 1: Database Schema Compliance');
    const sampleResult = await ExamResult.findOne().populate('exam');
    if (sampleResult) {
      const hasPositiveMarksField = sampleResult.negativeMarkingInfo && 
                                   sampleResult.negativeMarkingInfo.positiveMarks !== undefined;
      console.log(`✅ Schema test: ${hasPositiveMarksField ? 'PASS' : 'FAIL'} - positiveMarks field exists`);
    } else {
      console.log('⚠️  No exam results found to test schema');
    }

    // Test 2: Coverage analysis
    console.log('\n📊 Test 2: Coverage Analysis');
    const totalResults = await ExamResult.countDocuments();
    const resultsWithPositiveMarks = await ExamResult.countDocuments({
      'negativeMarkingInfo.positiveMarks': { $exists: true, $ne: null }
    });
    const coverage = totalResults > 0 ? ((resultsWithPositiveMarks / totalResults) * 100).toFixed(1) : 0;
    
    console.log(`📈 Total exam results: ${totalResults}`);
    console.log(`✅ Results with positiveMarks: ${resultsWithPositiveMarks}`);
    console.log(`📋 Coverage: ${coverage}%`);
    
    if (coverage >= 99) {
      console.log('✅ Coverage test: PASS - Excellent coverage');
    } else if (coverage >= 90) {
      console.log('⚠️  Coverage test: WARNING - Good coverage but some missing');
    } else {
      console.log('❌ Coverage test: FAIL - Poor coverage');
    }

    // Test 3: Data consistency check
    console.log('\n🔍 Test 3: Data Consistency Check');
    const sampleResults = await ExamResult.find({
      'negativeMarkingInfo.positiveMarks': { $exists: true }
    }).populate('exam', 'stream examSubject').limit(10);

    let consistencyIssues = 0;
    for (const result of sampleResults) {
      const positiveMarks = result.negativeMarkingInfo.positiveMarks;
      
      // Check if positiveMarks is a valid number
      if (isNaN(positiveMarks) || positiveMarks <= 0) {
        console.log(`❌ Invalid positiveMarks in result ${result._id}: ${positiveMarks}`);
        consistencyIssues++;
      }
      
      // Check if positiveMarks is reasonable (between 0.25 and 10)
      if (positiveMarks < 0.25 || positiveMarks > 10) {
        console.log(`⚠️  Unusual positiveMarks in result ${result._id}: ${positiveMarks}`);
      }
    }

    if (consistencyIssues === 0) {
      console.log('✅ Consistency test: PASS - All sampled data is valid');
    } else {
      console.log(`❌ Consistency test: FAIL - Found ${consistencyIssues} issues`);
    }

    // Test 4: Rule matching verification
    console.log('\n🎯 Test 4: Rule Matching Verification');
    const neetBiologyRule = await DefaultNegativeMarkingRule.findOne({
      stream: 'NEET',
      subject: 'Biology',
      isActive: true
    });

    if (neetBiologyRule) {
      const neetBiologyResults = await ExamResult.find({
        'negativeMarkingInfo.positiveMarks': { $exists: true }
      }).populate({
        path: 'exam',
        match: { stream: 'NEET', examSubject: { $in: ['Biology'] } }
      }).limit(5);

      const filteredResults = neetBiologyResults.filter(r => r.exam);
      
      if (filteredResults.length > 0) {
        const expectedPositiveMarks = neetBiologyRule.positiveMarks;
        let matchingResults = 0;
        
        for (const result of filteredResults) {
          if (result.negativeMarkingInfo.positiveMarks === expectedPositiveMarks) {
            matchingResults++;
          }
        }
        
        const matchRate = (matchingResults / filteredResults.length * 100).toFixed(1);
        console.log(`📊 NEET Biology rule matching: ${matchingResults}/${filteredResults.length} (${matchRate}%)`);
        
        if (matchRate >= 80) {
          console.log('✅ Rule matching test: PASS - Good rule compliance');
        } else {
          console.log('⚠️  Rule matching test: WARNING - Some rules not matching');
        }
      } else {
        console.log('⚠️  No NEET Biology results found for rule matching test');
      }
    } else {
      console.log('⚠️  NEET Biology rule not found for verification');
    }

    // Test 5: Edge cases check
    console.log('\n🔧 Test 5: Edge Cases Check');
    
    // Check for null/undefined positiveMarks
    const nullPositiveMarks = await ExamResult.countDocuments({
      $or: [
        { 'negativeMarkingInfo.positiveMarks': null },
        { 'negativeMarkingInfo.positiveMarks': undefined }
      ]
    });
    
    // Check for zero positiveMarks
    const zeroPositiveMarks = await ExamResult.countDocuments({
      'negativeMarkingInfo.positiveMarks': 0
    });
    
    // Check for negative positiveMarks
    const negativePositiveMarks = await ExamResult.countDocuments({
      'negativeMarkingInfo.positiveMarks': { $lt: 0 }
    });

    console.log(`🔍 Null/undefined positiveMarks: ${nullPositiveMarks}`);
    console.log(`🔍 Zero positiveMarks: ${zeroPositiveMarks}`);
    console.log(`🔍 Negative positiveMarks: ${negativePositiveMarks}`);

    const edgeCaseIssues = nullPositiveMarks + negativePositiveMarks;
    if (edgeCaseIssues === 0) {
      console.log('✅ Edge cases test: PASS - No problematic edge cases found');
    } else {
      console.log(`❌ Edge cases test: FAIL - Found ${edgeCaseIssues} problematic edge cases`);
    }

    // Summary
    console.log('\n🎉 Test Summary');
    console.log('================');
    
    const tests = [
      sampleResult ? (sampleResult.negativeMarkingInfo?.positiveMarks !== undefined) : false,
      coverage >= 99,
      consistencyIssues === 0,
      edgeCaseIssues === 0
    ];
    
    const passedTests = tests.filter(Boolean).length;
    const totalTests = tests.length;
    
    console.log(`📊 Tests passed: ${passedTests}/${totalTests}`);
    
    if (passedTests === totalTests) {
      console.log('🎊 Overall result: ALL TESTS PASSED - Fix is working correctly!');
    } else if (passedTests >= totalTests * 0.8) {
      console.log('⚠️  Overall result: MOSTLY WORKING - Some minor issues to address');
    } else {
      console.log('❌ Overall result: ISSUES DETECTED - Fix needs attention');
    }

    // Recommendations
    console.log('\n💡 Recommendations:');
    if (coverage < 100) {
      console.log('- Run migration script to fix remaining exam results');
    }
    if (consistencyIssues > 0) {
      console.log('- Investigate data consistency issues in exam results');
    }
    if (edgeCaseIssues > 0) {
      console.log('- Clean up edge cases with null/negative positiveMarks');
    }
    if (passedTests === totalTests) {
      console.log('- ✅ All good! The fix is working perfectly.');
    }

  } catch (error) {
    console.error('💥 Test failed:', error);
    throw error;
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testPositiveMarksFix()
    .then(() => {
      console.log('✅ Test script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test script failed:', error);
      process.exit(1);
    });
}

export default testPositiveMarksFix;