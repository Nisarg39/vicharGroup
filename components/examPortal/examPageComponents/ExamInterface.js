"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import toast from "react-hot-toast"

// Import sub-components
import ExamHeader from "./examInterfaceComponents/ExamHeader"
import QuestionDisplay from "./examInterfaceComponents/QuestionDisplay"
import QuestionNavigator from "./examInterfaceComponents/QuestionNavigator"
import ExamNavigation from "./examInterfaceComponents/ExamNavigation"
import ExamStartScreen from "./examInterfaceComponents/ExamStartScreen"
import ContinueExamPrompt from "./examInterfaceComponents/ContinueExamPrompt"
import ConfirmSubmitModal from "./examInterfaceComponents/ConfirmSubmitModal"
import ExamTimer from "./ExamTimer"

// PROGRESSIVE COMPUTATION: Import progressive scoring integration
import { useProgressiveScoring, ProgressiveScoreDisplay } from "../../../lib/progressive-scoring/ExamInterfaceIntegration"

// DIRECT STORAGE SYSTEM: Import enhanced submission handler for 15ms target
import { submitProgressiveResultDirect } from "../../../server_actions/actions/examController/progressiveSubmissionHandler"

// PERFORMANCE MONITORING: Import performance monitoring for 15ms target tracking
import { getPerformanceMonitor } from "../../../lib/progressive-scoring/PerformanceMonitor"

import { VicharCard } from "../../ui/vichar-card"
import { VicharButton } from "../../ui/vichar-button"
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs"
import { User, BookOpen, Info, Timer, CheckCircle, ListTodo, Star, Quote, Building2, Grid, X } from "lucide-react"
import { useState as useStateReact } from "react"
import { getStudentDetails } from "../../../server_actions/actions/studentActions"
import { getSubjectUnlockTime, getExamAccessRules, getSubjectUnlockSchedule } from "../../../utils/examDurationHelpers"
import { calculateRemainingTime, getEffectiveExamDuration } from "../../../utils/examTimingUtils"
// Progressive Computation System
import { handleProgressiveSubmission } from "../../../server_actions/actions/examController/progressiveSubmissionHandler"

// Removed: normalizeSubject function - now using consistent subject names from helper functions

// Removed: isRestrictedSubject function - now using proper helper functions from examDurationHelpers.js
// This ensures consistent subject restriction logic across the application

