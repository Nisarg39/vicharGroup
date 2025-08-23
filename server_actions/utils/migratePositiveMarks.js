import mongoose from 'mongoose';
import ExamResult from '../models/exam_portal/examResult.js';
import DefaultNegativeMarkingRule from '../models/exam_portal/defaultNegativeMarkingRule.js';
import Exam from '../models/exam_portal/exam.js';

// Migration script to populate missing positiveMarks in exam results
async function migratePositiveMarks() {
  try {
    console.log('🚀 Starting migration to populate missing positiveMarks in exam results...');
    
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('📦 Connected to MongoDB');
    }

    // Find all exam results that are missing positiveMarks in negativeMarkingInfo
    const resultsWithoutPositiveMarks = await ExamResult.find({
      $or: [
        { 'negativeMarkingInfo.positiveMarks': { $exists: false } },
        { 'negativeMarkingInfo.positiveMarks': null },
        { 'negativeMarkingInfo.positiveMarks': undefined }
      ]
    }).populate('exam', 'stream standard examSubject positiveMarks marks');

    console.log(`📊 Found ${resultsWithoutPositiveMarks.length} exam results missing positiveMarks`);

    if (resultsWithoutPositiveMarks.length === 0) {
      console.log('✅ No migration needed - all exam results already have positiveMarks');
      return;
    }

    let migrated = 0;
    let failed = 0;

    for (const result of resultsWithoutPositiveMarks) {
      try {
        let positiveMarks = 1; // Default fallback for most competitive exams

        // Try to get the positive marks from the default rule (same logic as server)
        if (result.exam) {
          const exam = result.exam;
          
          // 1. Try to find matching DefaultNegativeMarkingRule
          const defaultRules = await DefaultNegativeMarkingRule.find({
            stream: exam.stream,
            isActive: true
          }).sort({ priority: -1 });

          let ruleFound = false;

          for (const rule of defaultRules) {
            // Check for subject and standard specific rule
            if (rule.subject && rule.standard) {
              const examSubjects = exam.examSubject || [];
              const normalizedExamSubjects = examSubjects.map(subj => 
                subj.toLowerCase().trim().replace(/\s+/g, ' ')
              );
              const normalizedRuleSubject = rule.subject.toLowerCase().trim().replace(/\s+/g, ' ');
              
              if (normalizedExamSubjects.includes(normalizedRuleSubject) && 
                  rule.standard === exam.standard) {
                positiveMarks = rule.positiveMarks || 1;
                ruleFound = true;
                break;
              }
            }
            // Check for standard-specific rule
            else if (!rule.subject && rule.standard) {
              if (rule.standard === exam.standard) {
                positiveMarks = rule.positiveMarks || 1;
                ruleFound = true;
                break;
              }
            }
            // Check for stream-wide rule
            else if (!rule.subject && !rule.standard) {
              positiveMarks = rule.positiveMarks || 1;
              ruleFound = true;
              break;
            }
          }

          // 2. Fallback to exam's positiveMarks or marks field
          if (!ruleFound) {
            positiveMarks = exam.positiveMarks || exam.marks || 1;
          }
        }

        // Update the exam result
        await ExamResult.updateOne(
          { _id: result._id },
          { 
            $set: { 
              'negativeMarkingInfo.positiveMarks': positiveMarks 
            } 
          }
        );

        migrated++;
        
        if (migrated % 100 === 0) {
          console.log(`📈 Progress: ${migrated}/${resultsWithoutPositiveMarks.length} migrated`);
        }

      } catch (error) {
        console.error(`❌ Failed to migrate result ${result._id}:`, error.message);
        failed++;
      }
    }

    console.log('\n🎉 Migration completed!');
    console.log(`✅ Successfully migrated: ${migrated} exam results`);
    console.log(`❌ Failed: ${failed} exam results`);
    
    if (failed > 0) {
      console.log('⚠️  Some migrations failed - check logs above for details');
    }

    // Verify the migration
    const stillMissing = await ExamResult.countDocuments({
      $or: [
        { 'negativeMarkingInfo.positiveMarks': { $exists: false } },
        { 'negativeMarkingInfo.positiveMarks': null },
        { 'negativeMarkingInfo.positiveMarks': undefined }
      ]
    });

    console.log(`🔍 Verification: ${stillMissing} exam results still missing positiveMarks`);
    
    if (stillMissing === 0) {
      console.log('🎊 Perfect! All exam results now have positiveMarks in negativeMarkingInfo');
    }

  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migratePositiveMarks()
    .then(() => {
      console.log('✅ Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

export default migratePositiveMarks;