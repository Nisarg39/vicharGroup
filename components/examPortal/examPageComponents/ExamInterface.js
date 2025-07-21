"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import toast from "react-hot-toast"

// Import sub-components
import ExamHeader from "./examInterfaceComponents/ExamHeader"
import QuestionDisplay from "./examInterfaceComponents/QuestionDisplay"
import QuestionNavigator from "./examInterfaceComponents/QuestionNavigator"
import ExamNavigation from "./examInterfaceComponents/ExamNavigation"
import ExamStartScreen from "./examInterfaceComponents/ExamStartScreen"
import ContinueExamPrompt from "./examInterfaceComponents/ContinueExamPrompt"
import ConfirmSubmitModal from "./examInterfaceComponents/ConfirmSubmitModal"

export default function ExamInterface({ exam, questions, student, onComplete, isOnline }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState({})
    const [markedQuestions, setMarkedQuestions] = useState(new Set())
    const [timeLeft, setTimeLeft] = useState(exam?.examDurationMinutes * 60 || 0) // in seconds
    const [isExamStarted, setIsExamStarted] = useState(false)
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)
    const [examProgress, setExamProgress] = useState(null)
    const timerRef = useRef(null)
    const autoSaveRef = useRef(null)

    // Add state for continue exam prompt
    const [showContinuePrompt, setShowContinuePrompt] = useState(false);
    const [hasSavedProgress, setHasSavedProgress] = useState(false);

    // 1. Update the localStorage key to include both examId and studentId for uniqueness
    const progressKey = `exam_progress_${exam._id}_${student._id}`;

    // 2. Add state for startTime
    const [startTime, setStartTime] = useState(null);

    const currentQuestion = questions && questions.length > 0 ? questions[currentQuestionIndex] : null
    const totalQuestions = questions ? questions.length : 0
    const answeredQuestions = Object.keys(answers).length
    const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0

    // Debug logging
    useEffect(() => {
        console.log('ExamInterface Debug:', {
            questions: questions,
            currentQuestionIndex,
            currentQuestion,
            totalQuestions,
            exam
        })
    }, [questions, currentQuestionIndex, currentQuestion, totalQuestions, exam])

    // 3. Update loadExamProgress to restore startTime
    const loadExamProgress = useCallback(() => {
        try {
            const savedProgress = localStorage.getItem(progressKey);
            if (savedProgress) {
                const progress = JSON.parse(savedProgress);
                setAnswers(progress.answers || {});
                setCurrentQuestionIndex(progress.currentQuestionIndex || 0);
                setMarkedQuestions(new Set(progress.markedQuestions || []));
                setStartTime(progress.startTime || Date.now());
                // Calculate timeLeft based on startTime and duration
                const duration = (exam.examDurationMinutes || 0) * 60 * 1000;
                const now = Date.now();
                const calculatedTimeLeft = Math.max(Math.floor((progress.startTime + duration - now) / 1000), 0);
                setTimeLeft(calculatedTimeLeft);
                setIsExamStarted(true);
                toast.success("Previous progress loaded");
            }
        } catch (error) {
            console.error('Error loading exam progress:', error);
        }
    }, [progressKey, exam.examDurationMinutes]);

    // 4. Update saveExamProgress to save startTime
    const saveExamProgress = useCallback(() => {
        try {
            const progress = {
                answers,
                currentQuestionIndex,
                markedQuestions: Array.from(markedQuestions),
                timeLeft,
                startTime: startTime || Date.now(),
                lastSaved: new Date().toISOString()
            };
            localStorage.setItem(progressKey, JSON.stringify(progress));
            setExamProgress(progress);
        } catch (error) {
            console.error('Error saving exam progress:', error);
        }
    }, [answers, currentQuestionIndex, markedQuestions, timeLeft, progressKey, startTime]);

    // 1. On mount, always check for saved progress and restore answers, currentQuestionIndex, markedQuestions, startTime, and timeLeft before starting the timer.
    useEffect(() => {
        const savedProgress = localStorage.getItem(progressKey);
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            setAnswers(progress.answers || {});
            setCurrentQuestionIndex(progress.currentQuestionIndex || 0);
            setMarkedQuestions(new Set(progress.markedQuestions || []));
            setStartTime(progress.startTime || Date.now());
            // Calculate timeLeft based on startTime and duration
            const duration = (exam.examDurationMinutes || 0) * 60 * 1000;
            const now = Date.now();
            const calculatedTimeLeft = Math.max(Math.floor((progress.startTime + duration - now) / 1000), 0);
            setTimeLeft(calculatedTimeLeft);
            setIsExamStarted(true);
            toast.success("Previous progress loaded");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 2. On every answer change and question navigation, always call saveExamProgress
    useEffect(() => {
        if (isExamStarted) {
            saveExamProgress();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [answers, currentQuestionIndex, isExamStarted]);

    // 3. When starting a new exam, only reset state if there is no saved progress
    const startExam = () => {
        const savedProgress = localStorage.getItem(progressKey);
        if (!savedProgress) {
            const now = Date.now();
            setStartTime(now);
            setAnswers({});
            setCurrentQuestionIndex(0);
            setMarkedQuestions(new Set());
            setTimeLeft((exam.examDurationMinutes || 0) * 60);
        }
        setIsExamStarted(true);
        saveExamProgress();
        toast.success("Exam started! Good luck!");
    };

    // 6. Timer countdown: recalculate timeLeft based on startTime and duration
    useEffect(() => {
        if (isExamStarted && startTime && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                const duration = (exam.examDurationMinutes || 0) * 60 * 1000;
                const now = Date.now();
                const calculatedTimeLeft = Math.max(Math.floor((startTime + duration - now) / 1000), 0);
                setTimeLeft(calculatedTimeLeft);
                if (calculatedTimeLeft <= 0) {
                    handleAutoSubmit();
                }
            }, 1000);
            return () => {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
            };
        }
    }, [isExamStarted, startTime, exam.examDurationMinutes]);

    // 7. On exam submit, clear the saved progress as before
    const submitExam = () => {
        // Calculate score (basic implementation)
        let score = 0
        let totalMarks = 0

        questions.forEach(question => {
            const userAnswer = answers[question._id]
            if (userAnswer) {
                if (question.isMultipleAnswer) {
                    // Handle multiple answer questions
                    const correctAnswers = question.multipleAnswer || []
                    const isCorrect = Array.isArray(userAnswer) && 
                        userAnswer.length === correctAnswers.length &&
                        userAnswer.every(ans => correctAnswers.includes(ans))
                    if (isCorrect) score += question.marks || 4
                } else {
                    // Handle single answer questions
                    if (userAnswer === question.answer) {
                        score += question.marks || 4
                    }
                }
            }
            totalMarks += question.marks || 4
        })

        const examData = {
            answers,
            score,
            totalMarks,
            timeTaken: (exam.examDurationMinutes * 60) - timeLeft,
            completedAt: new Date().toISOString()
        }

        // Clear saved progress
        localStorage.removeItem(progressKey);
        
        onComplete(examData)
    }

    // Handle answer selection
    const handleAnswerChange = (questionId, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }))
    }

    // Handle multiple choice answers
    const handleMultipleAnswerChange = (questionId, option, isChecked) => {
        setAnswers(prev => {
            const currentAnswers = prev[questionId] || []
            if (isChecked) {
                return {
                    ...prev,
                    [questionId]: [...currentAnswers, option]
                }
            } else {
                return {
                    ...prev,
                    [questionId]: currentAnswers.filter(a => a !== option)
                }
            }
        })
    }

    // Toggle question marking
    const toggleMarkedQuestion = (questionIndex) => {
        setMarkedQuestions(prev => {
            const newSet = new Set(prev)
            if (newSet.has(questionIndex)) {
                newSet.delete(questionIndex)
            } else {
                newSet.add(questionIndex)
            }
            return newSet
        })
    }

    // Navigate to specific question
    const goToQuestion = (index) => {
        setCurrentQuestionIndex(index);
    }

    // Auto-submit when time expires
    const handleAutoSubmit = () => {
        toast.error("Time's up! Submitting exam automatically...")
        submitExam()
    }

    // 1. On mount, check for saved progress and show prompt if found
    useEffect(() => {
        const savedProgress = localStorage.getItem(progressKey);
        if (savedProgress && !isExamStarted) {
            setHasSavedProgress(true);
            setShowContinuePrompt(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 2. Handler for 'Continue Exam'
    const handleContinueExam = () => {
        loadExamProgress();
        setShowContinuePrompt(false);
    };

    // 3. Handler for 'Start New Exam'
    const handleStartNewExam = () => {
        localStorage.removeItem(progressKey);
        setAnswers({});
        setCurrentQuestionIndex(0);
        setMarkedQuestions(new Set());
        setTimeLeft(exam.examDurationMinutes * 60);
        setIsExamStarted(false);
        setShowContinuePrompt(false);
    };

    // Navigation handlers
    const handlePrevious = () => {
        setCurrentQuestionIndex(prev => Math.max(0, prev - 1))
    }

    const handleNext = () => {
        setCurrentQuestionIndex(prev => Math.min(totalQuestions - 1, prev + 1))
    }

    const handleToggleMarked = () => {
        toggleMarkedQuestion(currentQuestionIndex)
    }

    const handleSave = () => {
        saveExamProgress()
        toast.success("Progress saved!")
    }

    const handleSubmit = () => {
        setShowConfirmSubmit(true)
    }

    const handleConfirmSubmit = () => {
        setShowConfirmSubmit(false)
        submitExam()
    }

    const handleCancelSubmit = () => {
        setShowConfirmSubmit(false)
    }



    // 4. In the render logic, show the prompt if needed
    if (showContinuePrompt && hasSavedProgress && !isExamStarted) {
        return (
            <ContinueExamPrompt
                showContinuePrompt={showContinuePrompt}
                hasSavedProgress={hasSavedProgress}
                pendingExamStart={!isExamStarted}
                onContinueExam={handleContinueExam}
                onStartNewExam={handleStartNewExam}
            />
        );
    }

    if (!isExamStarted) {
        return (
            <ExamStartScreen
                exam={exam}
                totalQuestions={totalQuestions}
                onStartExam={startExam}
            />
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Header */}
            <ExamHeader
                exam={exam}
                student={student}
                isOnline={isOnline}
                timeLeft={timeLeft}
                answeredQuestions={answeredQuestions}
                totalQuestions={totalQuestions}
                progressPercentage={progressPercentage}
            />

            <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <QuestionDisplay
                            currentQuestion={currentQuestion}
                            currentQuestionIndex={currentQuestionIndex}
                            totalQuestions={totalQuestions}
                            markedQuestions={markedQuestions}
                            userAnswer={answers[currentQuestion?._id]}
                            onAnswerChange={handleAnswerChange}
                            onMultipleAnswerChange={handleMultipleAnswerChange}
                        />

                        {/* Navigation */}
                        <ExamNavigation
                            currentQuestionIndex={currentQuestionIndex}
                            totalQuestions={totalQuestions}
                            markedQuestions={markedQuestions}
                            onPrevious={handlePrevious}
                            onNext={handleNext}
                            onToggleMarked={handleToggleMarked}
                            onSave={handleSave}
                            onSubmit={handleSubmit}
                        />
                    </div>

                    {/* Sidebar - Question Navigator */}
                    <QuestionNavigator
                        questions={questions}
                        answers={answers}
                        markedQuestions={markedQuestions}
                        currentQuestionIndex={currentQuestionIndex}
                        onGoToQuestion={goToQuestion}
                    />
                </div>
            </div>

            {/* Confirm Submit Modal */}
            <ConfirmSubmitModal
                showConfirmSubmit={showConfirmSubmit}
                totalQuestions={totalQuestions}
                answeredQuestions={answeredQuestions}
                onCancel={handleCancelSubmit}
                onSubmit={handleConfirmSubmit}
            />
        </div>
    )
} 