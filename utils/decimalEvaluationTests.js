/**
 * Comprehensive Test Suite for Decimal Answer Evaluation
 * 
 * This file provides extensive test cases and examples for the decimal
 * evaluation system, covering edge cases and backward compatibility.
 * 
 * Author: Business Analyst - Educational Technology Expert  
 * Created: 2025-08-21
 */

import { 
    isPurelyNumerical, 
    normalizeNumericalValue,
    compareNumericalAnswers,
    evaluateAnswer,
    enhancedNormalizeAnswer 
} from './decimalAnswerEvaluator.js';
import { getEvaluationConfig } from './examEvaluationConfig.js';

/**
 * Test scenarios covering all edge cases mentioned in the user requirements
 */
export const DECIMAL_TEST_SCENARIOS = {
    // 1. Basic tolerance scenarios (11.3 should accept 11.32, 11.35)
    toleranceBasic: [
        {
            name: "Basic tolerance - correct answer 11.3",
            correctAnswer: "11.3",
            testCases: [
                { userAnswer: "11.3", shouldMatch: true, description: "Exact match" },
                { userAnswer: "11.32", shouldMatch: true, description: "Within 0.1 tolerance" },
                { userAnswer: "11.35", shouldMatch: true, description: "Within 0.1 tolerance" },
                { userAnswer: "11.2", shouldMatch: true, description: "Within 0.1 tolerance (lower)" },
                { userAnswer: "11.4", shouldMatch: true, description: "Within 0.1 tolerance (upper)" },
                { userAnswer: "11.5", shouldMatch: false, description: "Outside 0.1 tolerance" },
                { userAnswer: "11.1", shouldMatch: false, description: "Outside 0.1 tolerance" }
            ]
        }
    ],
    
    // 2. Precision differences (0.2 vs 0.20 vs 0.200)
    precisionDifferences: [
        {
            name: "Precision equivalence",
            correctAnswer: "0.2",
            testCases: [
                { userAnswer: "0.2", shouldMatch: true, description: "Exact match" },
                { userAnswer: "0.20", shouldMatch: true, description: "Trailing zero" },
                { userAnswer: "0.200", shouldMatch: true, description: "Multiple trailing zeros" },
                { userAnswer: ".2", shouldMatch: true, description: "No leading zero" },
                { userAnswer: "0.2000", shouldMatch: true, description: "Many trailing zeros" }
            ]
        }
    ],
    
    // 3. Alternative formats (.2 vs 0.2, 11 vs 11.0 vs 11.00)
    alternativeFormats: [
        {
            name: "Leading zero variations",
            correctAnswer: "0.5",
            testCases: [
                { userAnswer: "0.5", shouldMatch: true, description: "Standard format" },
                { userAnswer: ".5", shouldMatch: true, description: "No leading zero" },
                { userAnswer: "0.50", shouldMatch: true, description: "Trailing zero" }
            ]
        },
        {
            name: "Integer format variations", 
            correctAnswer: "11",
            testCases: [
                { userAnswer: "11", shouldMatch: true, description: "Integer format" },
                { userAnswer: "11.0", shouldMatch: true, description: "Integer with decimal" },
                { userAnswer: "11.00", shouldMatch: true, description: "Integer with decimals" },
                { userAnswer: "11.", shouldMatch: true, description: "Trailing decimal point" }
            ]
        }
    ],
    
    // 4. Scientific notation (1.23e-2 vs 0.0123)
    scientificNotation: [
        {
            name: "Scientific notation equivalence",
            correctAnswer: "0.0123",
            testCases: [
                { userAnswer: "0.0123", shouldMatch: true, description: "Standard decimal" },
                { userAnswer: "1.23e-2", shouldMatch: true, description: "Scientific notation lowercase" },
                { userAnswer: "1.23E-2", shouldMatch: true, description: "Scientific notation uppercase" },
                { userAnswer: "12.3e-3", shouldMatch: true, description: "Alternative scientific form" },
                { userAnswer: "0.123e-1", shouldMatch: true, description: "Another scientific form" }
            ]
        },
        {
            name: "Large number scientific notation",
            correctAnswer: "1200000",
            testCases: [
                { userAnswer: "1200000", shouldMatch: true, description: "Standard form" },
                { userAnswer: "1.2e6", shouldMatch: true, description: "Scientific notation" },
                { userAnswer: "1.2E6", shouldMatch: true, description: "Uppercase E" },
                { userAnswer: "12e5", shouldMatch: true, description: "Alternative form" }
            ]
        }
    ],
    
    // 5. Edge cases with very small and very large numbers
    edgeCases: [
        {
            name: "Very small numbers",
            correctAnswer: "1e-10",
            testCases: [
                { userAnswer: "1e-10", shouldMatch: true, description: "Exact match" },
                { userAnswer: "0.0000000001", shouldMatch: true, description: "Decimal form" },
                { userAnswer: "1.0e-10", shouldMatch: true, description: "With decimal" }
            ]
        },
        {
            name: "Very large numbers",
            correctAnswer: "1e10",
            testCases: [
                { userAnswer: "1e10", shouldMatch: true, description: "Scientific notation" },
                { userAnswer: "10000000000", shouldMatch: true, description: "Full decimal (if system handles)" }
            ]
        }
    ],
    
    // 6. Mixed content scenarios
    mixedContent: [
        {
            name: "Mixed content - should fall back to string comparison",
            correctAnswer: "12 units",
            testCases: [
                { userAnswer: "12 units", shouldMatch: true, description: "Exact string match" },
                { userAnswer: "12units", shouldMatch: false, description: "No space" },
                { userAnswer: "12.0 units", shouldMatch: false, description: "Different number format" },
                { userAnswer: "12", shouldMatch: false, description: "Number only" }
            ]
        }
    ],
    
    // 7. Negative numbers
    negativeNumbers: [
        {
            name: "Negative number handling",
            correctAnswer: "-5.2",
            testCases: [
                { userAnswer: "-5.2", shouldMatch: true, description: "Exact match" },
                { userAnswer: "-5.20", shouldMatch: true, description: "Trailing zero" },
                { userAnswer: "-5.25", shouldMatch: true, description: "Within tolerance" },
                { userAnswer: "-5.15", shouldMatch: true, description: "Within tolerance" },
                { userAnswer: "-5.35", shouldMatch: false, description: "Outside tolerance" }
            ]
        }
    ],
    
    // 8. Zero handling
    zeroHandling: [
        {
            name: "Zero variations",
            correctAnswer: "0",
            testCases: [
                { userAnswer: "0", shouldMatch: true, description: "Integer zero" },
                { userAnswer: "0.0", shouldMatch: true, description: "Decimal zero" },
                { userAnswer: "0.00", shouldMatch: true, description: "Multiple decimal zeros" },
                { userAnswer: "-0", shouldMatch: true, description: "Negative zero" },
                { userAnswer: "0.05", shouldMatch: true, description: "Within tolerance" },
                { userAnswer: "0.15", shouldMatch: false, description: "Outside tolerance" }
            ]
        }
    ]
};

