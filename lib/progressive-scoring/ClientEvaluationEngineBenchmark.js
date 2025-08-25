import { performance } from 'perf_hooks';
import { ClientEvaluationEngine } from './ClientEvaluationEngine';

class ClientEvaluationEngineBenchmark {
    constructor() {
        this.engine = new ClientEvaluationEngine();
        this.mockExamData = this.generateMockExamData(100); // 100-question exam
    }

    generateMockExamData(questionCount) {
        const questions = Array.from({ length: questionCount }, (_, index) => ({
            _id: `q${index + 1}`,
            type: index % 3 === 0 ? 'MCQ' : (index % 3 === 1 ? 'Numerical' : 'Integer'),
            subject: ['Physics', 'Chemistry', 'Mathematics'][index % 3],
            marks: 10,
            complexityLevel: ['easy', 'medium', 'hard'][index % 3]
        }));

        return {
            exam: {
                _id: 'benchmark_exam',
                stream: 'Science',
                standard: '12th',
                totalMarks: questionCount * 10,
                questions: questionCount
            },
            questions,
            student: {
                _id: 'benchmark_student',
                name: 'Performance Tester'
            }
        };
    }

    generateMockAnswers(questions) {
        return questions.reduce((answers, question) => {
            switch(question.type) {
                case 'MCQ':
                    answers[question._id] = { selectedOption: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)] };
                    break;
                case 'Numerical':
                    answers[question._id] = { value: Math.random() * 100 };
                    break;
                case 'Integer':
                    answers[question._id] = { value: Math.floor(Math.random() * 100) };
                    break;
            }
            return answers;
        }, {});
    }

    async runInitializationBenchmark() {
        console.log('🚀 Running Initialization Benchmark...');
        const start = performance.now();
        const result = await this.engine.initialize(this.mockExamData);
        const duration = performance.now() - start;

        console.log(`📊 Initialization Performance:`);
        console.log(`- Total Time: ${duration.toFixed(2)}ms`);
        console.log(`- Questions Loaded: ${result.questionsLoaded}`);
        console.log(`- Rules Preloaded: ${result.rulesPreloaded}`);

        return { duration, result };
    }

    async runSingleQuestionBenchmark() {
        console.log('🎯 Running Single Question Evaluation Benchmark...');
        const mockAnswers = this.generateMockAnswers(this.mockExamData.questions);
        const questionId = Object.keys(mockAnswers)[0];
        const answer = mockAnswers[questionId];

        const start = performance.now();
        const result = await this.engine.evaluateAnswerUpdate(questionId, answer);
        const duration = performance.now() - start;

        console.log(`📊 Single Question Evaluation Performance:`);
        console.log(`- Evaluation Time: ${duration.toFixed(2)}ms`);
        console.log(`- Success: ${result.success}`);
        console.log(`- Question ID: ${questionId}`);

        return { duration, result };
    }

    async runBatchEvaluationBenchmark() {
        console.log('🔄 Running Batch Evaluation Benchmark...');
        const mockAnswers = this.generateMockAnswers(this.mockExamData.questions);

        const start = performance.now();
        const result = await this.engine.evaluateBatchAnswers(mockAnswers);
        const duration = performance.now() - start;

        console.log(`📊 Batch Evaluation Performance:`);
        console.log(`- Total Time: ${duration.toFixed(2)}ms`);
        console.log(`- Questions Evaluated: ${result.totalAnswers}`);
        console.log(`- Success Rate: ${(result.successCount / result.totalAnswers * 100).toFixed(2)}%`);
        console.log(`- Average Time per Answer: ${result.averageTimePerAnswer.toFixed(2)}ms`);

        return { duration, result };
    }

    async runStatisticalAnalysisBenchmark() {
        console.log('📈 Running Statistical Analysis Benchmark...');
        const start = performance.now();
        const result = await this.engine.generateStatisticalAnalysis();
        const duration = performance.now() - start;

        console.log(`📊 Statistical Analysis Performance:`);
        console.log(`- Analysis Time: ${duration.toFixed(2)}ms`);
        console.log(`- Success: ${result.success}`);

        return { duration, result };
    }

    async runCompleteBenchmark() {
        console.log('🏁 Running Complete Client Evaluation Engine Benchmark...');
        
        const benchmarks = {
            initialization: await this.runInitializationBenchmark(),
            singleQuestion: await this.runSingleQuestionBenchmark(),
            batchEvaluation: await this.runBatchEvaluationBenchmark(),
            statisticalAnalysis: await this.runStatisticalAnalysisBenchmark()
        };

        console.log('\n🔬 Overall Benchmark Summary:');
        console.log(`- Initialization: ${benchmarks.initialization.duration.toFixed(2)}ms`);
        console.log(`- Single Question Eval: ${benchmarks.singleQuestion.duration.toFixed(2)}ms`);
        console.log(`- Batch Evaluation: ${benchmarks.batchEvaluation.duration.toFixed(2)}ms`);
        console.log(`- Statistical Analysis: ${benchmarks.statisticalAnalysis.duration.toFixed(2)}ms`);

        return benchmarks;
    }
}

// Run benchmarks
const benchmark = new ClientEvaluationEngineBenchmark();
benchmark.runCompleteBenchmark().then(
    results => console.log('Benchmark completed successfully'),
    error => console.error('Benchmark failed:', error)
);