export default function ExamInterface({ exam, questions, student, onComplete, isOnline, onBack }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState({})
    const [markedQuestions, setMarkedQuestions] = useState(new Set())
    const [visitedQuestions, setVisitedQuestions] = useState(new Set())
    const [timeLeft, setTimeLeft] = useState(0) // Initialize to 0, let useEffect handle calculation
    const [isExamStarted, setIsExamStarted] = useState(false)
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)
    // Removed: examProgress state - simplified progress tracking
    const timerRef = useRef(null) // Used for cleanup, actual timer in ExamTimer component
    const mainExamRef = useRef(null); // For fullscreen
    const warningsShownRef = useRef(new Set()); // Track which warnings have been shown
    const timerInitializedRef = useRef(false); // Track if timer has been initialized

    // Add state for continue exam prompt
    const [showContinuePrompt, setShowContinuePrompt] = useState(false);
    const [hasSavedProgress, setHasSavedProgress] = useState(false);

    // Track if exam is completed to avoid fullscreen warning after submit
    const examCompletedRef = useRef(false);

    // State for mobile floating question navigator
    const [showMobileNavigator, setShowMobileNavigator] = useState(false);
    const [warningCount, setWarningCount] = useState(0); // Track total warnings

    // ENHANCED SUBMISSION FEEDBACK STATE
    const [submissionState, setSubmissionState] = useState({
        status: 'idle', // 'idle', 'submitting', 'success', 'error'
        message: '',
        performanceMetrics: null,
        showProgress: false,
        performanceBadge: null,
        submissionTime: 0
    });
    
    // ACCESSIBILITY: Focus management for submission modals
    const modalRef = useRef(null);
    
    // Handle keyboard navigation for modals
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Only handle keyboard events when modal is open
            if (submissionState.status === 'idle') return;
            
            // Handle Escape key for error modal
            if (event.key === 'Escape' && submissionState.status === 'error') {
                setSubmissionState({ 
                    status: 'idle', 
                    message: '', 
                    performanceMetrics: null, 
                    showProgress: false, 
                    performanceBadge: null, 
                    submissionTime: 0 
                });
                return;
            }
            
            // Handle Tab key for focus trapping in error modal
            if (event.key === 'Tab' && submissionState.status === 'error') {
                const modal = modalRef.current;
                if (!modal) return;
                
                const focusableElements = modal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                if (event.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        event.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        event.preventDefault();
                    }
                }
            }
        };
        
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [submissionState.status]);
    
    // Focus management when modals open/close
    useEffect(() => {
        if (submissionState.status === 'error' && modalRef.current) {
            // Focus the first button in error modal
            const firstButton = modalRef.current.querySelector('button');
            if (firstButton) {
                setTimeout(() => firstButton.focus(), 100);
            }
        }
    }, [submissionState.status]);

    // PROGRESSIVE COMPUTATION: Initialize progressive scoring engine
    const progressiveScoring = useProgressiveScoring(exam, questions, student);

    // 1. Update the localStorage key to include both examId and studentId for uniqueness
    const progressKey = `exam_progress_${exam._id}_${student._id}`;

    // 2. Add state for startTime
    const [startTime, setStartTime] = useState(null);


    // --- SUBJECTWISE FILTERING ---
    // Check exam stream types for specialized logic
    const isJeeExam = exam?.stream?.toLowerCase().includes('jee');
    const isCetExam = exam?.stream?.toLowerCase().includes('cet');
    const isNeetExam = exam?.stream?.toLowerCase().includes('neet');
    const isCompetitiveExam = isJeeExam || isCetExam || isNeetExam;
    
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
        // For competitive exams, start with the first available (unlocked) subject
        if (isCompetitiveExam) {
            // Use proper access rules from helper functions
            const accessRules = getExamAccessRules(exam);
            if (accessRules.restrictedSubjects && accessRules.restrictedSubjects.length > 0) {
                // Find first subject that's not in the restricted list
                const availableSubject = allSubjects.find(subject => 
                    !accessRules.restrictedSubjects.includes(subject)
                );
                return availableSubject || allSubjects[0] || "";
            }
        }
        return allSubjects[0] || "";
    });

    // FIXED: Stable subject switching to prevent cascade effects
    // Use ref to track previous subject and prevent unnecessary resets
    const previousSubjectRef = useRef(selectedSubject);
    
    useEffect(() => {
        // Only reset question index if subject actually changed
        if (previousSubjectRef.current !== selectedSubject) {
            previousSubjectRef.current = selectedSubject;
            setCurrentQuestionIndex(0);
        }
    }, [selectedSubject]);

    // Handle manual subject changes with improved CET support
    const handleSubjectChange = (newSubject) => {
        console.log('CET Debug: Manual subject change attempted:', { 
            newSubject, 
            currentSubject: selectedSubject, 
            isCetExam,
            competitiveExamAccess: competitiveExamAccess.subjectAccess 
        });
        
        // Check if subject is locked with enhanced subject name matching for CET
        if (isCompetitiveExam && competitiveExamAccess.subjectAccess) {
            // Enhanced subject name variations for CET exams
            const subjectVariations = [newSubject];
            
            if (isCetExam) {
                // Mathematics variations
                if (newSubject.toLowerCase().includes('math')) {
                    subjectVariations.push('Mathematics', 'Maths', 'Math');
                }
                // Biology variations  
                else if (newSubject.toLowerCase().includes('bio')) {
                    subjectVariations.push('Biology', 'Bio', 'Botany', 'Zoology');
                }
                // Handle reverse matching - if selecting "Biology", also check "Bio"
                else if (newSubject === 'Biology') {
                    subjectVariations.push('Bio', 'Botany', 'Zoology');
                } else if (newSubject === 'Mathematics') {
                    subjectVariations.push('Maths', 'Math');
                }
            }
            
            console.log('CET Debug: Checking subject variations:', subjectVariations);
            
            // Check if any variation is locked
            let isLocked = false;
            let remainingTime = 0;
            let lockedVariation = null;
            
            for (const variation of subjectVariations) {
                const subjectAccess = competitiveExamAccess.subjectAccess[variation];
                if (subjectAccess?.isLocked) {
                    isLocked = true;
                    remainingTime = getSubjectUnlockTime(competitiveExamAccess.subjectAccess, variation);
                    lockedVariation = variation;
                    break;
                }
            }
            
            console.log('CET Debug: Lock check result:', { isLocked, remainingTime, lockedVariation });
            
            if (isLocked) {
                toast.error(`${newSubject} will be available in ${remainingTime} minutes`);
                return;
            }
        }
        
        // Clear any existing manual selection timeout
        if (manualSelectionTimeoutRef.current) {
            clearTimeout(manualSelectionTimeoutRef.current);
        }
        
        // Mark this as a manual selection to prevent auto-switching
        manualSubjectSelectionRef.current = true;
        console.log('CET Debug: Setting manual selection flag to prevent auto-override');
        
        // Set timeout to clear manual selection flag after 3 seconds
        manualSelectionTimeoutRef.current = setTimeout(() => {
            manualSubjectSelectionRef.current = false;
            console.log('CET Debug: Manual selection flag cleared after timeout');
        }, 3000);
        
        setSelectedSubject(newSubject);
        console.log('CET Debug: Subject changed manually to:', newSubject);
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

    // FIXED: Enhanced subject access logic with STABLE OBJECT REFERENCES
    // This prevents infinite loops by memoizing the unlock schedule computation
    const competitiveExamAccess = useMemo(() => {
        if (!startTime || !isExamStarted) {
            // Return stable fallback object to prevent re-renders
            return { allUnlocked: true, subjectAccess: {}, streamConfig: null, examType: 'practice' };
        }
        
        try {
            // STABLE COMPUTATION: Only recalculates when exam or startTime changes
            // Using JSON.stringify to create stable cache key for exam object
            const examKey = `${exam._id}_${exam.stream}_${exam.examAvailability}_${exam.endTime}`;
            const timeKey = Math.floor(startTime / 60000); // Round to minutes for stability
            const cacheKey = `${examKey}_${timeKey}`;
            
            // Use the utility function but ensure stable object references
            const unlockSchedule = getSubjectUnlockSchedule(exam, new Date(startTime));
            
            // DEBUG: Log subject access for CET exams
            if (isCetExam) {
                console.log('CET Subject Access Debug:', {
                    allUnlocked: unlockSchedule.allUnlocked,
                    subjectAccess: unlockSchedule.subjectAccess,
                    currentTime: new Date().toISOString(),
                    startTime: new Date(startTime).toISOString(),
                    examEndTime: exam.endTime ? new Date(exam.endTime).toISOString() : 'N/A'
                });
            }
            
            // STABLE RETURN: Create consistent object structure
            return {
                allUnlocked: Boolean(unlockSchedule.allUnlocked),
                subjectAccess: unlockSchedule.subjectAccess || {},
                streamConfig: unlockSchedule.streamConfig || null,
                examType: unlockSchedule.examType || exam.examAvailability || 'practice',
                _cacheKey: cacheKey // Internal cache key for debugging
            };
        } catch (error) {
            console.error('Error calculating subject unlock schedule:', error);
            // Return stable fallback object to prevent exam from breaking
            return { allUnlocked: true, subjectAccess: {}, streamConfig: null, examType: 'practice' };
        }
    }, [
        exam._id, // Only exam ID to prevent object reference issues
        exam.stream,
        exam.examAvailability, 
        exam.endTime,
        Math.floor(startTime / 60000), // Rounded startTime for stability
        isExamStarted,
        // CRITICAL FIX: Add current time for MHT-CET exams to enable automatic Biology/Maths unlock
        // This only affects exams with time-locked subjects (MHT-CET), preventing performance impact on NEET/JEE
        isCetExam ? Math.floor(Date.now() / 60000) : null
    ]);

    // For submit button logic
    const totalQuestionsAll = (questions || []).length;
    const answeredQuestionsAll = Object.keys(answers).filter(qid => (questions || []).some(q => q._id === qid)).length;
    const isLastSubject = allSubjects[allSubjects.length - 1] === selectedSubject;
    // Submit button is now always available throughout the exam

    // Debug logging removed for security - do not log exam questions/answers

    // Removed: loadExamProgress function - logic moved to handleContinueExam for clarity

    // Removed: saveExamProgress function - now handled by auto-save effect directly
    // This eliminates duplicate logic and ensures consistent progress saving

    // 1. On mount, always check for saved progress and restore answers, currentQuestionIndex, markedQuestions, startTime, and timeLeft before starting the timer.
    useEffect(() => {
        const savedProgress = localStorage.getItem(progressKey);
        if (savedProgress) {
            try {
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
                setVisitedQuestions(new Set(progress.visitedQuestions || []));
                setStartTime(progress.startTime || Date.now());
                // Use consistent helper function for time calculation
                const calculatedTimeLeft = calculateRemainingTime(exam, progress.startTime);
                setTimeLeft(calculatedTimeLeft);
                timerInitializedRef.current = true; // Mark timer as initialized when loading progress
                setIsExamStarted(true);
                toast.success("Previous progress loaded");
            } catch (error) {
                console.error('Error loading saved progress:', error);
                // Clear corrupted progress
                localStorage.removeItem(progressKey);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [progressKey]);

    // PROGRESSIVE COMPUTATION: Initialize when exam starts
    useEffect(() => {
        if (isExamStarted && progressiveScoring?.isSupported) {
            console.log('🔧 Initializing progressive scoring engine with performance monitoring...');
            
            // Initialize performance monitoring for 15ms target tracking
            const performanceMonitor = getPerformanceMonitor();
            performanceMonitor.initializeSession(
                exam._id, 
                student._id, 
                exam.stream || 'general'
            );
            
            progressiveScoring.initializeProgressive().then(result => {
                if (result.success) {
                    console.log('✅ Progressive scoring activated for exam');
                    console.log(`📊 Engine loaded ${result.questionsLoaded} questions`);
                    console.log('📈 Performance monitoring active for 15ms target tracking');
                    toast.success("Ultra-fast scoring activated!");
                } else {
                    console.log('⚠️ Progressive scoring failed, using server computation');
                    console.log('Reason:', result.reason);
                }
            }).catch(error => {
                console.error('❌ Progressive initialization error:', error);
            });
        }
    }, [isExamStarted, progressiveScoring]);

    // PROGRESSIVE COMPUTATION: Update answers in real-time
    useEffect(() => {
        if (progressiveScoring?.isInitialized?.() && Object.keys(answers).length > 0) {
            progressiveScoring.updateProgressiveAnswers(answers);
        }
    }, [answers, progressiveScoring]);



    // Mark initial question as visited when exam starts or when navigating
    useEffect(() => {
        if (isExamStarted) {
            const globalIndex = getGlobalQuestionIndex(currentQuestionIndex, selectedSubject);
            if (!visitedQuestions.has(globalIndex)) {
                setVisitedQuestions(prev => new Set([...prev, globalIndex]));
            }
        }
    }, [isExamStarted, currentQuestionIndex, selectedSubject]);

    // Track previously locked subjects for notification purposes
    const [previouslyLockedSubjects, setPreviouslyLockedSubjects] = useState(new Set());
    
    // FIXED: Track subject unlocking with stable dependencies and prevent cascade effects
    // Use competitiveExamAccess directly instead of recalculating
    useEffect(() => {
        if (!isCompetitiveExam || !isExamStarted || !startTime) return;
        
        const checkInterval = setInterval(() => {
            try {
                // Use already computed competitiveExamAccess to avoid recalculation
                // This prevents the circular dependency with getSubjectUnlockSchedule
                if (competitiveExamAccess.allUnlocked && previouslyLockedSubjects.size > 0) {
                    const examType = isNeetExam ? 'NEET' : isCetExam ? 'CET' : 'JEE';
                    const subjectList = Array.from(previouslyLockedSubjects).join(' & ');
                    toast.success(`🔓 ${subjectList} now available in ${examType}!`);
                    setPreviouslyLockedSubjects(new Set());
                }
            } catch (error) {
                console.error('Error checking subject unlock status:', error);
                // Continue interval but skip this check
            }
        }, 60000); // Check every minute
        
        return () => clearInterval(checkInterval);
    }, [
        isCompetitiveExam, 
        isExamStarted, 
        competitiveExamAccess.allUnlocked, // Use computed value instead of recalculating
        previouslyLockedSubjects.size,
        isNeetExam, 
        isCetExam
    ]);

    // FIXED: Initialize locked subjects using computed access state
    // Prevents recalculation and circular dependencies
    useEffect(() => {
        if (isCompetitiveExam && isExamStarted && startTime) {
            try {
                // Use already computed competitiveExamAccess instead of recalculating
                if (!competitiveExamAccess.allUnlocked && competitiveExamAccess.subjectAccess) {
                    const lockedSubjects = Object.keys(competitiveExamAccess.subjectAccess)
                        .filter(subject => competitiveExamAccess.subjectAccess[subject].isLocked)
                        .filter(subject => allSubjects.includes(subject)); // Only track subjects that exist in this exam
                        
                    setPreviouslyLockedSubjects(new Set(lockedSubjects));
                }
            } catch (error) {
                console.error('Error initializing locked subjects tracking:', error);
                // Continue without tracking locked subjects
            }
        }
    }, [
        isCompetitiveExam, 
        isExamStarted, 
        competitiveExamAccess.allUnlocked, // Use computed value
        competitiveExamAccess.subjectAccess,
        allSubjects.join(',') // Stable string representation
    ]);

    // FIXED: Check subject lock status using computed access state
    // Prevents circular dependencies and stabilizes subject switching
    const subjectSwitchInProgressRef = useRef(false);
    const manualSubjectSelectionRef = useRef(false); // Track manual selections
    const manualSelectionTimeoutRef = useRef(null); // Track timeout for manual selection reset
    
    useEffect(() => {
        if (!isCompetitiveExam || !isExamStarted || !startTime || subjectSwitchInProgressRef.current) return;
        
        // CRITICAL FIX: Don't auto-switch if user just made a manual selection
        if (manualSubjectSelectionRef.current) {
            console.log('CET Debug: Skipping auto-switch due to recent manual selection');
            return;
        }
        
        try {
            // Use already computed competitiveExamAccess to avoid recalculation
            if (competitiveExamAccess.allUnlocked) {
                if (isCetExam) {
                    console.log('CET Debug: All subjects unlocked, no auto-switching needed');
                }
                return;
            }
            
            // Enhanced subject lock checking with CET-specific name matching
            let currentSubjectAccess = competitiveExamAccess.subjectAccess?.[selectedSubject];
            
            // For CET exams, also check subject name variations
            if (isCetExam && !currentSubjectAccess) {
                const subjectVariations = [selectedSubject];
                if (selectedSubject.toLowerCase().includes('math')) {
                    subjectVariations.push('Mathematics', 'Maths', 'Math');
                } else if (selectedSubject.toLowerCase().includes('bio')) {
                    subjectVariations.push('Biology', 'Bio', 'Botany', 'Zoology');
                } else if (selectedSubject === 'Biology') {
                    subjectVariations.push('Bio');
                } else if (selectedSubject === 'Mathematics') {
                    subjectVariations.push('Maths', 'Math');
                }
                
                for (const variation of subjectVariations) {
                    const access = competitiveExamAccess.subjectAccess?.[variation];
                    if (access) {
                        currentSubjectAccess = access;
                        console.log('CET Debug: Found subject access via variation:', { selectedSubject, variation, access });
                        break;
                    }
                }
            }
            
            if (currentSubjectAccess?.isLocked) {
                console.log('CET Debug: Current subject is locked, finding alternative:', { selectedSubject, currentSubjectAccess });
                
                // Find the first available (unlocked) subject
                const availableSubject = allSubjects.find(subject => {
                    const subjectAccess = competitiveExamAccess.subjectAccess?.[subject];
                    return !subjectAccess?.isLocked;
                });
                
                console.log('CET Debug: Available subject found:', { availableSubject, allSubjects });
                
                if (availableSubject && availableSubject !== selectedSubject) {
                    // Prevent cascading subject switches
                    subjectSwitchInProgressRef.current = true;
                    setSelectedSubject(availableSubject);
                    
                    const remainingTime = Math.ceil(currentSubjectAccess.remainingTime / 1000 / 60);
                    toast(`Switched to ${availableSubject} - ${selectedSubject} will unlock in ${remainingTime} minutes`);
                    
                    console.log('CET Debug: Auto-switched subjects:', { 
                        from: selectedSubject, 
                        to: availableSubject, 
                        remainingTime 
                    });
                    
                    // Reset the flag after a short delay
                    setTimeout(() => {
                        subjectSwitchInProgressRef.current = false;
                    }, 1000);
                }
            }
        } catch (error) {
            console.error('Error checking subject lock status:', error);
            // Don't switch subjects if there's an error
            subjectSwitchInProgressRef.current = false;
        }
    }, [
        isCompetitiveExam, 
        isExamStarted, 
        competitiveExamAccess.allUnlocked,
        competitiveExamAccess.subjectAccess,
        // CRITICAL FIX: Removed selectedSubject dependency to prevent race condition with manual selection
        // The effect will now only run when access rules change, not when user manually changes subject
        allSubjects.join(',') // Stable string representation
    ]);

    // CRITICAL FIX: Separate timer-based check for locked subjects to prevent race conditions
    useEffect(() => {
        if (!isCompetitiveExam || !isExamStarted || !startTime) return;
        
        const checkCurrentSubjectLock = () => {
            // Skip if manual selection is in progress
            if (manualSubjectSelectionRef.current || subjectSwitchInProgressRef.current) {
                return;
            }
            
            try {
                if (competitiveExamAccess.allUnlocked) return;
                
                // Check if current subject is locked using same variation logic
                let currentSubjectAccess = competitiveExamAccess.subjectAccess?.[selectedSubject];
                
                // For CET exams, also check subject name variations
                if (isCetExam && !currentSubjectAccess) {
                    const subjectVariations = [selectedSubject];
                    if (selectedSubject.toLowerCase().includes('math')) {
                        subjectVariations.push('Mathematics', 'Maths', 'Math');
                    } else if (selectedSubject.toLowerCase().includes('bio')) {
                        subjectVariations.push('Biology', 'Bio', 'Botany', 'Zoology');
                    } else if (selectedSubject === 'Biology') {
                        subjectVariations.push('Bio');
                    } else if (selectedSubject === 'Mathematics') {
                        subjectVariations.push('Maths', 'Math');
                    }
                    
                    for (const variation of subjectVariations) {
                        const access = competitiveExamAccess.subjectAccess?.[variation];
                        if (access) {
                            currentSubjectAccess = access;
                            break;
                        }
                    }
                }
                
                // If current subject becomes locked, switch to available subject
                if (currentSubjectAccess?.isLocked) {
                    const availableSubject = allSubjects.find(subject => {
                        const subjectAccess = competitiveExamAccess.subjectAccess?.[subject];
                        return !subjectAccess?.isLocked;
                    });
                    
                    if (availableSubject && availableSubject !== selectedSubject) {
                        subjectSwitchInProgressRef.current = true;
                        setSelectedSubject(availableSubject);
                        
                        const remainingTime = Math.ceil(currentSubjectAccess.remainingTime / 1000 / 60);
                        toast(`Switched to ${availableSubject} - ${selectedSubject} will unlock in ${remainingTime} minutes`);
                        
                        setTimeout(() => {
                            subjectSwitchInProgressRef.current = false;
                        }, 1000);
                    }
                }
            } catch (error) {
                console.error('Error in timer-based subject lock check:', error);
            }
        };
        
        // Check every 30 seconds instead of on every state change
        const interval = setInterval(checkCurrentSubjectLock, 30000);
        
        return () => clearInterval(interval);
    }, [
        isCompetitiveExam, 
        isExamStarted, 
        startTime,
        competitiveExamAccess.allUnlocked,
        competitiveExamAccess.subjectAccess,
        allSubjects.join(','),
        isCetExam
    ]);

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
            // Progress saved locally
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
            setVisitedQuestions(new Set());
            setWarningCount(0);
            // Use consistent helper function for time calculation
            const calculatedTimeLeft = calculateRemainingTime(exam, now);
            setTimeLeft(calculatedTimeLeft);
        }
        setIsExamStarted(true);
        // Clear any previous warnings for this exam session
        warningsShownRef.current.clear();
        timerInitializedRef.current = false; // Reset timer initialization flag
        
        // Progressive scoring initialization now handled by useEffect above
        
        toast.success("Exam started! Good luck!");
    };

    // Timer logic moved to ExamTimer component

    // Cleanup manual selection timeout on unmount
    useEffect(() => {
        return () => {
            if (manualSelectionTimeoutRef.current) {
                clearTimeout(manualSelectionTimeoutRef.current);
            }
        };
    }, []);

    // --- FULLSCREEN LOGIC START ---
    const [warningDialog, setWarningDialog] = useState(false);
    
    // Detect iOS devices (iPhone, iPad, iPod)
    const isIOS = () => {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
               (navigator.userAgentData?.platform === 'iOS') ||
               (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.userAgent));
    };
    
    // Check if Fullscreen API is supported
    const isFullscreenSupported = () => {
        return !isIOS() && (
            document.fullscreenEnabled ||
            document.webkitFullscreenEnabled ||
            document.mozFullScreenEnabled ||
            document.msFullscreenEnabled
        );
    };

    // Function to request full-screen mode (exactly like reference)
    const enterFullScreen = () => {
        // Skip fullscreen on iOS devices
        if (!isFullscreenSupported()) {
            console.log('Fullscreen not supported on this device');
            setWarningDialog(false);
            warningIssuedRef.current = false;
            return;
        }
        
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
            
            // On iOS, only check for visibility and focus, not fullscreen
            const isViolation = isIOS() 
                ? (document.visibilityState !== 'visible' || document.hasFocus() === false)
                : (document.visibilityState !== 'visible' || !document.fullscreenElement || document.hasFocus() === false);
            
            if (isViolation) {
                // Only increment warning count once per violation
                if (!warningIssuedRef.current) {
                    warningIssuedRef.current = true;
                    setWarningCount(prev => {
                        const newCount = prev + 1;
                        // Warning issued - count incremented
                        const warningMessage = isIOS() 
                            ? `⚠️ Warning ${newCount}: Please keep the exam tab active`
                            : `⚠️ Warning ${newCount}: Please stay in fullscreen mode`;
                        toast.error(warningMessage, { duration: 3000 });
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
            // Only add fullscreen listener if supported
            if (isFullscreenSupported()) {
                document.addEventListener('fullscreenchange', handleVisibilityChange);
            }
            window.addEventListener("resize", handleVisibilityChange);
            window.addEventListener("focus", handleVisibilityChange);
            window.addEventListener("blur", handleVisibilityChange);
        }

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (isFullscreenSupported()) {
                document.removeEventListener('fullscreenchange', handleVisibilityChange);
            }
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

    // Enhanced exam submission with progressive computation support and performance feedback
    const submitExam = async () => {
        try {
            examCompletedRef.current = true;
            setWarningDialog(false); // Close warning dialog
            exitFullscreen();

            // ENHANCED SUBMISSION FEEDBACK: Show loading state immediately
            setSubmissionState({ 
                status: 'submitting', 
                message: 'Processing your exam...',
                showProgress: true,
                performanceMetrics: null,
                performanceBadge: null,
                submissionTime: 0
            });
        
        // Prepare exam data for submission
        const examSubmissionData = {
            answers,
            score: 0, // Will be calculated by progressive system or server
            totalMarks: 0,
            timeTaken: exam.examAvailability === 'scheduled' 
                ? Math.floor((Date.now() - startTime) / 1000) 
                : (getEffectiveExamDuration(exam) * 60) - timeLeft,
            completedAt: new Date().toISOString(),
            visitedQuestions: Array.from(visitedQuestions),
            markedQuestions: Array.from(markedQuestions),
            warnings: warningCount,
            examAvailability: exam?.examAvailability,
            examEndTime: exam?.endTime,
            isAutoSubmit: true,
            timeRemaining: timeLeft
        };

        const submissionStartTime = Date.now();

        // ENHANCED PROGRESSIVE COMPUTATION: Try direct storage submission first (15ms target)
        if (progressiveScoring?.isInitialized?.()) {
            try {
                console.log('🚀 Attempting enhanced progressive submission with direct storage...');
                
                // Get complete ExamResult data from progressive engine
                const progressiveResult = await progressiveScoring.getProgressiveResults();
                
                if (progressiveResult.success && progressiveResult.results && progressiveResult.isPreComputed) {
                    console.log('📊 Progressive computation data ready, submitting via direct storage...');
                    
                    // Prepare complete data structure for direct storage
                    const directStorageData = {
                        ...progressiveResult.results,
                        examId: exam._id,
                        studentId: student._id,
                        timeTaken: exam.examAvailability === 'scheduled' 
                            ? Math.floor((Date.now() - startTime) / 1000) 
                            : (getEffectiveExamDuration(exam) * 60) - timeLeft,
                        completedAt: new Date().toISOString(),
                        submittedAt: new Date().toISOString(),
                        visitedQuestions: Array.from(visitedQuestions),
                        markedQuestions: Array.from(markedQuestions),
                        warnings: warningCount,
                        examAvailability: exam?.examAvailability,
                        examEndTime: exam?.endTime,
                        isAutoSubmit: true,
                        timeRemaining: timeLeft,
                        
                        // Raw data for fallback
                        rawExamData: {
                            examId: exam._id,
                            studentId: student._id,
                            answers,
                            timeTaken: exam.examAvailability === 'scheduled' 
                                ? Math.floor((Date.now() - startTime) / 1000) 
                                : (getEffectiveExamDuration(exam) * 60) - timeLeft,
                            completedAt: new Date().toISOString(),
                            visitedQuestions: Array.from(visitedQuestions),
                            markedQuestions: Array.from(markedQuestions),
                            warnings: warningCount
                        }
                    };
                    
                    // ULTRA-FAST DIRECT STORAGE SUBMISSION (15ms target)
                    const submissionStartTime = Date.now();
                    const directResult = await submitProgressiveResultDirect(directStorageData);
                    
                    // Track performance metrics
                    const performanceMonitor = getPerformanceMonitor();
                    const performanceResults = performanceMonitor.logSubmissionAttempt(directResult, submissionStartTime);
                    
                    if (directResult.success) {
                        const totalSubmissionTime = Date.now() - submissionStartTime;
                        
                        console.log(`✅ ULTRA-FAST submission completed in ${directResult.processingTime}ms`);
                        console.log(`⚡ Performance improvement: ${directResult.performanceImprovement}`);
                        console.log(`🎯 Target achieved: ${directResult.performanceMetrics?.targetAchieved}`);
                        console.log(`📊 Performance rank: ${performanceResults.performanceRank}`);
                        
                        // ENHANCED SUBMISSION FEEDBACK: Success state with performance metrics
                        const performanceBadge = performanceResults.target15msAchieved ? '⚡ Ultra-Fast' : 
                                               totalSubmissionTime <= 50 ? '🚀 Very Fast' : 
                                               totalSubmissionTime <= 100 ? '✅ Fast' : '✅ Complete';
                        
                        setSubmissionState({ 
                            status: 'success', 
                            message: 'Exam submitted successfully!',
                            performanceMetrics: {
                                submissionTime: totalSubmissionTime,
                                target15msAchieved: performanceResults.target15msAchieved,
                                performanceRank: performanceResults.performanceRank,
                                processingTime: directResult.processingTime
                            },
                            performanceBadge: performanceBadge,
                            submissionTime: totalSubmissionTime,
                            showProgress: false 
                        });
                        
                        if (performanceResults.target15msAchieved) {
                            console.log('🏆 15ms TARGET ACHIEVED! ULTRA-FAST SUBMISSION SUCCESS!');
                            // Show special toast for ultra-fast achievement
                            toast.success(`🏆 Ultra-Fast Submission! Completed in ${totalSubmissionTime}ms`, { duration: 4000 });
                        } else {
                            toast.success(`Exam submitted successfully in ${totalSubmissionTime}ms`);
                        }
                        
                        // Clear saved progress
                        localStorage.removeItem(progressKey);
                        
                        // Call onComplete with enhanced results after brief delay to show feedback
                        setTimeout(() => {
                            if (typeof onComplete === 'function') {
                                onComplete({
                                    ...directResult,
                                    performanceMetrics: {
                                        ...directResult.performanceMetrics,
                                        submissionTime: performanceResults.submissionTime,
                                        target15msAchieved: performanceResults.target15msAchieved,
                                        performanceRank: performanceResults.performanceRank
                                    }
                                });
                            }
                        }, 1500); // Show success feedback for 1.5 seconds
                        return;
                    } else {
                        console.warn('⚠️ Direct storage submission failed, falling back to traditional method');
                        console.log('🔍 Failure reason:', directResult.validationFailure?.reason);
                        
                        // Update submission state to show fallback
                        setSubmissionState({ 
                            status: 'submitting', 
                            message: 'Switching to backup processing...',
                            showProgress: true,
                            performanceMetrics: null,
                            performanceBadge: null,
                            submissionTime: 0
                        });
                    }
                } else {
                    console.warn('⚠️ Progressive computation data not available, falling back to traditional method');
                    console.log('🔍 Reason:', progressiveResult.reason);
                    
                    // Update submission state for traditional fallback
                    setSubmissionState({ 
                        status: 'submitting', 
                        message: 'Processing with traditional computation...',
                        showProgress: true,
                        performanceMetrics: null,
                        performanceBadge: null,
                        submissionTime: 0
                    });
                }
                
                console.log('🔄 Using traditional submission fallback');
            } catch (error) {
                console.error('❌ Enhanced progressive submission error:', error);
                console.log('🔄 Falling back to traditional server-side computation');
                
                // Update submission state for error recovery
                setSubmissionState({ 
                    status: 'submitting', 
                    message: 'Recovering submission process...',
                    showProgress: true,
                    performanceMetrics: null,
                    performanceBadge: null,
                    submissionTime: 0
                });
            }
        }

        // FALLBACK: Traditional server-side computation
        console.log('🔄 Using traditional server-side computation...');
        
        // Calculate score using traditional method
        let score = 0;
        
        // FIXED: Use exam.totalMarks from database instead of summing individual question marks
        // This prevents the 540 (180×3) bug where client calculation was incorrect
        const totalMarks = exam.totalMarks || 0;
        
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
            // REMOVED: totalMarks += question.marks || 4;  
            // This was causing the 540 bug by incorrectly summing individual question marks
        });

        const examData = {
            answers,
            score,
            totalMarks,
            timeTaken: exam.examAvailability === 'scheduled' 
                ? Math.floor((Date.now() - startTime) / 1000) 
                : (getEffectiveExamDuration(exam) * 60) - timeLeft,
            completedAt: new Date().toISOString(),
            visitedQuestions: Array.from(visitedQuestions),
            markedQuestions: Array.from(markedQuestions),
            warnings: warningCount,
            examAvailability: exam?.examAvailability,
            examEndTime: exam?.endTime,
            isAutoSubmit: true,
            timeRemaining: timeLeft,
            submissionType: 'traditional_server'
        };

        const totalSubmissionTime = Date.now() - submissionStartTime;
        
        // ENHANCED SUBMISSION FEEDBACK: Traditional completion with performance metrics
        const performanceBadge = totalSubmissionTime <= 100 ? '✅ Fast' : 
                               totalSubmissionTime <= 500 ? '📊 Good' : 
                               '✅ Complete';
        
        setSubmissionState({ 
            status: 'success', 
            message: 'Exam submitted successfully!',
            performanceMetrics: {
                submissionTime: totalSubmissionTime,
                target15msAchieved: false,
                performanceRank: totalSubmissionTime <= 100 ? 'FAST' : totalSubmissionTime <= 500 ? 'GOOD' : 'AVERAGE',
                computationMethod: 'server_traditional'
            },
            performanceBadge: performanceBadge,
            submissionTime: totalSubmissionTime,
            showProgress: false 
        });
        
        toast.success(`Exam submitted successfully in ${totalSubmissionTime}ms`);
        
        // Clear saved progress
        localStorage.removeItem(progressKey);
        
        // Call onComplete with traditional data after brief delay to show feedback
        setTimeout(() => {
            if (typeof onComplete === 'function') {
                onComplete({
                    ...examData,
                    performanceMetrics: {
                        submissionTime: totalSubmissionTime,
                        target15msAchieved: false,
                        performanceRank: totalSubmissionTime <= 100 ? 'FAST' : 'AVERAGE',
                        computationMethod: 'server_traditional'
                    }
                });
            } else {
                console.error('onComplete is not a function:', onComplete);
            }
        }, 1200); // Show success feedback for 1.2 seconds
        
        } catch (globalError) {
            // COMPREHENSIVE ERROR HANDLING: Catch any unhandled errors in submission process
            const totalSubmissionTime = Date.now() - submissionStartTime;
            
            console.error('❌ Global submission error:', globalError);
            
            setSubmissionState({ 
                status: 'error', 
                message: 'Unexpected Submission Error',
                showProgress: false,
                performanceMetrics: {
                    submissionTime: totalSubmissionTime,
                    errorType: 'global_submission_failure',
                    fallbackAvailable: true,
                    errorMessage: globalError.message
                },
                performanceBadge: null,
                submissionTime: totalSubmissionTime
            });
            
            // Show error toast with recovery guidance
            toast.error('Unexpected error during submission. Please try again.', { duration: 5000 });
            
            console.log('🛡️ Global error handler activated - User can retry submission');
        }
    }
    // --- FULLSCREEN LOGIC END ---

    // Handle answer selection
    const handleAnswerChange = async (questionId, answer) => {
        // Reset submission state when user makes changes
        if (submissionState.status !== 'idle') {
            setSubmissionState({
                status: 'idle',
                message: '',
                performanceMetrics: null,
                showProgress: false,
                performanceBadge: null,
                submissionTime: 0
            });
        }

        // Update local answers state
        const newAnswers = {
            ...answers,
            [questionId]: answer
        };
        
        setAnswers(newAnswers);

        // PROGRESSIVE COMPUTATION: Update progressive scoring in background
        if (progressiveScoring?.isInitialized?.()) {
            progressiveScoring.updateProgressiveAnswers(newAnswers);
        }
    }

    // Handle multiple choice answers
    const handleMultipleAnswerChange = async (questionId, option, isChecked) => {
        // Reset submission state when user makes changes
        if (submissionState.status !== 'idle') {
            setSubmissionState({
                status: 'idle',
                message: '',
                performanceMetrics: null,
                showProgress: false,
                performanceBadge: null,
                submissionTime: 0
            });
        }

        let newAnswer;
        
        // Update local answers state and get new answer
        setAnswers(prev => {
            const currentAnswers = prev[questionId] || []
            if (isChecked) {
                newAnswer = [...currentAnswers, option];
                return {
                    ...prev,
                    [questionId]: newAnswer
                }
            } else {
                newAnswer = currentAnswers.filter(a => a !== option);
                return {
                    ...prev,
                    [questionId]: newAnswer
                }
            }
        });

        // OLD PROGRESSIVE COMPUTATION CODE REMOVED - Now handled by new progressive hook above
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
    // Fixed to handle sorted JEE questions correctly
    const getGlobalQuestionIndex = (subjectRelativeIndex, subject) => {
        // Get the sorted subject questions (same sorting as used in display)
        const filtered = (questions || []).filter(q => q.subject === subject);
        
        let sortedSubjectQuestions;
        if (isJeeExam) {
            // Apply the same sorting as in subjectQuestions
            sortedSubjectQuestions = filtered.sort((a, b) => {
                const sectionA = a.section || 1;
                const sectionB = b.section || 1;
                
                if (sectionA !== sectionB) {
                    return sectionA - sectionB;
                }
                
                return (a.questionNumber || 0) - (b.questionNumber || 0);
            });
        } else {
            sortedSubjectQuestions = filtered;
        }
        
        if (sortedSubjectQuestions.length === 0) return 0;
        
        const targetQuestion = sortedSubjectQuestions[subjectRelativeIndex];
        if (!targetQuestion) return 0;
        
        // Find the global index of this question in the original unsorted array
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
        
        // Get the sorted subject questions (same sorting as used in display)
        const filtered = (questions || []).filter(q => q.subject === targetQuestion.subject);
        
        let sortedSubjectQuestions;
        if (isJeeExam) {
            // Apply the same sorting as in subjectQuestions
            sortedSubjectQuestions = filtered.sort((a, b) => {
                const sectionA = a.section || 1;
                const sectionB = b.section || 1;
                
                if (sectionA !== sectionB) {
                    return sectionA - sectionB;
                }
                
                return (a.questionNumber || 0) - (b.questionNumber || 0);
            });
        } else {
            sortedSubjectQuestions = filtered;
        }
        
        // Find the subject-relative index in the sorted array
        const subjectRelativeIndex = sortedSubjectQuestions.findIndex(q => q._id === targetQuestion._id);
        
        if (subjectRelativeIndex !== -1) {
            setCurrentQuestionIndex(subjectRelativeIndex);
        }
    }

    // Auto-submit when time expires with enhanced feedback
    const handleAutoSubmit = () => {
        console.log('🚨 AUTO-SUBMIT TRIGGERED!', {
            examId: exam._id,
            studentId: student._id,
            timeLeft: timeLeft,
            timestamp: new Date().toISOString(),
            totalAnswers: Object.keys(answers).length,
            visitedQuestions: visitedQuestions.size,
            markedQuestions: markedQuestions.size,
            warningCount: warningCount
        });
        
        // Clear any existing timers
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        
        console.log('📢 Showing auto-submit toast notification to student');
        toast.error("⏰ Time's up! Your exam has been automatically submitted.", { 
            duration: 6000,
            style: {
                fontSize: '16px',
                fontWeight: 'bold'
            }
        });
        
        console.log('⏳ Auto-submit waiting 1 second before calling submitExam()');
        // Small delay to ensure toast is visible before submission
        setTimeout(() => {
            console.log('🎯 Auto-submit calling submitExam() - Emergency Queue System should activate now!');
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
        const savedProgress = localStorage.getItem(progressKey);
        if (savedProgress) {
            try {
                const progress = JSON.parse(savedProgress);
                setAnswers(progress.answers || {});
                setWarningCount(progress.warningCount || 0);
                
                if (progress.selectedSubject) {
                    setSelectedSubject(progress.selectedSubject);
                }
                
                setCurrentQuestionIndex(0);
                setTimeout(() => {
                    setCurrentQuestionIndex(progress.currentQuestionIndex || 0);
                }, 100);
                
                setMarkedQuestions(new Set(progress.markedQuestions || []));
                setVisitedQuestions(new Set(progress.visitedQuestions || []));
                setStartTime(progress.startTime || Date.now());
                
                // Use consistent helper function for time calculation
                const calculatedTimeLeft = calculateRemainingTime(exam, progress.startTime);
                setTimeLeft(calculatedTimeLeft);
                
                timerInitializedRef.current = true;
                setIsExamStarted(true);
                toast.success("Previous progress loaded");
            } catch (error) {
                console.error('Error loading saved progress:', error);
                localStorage.removeItem(progressKey);
            }
        }
        setShowContinuePrompt(false);
    };

    // 3. Handler for 'Start New Exam' - using consistent helper functions
    const handleStartNewExam = () => {
        localStorage.removeItem(progressKey);
        setAnswers({});
        setCurrentQuestionIndex(0);
        setMarkedQuestions(new Set());
        setVisitedQuestions(new Set());
        setWarningCount(0);
        
        // Use consistent helper function for time calculation
        const now = Date.now();
        const calculatedTimeLeft = calculateRemainingTime(exam, now);
        setTimeLeft(calculatedTimeLeft);
        
        setIsExamStarted(false);
        setShowContinuePrompt(false);
        // Clear warning tracking for new exam
        warningsShownRef.current.clear();
        timerInitializedRef.current = false;
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
        // Use the current question's actual global index from the original questions array
        const globalIndex = currentQuestion ? questions.findIndex(q => q._id === currentQuestion._id) : -1
        if (globalIndex !== -1) {
            toggleMarkedQuestion(globalIndex)
        }
    }

    const handleClear = async () => {
        if (currentQuestion && currentQuestion._id) {
            // Reset submission state when user makes changes
            if (submissionState.status !== 'idle') {
                setSubmissionState({
                    status: 'idle',
                    message: '',
                    performanceMetrics: null,
                    showProgress: false,
                    performanceBadge: null,
                    submissionTime: 0
                });
            }

            const questionId = currentQuestion._id;
            
            // Update local answers state
            setAnswers(prev => {
                const newAnswers = { ...prev }
                delete newAnswers[questionId]
                return newAnswers
            });

            // OLD PROGRESSIVE COMPUTATION CODE REMOVED - Now handled by new progressive hook

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
            
            {/* ExamTimer Component - Handles timer logic */}
            <ExamTimer
                isExamStarted={isExamStarted}
                startTime={startTime}
                exam={exam}
                onTimeUpdate={setTimeLeft}
                onTimeExpired={handleAutoSubmit}
                warningsShownRef={warningsShownRef}
            />
            {/* Enhanced Submission Feedback Modal with Smooth Transitions - Responsive & Accessible */}
            {submissionState.status === 'submitting' && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 transition-all duration-300 animate-in fade-in px-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="submission-dialog-title"
                    aria-describedby="submission-dialog-description"
                >
                    <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 w-full max-w-sm sm:max-w-md text-center transform transition-all duration-500 animate-in slide-in-from-bottom-4 fade-in">
                        <div className="mb-4 sm:mb-6">
                            {submissionState.showProgress && (
                                <div className="relative mb-3 sm:mb-4">
                                    {/* Ultra-fast submission spinner - responsive sizing */}
                                    <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-3 sm:border-4 border-blue-100 border-b-blue-600 transition-all duration-200"></div>
                                    {/* Pulse effect for ultra-fast feedback */}
                                    <div className="absolute inset-0 rounded-full animate-pulse bg-blue-50 opacity-30"></div>
                                </div>
                            )}
                            <h3 
                                id="submission-dialog-title"
                                className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 animate-in slide-in-from-left-2 duration-300"
                            >
                                {submissionState.message}
                            </h3>
                            <p 
                                id="submission-dialog-description"
                                className="text-gray-600 text-sm sm:text-base animate-in slide-in-from-left-2 duration-300 delay-100"
                            >
                                Please wait while we process your exam...
                            </p>
                            
                            {/* Screen reader live region for submission updates */}
                            <div className="sr-only" aria-live="polite" aria-atomic="true">
                                {submissionState.message} - Processing exam submission, please wait.
                            </div>
                        </div>
                        
                        {/* Progress dots animation for ultra-fast submissions - responsive & accessible */}
                        <div className="flex justify-center space-x-1" role="progressbar" aria-label="Processing submission">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 rounded-full animate-pulse"></div>
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Success Feedback Modal with Performance Metrics and Celebrations - Responsive & Accessible */}
            {submissionState.status === 'success' && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 transition-all duration-500 animate-in fade-in px-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="success-dialog-title"
                    aria-describedby="success-dialog-description"
                >
                    <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 w-full max-w-sm sm:max-w-md text-center transform transition-all duration-700 animate-in zoom-in-95 fade-in">
                        <div className="mb-4 sm:mb-6">
                            {/* Success icon with celebration animation - responsive */}
                            <div className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4">
                                <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-30"></div>
                                <div className="relative bg-green-100 rounded-full p-3 sm:p-4 transform animate-in zoom-in-50 duration-500">
                                    <CheckCircle 
                                        className="w-10 h-10 sm:w-12 sm:h-12 text-green-600 animate-in zoom-in-95 duration-300 delay-200" 
                                        aria-hidden="true"
                                    />
                                </div>
                                
                                {/* Celebration particles for 15ms achievement */}
                                {submissionState.performanceMetrics?.target15msAchieved && (
                                    <>
                                        <div className="absolute -top-2 -right-2 text-yellow-400 animate-bounce text-2xl">🎉</div>
                                        <div className="absolute -top-2 -left-2 text-yellow-400 animate-bounce text-2xl" style={{animationDelay: '0.1s'}}>✨</div>
                                        <div className="absolute -bottom-2 -right-2 text-yellow-400 animate-bounce text-2xl" style={{animationDelay: '0.2s'}}>⚡</div>
                                        <div className="absolute -bottom-2 -left-2 text-yellow-400 animate-bounce text-2xl" style={{animationDelay: '0.3s'}}>🏆</div>
                                    </>
                                )}
                            </div>
                            
                            <h3 
                                id="success-dialog-title"
                                className="text-xl sm:text-2xl font-bold text-green-600 mb-2 sm:mb-3 animate-in slide-in-from-bottom-2 duration-500 delay-300"
                            >
                                {submissionState.message}
                            </h3>
                            
                            {/* Screen reader announcement for success */}
                            <div className="sr-only" aria-live="polite" aria-atomic="true">
                                Exam submitted successfully! 
                                {submissionState.performanceMetrics?.target15msAchieved && 'Ultra-fast target achieved! '}
                                Submission completed in {submissionState.submissionTime} milliseconds.
                            </div>
                            
                            {/* Performance badge with special styling for ultra-fast - responsive */}
                            {submissionState.performanceBadge && (
                                <div className={`inline-block text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-3 sm:mb-4 transform animate-in scale-in duration-500 delay-500 ${
                                    submissionState.performanceMetrics?.target15msAchieved 
                                        ? 'bg-gradient-to-r from-yellow-300 to-yellow-500 text-yellow-900 shadow-lg animate-pulse'
                                        : 'bg-blue-100 text-blue-800'
                                }`}>
                                    {submissionState.performanceBadge}
                                </div>
                            )}
                            
                            {/* Performance metrics with enhanced styling - responsive & accessible */}
                            <div 
                                id="success-dialog-description"
                                className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-sm space-y-2 animate-in slide-in-from-bottom-4 duration-500 delay-700"
                                role="region"
                                aria-label="Performance metrics"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Submission Time:</span>
                                    <span className={`font-bold ${
                                        submissionState.submissionTime <= 15 ? 'text-green-600' :
                                        submissionState.submissionTime <= 50 ? 'text-blue-600' :
                                        'text-gray-900'
                                    }`}>
                                        {submissionState.submissionTime}ms
                                    </span>
                                </div>
                                
                                {submissionState.performanceMetrics?.target15msAchieved && (
                                    <div className="text-center p-2 bg-gradient-to-r from-green-100 to-green-200 rounded-lg">
                                        <p className="text-green-800 font-bold text-base">
                                            🏆 15ms Ultra-Fast Target Achieved!
                                        </p>
                                        <p className="text-green-700 text-xs mt-1">
                                            You've experienced the fastest possible submission!
                                        </p>
                                    </div>
                                )}
                                
                                {submissionState.performanceMetrics?.performanceRank && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Performance Rank:</span>
                                        <span className="font-bold text-blue-600">
                                            {submissionState.performanceMetrics.performanceRank}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Error Feedback Modal with Progressive-Aware Error Messages - Responsive & Accessible */}
            {submissionState.status === 'error' && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 transition-all duration-500 animate-in fade-in px-4"
                    role="alertdialog"
                    aria-modal="true"
                    aria-labelledby="error-dialog-title"
                    aria-describedby="error-dialog-description"
                >
                    <div 
                        ref={modalRef}
                        className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 w-full max-w-sm sm:max-w-md text-center transform transition-all duration-700 animate-in zoom-in-95 fade-in"
                    >
                        <div className="mb-4 sm:mb-6">
                            {/* Error icon with warning animation - responsive */}
                            <div className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4">
                                <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-30"></div>
                                <div className="relative bg-red-100 rounded-full p-3 sm:p-4 transform animate-in zoom-in-50 duration-500">
                                    <X 
                                        className="w-10 h-10 sm:w-12 sm:h-12 text-red-600 animate-in zoom-in-95 duration-300 delay-200" 
                                        aria-hidden="true"
                                    />
                                </div>
                            </div>
                            
                            <h3 
                                id="error-dialog-title"
                                className="text-lg sm:text-xl font-bold text-red-600 mb-2 sm:mb-3 animate-in slide-in-from-bottom-2 duration-500 delay-300"
                            >
                                {submissionState.message}
                            </h3>
                            
                            {/* Screen reader announcement for errors */}
                            <div className="sr-only" aria-live="assertive" aria-atomic="true">
                                Error: {submissionState.message}. 
                                {submissionState.performanceMetrics?.fallbackAvailable && 'Backup system available. '}
                                You can try again.
                            </div>
                            
                            {/* Error details with performance context - responsive & accessible */}
                            <div 
                                id="error-dialog-description"
                                className="bg-red-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-sm space-y-3 animate-in slide-in-from-bottom-4 duration-500 delay-700"
                                role="region"
                                aria-label="Error details"
                            >
                                <div className="text-red-800">
                                    <p className="font-medium mb-2">What happened:</p>
                                    <p className="text-sm">
                                        {submissionState.performanceMetrics?.errorType === 'progressive_submission_failure' 
                                            ? 'The ultra-fast submission system encountered an issue, but don\'t worry - we\'re automatically switching to our backup system.'
                                            : 'There was an issue processing your submission. We\'re working to resolve it.'}
                                    </p>
                                </div>
                                
                                {submissionState.performanceMetrics?.fallbackAvailable && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p className="text-blue-800 font-medium text-sm">
                                            ✓ Backup system available - Your exam is safe!
                                        </p>
                                    </div>
                                )}
                                
                                <div className="text-gray-600">
                                    <p className="text-xs">
                                        Time elapsed: {submissionState.submissionTime}ms
                                    </p>
                                </div>
                            </div>
                            
                            {/* Recovery actions - responsive */}
                            <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                                <button
                                    onClick={() => {
                                        setSubmissionState({ status: 'idle', message: '', performanceMetrics: null, showProgress: false, performanceBadge: null, submissionTime: 0 });
                                        submitExam(); // Retry submission
                                    }}
                                    className="w-full bg-blue-600 text-white py-2.5 sm:py-3 px-4 rounded-lg sm:rounded-xl font-medium hover:bg-blue-700 transition-colors active:scale-95 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    aria-describedby="retry-button-description"
                                >
                                    Try Again with Backup System
                                </button>
                                <div id="retry-button-description" className="sr-only">
                                    Retry submitting your exam using the backup processing system
                                </div>
                                
                                <button
                                    onClick={() => {
                                        setSubmissionState({ status: 'idle', message: '', performanceMetrics: null, showProgress: false, performanceBadge: null, submissionTime: 0 });
                                    }}
                                    className="w-full bg-gray-200 text-gray-700 py-2 sm:py-2.5 px-4 rounded-lg sm:rounded-xl font-medium hover:bg-gray-300 transition-colors active:scale-95 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                                    aria-describedby="cancel-button-description"
                                >
                                    Cancel
                                </button>
                                <div id="cancel-button-description" className="sr-only">
                                    Cancel the retry attempt and return to the exam interface
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Warning Dialog */}
            {warningDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
                    <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-red-600 mb-4">
                            ⚠️ Warning #{warningCount + 1}
                        </h3>
                        <p className="text-gray-700 mb-2">
                            {isIOS() 
                                ? "The exam tab has lost focus. Please return to this tab and keep it active during the exam."
                                : "You have exited fullscreen mode or the exam window has lost focus. Please return to fullscreen mode to continue your exam safely."
                            }
                        </p>
                        <p className="text-sm text-red-500 mb-4">
                            Total warnings received: {warningCount}
                        </p>
                        <button
                            onClick={() => {
                                if (isIOS()) {
                                    // On iOS, just close the dialog since we can't enter fullscreen
                                    setWarningDialog(false);
                                    warningIssuedRef.current = false;
                                } else {
                                    enterFullScreen();
                                }
                            }}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                        >
                            {isIOS() ? "Continue Exam" : "Return to Fullscreen"}
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
                                // FIXED: Check if subject is locked for competitive exams - Use consistent variation logic
                                let isLocked = false;
                                let remainingTime = 0;
                                
                                if (isCompetitiveExam && competitiveExamAccess.subjectAccess) {
                                    // Check direct match first
                                    let subjectAccess = competitiveExamAccess.subjectAccess[subject];
                                    
                                    // For CET exams, also check subject name variations (same logic as auto-switch)
                                    if (isCetExam && !subjectAccess) {
                                        const subjectVariations = [subject];
                                        if (subject.toLowerCase().includes('math')) {
                                            subjectVariations.push('Mathematics', 'Maths', 'Math');
                                        } else if (subject.toLowerCase().includes('bio')) {
                                            subjectVariations.push('Biology', 'Bio', 'Botany', 'Zoology');
                                        } else if (subject === 'Biology') {
                                            subjectVariations.push('Bio');
                                        } else if (subject === 'Mathematics') {
                                            subjectVariations.push('Maths', 'Math');
                                        }
                                        
                                        for (const variation of subjectVariations) {
                                            const access = competitiveExamAccess.subjectAccess[variation];
                                            if (access) {
                                                subjectAccess = access;
                                                break;
                                            }
                                        }
                                    }
                                    
                                    if (subjectAccess?.isLocked) {
                                        isLocked = true;
                                        remainingTime = getSubjectUnlockTime(competitiveExamAccess.subjectAccess, subject);
                                    }
                                }
                                
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
                    
                    {/* Competitive Exam Time Restriction Info */}
                    {isCompetitiveExam && !competitiveExamAccess.allUnlocked && (
                        <div className="mt-2 text-center">
                            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                <p className="text-xs text-amber-700 font-medium">
                                    {isCetExam && '🔒 Bio & Maths papers will unlock in 90 minutes'}
                                    {isJeeExam && '🔒 Some sections may have time restrictions'}
                                    {isNeetExam && (
                                        // NEET has no subject restrictions, so this should rarely show
                                        competitiveExamAccess.subjectAccess && 
                                        Object.values(competitiveExamAccess.subjectAccess).some(access => access.isLocked)
                                            ? '🔒 Some subjects are temporarily restricted'
                                            : null
                                    )}
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
                                visitedQuestions={visitedQuestions}
                                currentQuestionIndex={getGlobalQuestionIndex(currentQuestionIndex, selectedSubject)}
                                onGoToQuestion={(index) => {
                                    handleNavigatorGoToQuestion(index);
                                    setShowMobileNavigator(false);
                                }}
                                isCetExam={isCetExam}
                                cetAccess={competitiveExamAccess}
                                isJeeExam={isJeeExam}
                                isNeetExam={isNeetExam}
                                isCompetitiveExam={isCompetitiveExam}
                                selectedSubject={selectedSubject}
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
                                        visitedQuestions={visitedQuestions}
                                        currentQuestionIndex={getGlobalQuestionIndex(currentQuestionIndex, selectedSubject)}
                                        onGoToQuestion={handleNavigatorGoToQuestion}
                                        isCetExam={isCetExam}
                                        cetAccess={competitiveExamAccess}
                                        isJeeExam={isJeeExam}
                                        isNeetExam={isNeetExam}
                                        isCompetitiveExam={isCompetitiveExam}
                                        selectedSubject={selectedSubject}
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
                exam={exam}
            />
        </div>
    )
} 