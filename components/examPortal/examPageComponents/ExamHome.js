"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import toast from "react-hot-toast"
import { useSelector, useDispatch } from "react-redux"
import { getStudentDetails } from "../../../server_actions/actions/studentActions"
import { studentDetails } from "../../../features/login/LoginSlice"
import { checkExamEligibility, submitExamResult, getStudentExamResults, getStudentExamResult, getAllExamAttempts } from "../../../server_actions/actions/examController/studentExamActions"

// Import sub-components
import LoadingSpinner from "./examHomeComponents/LoadingSpinner"
import ContinueExamPrompt from "./examHomeComponents/ContinueExamPrompt"
import ExamHeader from "./examHomeComponents/ExamHeader"
import PreviousAttemptAlert from "./examHomeComponents/PreviousAttemptAlert"
import ExamDetailsCard from "./examHomeComponents/ExamDetailsCard"
import ExamAttemptsTable from "./examHomeComponents/ExamAttemptsTable"
import OfflineCapabilitiesCard from "./examHomeComponents/OfflineCapabilitiesCard"

// Import main components
import ExamInterface from "./ExamInterface"
import Instructions from "./Instructions"
import ExamResult from "./ExamResult"
import { VicharCard, VicharCardContent, VicharCardHeader, VicharCardTitle } from "../../ui/vichar-card";
import { VicharButton } from "../../ui/vichar-button";
import { VicharTable } from "../../ui/vichar-table";

