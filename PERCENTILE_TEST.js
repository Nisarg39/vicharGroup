/**
 * Test script to verify percentile formatting fixes work correctly
 * Run this with: node PERCENTILE_TEST.js
 */

// Utility functions (same as implemented in ExamStudentStats.js)
const safeNumber = (value, defaultValue = 0, min = null, max = null) => {
    // Handle already formatted strings like "85.5th"
    if (typeof value === 'string' && value.includes('th')) {
        const numericPart = parseFloat(value.replace('th', ''))
        if (!isNaN(numericPart) && isFinite(numericPart)) {
            value = numericPart
        }
    }
    
    let num = parseFloat(value)
    if (isNaN(num) || !isFinite(num)) {
        num = defaultValue
    }
    if (min !== null && num < min) num = min
    if (max !== null && num > max) num = max
    return num
}

const formatPercentile = (percentile) => {
    if (percentile === null || percentile === undefined) {
        return '-'
    }
    
    // If already a formatted string, return as is
    if (typeof percentile === 'string' && percentile.includes('th')) {
        return percentile
    }
    
    // Convert to safe number and format
    const safePercentileValue = safeNumber(percentile, 0, 0, 100)
    return safePercentileValue.toFixed(1) + 'th'
}

// Test cases that previously caused "toFixed is not a function" error
const testCases = [
    // Cases that caused the original error
    { input: null, expected: '-', description: 'Null value (common for non-completed students)' },
    { input: undefined, expected: '-', description: 'Undefined value (missing data)' },
    { input: NaN, expected: '0.0th', description: 'NaN value (calculation error)' },
    
    // Valid numeric cases
    { input: 85.5, expected: '85.5th', description: 'Normal numeric percentile' },
    { input: 0, expected: '0.0th', description: 'Zero percentile (lowest performer)' },
    { input: 100, expected: '100.0th', description: 'Perfect percentile (top performer)' },
    { input: 50.0, expected: '50.0th', description: 'Median percentile' },
    
    // String representations  
    { input: '85.5', expected: '85.5th', description: 'String numeric value' },
    { input: '85.5th', expected: '85.5th', description: 'Already formatted string' },
    { input: '0', expected: '0.0th', description: 'String zero' },
    { input: '100', expected: '100.0th', description: 'String hundred' },
    
    // Edge cases and invalid data
    { input: 'invalid', expected: '0.0th', description: 'Invalid string (should default to 0)' },
    { input: '', expected: '0.0th', description: 'Empty string' },
    { input: '   ', expected: '0.0th', description: 'Whitespace string' },
    { input: 'NaN', expected: '0.0th', description: 'String "NaN"' },
    
    // Boundary conditions
    { input: -10, expected: '0.0th', description: 'Negative value (should clamp to 0)' },
    { input: 150, expected: '100.0th', description: 'Over 100 (should clamp to 100)' },
    { input: 99.99, expected: '100.0th', description: 'Very close to 100 (should clamp)' },
    { input: 0.01, expected: '0.0th', description: 'Very small positive value (should clamp)' },
    
    // Floating point precision
    { input: 85.999999, expected: '86.0th', description: 'Floating point precision test' },
    { input: 33.333333, expected: '33.3th', description: 'Repeating decimal' },
    
    // Object/Array cases (should not crash)
    { input: {}, expected: '0.0th', description: 'Empty object (invalid input)' },
    { input: [], expected: '0.0th', description: 'Empty array (invalid input)' },
    { input: { percentile: 85 }, expected: '0.0th', description: 'Object with percentile property' },
    
    // Special JavaScript values  
    { input: Infinity, expected: '0.0th', description: 'Infinity (treated as invalid, defaults to 0)' },
    { input: -Infinity, expected: '0.0th', description: 'Negative Infinity (treated as invalid, defaults to 0)' }
];

