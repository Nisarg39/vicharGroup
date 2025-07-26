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
import { VicharCard } from "../../ui/vichar-card"
import { VicharButton } from "../../ui/vichar-button"
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs"
import { User, BookOpen, Info, Timer, CheckCircle, ListTodo, Star, Quote, Building2 } from "lucide-react"
import { useState as useStateReact } from "react"
import { getStudentDetails } from "../../../server_actions/actions/studentActions"

export default function ExamInterface({ exam, questions, student, onComplete, isOnline, onBack }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState({})
    const [markedQuestions, setMarkedQuestions] = useState(new Set())
    const [timeLeft, setTimeLeft] = useState(exam?.examDurationMinutes * 60 || 0) // in seconds
    const [isExamStarted, setIsExamStarted] = useState(false)
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)
    const [examProgress, setExamProgress] = useState(null)
    const timerRef = useRef(null)
    const autoSaveRef = useRef(null)
    const mainExamRef = useRef(null); // For fullscreen

    // Add state for continue exam prompt
    const [showContinuePrompt, setShowContinuePrompt] = useState(false);
    const [hasSavedProgress, setHasSavedProgress] = useState(false);

    // Track if exam is completed to avoid fullscreen warning after submit
    const examCompletedRef = useRef(false);

    // 1. Update the localStorage key to include both examId and studentId for uniqueness
    const progressKey = `exam_progress_${exam._id}_${student._id}`;

    // 2. Add state for startTime
    const [startTime, setStartTime] = useState(null);

    // --- SUBJECTWISE FILTERING ---
    // Get all unique subjects from questions
    const allSubjects = Array.from(new Set((questions || []).map(q => q.subject))).filter(Boolean);
    const [selectedSubject, setSelectedSubject] = useState(allSubjects[0] || "");

    // When switching subject tabs, reset currentQuestionIndex to 0
    useEffect(() => {
        setCurrentQuestionIndex(0);
    }, [selectedSubject]);

    // Filter questions by selected subject
    const subjectQuestions = (questions || []).filter(q => q.subject === selectedSubject);
    const currentQuestion = subjectQuestions && subjectQuestions.length > 0 ? subjectQuestions[currentQuestionIndex] : null;
    const totalQuestions = subjectQuestions ? subjectQuestions.length : 0;
    const answeredQuestions = Object.keys(answers).filter(qid => subjectQuestions.some(q => q._id === qid)).length;
    const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

    // For submit button logic
    const totalQuestionsAll = (questions || []).length;
    const answeredQuestionsAll = Object.keys(answers).filter(qid => (questions || []).some(q => q._id === qid)).length;
    const isLastSubject = allSubjects[allSubjects.length - 1] === selectedSubject;
    const isLastQuestion = currentQuestionIndex === (subjectQuestions.length - 1);
    // Only show submit button if:
    // (a) On last subject tab AND last question of that subject, OR
    // (b) At least half of all questions are answered AND on last subject tab
    const showSubmitButton = isLastSubject && (isLastQuestion || (answeredQuestionsAll >= Math.ceil(totalQuestionsAll / 2)));

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

    // --- FULLSCREEN LOGIC START ---
    // Helper to enter fullscreen
    const requestFullscreen = useCallback(() => {
        const elem = mainExamRef.current;
        if (elem && elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem && elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem && elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem && elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    }, []);

    // Helper to exit fullscreen
    const exitFullscreen = useCallback(() => {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }, []);

    // On exam start/continue, enter fullscreen
    useEffect(() => {
        if (isExamStarted) {
            requestFullscreen();
        }
    }, [isExamStarted, requestFullscreen]);

    // Listen for fullscreenchange: if exited, warn and force re-entry
    useEffect(() => {
        function handleFullscreenChange() {
            const isFull = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
            if (!isFull && isExamStarted && !examCompletedRef.current) {
                toast.error("You must stay in fullscreen during the exam! Returning to fullscreen...");
                setTimeout(() => {
                    requestFullscreen();
                }, 500);
            }
        }
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
        document.addEventListener("mozfullscreenchange", handleFullscreenChange);
        document.addEventListener("MSFullscreenChange", handleFullscreenChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
            document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
            document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
        };
    }, [isExamStarted, requestFullscreen]);

    // Block navigation away
    useEffect(() => {
        function handleBeforeUnload(e) {
            if (isExamStarted) {
                e.preventDefault();
                e.returnValue = "Are you sure you want to leave? Your exam will be lost.";
                return e.returnValue;
            }
        }
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [isExamStarted]);

    // On exam submit, exit fullscreen
    const submitExam = () => {
        examCompletedRef.current = true;
        exitFullscreen();
        // Calculate score (basic implementation)
        let score = 0
        let totalMarks = 0

        subjectQuestions.forEach(question => {
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
    // --- FULLSCREEN LOGIC END ---

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

    // College details state
    const [collegeDetails, setCollegeDetails] = useStateReact(null);

    useEffect(() => {
        if (student && student.college && typeof student.college === 'object' && student.college.collegeName) {
            setCollegeDetails(student.college);
        } else if (exam && exam.college && typeof exam.college === 'object' && exam.college.collegeName) {
            setCollegeDetails(exam.college);
        } else if (student && student.college && typeof student.college === 'string') {
            setCollegeDetails({ collegeName: 'College', collegeCode: student.college });
        } else if (exam && exam.college && typeof exam.college === 'string') {
            setCollegeDetails({ collegeName: 'College', collegeCode: exam.college });
        }
    }, [student, exam]);


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
                totalQuestions={totalQuestionsAll}
                onStartExam={startExam}
                onBack={onBack}
            />
        )
    }

    return (
        <div
            ref={mainExamRef}
            className="min-h-screen bg-white flex flex-col"
        >
            {/* Header */}
            <ExamHeader
                exam={exam}
                student={student}
                isOnline={isOnline}
                timeLeft={timeLeft}
                answeredQuestions={answeredQuestions}
                totalQuestions={totalQuestions}
                progressPercentage={progressPercentage}
                collegeDetails={collegeDetails}
            />

            <div className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 flex flex-col min-h-0">
                {/* Subject Tabs */}
                {allSubjects.length > 1 && (
                    <div className="mb-4 animate-slideUp" style={{animationDelay: '0.1s'}}>
                        <Tabs value={selectedSubject} onValueChange={setSelectedSubject} className="w-full">
                            <TabsList className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2 gap-2">
                                {allSubjects.map(subject => {
                                    const count = (questions || []).filter(q => q.subject === subject).length;
                                    return (
                                        <TabsTrigger 
                                            key={subject} 
                                            value={subject} 
                                            className="capitalize px-4 py-2 rounded-xl font-medium transition-all duration-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-100 text-sm"
                                        >
                                            {subject} ({count})
                                        </TabsTrigger>
                                    );
                                })}
                            </TabsList>
                        </Tabs>
                    </div>
                )}
                
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 min-h-0 animate-fadeIn" style={{animationDelay: '0.2s'}}>
                    {/* Main Content */}
                    <div className="lg:col-span-3 flex flex-col min-h-0 order-2 lg:order-1">
                        <VicharCard className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-100">
                                <QuestionDisplay
                                    currentQuestion={currentQuestion}
                                    currentQuestionIndex={currentQuestionIndex}
                                    totalQuestions={totalQuestions}
                                    markedQuestions={markedQuestions}
                                    userAnswer={answers[currentQuestion?._id]}
                                    onAnswerChange={handleAnswerChange}
                                    onMultipleAnswerChange={handleMultipleAnswerChange}
                                />
                            </div>
                        </VicharCard>
                        
                        {/* Navigation - Always visible at bottom */}
                        <div className="mt-4 animate-slideUp" style={{animationDelay: '0.3s'}}>
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4">
                                <ExamNavigation
                                    currentQuestionIndex={currentQuestionIndex}
                                    totalQuestions={totalQuestions}
                                    markedQuestions={markedQuestions}
                                    onPrevious={handlePrevious}
                                    onNext={handleNext}
                                    onToggleMarked={handleToggleMarked}
                                    onSave={handleSave}
                                    onSubmit={handleSubmit}
                                    VicharButton={VicharButton}
                                    showSubmitButton={showSubmitButton}
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Sidebar - Question Navigator */}
                    <div className="lg:col-span-1 flex flex-col min-h-0 order-1 lg:order-2 animate-slideUp" style={{animationDelay: '0.4s'}}>
                        <QuestionNavigator
                            questions={subjectQuestions}
                            answers={answers}
                            markedQuestions={markedQuestions}
                            currentQuestionIndex={currentQuestionIndex}
                            onGoToQuestion={goToQuestion}
                        />
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.6s ease-out forwards;
                }
                .animate-slideUp {
                    animation: slideUp 0.6s ease-out forwards;
                    opacity: 0;
                }
                /* Custom Scrollbar */
                .scrollbar-thin {
                    scrollbar-width: thin;
                }
                .scrollbar-thumb-blue-300::-webkit-scrollbar-thumb {
                    background-color: #93c5fd;
                    border-radius: 9999px;
                }
                .scrollbar-track-gray-100::-webkit-scrollbar-track {
                    background-color: #f3f4f6;
                    border-radius: 9999px;
                }
                .scrollbar-thin::-webkit-scrollbar {
                    width: 6px;
                }
            `}</style>

            {/* Confirm Submit Modal */}
            <ConfirmSubmitModal
                showConfirmSubmit={showConfirmSubmit}
                totalQuestions={totalQuestions}
                answeredQuestions={answeredQuestions}
                onCancel={handleCancelSubmit}
                onSubmit={handleConfirmSubmit}
                VicharButton={VicharButton}
            />
        </div>
    )
} 