/**
 * Backward compatibility test scenarios
 */
export const BACKWARD_COMPATIBILITY_TESTS = {
    mcqAnswers: [
        {
            name: "MCQ single choice",
            question: { userInputAnswer: false, isMultipleAnswer: false },
            correctAnswer: "A",
            testCases: [
                { userAnswer: "A", shouldMatch: true },
                { userAnswer: "a", shouldMatch: true },
                { userAnswer: "<p>A</p>", shouldMatch: true },
                { userAnswer: "B", shouldMatch: false }
            ]
        }
    ],
    mcmaAnswers: [
        {
            name: "MCMA multiple choice",
            question: { userInputAnswer: false, isMultipleAnswer: true },
            correctAnswer: ["A", "C"],
            testCases: [
                { userAnswer: ["A", "C"], shouldMatch: true },
                { userAnswer: ["C", "A"], shouldMatch: true },
                { userAnswer: ["A"], shouldMatch: false },
                { userAnswer: ["A", "B", "C"], shouldMatch: false }
            ]
        }
    ]
};

/**
 * Run a single test scenario
 */
export function runTestScenario(scenario, config = {}) {
    const results = [];
    
    scenario.testCases.forEach(testCase => {
        const question = { userInputAnswer: true }; // Numerical question
        const evaluationResult = evaluateAnswer(
            testCase.userAnswer, 
            scenario.correctAnswer, 
            question, 
            config
        );
        
        const passed = evaluationResult.isMatch === testCase.shouldMatch;
        
        results.push({
            ...testCase,
            actualResult: evaluationResult.isMatch,
            passed,
            method: evaluationResult.method,
            details: evaluationResult.details,
            difference: evaluationResult.difference
        });
    });
    
    return {
        scenarioName: scenario.name,
        totalTests: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        results
    };
}

