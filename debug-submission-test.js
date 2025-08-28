// Quick test to verify debug logging is working in submission flow
// This will help identify where the submission is hanging

console.log("🔍 DEBUG TEST: Starting submission hang diagnosis...");

// Test 1: Check if submitProgressiveResultDirect is accessible
async function testSubmissionFlow() {
    try {
        console.log("📋 TEST 1: Testing submitProgressiveResultDirect import...");
        
        // Try to import the function
        const { submitProgressiveResultDirect } = await import('./server_actions/actions/examController/progressiveSubmissionHandler.js');
        
        console.log("✅ TEST 1 PASSED: submitProgressiveResultDirect imported successfully");
        
        console.log("📋 TEST 2: Testing function call with minimal data...");
        
        // Test with minimal data to see if it hangs
        const testData = {
            examId: "507f1f77bcf86cd799439011", // Dummy ObjectId
            studentId: "507f1f77bcf86cd799439012", // Dummy ObjectId
            answers: { "test": "A" },
            clientEvaluationResult: {
                finalScore: 4,
                totalMarks: 4,
                percentage: 100,
                correctAnswers: 1,
                incorrectAnswers: 0,
                unattempted: 0
            }
        };
        
        console.log("⏱️ TEST 2: About to call submitProgressiveResultDirect...");
        
        // Set a timeout to detect if it hangs
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error("TIMEOUT: submitProgressiveResultDirect hung after 5 seconds"));
            }, 5000);
        });
        
        const submitPromise = submitProgressiveResultDirect(testData);
        
        const result = await Promise.race([submitPromise, timeoutPromise]);
        
        console.log("✅ TEST 2 RESULT:", result);
        
    } catch (error) {
        if (error.message.includes("TIMEOUT")) {
            console.error("❌ HANG DETECTED: submitProgressiveResultDirect is hanging!");
            console.error("🔍 DIAGNOSIS: The issue is in submitProgressiveResultDirect function");
        } else {
            console.error("❌ TEST ERROR:", error.message);
            
            if (error.message.includes("Cannot read properties")) {
                console.error("🔍 DIAGNOSIS: Likely MongoDB connection or model issue");
            } else if (error.message.includes("dynamic import")) {
                console.error("🔍 DIAGNOSIS: Dynamic import issue in server action");
            } else {
                console.error("🔍 DIAGNOSIS: Other error -", error.message);
            }
        }
    }
}

// Test 3: Check if optimized endpoint is accessible
async function testOptimizedEndpoint() {
    try {
        console.log("📋 TEST 3: Testing optimized endpoint import...");
        
        const { submitOptimizedExamResult } = await import('./server_actions/actions/examController/optimizedSubmissionEndpoint.js');
        
        console.log("✅ TEST 3 PASSED: optimizedSubmissionEndpoint imported successfully");
        
    } catch (error) {
        console.error("❌ TEST 3 FAILED: optimized endpoint import failed:", error.message);
        console.error("🔍 DIAGNOSIS: This is likely the root cause of the hang!");
    }
}

// Run all tests
async function runAllTests() {
    console.log("🚀 Starting comprehensive submission hang diagnosis...");
    
    await testOptimizedEndpoint();
    await testSubmissionFlow();
    
    console.log("🏁 Diagnosis complete. Check logs above for hang location.");
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { testSubmissionFlow, testOptimizedEndpoint, runAllTests };
} else if (typeof window !== 'undefined') {
    window.debugSubmissionTest = { testSubmissionFlow, testOptimizedEndpoint, runAllTests };
}

// Auto-run if this script is executed directly
if (typeof require !== 'undefined' && require.main === module) {
    runAllTests();
}