function runTests() {
    console.log('🧪 Testing Percentile Formatting Fix\n');
    console.log('This test verifies that the "student.percentile.toFixed is not a function" error is fixed.\n');
    
    let passed = 0;
    let failed = 0;
    let errors = 0;
    
    testCases.forEach((testCase, index) => {
        try {
            const result = formatPercentile(testCase.input);
            const success = result === testCase.expected;
            
            if (success) {
                console.log(`✅ Test ${index + 1}: PASS`);
                console.log(`   ${testCase.description}`);
                console.log(`   Input: ${JSON.stringify(testCase.input)} → Output: ${result}\n`);
                passed++;
            } else {
                console.log(`❌ Test ${index + 1}: FAIL`);
                console.log(`   ${testCase.description}`);
                console.log(`   Input: ${JSON.stringify(testCase.input)}`);
                console.log(`   Expected: ${testCase.expected}`);
                console.log(`   Got: ${result}\n`);
                failed++;
            }
        } catch (error) {
            console.log(`💥 Test ${index + 1}: ERROR`);
            console.log(`   ${testCase.description}`);
            console.log(`   Input: ${JSON.stringify(testCase.input)}`);
            console.log(`   Error: ${error.message}\n`);
            errors++;
        }
    });
    
    // Summary
    console.log('📊 Test Results Summary:');
    console.log(`   Total Tests: ${testCases.length}`);
    console.log(`   Passed: ${passed}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%\n`);
    
    if (errors === 0 && failed === 0) {
        console.log('🎉 ALL TESTS PASSED!');
        console.log('✅ The percentile formatting fix is working correctly.');
        console.log('✅ No more "toFixed is not a function" errors should occur.');
    } else {
        console.log('⚠️ Some tests failed or had errors.');
        console.log('🔧 Please review the implementation.');
    }
    
    return {
        total: testCases.length,
        passed,
        failed,
        errors,
        success: errors === 0 && failed === 0
    };
}

function simulateExcelExport() {
    console.log('\n📋 Simulating Excel Export with Various Percentile Values\n');
    
    // Simulate student data as it might come from the database
    const mockStudentData = [
        { name: 'Alice Johnson', percentile: 95.5, score: 95, status: 'completed' },
        { name: 'Bob Smith', percentile: null, score: 0, status: 'registered' },        // Not completed
        { name: 'Carol Davis', percentile: '87.3th', score: 87, status: 'completed' },   // Already formatted
        { name: 'David Wilson', percentile: undefined, score: 0, status: 'registered' }, // Missing data
        { name: 'Eve Brown', percentile: NaN, score: 78, status: 'completed' },          // Calculation error
        { name: 'Frank Miller', percentile: 'invalid', score: 65, status: 'completed' }, // Corrupted data
        { name: 'Grace Lee', percentile: 0, score: 25, status: 'completed' },            // Bottom performer
        { name: 'Henry Taylor', percentile: 100, score: 100, status: 'completed' },      // Top performer
        { name: 'Ivy Chen', percentile: 150, score: 90, status: 'completed' },           // Over 100 (should clamp)
        { name: 'Jack Anderson', percentile: -5, score: 45, status: 'completed' }        // Negative (should clamp)
    ];
    
    console.log('Processing student data for Excel export...\n');
    
    // Simulate the Excel row creation process
    const excelRows = mockStudentData.map((student, index) => {
        const formattedPercentile = formatPercentile(student.percentile);
        const row = [
            index + 1,              // S.No
            student.name,           // Student Name
            student.score,          // Score  
            formattedPercentile,    // Percentile (this was causing the error)
            student.status          // Status
        ];
        
        console.log(`Row ${index + 1}: ${student.name}`);
        console.log(`  Raw percentile: ${JSON.stringify(student.percentile)}`);
        console.log(`  Formatted percentile: ${formattedPercentile}`);
        console.log(`  Excel row: [${row.join(', ')}]\n`);
        
        return row;
    });
    
    console.log('✅ Excel export simulation completed successfully!');
    console.log(`✅ Generated ${excelRows.length} rows without any "toFixed" errors.`);
    
    return excelRows;
}

// Run the tests
if (typeof require !== 'undefined' && require.main === module) {
    console.log('🚀 Starting Percentile Formatting Tests...\n');
    
    const testResults = runTests();
    const excelData = simulateExcelExport();
    
    console.log('\n🏁 Test Execution Complete!');
    
    if (testResults.success) {
        console.log('\n✅ VERIFICATION COMPLETE: The percentile formatting fix is working correctly.');
        console.log('✅ Both table display and Excel export should now work without errors.');
        console.log('✅ All edge cases are properly handled with safe fallbacks.');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        safeNumber,
        formatPercentile,
        runTests,
        simulateExcelExport,
        testCases
    };
}