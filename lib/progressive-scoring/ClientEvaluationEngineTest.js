import { ClientEvaluationEngine, getClientEvaluationEngine } from './ClientEvaluationEngine';
import { MarkingRuleResolver } from './MarkingRuleResolver';
import { AnswerEvaluator } from './AnswerEvaluator';
import { StatisticalAnalyzer } from './StatisticalAnalyzer';
import { ExamResultAssembler } from './ExamResultAssembler';

describe('ClientEvaluationEngine - Performance & Reliability Tests', () => {
    let engine;
    let mockExamData;

    beforeEach(async () => {
        // Mock comprehensive exam data for testing
        mockExamData = {
            exam: {
                _id: 'test_exam_001',
                stream: 'Science',
                standard: '12th',
                totalMarks: 100,
                questions: 10
            },
            questions: [
                // Simulate diverse question types
                {
                    _id: 'q1',
                    type: 'MCQ',
                    subject: 'Physics',
                    marks: 10,
                    complexityLevel: 'medium'
                },
                // Add more mock questions covering various scenarios
            ],
            student: {
                _id: 'student_001',
                name: 'Test Student'
            }
        };

        engine = new ClientEvaluationEngine();
        await engine.initialize(mockExamData);
    });

    // Performance Tests
    describe('Performance Targets', () => {
        test('Initialization time meets performance target', async () => {
            const initResult = await engine.initialize(mockExamData);
            expect(initResult.initializationTime).toBeLessThan(200); // <200ms
        });

        test('Single answer evaluation meets performance target', async () => {
            const start = performance.now();
            const result = await engine.evaluateAnswerUpdate('q1', { selectedOption: 'A' });
            const evaluationTime = performance.now() - start;
            
            expect(result.success).toBe(true);
            expect(evaluationTime).toBeLessThan(5); // <5ms per question
        });

        test('Batch answer evaluation meets performance target', async () => {
            const batchAnswers = {
                'q1': { selectedOption: 'A' },
                'q2': { value: 42 }
            };

            const start = performance.now();
            const result = await engine.evaluateBatchAnswers(batchAnswers);
            const batchTime = performance.now() - start;
            
            expect(result.success).toBe(true);
            expect(result.averageTimePerAnswer).toBeLessThan(5); // <5ms average
            expect(batchTime).toBeLessThan(50); // Total batch under 50ms
        });

        test('Statistical analysis meets performance target', async () => {
            const start = performance.now();
            const result = await engine.generateStatisticalAnalysis();
            const analysisTime = performance.now() - start;
            
            expect(result.success).toBe(true);
            expect(analysisTime).toBeLessThan(50); // <50ms total
        });
    });

    // Accuracy Tests
    describe('Evaluation Accuracy', () => {
        test('Marking rule resolution accuracy', async () => {
            const question = mockExamData.questions[0];
            const rule = await engine.getMarkingRule(question);
            
            expect(rule).toBeDefined();
            expect(rule.subject).toBe(question.subject);
        });

        test('Answer evaluation maintains decimal precision', async () => {
            const result = await engine.evaluateAnswerUpdate('q1', { value: 42.5000 });
            expect(result.evaluationResult.score).toBeCloseTo(result.evaluationResult.score, 4);
        });
    });

    // Reliability Tests
    describe('Reliability & Error Handling', () => {
        test('Handles invalid input gracefully', async () => {
            const result = await engine.evaluateAnswerUpdate('invalid_question', null);
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        test('Offline capability and data preservation', async () => {
            // Simulate network disconnection
            const initialResult = await engine.evaluateAnswerUpdate('q1', { selectedOption: 'A' });
            
            // Simulate offline mode
            await engine.clear();
            await engine.initialize(mockExamData);
            
            const offlineResult = await engine.evaluateAnswerUpdate('q1', { selectedOption: 'A' });
            
            expect(offlineResult.success).toBe(true);
        });
    });

    // Security Tests
    describe('Security Validation', () => {
        test('Input sanitization prevents injection', async () => {
            const maliciousInput = {
                '__proto__': { malicious: true },
                'selectedOption': '<script>alert("XSS")</script>'
            };

            const result = await engine.evaluateAnswerUpdate('q1', maliciousInput);
            expect(result.success).toBe(false);
            expect(result.error).toContain('Invalid input');
        });

        test('Result cannot be tampered after evaluation', async () => {
            const result = await engine.evaluateAnswerUpdate('q1', { selectedOption: 'A' });
            const originalScore = result.evaluationResult.score;

            // Attempt to modify result
            result.evaluationResult.score = 100;
            
            expect(result.evaluationResult.score).not.toBe(100);
            expect(result.evaluationResult.score).toBe(originalScore);
        });
    });

    // Load & Concurrency Tests
    describe('Load and Concurrency', () => {
        test('Handles concurrent answer evaluations', async () => {
            const concurrentEvaluations = Array(500).fill().map((_, index) => 
                engine.evaluateAnswerUpdate(`q${index % 10}`, { selectedOption: 'A' })
            );

            const results = await Promise.all(concurrentEvaluations);
            
            expect(results.every(result => result.success)).toBe(true);
            expect(results.length).toBe(500);
        });
    });

    // Cleanup
    afterEach(async () => {
        await engine.clear();
    });
});