export default function ExamHome({ examId }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const dispatch = useDispatch()
    const student = useSelector(state => state.login.studentDetails)
    const [exam, setExam] = useState(null)
    const [examQuestions, setExamQuestions] = useState([])
    const [isOnline, setIsOnline] = useState(navigator.onLine)
    const [isLoading, setIsLoading] = useState(true)
    const [currentView, setCurrentView] = useState('home') // 'home', 'instructions', 'exam', 'result'
    const [examProgress, setExamProgress] = useState(null)
    const [offlineSubmissions, setOfflineSubmissions] = useState([])
    const [examResult, setExamResult] = useState(null)
    const [hasAttempted, setHasAttempted] = useState(false)
    const [previousResult, setPreviousResult] = useState(null)
    const [allAttempts, setAllAttempts] = useState([]);
    const [selectedAttempt, setSelectedAttempt] = useState(null);
    const [isEligible, setIsEligible] = useState(false); // NEW: eligibility state

    // Add state for continue exam prompt
    const [showContinuePrompt, setShowContinuePrompt] = useState(false);
    const [hasSavedProgress, setHasSavedProgress] = useState(false);
    const [pendingExamStart, setPendingExamStart] = useState(false);

    // Helper to get the progress key
    const getProgressKey = () => exam && student?._id ? `exam_progress_${exam._id}_${student._id}` : null;

    // Handler for starting or retaking exam
    const handleStartExam = () => {
        if (!isEligible) {
            toast.error('You are not eligible to attempt this exam.');
            return;
        }
        const progressKey = getProgressKey();
        if (progressKey) {
            const savedProgress = localStorage.getItem(progressKey);
            if (savedProgress) {
                setHasSavedProgress(true);
                setShowContinuePrompt(true);
                setPendingExamStart(true);
                return;
            }
        }
        setCurrentView('instructions');
    };

    // Handler for continue exam
    const handleContinueExam = () => {
        setShowContinuePrompt(false);
        setPendingExamStart(false);
        setCurrentView('instructions');
    };

    // Handler for start new exam
    const handleStartNewExam = () => {
        const progressKey = getProgressKey();
        if (progressKey) {
            localStorage.removeItem(progressKey);
        }
        setShowContinuePrompt(false);
        setPendingExamStart(false);
        setCurrentView('instructions');
    };

    // Sync offline submissions
    const syncOfflineData = useCallback(async () => {
        if (!isOnline || offlineSubmissions.length === 0) return

        try {
            // Starting to sync offline submissions
            
            const successfulSubmissions = []
            const failedSubmissions = []
            
            for (const submission of offlineSubmissions) {
                // Submitting exam result
                
                const result = await submitExamResult({
                    examId: submission.examId,
                    studentId: submission.studentId,
                    answers: submission.answers,
                    score: submission.score,
                    totalMarks: exam?.totalMarks || 0,
                    timeTaken: submission.timeTaken || 0,
                    completedAt: submission.completedAt,
                    isOfflineSubmission: true
                })
                
                if (result.success) {
                    // Exam submitted successfully
                    successfulSubmissions.push(submission)
                    // Store the result to show to the student
                    setExamResult(result.result)
                } else {
                    console.error('Failed to submit exam:', result.message)
                    // Don't throw error for duplicate submissions, just log them
                    if (result.message.includes('already submitted')) {
                        // Exam already submitted, skipping
                        successfulSubmissions.push(submission) // Consider it "successful" since it's already in DB
                    } else {
                        failedSubmissions.push({ submission, error: result.message })
                    }
                }
            }
            
            // Remove only the successfully synced submissions
            const remainingSubmissions = offlineSubmissions.filter(sub =>
                !successfulSubmissions.some(successSub =>
                    successSub.examId === sub.examId && successSub.timestamp === sub.timestamp
                )
            );

            if (remainingSubmissions.length > 0) {
                localStorage.setItem('offline_submissions', JSON.stringify(remainingSubmissions));
                setOfflineSubmissions(remainingSubmissions);
            } else {
                localStorage.removeItem('offline_submissions');
                setOfflineSubmissions([]);
            }
            
            if (successfulSubmissions.length > 0) {
                toast.success(`${successfulSubmissions.length} exam(s) synced successfully!`)
                
                // IMMEDIATELY refresh attempts after sync to validate reattempt logic
                const updatedAttempts = await getAllExamAttempts(student._id, examId);
                if (updatedAttempts.success) {
                    setAllAttempts(updatedAttempts.attempts);
                    // Update hasAttempted state since we now have at least one attempt
                    if (updatedAttempts.attempts.length > 0) {
                        setHasAttempted(true);
                    }
                }
                
                // Show result if this was a recent submission
                if (examResult) {
                    setCurrentView('result')
                } else {
                    // Fetch the latest result from database and show it
                    const latestResult = await fetchLatestExamResult()
                    if (latestResult) {
                        setExamResult(latestResult)
                        setCurrentView('result')
                    }
                }
            }
            
            if (failedSubmissions.length > 0) {
                toast.error(`${failedSubmissions.length} exam(s) failed to sync`)
            }
        } catch (error) {
            console.error('Error syncing offline data:', error)
            toast.error('Failed to sync some offline submissions')
        }
    }, [isOnline, offlineSubmissions, exam])

    // Check online status
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true)
            toast.success("Connection restored! Syncing offline data...")
            // Add a small delay to ensure state is updated
            setTimeout(() => {
                syncOfflineData()
            }, 1000)
        }
        
        const handleOffline = () => {
            setIsOnline(false)
            toast.error("You're offline. Exam will continue in offline mode.")
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [syncOfflineData])

    // Load cached exam data
    useEffect(() => {
        loadCachedExamData()
    }, [examId])

    // Load cached exam data from localStorage
    const loadCachedExamData = useCallback(() => {
        try {
            const cachedExam = localStorage.getItem(`exam_${examId}`)
            const cachedQuestions = localStorage.getItem(`exam_questions_${examId}`)
            const cachedProgress = localStorage.getItem(`exam_progress_${examId}`)
            const cachedSubmissions = localStorage.getItem('offline_submissions')

            if (cachedExam) {
                setExam(JSON.parse(cachedExam))
            }
            if (cachedQuestions) {
                setExamQuestions(JSON.parse(cachedQuestions))
            }
            if (cachedProgress) {
                setExamProgress(JSON.parse(cachedProgress))
            }
            if (cachedSubmissions) {
                setOfflineSubmissions(JSON.parse(cachedSubmissions))
            }
        } catch (error) {
            console.error('Error loading cached data:', error)
        }
    }, [examId])

    // Cache exam data
    const cacheExamData = useCallback((examData, questions) => {
        try {
            localStorage.setItem(`exam_${examId}`, JSON.stringify(examData))
            localStorage.setItem(`exam_questions_${examId}`, JSON.stringify(questions))
        } catch (error) {
            console.error('Error caching exam data:', error)
        }
    }, [examId])

    // Fetch latest exam result
    const fetchLatestExamResult = useCallback(async () => {
        if (!student?._id) return null
        
        try {
            // Fetching exam results for student
            const results = await getStudentExamResults(student._id)
            // Retrieved exam results
            
            if (results.success && results.results.length > 0) {
                // Found exam results
                
                // Find the result for this specific exam - try multiple matching strategies
                let examResult = results.results.find(result => 
                    result.examName === exam?.examName
                )
                
                if (!examResult) {
                    examResult = results.results.find(result => 
                        result._id === examId
                    )
                }
                
                if (!examResult) {
                    // Try to find by exam ID in the result data
                    examResult = results.results.find(result => 
                        result.exam && result.exam._id === examId
                    )
                }
                
                // Matched exam result
                
                if (examResult) {
                    return {
                        score: examResult.score,
                        totalMarks: examResult.totalMarks,
                        percentage: examResult.percentage,
                        correctAnswers: examResult.statistics?.correctAnswers || 0,
                        incorrectAnswers: examResult.statistics?.incorrectAnswers || 0,
                        unattempted: examResult.statistics?.unattempted || 0,
                        timeTaken: examResult.timeTaken,
                        completedAt: examResult.completedAt,
                        questionAnalysis: examResult.questionAnalysis || []
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching exam result:', error)
        }
        return null
    }, [student?._id, exam?.examName, examId])

    // Check if student has already attempted this exam
    const checkPreviousAttempt = async () => {
        try {
            // Basic validation
            if (!student?._id || !examId) {
                return
            }
            
            // Direct API call
            const result = await getStudentExamResult(student._id, examId)
            
            if (result.success && result.result) {
                setHasAttempted(true)
                setPreviousResult({
                    score: result.result.score,
                    totalMarks: result.result.totalMarks,
                    percentage: result.result.percentage,
                    correctAnswers: result.result.statistics?.correctAnswers || 0,
                    incorrectAnswers: result.result.statistics?.incorrectAnswers || 0,
                    unattempted: result.result.statistics?.unattempted || 0,
                    timeTaken: result.result.timeTaken,
                    completedAt: result.result.completedAt,
                    questionAnalysis: result.result.questionAnalysis || []
                })
            }
        } catch (error) {
            console.error('Error checking previous attempt:', error.message)
        }
    }

    const checkEligibility = async (student) => {
        const details = {
            examId: examId,
            studentId: student._id
        }
        
        try {
            const eligibility = await checkExamEligibility(details)
            if(eligibility.success){
                toast.success(eligibility.message)
                setExam(eligibility.exam)
                setIsEligible(true); // NEW: set eligible
                
                // Cache exam data for offline use
                cacheExamData(eligibility.exam, eligibility.exam.examQuestions || [])
                
                // Load questions if available
                if (eligibility.exam.examQuestions) {
                    setExamQuestions(eligibility.exam.examQuestions)
                    // Questions loaded successfully
                } else {
                    // No questions found in exam data
                }
                
                // Eligibility check completed
            } else {
                toast.error(eligibility.message)
                setIsEligible(false); // NEW: set not eligible
            }
        } catch (error) {
            console.error('Error checking eligibility:', error)
            toast.error('Failed to check exam eligibility')
            setIsEligible(false); // NEW: set not eligible
        }
    }

    useEffect(() => {
        const isSignedIn = localStorage.getItem("token")
        const viewParam = searchParams.get('view')
        const printParam = searchParams.get('print')
        
        if(!isSignedIn){
            toast.error("Please sign in to access this page")
            localStorage.setItem("examIdRedirect", `${examId}`)
            setTimeout(() => {
                router.push("/login")  
            }, 2000)
        } else if (!student || !student.name) {
            getStudentDetails(isSignedIn).then(studentDetail => {
                if(studentDetail.success){
                    dispatch(studentDetails(studentDetail.student))
                    // Check previous attempt immediately after getting student details
                    checkPreviousAttempt()
                    checkEligibility(studentDetail.student)
                    
                    // Handle result view after student is loaded
                    if (viewParam === 'result') {
                        handleDirectResultView(studentDetail.student, printParam === 'true')
                    }
                } else {
                    localStorage.removeItem('token')
                    router.push('/login')
                }
            }).finally(() => {
                setIsLoading(false)
            })
        } else {
            // Check previous attempt immediately if student is already loaded
            checkPreviousAttempt()
            checkEligibility(student)
            
            // Handle result view if student is already loaded
            if (viewParam === 'result') {
                handleDirectResultView(student, printParam === 'true')
            }
            
            setIsLoading(false)
        }
    }, [examId, searchParams]) // Added searchParams dependency

    // Additional useEffect to ensure checkPreviousAttempt runs when student is loaded
    useEffect(() => {
        if (student?._id && examId && !hasAttempted) {
            checkPreviousAttempt()
        }
    }, [student?._id, examId, hasAttempted])

    // Fetch all attempts when student and examId are available
    useEffect(() => {
        async function fetchAttempts() {
            if (student?._id && examId) {
                // Fetching attempts for student and exam
                const res = await getAllExamAttempts(student._id, examId);
                // Retrieved exam attempts response
                if (res.success) {
                    // Setting attempts data
                    setAllAttempts(res.attempts);
                    // Update hasAttempted state based on actual attempts
                    setHasAttempted(res.attempts.length > 0);
                } else {
                    console.error("Failed to fetch attempts:", res.message);
                }
            }
        }
        fetchAttempts();
    }, [student?._id, examId, examResult]); // refetch after new attempt

    // Refresh state when coming back to home view
    useEffect(() => {
        if (currentView === 'home' && student?._id && examId) {
            // Small delay to ensure state is properly set before refreshing
            const timeoutId = setTimeout(() => {
                refreshExamState();
            }, 100);
            return () => clearTimeout(timeoutId);
        }
    }, [currentView, student?._id, examId]);

    // Find the best attempt (highest score, if tie: earliest date)
    const bestAttempt = allAttempts.length > 0 ? allAttempts.reduce((best, curr) => {
        if (!best) return curr;
        if (curr.score > best.score) return curr;
        if (curr.score === best.score && new Date(curr.completedAt) < new Date(best.completedAt)) return curr;
        return best;
    }, null) : null;


    const beginExam = () => {
        setCurrentView('exam')
    }

    const viewPreviousResult = () => {
        if (previousResult) {
            // Check if this is a scheduled exam and if results can be shown
            const isScheduledExam = exam?.examAvailability === 'scheduled';
            const examEndTime = exam?.endTime ? new Date(exam.endTime) : null;
            const currentTime = new Date();
            const isBeforeEndTime = examEndTime && currentTime < examEndTime;
            
            if (isScheduledExam && isBeforeEndTime) {
                const endTimeFormatted = examEndTime.toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                });
                toast.error(
                    `Results will be available after the exam ends at ${endTimeFormatted}`,
                    { duration: 5000 }
                );
                return;
            }
            
            setExamResult(previousResult)
            setCurrentView('result')
        }
    }

    // Function to refresh exam state when returning from result view
    const refreshExamState = async () => {
        if (student?._id && examId) {
            try {
                // Refresh attempts data
                const updatedAttempts = await getAllExamAttempts(student._id, examId);
                if (updatedAttempts.success) {
                    setAllAttempts(updatedAttempts.attempts);
                    // Update hasAttempted state based on actual attempts
                    setHasAttempted(updatedAttempts.attempts.length > 0);
                }
                
                // Refresh previous attempt data
                const result = await getStudentExamResult(student._id, examId);
                if (result.success && result.result) {
                    setPreviousResult({
                        score: result.result.score,
                        totalMarks: result.result.totalMarks,
                        percentage: result.result.percentage,
                        correctAnswers: result.result.statistics?.correctAnswers || 0,
                        incorrectAnswers: result.result.statistics?.incorrectAnswers || 0,
                        unattempted: result.result.statistics?.unattempted || 0,
                        timeTaken: result.result.timeTaken,
                        completedAt: result.result.completedAt,
                        questionAnalysis: result.result.questionAnalysis || []
                    });
                }
            } catch (error) {
                console.error('Error refreshing exam state:', error);
            }
        }
    }

    const handleExamComplete = async (examData) => {
        try {
            const submission = {
                examId,
                studentId: student._id,
                answers: examData.answers,
                score: examData.score,
                timeTaken: examData.timeTaken,
                warnings: examData.warnings || 0, // Include warnings in submission
                completedAt: new Date().toISOString(),
                timestamp: Date.now()
            };

            if (isOnline) {
                // Submit immediately if online
                // Submitting exam result to server
                
                const result = await submitExamResult({
                    examId,
                    studentId: student._id,
                    answers: examData.answers,
                    score: examData.score,
                    totalMarks: exam?.totalMarks || 0,
                    timeTaken: examData.timeTaken || 0,
                    warnings: examData.warnings || 0, // Include warnings
                    completedAt: new Date().toISOString(),
                    isOfflineSubmission: false
                });
                
                // Exam submission completed

                if (result.success) {
                    // Check if this is a scheduled exam and if current time is before end time
                    const isScheduledExam = examData.examAvailability === 'scheduled';
                    const examEndTime = examData.examEndTime ? new Date(examData.examEndTime) : null;
                    const currentTime = new Date();
                    const isBeforeEndTime = examEndTime && currentTime < examEndTime;
                    
                    if (isScheduledExam && isBeforeEndTime) {
                        // For scheduled exams submitted before end time, don't show results immediately
                        const timeUntilEnd = examEndTime - currentTime;
                        const minutesUntilEnd = Math.ceil(timeUntilEnd / (1000 * 60));
                        
                        // Store the result but don't display it yet
                        setExamResult(result.result);
                        setHasAttempted(true);
                        
                        // Update attempts
                        const updatedAttempts = await getAllExamAttempts(student._id, examId);
                        if (updatedAttempts.success) {
                            setAllAttempts(updatedAttempts.attempts);
                            if (updatedAttempts.attempts.length > 0) {
                                setPreviousResult({
                                    score: result.result.score,
                                    totalMarks: result.result.totalMarks,
                                    percentage: result.result.percentage,
                                    correctAnswers: result.result.statistics?.correctAnswers || 0,
                                    incorrectAnswers: result.result.statistics?.incorrectAnswers || 0,
                                    unattempted: result.result.statistics?.unattempted || 0,
                                    timeTaken: result.result.timeTaken,
                                    completedAt: result.result.completedAt,
                                    questionAnalysis: result.result.questionAnalysis || []
                                });
                            }
                        }
                        
                        // Show home view with a special message
                        setCurrentView('home');
                        
                        // Format the end time for display
                        const endTimeFormatted = examEndTime.toLocaleString('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                        });
                        
                        toast.success(
                            `Exam submitted successfully! Results will be available after the exam ends at ${endTimeFormatted}`,
                            { duration: 8000 }
                        );
                    } else {
                        // For practice exams or scheduled exams after end time, show results immediately
                        setExamResult(result.result);
                        
                        // IMMEDIATELY refresh attempts after submission to validate reattempt logic
                        const updatedAttempts = await getAllExamAttempts(student._id, examId);
                        if (updatedAttempts.success) {
                            setAllAttempts(updatedAttempts.attempts);
                            // Update hasAttempted state since we now have at least one attempt
                            setHasAttempted(true);
                            // Update previous result state for the "View Previous Result" functionality
                            if (updatedAttempts.attempts.length > 0) {
                                setPreviousResult({
                                    score: result.result.score,
                                    totalMarks: result.result.totalMarks,
                                    percentage: result.result.percentage,
                                    correctAnswers: result.result.statistics?.correctAnswers || 0,
                                    incorrectAnswers: result.result.statistics?.incorrectAnswers || 0,
                                    unattempted: result.result.statistics?.unattempted || 0,
                                    timeTaken: result.result.timeTaken,
                                    completedAt: result.result.completedAt,
                                    questionAnalysis: result.result.questionAnalysis || []
                                });
                            }
                        }
                        
                        setCurrentView('result');
                        toast.success('Exam submitted successfully!');
                    }
                    
                    // Remove any pending offline submission for this exam (if it exists)
                    const updatedSubmissions = offlineSubmissions.filter(sub => sub.examId !== examId);
                    setOfflineSubmissions(updatedSubmissions);
                    if (updatedSubmissions.length === 0) {
                        localStorage.removeItem('offline_submissions');
                    } else {
                        localStorage.setItem('offline_submissions', JSON.stringify(updatedSubmissions));
                    }
                } else {
                    toast.error('Failed to submit exam: ' + result.message);
                    setCurrentView('home');
                }
            } else {
                // Add to offlineSubmissions only if offline
                const existingSubmission = offlineSubmissions.find(sub => sub.examId === examId);
                if (existingSubmission) {
                    // Replace the existing submission with the new one
                    const updatedSubmissions = offlineSubmissions.map(sub =>
                        sub.examId === examId ? submission : sub
                    );
                    setOfflineSubmissions(updatedSubmissions);
                    localStorage.setItem('offline_submissions', JSON.stringify(updatedSubmissions));
                } else {
                    // Add new submission
                    const updatedSubmissions = [...offlineSubmissions, submission];
                    setOfflineSubmissions(updatedSubmissions);
                    localStorage.setItem('offline_submissions', JSON.stringify(updatedSubmissions));
                }
                toast.success('Exam completed! Will sync when connection is restored.');
                setCurrentView('home');
            }
        } catch (error) {
            console.error('Error submitting exam:', error);
            toast.error('An error occurred while submitting the exam. Please try again.');
            // Don't change the view on error, stay on exam page
        }
    };

    // Add a helper to check for saved progress
    const hasUncompletedExam = (() => {
        const progressKey = exam && student?._id ? `exam_progress_${exam._id}_${student._id}` : null;
        if (progressKey) {
            const savedProgress = localStorage.getItem(progressKey);
            return !!savedProgress;
        }
        return false;
    })();

    // Handler for continue exam (no prompt)
    const handleContinueExamDirect = () => {
        setCurrentView('exam');
    };

    // Handler for viewing attempt details
    const handleViewAttemptDetails = (attempt) => {
        setSelectedAttempt(attempt);
        setCurrentView('attemptDetails');
    };

    // Handler for viewing results
    const handleViewResults = async () => {
        // Check if this is a scheduled exam and if results can be shown
        const isScheduledExam = exam?.examAvailability === 'scheduled';
        const examEndTime = exam?.endTime ? new Date(exam.endTime) : null;
        const currentTime = new Date();
        const isBeforeEndTime = examEndTime && currentTime < examEndTime;
        
        if (isScheduledExam && isBeforeEndTime) {
            const endTimeFormatted = examEndTime.toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short'
            });
            toast.error(
                `Results will be available after the exam ends at ${endTimeFormatted}`,
                { duration: 5000 }
            );
            return;
        }
        
        const result = await fetchLatestExamResult();
        if (result) {
            setExamResult(result);
            setCurrentView('result');
        } else {
            toast.error('No results found for this exam');
        }
    };

    // Handler for direct result view from URL parameters
    const handleDirectResultView = async (studentData, autoPrint = false) => {
        try {
            const result = await getAllExamAttempts(studentData._id, examId);
            if (result.success && result.attempts && result.attempts.length > 0) {
                // Get the latest attempt
                const latestAttempt = result.attempts[0];
                
                // Convert to the format expected by ExamResult component
                const formattedResult = {
                    score: latestAttempt.score,
                    totalMarks: latestAttempt.totalMarks,
                    percentage: latestAttempt.percentage,
                    correctAnswers: latestAttempt.statistics?.correctAnswers || 0,
                    incorrectAnswers: latestAttempt.statistics?.incorrectAnswers || 0,
                    unattempted: latestAttempt.statistics?.unattempted || 0,
                    timeTaken: latestAttempt.timeTaken,
                    completedAt: latestAttempt.completedAt,
                    questionAnalysis: latestAttempt.questionAnalysis || [],
                    negativeMarkingInfo: latestAttempt.negativeMarkingInfo
                };
                
                setExamResult(formattedResult);
                setAllAttempts(result.attempts);
                setCurrentView('result');
                
                // Auto-trigger print if requested
                if (autoPrint) {
                    setTimeout(() => {
                        window.print();
                    }, 2000); // Give time for the component to render
                }
            } else {
                toast.error('No exam results found');
                setCurrentView('home');
            }
        } catch (error) {
            console.error('Error loading exam result:', error);
            toast.error('Failed to load exam result');
            setCurrentView('home');
        }
    };

    // Loading state
    if (isLoading) {
        return <LoadingSpinner />
    }

    // Continue exam prompt
    if (showContinuePrompt && hasSavedProgress && pendingExamStart) {
        return (
            <ContinueExamPrompt
                showContinuePrompt={showContinuePrompt}
                hasSavedProgress={hasSavedProgress}
                pendingExamStart={pendingExamStart}
                onContinueExam={handleContinueExam}
                onStartNewExam={handleStartNewExam}
            />
        )
    }

    // Instructions view
    if (currentView === 'instructions') {
        return <Instructions exam={exam} onStart={beginExam} onBack={() => setCurrentView('home')} />
    }

    // Exam interface
    if (currentView === 'exam') {
        return (
            <ExamInterface 
                exam={exam}
                questions={exam?.examQuestions || examQuestions || []}
                student={student}
                onComplete={handleExamComplete}
                isOnline={isOnline}
                onBack={() => setCurrentView('home')}
            />
        )
    }

    // Handler for retake with reattempt validation
    const handleRetake = () => {
        // exam.reattempt: allowed attempts (0 = unlimited, but server treats as 1 if undefined)
        // allAttempts: array of all attempts for this student and exam
        const allowed = exam?.reattempt || 1; // Match server logic: default to 1 attempt
        const attempts = allAttempts.length;
        if (allowed > 0 && attempts >= allowed) {
            toast.error(`You have reached the maximum allowed attempts (${allowed}) for this exam.`);
            return;
        }
        setCurrentView('instructions');
    };

    // Result view
    if (currentView === 'result') {
        return (
            <ExamResult 
                result={examResult}
                exam={exam}
                onBack={() => {
                    refreshExamState(); // Refresh state before going back
                    setCurrentView('home');
                }}
                onRetake={handleRetake}
                allAttempts={allAttempts}
            />
        )
    }

    // Attempt details view
    if (currentView === 'attemptDetails' && selectedAttempt) {
        return (
            <ExamResult
                result={selectedAttempt}
                exam={exam}
                onBack={() => {
                    refreshExamState(); // Refresh state before going back
                    setCurrentView('home');
                }}
                onRetake={handleRetake}
                allAttempts={allAttempts}
            />
        );
    }

    // Main home view
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/10 to-blue-400/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-gradient-to-br from-purple-400/5 to-pink-400/5 rounded-full blur-2xl"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
                <div className="space-y-6 sm:space-y-8">
                    {/* Header */}
                    <section aria-label="Exam Portal Header" className="animate-fadeIn">
                        <ExamHeader
                            student={student}
                            isOnline={isOnline}
                            offlineSubmissions={offlineSubmissions}
                            onSyncOfflineData={syncOfflineData}
                            onViewResults={handleViewResults}
                        />
                    </section>

                    {/* Alerts and Previous Attempt */}
                    <section aria-label="Exam Alerts" className="space-y-4 animate-slideUp" style={{animationDelay: '0.1s'}}>
                        <PreviousAttemptAlert
                            hasAttempted={hasAttempted}
                            onViewPreviousResult={viewPreviousResult}
                        />
                    </section>

                    {/* Main Content Grid */}
                    <section aria-label="Exam Main Content" className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 animate-slideUp" style={{animationDelay: '0.2s'}}>
                        {/* Main Content Area */}
                        <div className="lg:col-span-8 space-y-6 lg:space-y-8">
                            {/* Exam Details */}
                            <div className="group">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 bg-black bg-clip-text text-transparent">
                                        Exam Details
                                    </h2>
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent ml-6"></div>
                                </div>
                                <div className="transform transition-all duration-300 hover:scale-[1.02]">
                                    <ExamDetailsCard
                                        exam={exam}
                                        hasUncompletedExam={hasUncompletedExam}
                                        hasAttempted={hasAttempted}
                                        allAttempts={allAttempts}
                                        isOnline={isOnline}
                                        onStartExam={handleStartExam}
                                        onContinueExam={handleContinueExamDirect}
                                        onViewPreviousResult={viewPreviousResult}
                                        isEligible={isEligible}
                                    />
                                </div>
                            </div>

                            {/* Attempts Table */}
                            <div className="group">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 bg-black bg-clip-text text-transparent">
                                        Your Attempts
                                    </h2>
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent ml-6"></div>
                                </div>
                                <div className="transform transition-all duration-300 hover:scale-[1.01]">
                                    <ExamAttemptsTable
                                        allAttempts={allAttempts}
                                        bestAttempt={bestAttempt}
                                        onViewAttemptDetails={handleViewAttemptDetails}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4 space-y-6 lg:space-y-8">
                            <div className="group">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 bg-black bg-clip-text text-transparent">
                                        Offline & Sync
                                    </h2>
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent ml-6"></div>
                                </div>
                                <div className="transform transition-all duration-300 hover:scale-[1.02]">
                                    <OfflineCapabilitiesCard />
                                </div>
                            </div>

                            {/* Additional Info Panel */}
                            <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    Exam Guidelines
                                </h3>
                                <div className="space-y-3 text-sm text-gray-700">
                                    <div className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <span>Ensure stable internet connection for best experience</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <span>Your progress is automatically saved every few seconds</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <span>Questions can be marked for review and revisited later</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <span>Exam supports offline mode with automatic sync</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
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
            `}</style>
        </div>
    )
}