/**
 * Run all test scenarios with a given configuration
 */
export function runAllTests(config = {}) {
    const allResults = {};
    
    // Run decimal test scenarios
    Object.entries(DECIMAL_TEST_SCENARIOS).forEach(([category, scenarios]) => {
        allResults[category] = scenarios.map(scenario => 
            runTestScenario(scenario, config)
        );
    });
    
    return allResults;
}

/**
 * Generate a test report
 */
export function generateTestReport(results) {
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    
    const report = {
        summary: {},
        categories: {},
        failures: []
    };
    
    Object.entries(results).forEach(([category, scenarios]) => {
        const categoryStats = {
            tests: 0,
            passed: 0,
            failed: 0,
            scenarios: []
        };
        
        scenarios.forEach(scenario => {
            totalTests += scenario.totalTests;
            totalPassed += scenario.passed;
            totalFailed += scenario.failed;
            
            categoryStats.tests += scenario.totalTests;
            categoryStats.passed += scenario.passed;
            categoryStats.failed += scenario.failed;
            categoryStats.scenarios.push(scenario);
            
            // Collect failures
            scenario.results.forEach(result => {
                if (!result.passed) {
                    report.failures.push({
                        category,
                        scenario: scenario.scenarioName,
                        testCase: result.description,
                        userAnswer: result.userAnswer,
                        expected: result.shouldMatch,
                        actual: result.actualResult,
                        method: result.method,
                        details: result.details
                    });
                }
            });
        });
        
        report.categories[category] = categoryStats;
    });
    
    report.summary = {
        totalTests,
        totalPassed,
        totalFailed,
        successRate: ((totalPassed / totalTests) * 100).toFixed(2) + '%'
    };
    
    return report;
}

/**
 * Example usage for manual testing
 */
export function runExampleTests() {
    console.log('Running decimal evaluation tests...\n');
    
    // Test with default configuration
    const defaultResults = runAllTests();
    const defaultReport = generateTestReport(defaultResults);
    
    console.log('=== DEFAULT CONFIGURATION RESULTS ===');
    console.log(`Total Tests: ${defaultReport.summary.totalTests}`);
    console.log(`Passed: ${defaultReport.summary.totalPassed}`);
    console.log(`Failed: ${defaultReport.summary.totalFailed}`);
    console.log(`Success Rate: ${defaultReport.summary.successRate}\n`);
    
    // Test with strict configuration
    const strictConfig = {
        mode: 'absolute',
        absoluteTolerance: 0.01,
        enableMultipleFormats: false
    };
    
    const strictResults = runAllTests(strictConfig);
    const strictReport = generateTestReport(strictResults);
    
    console.log('=== STRICT CONFIGURATION RESULTS ===');
    console.log(`Total Tests: ${strictReport.summary.totalTests}`);
    console.log(`Passed: ${strictReport.summary.totalPassed}`);
    console.log(`Failed: ${strictReport.summary.totalFailed}`);
    console.log(`Success Rate: ${strictReport.summary.successRate}\n`);
    
    // Show some failures for debugging
    if (defaultReport.failures.length > 0) {
        console.log('=== SAMPLE FAILURES (DEFAULT CONFIG) ===');
        defaultReport.failures.slice(0, 5).forEach(failure => {
            console.log(`${failure.category} - ${failure.scenario}`);
            console.log(`  Test: ${failure.testCase}`);
            console.log(`  User Answer: ${failure.userAnswer}`);
            console.log(`  Expected: ${failure.expected}, Got: ${failure.actual}`);
            console.log(`  Method: ${failure.method}`);
            console.log(`  Details: ${failure.details}\n`);
        });
    }
    
    return {
        default: defaultReport,
        strict: strictReport
    };
}

export default {
    DECIMAL_TEST_SCENARIOS,
    BACKWARD_COMPATIBILITY_TESTS,
    runTestScenario,
    runAllTests,
    generateTestReport,
    runExampleTests
};