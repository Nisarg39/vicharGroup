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
import { User, BookOpen, Info, Timer, CheckCircle, ListTodo, Star, Quote, Building2, Grid, X } from "lucide-react"
import { useState as useStateReact } from "react"
import { getStudentDetails } from "../../../server_actions/actions/studentActions"
// Server auto-save removed - only saves locally until submission

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
    const mainExamRef = useRef(null); // For fullscreen
    const warningsShownRef = useRef(new Set()); // Track which warnings have been shown

    // Add state for continue exam prompt
    const [showContinuePrompt, setShowContinuePrompt] = useState(false);
    const [hasSavedProgress, setHasSavedProgress] = useState(false);

    // Track if exam is completed to avoid fullscreen warning after submit
    const examCompletedRef = useRef(false);

    // State for mobile floating question navigator
    const [showMobileNavigator, setShowMobileNavigator] = useState(false);
    const [warningCount, setWarningCount] = useState(0); // Track total warnings

    // 1. Update the localStorage key to include both examId and studentId for uniqueness
    const progressKey = `exam_progress_${exam._id}_${student._id}`;

    // 2. Add state for startTime
    const [startTime, setStartTime] = useState(null);

    // --- SUBJECTWISE FILTERING ---
    // Check if this is a JEE exam
    const isJeeExam = exam?.stream?.toLowerCase().includes('jee');
    
    // Check if this is a CET exam
    const isCetExam = exam?.stream?.toLowerCase().includes('cet');
    
    // Get all unique subjects from questions with competitive exam ordering (Physics, Chemistry, then others alphabetically)
    const allSubjects = (() => {
        const uniqueSubjects = Array.from(new Set((questions || []).map(q => q.subject))).filter(Boolean);
        const priorityOrder = ['Physics', 'Chemistry'];
        const orderedSubjects = [];
        
        // Add priority subjects first if they exist
        priorityOrder.forEach(subject => {
            if (uniqueSubjects.includes(subject)) {
                orderedSubjects.push(subject);
            }
        });
        
        // Add remaining subjects alphabetically
        const remainingSubjects = uniqueSubjects
            .filter(subject => !priorityOrder.includes(subject))
            .sort();
        
        return [...orderedSubjects, ...remainingSubjects];
    })();
    const [selectedSubject, setSelectedSubject] = useState(() => {
        // For CET exams, start with the first available (unlocked) subject
        if (isCetExam) {
            const availableSubject = allSubjects.find(subject => {
                const restrictedSubjects = ['Biology', 'Maths', 'Mathematics'];
                return !restrictedSubjects.some(restricted => 
                    subject.toLowerCase().includes(restricted.toLowerCase())
                );
            });
            return availableSubject || allSubjects[0] || "";
        }
        return allSubjects[0] || "";
    });

    // When switching subject tabs, reset currentQuestionIndex to 0
    useEffect(() => {
        setCurrentQuestionIndex(0);
    }, [selectedSubject]);

    // Prevent switching to locked subjects in CET exams
    const handleSubjectChange = (newSubject) => {
        if (isCetExam && cetAccess.subjectAccess && cetAccess.subjectAccess[newSubject]?.isLocked) {
            const remainingTime = Math.ceil(cetAccess.subjectAccess[newSubject].remainingTime / 1000 / 60);
            toast.error(`${newSubject} will be available in ${remainingTime} minutes`);
            return;
        }
        setSelectedSubject(newSubject);
    };

    // Filter and organize questions by selected subject
    // For JEE exams, organize by sections (A before B)
    const subjectQuestions = (() => {
        const filtered = (questions || []).filter(q => q.subject === selectedSubject);
        
        if (isJeeExam) {
            // Sort by section: Section A (1) before Section B (2), then by questionNumber
            return filtered.sort((a, b) => {
                // First sort by section (1 = Section A, 2 = Section B)
                const sectionA = a.section || 1; // Default to section 1 if null
                const sectionB = b.section || 1;
                
                if (sectionA !== sectionB) {
                    return sectionA - sectionB;
                }
                
                // Within same section, sort by question number
                return (a.questionNumber || 0) - (b.questionNumber || 0);
            });
        }
        
        return filtered;
    })();
    const currentQuestion = subjectQuestions && subjectQuestions.length > 0 ? subjectQuestions[currentQuestionIndex] : null;
    const totalQuestions = subjectQuestions ? subjectQuestions.length : 0;
    const answeredQuestions = Object.keys(answers).filter(qid => subjectQuestions.some(q => q._id === qid)).length;
    const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

    // Get current section information for JEE exams
    const getCurrentSectionInfo = () => {
        if (!isJeeExam || !currentQuestion) return null;
        
        const section = currentQuestion.section || 1;
        const sectionName = section === 1 ? 'A' : 'B';
        
        // Count questions in each section for current subject
        const sectionAQuestions = subjectQuestions.filter(q => (q.section || 1) === 1);
        const sectionBQuestions = subjectQuestions.filter(q => (q.section || 1) === 2);
        
        // Find position within current section
        const currentSectionQuestions = section === 1 ? sectionAQuestions : sectionBQuestions;
        const positionInSection = currentSectionQuestions.findIndex(q => q._id === currentQuestion._id) + 1;
        
        return {
            section,
            sectionName,
            positionInSection,
            totalInSection: currentSectionQuestions.length,
            sectionACount: sectionAQuestions.length,
            sectionBCount: sectionBQuestions.length
        };
    };

    const currentSectionInfo = getCurrentSectionInfo();

    // CET exam time-based subject access logic
    const getCetSubjectAccess = () => {
        if (!isCetExam || !startTime) return { allUnlocked: true };
        
        const currentTime = Date.now();
        const timeElapsed = currentTime - startTime; // in milliseconds
        const ninetyMinutes = 90 * 60 * 1000; // 90 minutes in milliseconds
        
        // Bio and Maths subjects are locked for first 90 minutes
        const restrictedSubjects = ['Biology', 'Maths', 'Mathematics'];
        const isTimeExpired = timeElapsed >= ninetyMinutes;
        
        const subjectAccess = {};
        allSubjects.forEach(subject => {
            const isRestricted = restrictedSubjects.some(restricted => 
                subject.toLowerCase().includes(restricted.toLowerCase())
            );
            subjectAccess[subject] = {
                isLocked: isRestricted && !isTimeExpired,
                remainingTime: isRestricted && !isTimeExpired ? ninetyMinutes - timeElapsed : 0
            };
        });
        
        return {
            allUnlocked: isTimeExpired,
            subjectAccess,
            totalWaitTime: ninetyMinutes,
            timeElapsed
        };
    };

    const cetAccess = getCetSubjectAccess();

    // For submit button logic
    const totalQuestionsAll = (questions || []).length;
    const answeredQuestionsAll = Object.keys(answers).filter(qid => (questions || []).some(q => q._id === qid)).length;
    const isLastSubject = allSubjects[allSubjects.length - 1] === selectedSubject;
    const isLastQuestion = currentQuestionIndex === (subjectQuestions.length - 1);
    // Submit button is now always available throughout the exam

    // Debug logging removed for security - do not log exam questions/answers

    // 3. Update loadExamProgress to restore startTime
    const loadExamProgress = useCallback(() => {
        try {
            const savedProgress = localStorage.getItem(progressKey);
            if (savedProgress) {
                const progress = JSON.parse(savedProgress);
                setAnswers(progress.answers || {});
                setWarningCount(progress.warningCount || 0); // Restore warning count
                
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

    // 4. Update saveExamProgress to save locally only
    const saveExamProgress = useCallback(async () => {
        try {
            const progress = {
                answers,
                currentQuestionIndex,
                selectedSubject, // Save selected subject
                markedQuestions: Array.from(markedQuestions),
                visitedQuestions: Array.from(visitedQuestions),
                timeLeft,
                startTime: startTime || Date.now(),
                warningCount, // Save warning count
                lastSaved: new Date().toISOString()
            };
            
            // Save to localStorage only - no server calls during exam
            localStorage.setItem(progressKey, JSON.stringify(progress));
            setExamProgress(progress);
            // Progress saved locally
        } catch (error) {
            console.error('Error saving exam progress:', error);
        }
    }, [answers, currentQuestionIndex, selectedSubject, markedQuestions, visitedQuestions, timeLeft, progressKey, startTime, warningCount]);

    // 1. On mount, always check for saved progress and restore answers, currentQuestionIndex, markedQuestions, startTime, and timeLeft before starting the timer.
    useEffect(() => {
        const savedProgress = localStorage.getItem(progressKey);
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            setAnswers(progress.answers || {});
            setWarningCount(progress.warningCount || 0); // Restore warning count
            
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

    // Force re-render every minute for CET exam time updates and check for unlocked subjects
    const [, forceUpdate] = useState({});
    const [previouslyLockedSubjects, setPreviouslyLockedSubjects] = useState(new Set());
    
    useEffect(() => {
        if (isCetExam && isExamStarted) {
            const interval = setInterval(() => {
                const currentAccess = getCetSubjectAccess();
                
                // Check if any previously locked subjects are now unlocked
                if (currentAccess.subjectAccess) {
                    const currentlyLocked = new Set();
                    const newlyUnlocked = [];
                    
                    Object.entries(currentAccess.subjectAccess).forEach(([subject, access]) => {
                        if (access.isLocked) {
                            currentlyLocked.add(subject);
                        } else if (previouslyLockedSubjects.has(subject)) {
                            newlyUnlocked.push(subject);
                        }
                    });
                    
                    // Show notification for newly unlocked subjects
                    if (newlyUnlocked.length > 0) {
                        toast.success(`🔓 ${newlyUnlocked.join(' & ')} ${newlyUnlocked.length > 1 ? 'are' : 'is'} now available!`);
                    }
                    
                    setPreviouslyLockedSubjects(currentlyLocked);
                }
                
                forceUpdate({});
            }, 60000); // Update every minute
            
            return () => clearInterval(interval);
        }
    }, [isCetExam, isExamStarted, previouslyLockedSubjects]);

    // Initialize locked subjects on exam start
    useEffect(() => {
        if (isCetExam && isExamStarted && cetAccess.subjectAccess) {
            const lockedSubjects = new Set();
            Object.entries(cetAccess.subjectAccess).forEach(([subject, access]) => {
                if (access.isLocked) {
                    lockedSubjects.add(subject);
                }
            });
            setPreviouslyLockedSubjects(lockedSubjects);
        }
    }, [isCetExam, isExamStarted]);

    // Check if current subject is locked and switch to available subject
    useEffect(() => {
        if (isCetExam && isExamStarted && cetAccess.subjectAccess && cetAccess.subjectAccess[selectedSubject]?.isLocked) {
            // Find first available subject
            const availableSubject = allSubjects.find(subject => 
                !cetAccess.subjectAccess[subject]?.isLocked
            );
            if (availableSubject && availableSubject !== selectedSubject) {
                setSelectedSubject(availableSubject);
                toast(`Switched to ${availableSubject} - ${selectedSubject} is still locked`);
            }
        }
    }, [isCetExam, isExamStarted, selectedSubject, cetAccess.subjectAccess, allSubjects]);

    // 2. Auto-save to localStorage only (no server calls during exam)
    useEffect(() => {
        if (isExamStarted) {
            // Save to localStorage only - no server calls until submission
            const progress = {
                answers,
                currentQuestionIndex,
                selectedSubject,
                markedQuestions: Array.from(markedQuestions),
                visitedQuestions: Array.from(visitedQuestions),
                timeLeft,
                startTime: startTime || Date.now(),
                warningCount,
                lastSaved: new Date().toISOString()
            };
            localStorage.setItem(progressKey, JSON.stringify(progress));
            setExamProgress(progress);
            // Progress saved locally
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
        // Clear any previous warnings for this exam session
        warningsShownRef.current.clear();
        saveExamProgress();
        toast.success("Exam started! Good luck!");
    };

    // 6. Timer countdown: recalculate timeLeft based on startTime and duration with warnings
    useEffect(() => {
        if (isExamStarted && startTime && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                const duration = (exam.examDurationMinutes || 0) * 60 * 1000;
                const now = Date.now();
                const calculatedTimeLeft = Math.max(Math.floor((startTime + duration - now) / 1000), 0);
                setTimeLeft(calculatedTimeLeft);
                
                // Show time warnings
                const warnings = [
                    { time: 300, message: "⚠️ 5 minutes remaining! Please review your answers.", type: "warning" }, // 5 minutes
                    { time: 60, message: "🚨 1 minute remaining! Exam will auto-submit soon.", type: "error" }, // 1 minute
                    { time: 30, message: "⏰ 30 seconds remaining! Auto-submit imminent.", type: "error" }, // 30 seconds
                    { time: 10, message: "🔥 10 seconds remaining! Submitting now...", type: "error" } // 10 seconds
                ];
                
                warnings.forEach(warning => {
                    if (calculatedTimeLeft === warning.time && !warningsShownRef.current.has(warning.time)) {
                        warningsShownRef.current.add(warning.time);
                        if (warning.type === "error") {
                            toast.error(warning.message, { duration: 4000 });
                        } else {
                            toast.warning(warning.message, { duration: 4000 });
                        }
                    }
                });
                
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
            element.requestFullscreen().then(() => {
                // Only close dialog after successful fullscreen entry
                setWarningDialog(false);
                warningIssuedRef.current = false;
            });
        } else if (element.mozRequestFullScreen) { // Firefox
            element.mozRequestFullScreen();
            // For older browsers without promise support, close after a delay
            setTimeout(() => {
                if (document.fullscreenElement) {
                    setWarningDialog(false);
                    warningIssuedRef.current = false;
                }
            }, 100);
        } else if (element.webkitRequestFullscreen) { // Chrome, Safari and Opera
            element.webkitRequestFullscreen();
            setTimeout(() => {
                if (document.fullscreenElement || document.webkitFullscreenElement) {
                    setWarningDialog(false);
                    warningIssuedRef.current = false;
                }
            }, 100);
        } else if (element.msRequestFullscreen) { // IE/Edge
            element.msRequestFullscreen();
            setTimeout(() => {
                if (document.fullscreenElement || document.msFullscreenElement) {
                    setWarningDialog(false);
                    warningIssuedRef.current = false;
                }
            }, 100);
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
    const warningIssuedRef = useRef(false); // Track if warning was already issued for current violation
    
    useEffect(() => {
        const handleVisibilityChange = () => {
            // Don't check for warnings if exam hasn't started yet
            if (!isExamStarted) {
                return;
            }
            
            // Don't show warning if exam is completed
            if (examCompletedRef.current) {
                setWarningDialog(false);
                return;
            }
            
            if (document.visibilityState !== 'visible' || !document.fullscreenElement || document.hasFocus() === false) {
                // Only increment warning count once per violation
                if (!warningIssuedRef.current) {
                    warningIssuedRef.current = true;
                    setWarningCount(prev => {
                        const newCount = prev + 1;
                        // Warning issued - count incremented
                        toast.error(`⚠️ Warning ${newCount}: Please stay in fullscreen mode`, { duration: 3000 });
                        return newCount;
                    });
                }
                setWarningDialog(true);
            }
            // Note: Dialog closing is now handled only by the enterFullScreen function
            // This prevents the dialog from auto-dismissing when conditions change
        };

        // Only add listeners if exam has started
        if (isExamStarted) {
            document.addEventListener('visibilitychange', handleVisibilityChange);
            document.addEventListener('fullscreenchange', handleVisibilityChange);
            window.addEventListener("resize", handleVisibilityChange);
            window.addEventListener("focus", handleVisibilityChange);
            window.addEventListener("blur", handleVisibilityChange);
        }

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
            if (isExamStarted && !examCompletedRef.current) {
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
        setWarningDialog(false); // Close warning dialog
        exitFullscreen();
        // Calculate score (basic implementation)
        let score = 0;
        let totalMarks = 0;

        // Calculate score for ALL questions, not just current subject
        (questions || []).forEach(question => {
            const userAnswer = answers[question._id];
            if (userAnswer) {
                if (question.isMultipleAnswer) {
                    // Handle multiple answer questions
                    const correctAnswers = question.multipleAnswer || [];
                    const isCorrect = Array.isArray(userAnswer) && 
                        userAnswer.length === correctAnswers.length &&
                        userAnswer.every(ans => correctAnswers.includes(ans));
                    if (isCorrect) score += question.marks || 4;
                } else {
                    // Handle single answer questions
                    if (userAnswer === question.answer) {
                        score += question.marks || 4;
                    }
                }
            }
            totalMarks += question.marks || 4;
        });

        const examData = {
            answers,
            score,
            totalMarks,
            timeTaken: (exam.examDurationMinutes * 60) - timeLeft,
            completedAt: new Date().toISOString(),
            visitedQuestions: Array.from(visitedQuestions),
            markedQuestions: Array.from(markedQuestions),
            warnings: warningCount // Include warnings in submission
        };

        // Clear saved progress
        localStorage.removeItem(progressKey);
        
        // Calling onComplete with exam submission data
        
        if (typeof onComplete === 'function') {
            onComplete(examData);
        } else {
            console.error('onComplete is not a function:', onComplete);
        }
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

    
    // Helper function to get global question index from subject-relative index
    const getGlobalQuestionIndex = (subjectRelativeIndex, subject) => {
        const subjectQuestions = (questions || []).filter(q => q.subject === subject);
        if (subjectQuestions.length === 0) return 0;
        
        const targetQuestion = subjectQuestions[subjectRelativeIndex];
        if (!targetQuestion) return 0;
        
        return questions.findIndex(q => q._id === targetQuestion._id);
    }
    
    // Handle navigation from QuestionNavigator (receives global index)
    const handleNavigatorGoToQuestion = (globalIndex) => {
        const targetQuestion = questions[globalIndex];
        if (!targetQuestion) return;
        
        // Switch to the subject of the target question
        if (targetQuestion.subject !== selectedSubject) {
            setSelectedSubject(targetQuestion.subject);
        }
        
        // Find the subject-relative index
        const subjectQuestions = (questions || []).filter(q => q.subject === targetQuestion.subject);
        const subjectRelativeIndex = subjectQuestions.findIndex(q => q._id === targetQuestion._id);
        
        if (subjectRelativeIndex !== -1) {
            setCurrentQuestionIndex(subjectRelativeIndex);
        }
    }

    // Auto-submit when time expires
    const handleAutoSubmit = () => {
        // Clear any existing timers
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        // Auto-save removed - only local storage during exam
        
        toast.error("⏰ Time's up! Your exam has been automatically submitted.", { 
            duration: 6000,
            style: {
                fontSize: '16px',
                fontWeight: 'bold'
            }
        });
        
        // Small delay to ensure toast is visible before submission
        setTimeout(() => {
            submitExam();
        }, 1000);
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
        // Clear warning tracking for new exam
        warningsShownRef.current.clear();
    };

    // Navigation handlers
    const handlePrevious = () => {
        setCurrentQuestionIndex(prev => Math.max(0, prev - 1))
    }

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            // Move to next question in current subject
            setCurrentQuestionIndex(prev => prev + 1)
        } else {
            // At last question of current subject, check if there's a next subject
            const currentSubjectIndex = allSubjects.indexOf(selectedSubject)
            if (currentSubjectIndex < allSubjects.length - 1) {
                // Move to first question of next subject
                const nextSubject = allSubjects[currentSubjectIndex + 1]
                setSelectedSubject(nextSubject)
                setCurrentQuestionIndex(0)
            }
        }
    }

    const handleToggleMarked = () => {
        const globalIndex = getGlobalQuestionIndex(currentQuestionIndex, selectedSubject)
        toggleMarkedQuestion(globalIndex)
    }

    const handleClear = () => {
        if (currentQuestion && currentQuestion._id) {
            setAnswers(prev => {
                const newAnswers = { ...prev }
                delete newAnswers[currentQuestion._id]
                return newAnswers
            })
            toast.success("Selection cleared!")
        }
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
                        <h3 className="text-lg font-semibold text-red-600 mb-4">
                            ⚠️ Warning #{warningCount + 1}
                        </h3>
                        <p className="text-gray-700 mb-2">
                            You have exited fullscreen mode or the exam window has lost focus. 
                            Please return to fullscreen mode to continue your exam safely.
                        </p>
                        <p className="text-sm text-red-500 mb-4">
                            Total warnings received: {warningCount}
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

            {/* Subject Tabs - Mobile Optimized */}
            {allSubjects.length > 1 && (
                <div className="w-full px-2 sm:px-3 py-2 bg-white border-b border-gray-200">
                    <Tabs value={selectedSubject} onValueChange={handleSubjectChange} className="w-full">
                        <TabsList className="w-full bg-gray-50 rounded-xl p-1 grid grid-flow-col auto-cols-fr gap-1 min-h-[48px]">
                            {allSubjects.map(subject => {
                                // Check if subject is locked for CET exams
                                const isLocked = isCetExam && cetAccess.subjectAccess && cetAccess.subjectAccess[subject]?.isLocked;
                                const remainingTime = isLocked ? Math.ceil(cetAccess.subjectAccess[subject].remainingTime / 1000 / 60) : 0;
                                
                                return (
                                    <TabsTrigger 
                                        key={subject} 
                                        value={subject} 
                                        disabled={isLocked}
                                        className={`capitalize px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 min-h-[40px] flex flex-col items-center justify-center ${
                                            isLocked 
                                                ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' 
                                                : 'data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-blue-50 data-[state=active]:hover:bg-blue-600'
                                        }`}
                                    >
                                        <span className="truncate text-center flex items-center gap-1">
                                            {isLocked && <span>🔒</span>}
                                            {subject}
                                        </span>
                                        {isLocked && (
                                            <span className="text-[10px] sm:text-xs opacity-80">
                                                {`${remainingTime}min`}
                                            </span>
                                        )}
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>
                    </Tabs>
                    
                    {/* JEE Section Progress Info */}
                    {isJeeExam && currentSectionInfo && currentSectionInfo.sectionBCount > 0 && (
                        <div className="mt-2 text-center">
                            <p className="text-xs text-gray-600">
                                Section {currentSectionInfo.sectionName}: Question {currentSectionInfo.positionInSection} of {currentSectionInfo.totalInSection}
                                {currentSectionInfo.section === 1 && (
                                    <span className="text-purple-600 font-medium"> • Section B will follow</span>
                                )}
                            </p>
                        </div>
                    )}
                    
                    {/* CET Time Restriction Info */}
                    {isCetExam && !cetAccess.allUnlocked && (
                        <div className="mt-2 text-center">
                            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                <p className="text-xs text-amber-700 font-medium">
                                    🔒 Bio & Maths papers will unlock in {Math.ceil((cetAccess.totalWaitTime - cetAccess.timeElapsed) / 1000 / 60)} minutes
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {/* Mobile Layout - Optimized for Phones */}
            <div className="lg:hidden flex flex-col h-screen relative transition-all duration-300">
                {/* Main Content Area - Scrollable */}
                <div className="flex-1 overflow-y-auto pb-safe" style={{paddingBottom: 'calc(160px + env(safe-area-inset-bottom))'}}>
                    {/* Question Display */}
                    <div className="bg-white mx-2 mt-2 rounded-2xl shadow-sm border border-gray-100">
                        <div className="p-3 sm:p-4">
                            <QuestionDisplay
                                currentQuestion={currentQuestion}
                                currentQuestionIndex={currentQuestionIndex}
                                totalQuestions={totalQuestions}
                                markedQuestions={markedQuestions}
                                userAnswer={answers[currentQuestion?._id]}
                                onAnswerChange={handleAnswerChange}
                                onMultipleAnswerChange={handleMultipleAnswerChange}
                                currentSectionInfo={currentSectionInfo}
                                isJeeExam={isJeeExam}
                            />
                        </div>
                    </div>
                </div>
                
                {/* Floating Question Navigator Button */}
                <button
                    onClick={() => setShowMobileNavigator(true)}
                    className="fixed bottom-24 right-4 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40 active:scale-95"
                    title="Question Navigator"
                >
                    <Grid className="w-6 h-6" />
                </button>
            </div>
            
            {/* Mobile Question Navigator Overlay - Outside blurred container */}
            {showMobileNavigator && (
                <div className="fixed z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto lg:hidden" 
                     style={{
                         top: 0,
                         left: 0,
                         right: 0,
                         bottom: 'calc(160px + env(safe-area-inset-bottom))'
                     }}>
                    <div className="bg-white rounded-2xl w-full max-w-md h-[75vh] flex flex-col relative">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowMobileNavigator(false)}
                            className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center z-10 transition-colors"
                            title="Close Navigator"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                        
                        {/* Question Navigator Content */}
                        <div className="flex-1 overflow-hidden min-h-0">
                            <QuestionNavigator
                                questions={questions}
                                answers={answers}
                                markedQuestions={markedQuestions}
                                currentQuestionIndex={getGlobalQuestionIndex(currentQuestionIndex, selectedSubject)}
                                onGoToQuestion={(index) => {
                                    handleNavigatorGoToQuestion(index);
                                    setShowMobileNavigator(false);
                                }}
                                isCetExam={isCetExam}
                                cetAccess={cetAccess}
                                isMobileOverlay={true}
                            />
                        </div>
                    </div>
                </div>
            )}
            
            {/* Sticky Navigation - Mobile Only */}
            <div className="lg:hidden">
                <ExamNavigation
                    currentQuestionIndex={currentQuestionIndex}
                    currentGlobalIndex={getGlobalQuestionIndex(currentQuestionIndex, selectedSubject)}
                    totalQuestions={totalQuestions}
                    markedQuestions={markedQuestions}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    onToggleMarked={handleToggleMarked}
                    onClear={handleClear}
                    onSubmit={handleSubmit}
                    VicharButton={VicharButton}
                    isOnLastSubject={isLastSubject}
                />
            </div>

            {/* Desktop Layout - Fixed Height to Prevent Scrolling */}
            <div className="hidden lg:flex lg:flex-col lg:h-screen lg:overflow-hidden">
                {/* Desktop Content Container with Proper Height Management */}
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="max-w-7xl mx-auto px-4 py-3 flex-1 flex flex-col min-h-0">
                        <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
                            {/* Main Content Area - Scrollable */}
                            <div className="col-span-8 flex flex-col min-h-0">
                                {/* Question Display - Optimized Height */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100vh-320px)] max-h-[600px] flex flex-col min-h-0 mb-3">
                                    <div className="p-4 lg:p-6 flex-1 overflow-y-auto">
                                        <QuestionDisplay
                                            currentQuestion={currentQuestion}
                                            currentQuestionIndex={currentQuestionIndex}
                                            totalQuestions={totalQuestions}
                                            markedQuestions={markedQuestions}
                                            userAnswer={answers[currentQuestion?._id]}
                                            onAnswerChange={handleAnswerChange}
                                            onMultipleAnswerChange={handleMultipleAnswerChange}
                                            currentSectionInfo={currentSectionInfo}
                                            isJeeExam={isJeeExam}
                                        />
                                    </div>
                                </div>
                                
                                {/* Navigation Controls - Fixed at Bottom */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 lg:p-4 flex-shrink-0">
                                    <ExamNavigation
                                        currentQuestionIndex={currentQuestionIndex}
                                        currentGlobalIndex={getGlobalQuestionIndex(currentQuestionIndex, selectedSubject)}
                                        totalQuestions={totalQuestions}
                                        markedQuestions={markedQuestions}
                                        onPrevious={handlePrevious}
                                        onNext={handleNext}
                                        onToggleMarked={handleToggleMarked}
                                        onClear={handleClear}
                                        onSubmit={handleSubmit}
                                        VicharButton={VicharButton}
                                        isOnLastSubject={isLastSubject}
                                                />
                                </div>
                            </div>
                            
                            {/* Sidebar - Question Navigator - Fixed Height */}
                            <div className="col-span-4 flex flex-col min-h-0">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100vh-200px)] flex flex-col min-h-0">
                                    <QuestionNavigator
                                        questions={questions}
                                        answers={answers}
                                        markedQuestions={markedQuestions}
                                        currentQuestionIndex={getGlobalQuestionIndex(currentQuestionIndex, selectedSubject)}
                                        onGoToQuestion={handleNavigatorGoToQuestion}
                                        isCetExam={isCetExam}
                                        cetAccess={cetAccess}
                                    />
                                </div>
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
                        scroll-behavior: smooth;
                    }
                    
                    /* Prevent zoom on inputs */
                    input, select, textarea {
                        font-size: 16px;
                        -webkit-appearance: none;
                        border-radius: 8px;
                    }
                    
                    /* Better touch targets */
                    button {
                        min-height: 44px;
                        min-width: 44px;
                        touch-action: manipulation;
                    }
                    
                    /* Safe area support for notched devices */
                    .safe-area-bottom {
                        padding-bottom: env(safe-area-inset-bottom);
                    }
                    
                    .pb-safe {
                        padding-bottom: calc(1rem + env(safe-area-inset-bottom));
                    }
                    
                    /* Exam container optimizations */
                    .exam-mode {
                        height: 100vh;
                        height: 100dvh; /* Dynamic viewport height */
                    }
                    
                    /* Better scrolling performance */
                    .overflow-y-auto {
                        overflow-y: scroll;
                        -webkit-overflow-scrolling: touch;
                    }
                    
                    /* Reduce layout shifts */
                    .rounded-2xl {
                        border-radius: 16px;
                    }
                    
                    /* Improve tap responsiveness */
                    .tap-highlight-none {
                        -webkit-tap-highlight-color: transparent;
                    }
                }
            `}</style>

            {/* Confirm Submit Modal */}
            <ConfirmSubmitModal
                showConfirmSubmit={showConfirmSubmit}
                totalQuestions={totalQuestionsAll}
                answeredQuestions={answeredQuestionsAll}
                onCancel={handleCancelSubmit}
                onSubmit={handleConfirmSubmit}
                VicharButton={VicharButton}
            />
        </div>
    )
} 