/**
 * CRITICAL VERIFICATION TEST SUITE
 * Testing MHT-CET Subject Locking Fix Implementation
 * Business Analyst Verification - 2025-08-22
 */

import { getSubjectUnlockSchedule } from './utils/examDurationHelpers.js';

// Test scenarios based on requirements
const TEST_SCENARIOS = [
    {
        name: "Scheduled Exam - Normal Flow",
        exam: {
            examAvailability: 'scheduled',
            stream: 'MHT-CET',
            endTime: '2024-01-01T15:00:00', // 3:00 PM
        },
        studentStartTime: new Date('2024-01-01T12:00:00'), // 12:00 PM start
        testTime: new Date('2024-01-01T13:30:00'), // 1:30 PM (90min before end)
        expectedUnlock: true,
        description: "Should unlock Biology/Maths at 1:30 PM (90min before 3:00 PM end)"
    },
    {
        name: "Scheduled Exam - Late Start Edge Case",
        exam: {
            examAvailability: 'scheduled',
            stream: 'MHT-CET',
            endTime: '2024-01-01T15:00:00', // 3:00 PM
        },
        studentStartTime: new Date('2024-01-01T14:00:00'), // 2:00 PM start (1hr before end)
        testTime: new Date('2024-01-01T14:00:00'), // Test immediately at start
        expectedUnlock: true,
        description: "Should unlock immediately - less than 90min remaining"
    },
    {
        name: "Scheduled Exam - Before Unlock Time",
        exam: {
            examAvailability: 'scheduled',
            stream: 'MHT-CET',
            endTime: '2024-01-01T15:00:00', // 3:00 PM
        },
        studentStartTime: new Date('2024-01-01T12:00:00'), // 12:00 PM start
        testTime: new Date('2024-01-01T13:00:00'), // 1:00 PM (120min before end)
        expectedUnlock: false,
        description: "Should keep locked - more than 90min remaining"
    },
    {
        name: "Practice Exam - Normal Flow",
        exam: {
            examAvailability: 'practice',
            stream: 'MHT-CET',
            examDurationMinutes: 180
        },
        studentStartTime: new Date('2024-01-01T12:00:00'), // 12:00 PM start
        testTime: new Date('2024-01-01T13:30:00'), // 1:30 PM (90min after start)
        expectedUnlock: true,
        description: "Should unlock after 90min from start time"
    },
    {
        name: "Practice Exam - Before Unlock",
        exam: {
            examAvailability: 'practice',
            stream: 'MHT-CET',
            examDurationMinutes: 180
        },
        studentStartTime: new Date('2024-01-01T12:00:00'), // 12:00 PM start
        testTime: new Date('2024-01-01T13:00:00'), // 1:00 PM (60min after start)
        expectedUnlock: false,
        description: "Should keep locked - only 60min elapsed"
    },
    {
        name: "NEET Exam - No Locking",
        exam: {
            examAvailability: 'scheduled',
            stream: 'NEET',
            endTime: '2024-01-01T15:00:00'
        },
        studentStartTime: new Date('2024-01-01T12:00:00'),
        testTime: new Date('2024-01-01T12:01:00'),
        expectedUnlock: true,
        description: "NEET should have no subject restrictions"
    }
];

// Mock current time for testing
const originalDateNow = Date.now;

function runVerificationTests() {
    console.log('🔍 RUNNING CRITICAL MHT-CET VERIFICATION TESTS\n');
    console.log('='.repeat(60));
    
    let passed = 0;
    let failed = 0;
    
    TEST_SCENARIOS.forEach((scenario, index) => {
        console.log(`\n📋 Test ${index + 1}: ${scenario.name}`);
        console.log(`📝 ${scenario.description}`);
        
        // Mock current time to the test time
        Date.now = () => scenario.testTime.getTime();
        
        try {
            const result = getSubjectUnlockSchedule(scenario.exam, scenario.studentStartTime);
            
            // Check if Biology/Maths are unlocked (for MHT-CET)
            let actualUnlock = true;
            if (scenario.exam.stream === 'MHT-CET') {
                const biologyLocked = result.subjectAccess?.Biology?.isLocked || false;
                const mathsLocked = result.subjectAccess?.Mathematics?.isLocked || 
                                   result.subjectAccess?.Maths?.isLocked || false;
                actualUnlock = !biologyLocked && !mathsLocked;
            } else {
                // For non-MHT-CET, should always be unlocked
                actualUnlock = result.allUnlocked;
            }
            
            const testPassed = actualUnlock === scenario.expectedUnlock;
            
            if (testPassed) {
                console.log(`✅ PASSED - Expected: ${scenario.expectedUnlock}, Got: ${actualUnlock}`);
                passed++;
            } else {
                console.log(`❌ FAILED - Expected: ${scenario.expectedUnlock}, Got: ${actualUnlock}`);
                console.log(`   Result:`, JSON.stringify(result, null, 2));
                failed++;
            }
            
        } catch (error) {
            console.log(`💥 ERROR - ${error.message}`);
            failed++;
        }
    });
    
    // Restore original Date.now
    Date.now = originalDateNow;
    
    console.log('\n' + '='.repeat(60));
    console.log(`📊 VERIFICATION RESULTS:`);
    console.log(`✅ Passed: ${passed}/${TEST_SCENARIOS.length}`);
    console.log(`❌ Failed: ${failed}/${TEST_SCENARIOS.length}`);
    
    if (failed === 0) {
        console.log('\n🎉 ALL TESTS PASSED - IMPLEMENTATION IS CORRECT!');
        return true;
    } else {
        console.log('\n🚨 TESTS FAILED - IMPLEMENTATION HAS ISSUES!');
        return false;
    }
}

// Export for testing
export { runVerificationTests, TEST_SCENARIOS };

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runVerificationTests();
}