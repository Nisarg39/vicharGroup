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
    const [visitedQuestions, setVisitedQuestions] = useState(new Set())
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
                
                // Fix: Restore selected subject first, then set question index
                if (progress.selectedSubject) {
                    setSelectedSubject(progress.selectedSubject);
                }
                
                // Reset to 0 to ensure proper loading, then set to saved index after subject is set
                setCurrentQuestionIndex(0);
                
                // Use setTimeout to ensure subject change completes first
                setTimeout(() => {
                    setCurrentQuestionIndex(progress.currentQuestionIndex || 0);
                }, 100);
                
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
                selectedSubject, // Save selected subject
                markedQuestions: Array.from(markedQuestions),
                visitedQuestions: Array.from(visitedQuestions),
                timeLeft,
                startTime: startTime || Date.now(),
                lastSaved: new Date().toISOString()
            };
            localStorage.setItem(progressKey, JSON.stringify(progress));
            setExamProgress(progress);
        } catch (error) {
            console.error('Error saving exam progress:', error);
        }
    }, [answers, currentQuestionIndex, selectedSubject, markedQuestions, visitedQuestions, timeLeft, progressKey, startTime]);

    // 1. On mount, always check for saved progress and restore answers, currentQuestionIndex, markedQuestions, startTime, and timeLeft before starting the timer.
    useEffect(() => {
        const savedProgress = localStorage.getItem(progressKey);
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            setAnswers(progress.answers || {});
            
            // Fix: Restore selected subject first, then set question index
            if (progress.selectedSubject) {
                setSelectedSubject(progress.selectedSubject);
            }
            
            // Reset to 0 to ensure proper loading, then set to saved index after subject is set
            setCurrentQuestionIndex(0);
            
            // Use setTimeout to ensure subject change completes first
            setTimeout(() => {
                setCurrentQuestionIndex(progress.currentQuestionIndex || 0);
            }, 100);
            
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

    // Mark initial question as visited when exam starts or when navigating
    useEffect(() => {
        if (isExamStarted && !visitedQuestions.has(currentQuestionIndex)) {
            setVisitedQuestions(prev => new Set([...prev, currentQuestionIndex]));
        }
    }, [isExamStarted, currentQuestionIndex, visitedQuestions]);

    // 2. On every answer change and question navigation, always call saveExamProgress
    useEffect(() => {
        if (isExamStarted) {
            saveExamProgress();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [answers, currentQuestionIndex, visitedQuestions, markedQuestions, isExamStarted]);

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
    const [warningDialog, setWarningDialog] = useState(false);

    // Function to request full-screen mode (exactly like reference)
    const enterFullScreen = () => {
        const element = document.documentElement; // Whole document
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) { // Firefox
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) { // Chrome, Safari and Opera
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) { // IE/Edge
            element.msRequestFullscreen();
        }
    };

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

    // On exam start/continue, enter fullscreen and hide navigation
    useEffect(() => {
        if (isExamStarted) {
            enterFullScreen();
            
            // Add exam-mode class to body for global navigation hiding
            document.body.classList.add('exam-mode');
            
            // Hide navigation elements during exam
            const navElements = document.querySelectorAll('nav, .navbar, .navigation, [role="navigation"]');
            navElements.forEach(nav => {
                nav.style.display = 'none';
            });
            
            // Hide header/top navigation if it exists
            const headerElements = document.querySelectorAll('header, .header, .top-nav');
            headerElements.forEach(header => {
                header.style.display = 'none';
            });
            
            // Hide any sidebar or menu elements
            const sidebarElements = document.querySelectorAll('.sidebar, .menu, .drawer, [role="menu"]');
            sidebarElements.forEach(sidebar => {
                sidebar.style.display = 'none';
            });
        }
        
        // Cleanup function to restore navigation when exam ends
        return () => {
            // Remove exam-mode class from body
            document.body.classList.remove('exam-mode');
            
            if (examCompletedRef.current) {
                const navElements = document.querySelectorAll('nav, .navbar, .navigation, [role="navigation"]');
                navElements.forEach(nav => {
                    nav.style.display = '';
                });
                
                const headerElements = document.querySelectorAll('header, .header, .top-nav');
                headerElements.forEach(header => {
                    header.style.display = '';
                });
                
                const sidebarElements = document.querySelectorAll('.sidebar, .menu, .drawer, [role="menu"]');
                sidebarElements.forEach(sidebar => {
                    sidebar.style.display = '';
                });
            }
        };
    }, [isExamStarted]);


    // Out of focus detection (exactly like reference)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState !== 'visible' || !document.fullscreenElement || document.hasFocus() === false) {
                setWarningDialog(true);
            } else {
                setWarningDialog(false);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('fullscreenchange', handleVisibilityChange);
        window.addEventListener("resize", handleVisibilityChange);
        window.addEventListener("focus", handleVisibilityChange);
        window.addEventListener("blur", handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('fullscreenchange', handleVisibilityChange);
            window.removeEventListener("resize", handleVisibilityChange);
            window.removeEventListener("focus", handleVisibilityChange);
            window.removeEventListener("blur", handleVisibilityChange);
        };
    }, [isExamStarted]);




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
            completedAt: new Date().toISOString(),
            visitedQuestions: Array.from(visitedQuestions),
            markedQuestions: Array.from(markedQuestions)
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
            className={`bg-gray-50 ${isExamStarted ? 'exam-mode' : ''}`}
        >
            {/* Warning Dialog */}
            {warningDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
                    <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-red-600 mb-4">⚠️ Warning</h3>
                        <p className="text-gray-700 mb-4">
                            You have exited fullscreen mode or the exam window has lost focus. 
                            Please return to fullscreen mode to continue your exam safely.
                        </p>
                        <button
                            onClick={enterFullScreen}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                        >
                            Return to Fullscreen
                        </button>
                    </div>
                </div>
            )}
            
            {/* Header */}
            <div className="w-full">
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
            </div>

            {/* Subject Tabs */}
            {allSubjects.length > 1 && (
                <div className="w-full px-3 py-2 bg-white border-b border-gray-200">
                    <Tabs value={selectedSubject} onValueChange={setSelectedSubject} className="w-full">
                        <TabsList className="w-full bg-gray-100 rounded-lg p-1 grid grid-flow-col auto-cols-fr gap-1">
                            {allSubjects.map(subject => {
                                const count = (questions || []).filter(q => q.subject === subject).length;
                                return (
                                    <TabsTrigger 
                                        key={subject} 
                                        value={subject} 
                                        className="capitalize px-2 py-1.5 rounded-md font-medium text-xs sm:text-sm transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
                                    >
                                        <span className="hidden sm:inline">{subject}</span>
                                        <span className="sm:hidden">{subject.slice(0, 4)}</span>
                                        <span className="ml-1">({count})</span>
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>
                    </Tabs>
                </div>
            )}
            
            {/* Mobile Layout - Simple and Clean */}
            <div className="lg:hidden">
                {/* Question Display */}
                <div className="bg-white mx-3 mt-3 rounded-xl shadow-sm border border-gray-200">
                    <div className="p-4">
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
                </div>
                
                {/* Navigation Buttons - Always at bottom */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 z-40 mt-4">
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
                
                {/* Question Navigator */}
                <div className="bg-white mx-3 mt-4 mb-20 rounded-xl shadow-sm border border-gray-200">
                    <QuestionNavigator
                        questions={subjectQuestions}
                        answers={answers}
                        markedQuestions={markedQuestions}
                        currentQuestionIndex={currentQuestionIndex}
                        onGoToQuestion={goToQuestion}
                    />
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="grid grid-cols-12 gap-6">
                        {/* Main Content Area */}
                        <div className="col-span-8 space-y-4">
                            {/* Question Display */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                <div className="p-6">
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
                            </div>
                            
                            {/* Navigation Controls */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
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
                        
                        {/* Sidebar - Question Navigator */}
                        <div className="col-span-4">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-6">
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
                </div>
            </div>

            <style jsx global>{`
                /* Hide ALL navigation elements during exam - including specific Navbar component */
                body.exam-mode nav,
                body.exam-mode nav.bg-white,
                body.exam-mode .navbar,
                body.exam-mode .navigation,
                body.exam-mode [role="navigation"],
                body.exam-mode header,
                body.exam-mode .header,
                body.exam-mode .top-nav,
                body.exam-mode .sidebar,
                body.exam-mode .menu,
                body.exam-mode .drawer,
                body.exam-mode [role="menu"],
                body.exam-mode .app-bar,
                body.exam-mode .toolbar,
                body.exam-mode .breadcrumb,
                body.exam-mode .breadcrumbs,
                /* Target the specific Navbar structure */
                body.exam-mode nav > div.container,
                body.exam-mode nav > div > div.flex {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    height: 0 !important;
                    overflow: hidden !important;
                    pointer-events: none !important;
                }
                
                /* Ensure exam container takes full screen */
                .exam-mode {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 99999;
                    overflow-y: auto;
                    background: #f9fafb;
                }
                
                /* Hide scrollbars during exam for cleaner look */
                body.exam-mode {
                    overflow: hidden;
                }
                
                /* Force hide any remaining navigation elements */
                body.exam-mode * {
                    max-width: 100% !important;
                }
                
                body.exam-mode nav *,
                body.exam-mode .navbar *,
                body.exam-mode header * {
                    display: none !important;
                }
                
                /* Mobile optimizations */
                @media (max-width: 1024px) {
                    /* Smooth scrolling */
                    * {
                        -webkit-overflow-scrolling: touch;
                    }
                    
                    /* Prevent zoom on inputs */
                    input, select, textarea {
                        font-size: 16px;
                    }
                    
                    /* Better touch targets */
                    button {
                        min-height: 44px;
                        min-width: 44px;
                    }
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