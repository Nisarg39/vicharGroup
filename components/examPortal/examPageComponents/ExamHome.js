"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
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

export default function ExamHome({ examId }) {
    const router = useRouter()
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

    // Add state for continue exam prompt
    const [showContinuePrompt, setShowContinuePrompt] = useState(false);
    const [hasSavedProgress, setHasSavedProgress] = useState(false);
    const [pendingExamStart, setPendingExamStart] = useState(false);

    // Helper to get the progress key
    const getProgressKey = () => exam && student?._id ? `exam_progress_${exam._id}_${student._id}` : null;

    // Handler for starting or retaking exam
    const handleStartExam = () => {
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
        setCurrentView('exam');
    };

    // Handler for continue exam
    const handleContinueExam = () => {
        setShowContinuePrompt(false);
        setPendingExamStart(false);
        setCurrentView('exam');
    };

    // Handler for start new exam
    const handleStartNewExam = () => {
        const progressKey = getProgressKey();
        if (progressKey) {
            localStorage.removeItem(progressKey);
        }
        setShowContinuePrompt(false);
        setPendingExamStart(false);
        setCurrentView('exam');
    };

    // Sync offline submissions
    const syncOfflineData = useCallback(async () => {
        if (!isOnline || offlineSubmissions.length === 0) return

        try {
            console.log('Starting to sync offline submissions:', offlineSubmissions.length)
            
            const successfulSubmissions = []
            const failedSubmissions = []
            
            for (const submission of offlineSubmissions) {
                console.log('Submitting exam result:', submission.examId)
                
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
                    console.log('Exam submitted successfully:', result.result)
                    successfulSubmissions.push(submission)
                    // Store the result to show to the student
                    setExamResult(result.result)
                } else {
                    console.error('Failed to submit exam:', result.message)
                    // Don't throw error for duplicate submissions, just log them
                    if (result.message.includes('already submitted')) {
                        console.log('Exam already submitted, skipping:', submission.examId)
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
            console.log('Fetching exam results for student:', student._id)
            const results = await getStudentExamResults(student._id)
            console.log('All exam results:', results)
            
            if (results.success && results.results.length > 0) {
                console.log('Found', results.results.length, 'exam results')
                
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
                
                console.log('Matched exam result:', examResult)
                
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
                
                // Cache exam data for offline use
                cacheExamData(eligibility.exam, eligibility.exam.examQuestions || [])
                
                // Load questions if available
                if (eligibility.exam.examQuestions) {
                    setExamQuestions(eligibility.exam.examQuestions)
                    console.log('Questions set:', eligibility.exam.examQuestions.length, 'questions')
                    console.log('First question sample:', eligibility.exam.examQuestions[0])
                } else {
                    console.log('No questions found in exam data')
                }
                
                console.log('Eligibility check result:', eligibility)
                console.log('Exam data:', eligibility.exam)
                console.log('Exam questions:', eligibility.exam.examQuestions)
            } else {
                toast.error(eligibility.message)
            }
        } catch (error) {
            console.error('Error checking eligibility:', error)
            toast.error('Failed to check exam eligibility')
        }
    }

    useEffect(() => {
        const isSignedIn = localStorage.getItem("token")
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
            setIsLoading(false)
        }
    }, [examId]) // Added examId dependency to ensure it runs when examId changes

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
                const res = await getAllExamAttempts(student._id, examId);
                if (res.success) {
                    setAllAttempts(res.attempts);
                }
            }
        }
        fetchAttempts();
    }, [student?._id, examId, examResult]); // refetch after new attempt

    // Find the best attempt (highest score, if tie: earliest date)
    const bestAttempt = allAttempts.length > 0 ? allAttempts.reduce((best, curr) => {
        if (!best) return curr;
        if (curr.score > best.score) return curr;
        if (curr.score === best.score && new Date(curr.completedAt) < new Date(best.completedAt)) return curr;
        return best;
    }, null) : null;

    const startExam = () => {
        setCurrentView('instructions')
    }

    const beginExam = () => {
        setCurrentView('exam')
    }

    const viewPreviousResult = () => {
        if (previousResult) {
            setExamResult(previousResult)
            setCurrentView('result')
        }
    }

    const handleExamComplete = async (examData) => {
        const submission = {
            examId,
            studentId: student._id,
            answers: examData.answers,
            score: examData.score,
            timeTaken: examData.timeTaken,
            completedAt: new Date().toISOString(),
            timestamp: Date.now()
        };

        if (isOnline) {
            // Submit immediately if online
            const result = await submitExamResult({
                examId,
                studentId: student._id,
                answers: examData.answers,
                score: examData.score,
                totalMarks: exam?.totalMarks || 0,
                timeTaken: examData.timeTaken || 0,
                completedAt: new Date().toISOString(),
                isOfflineSubmission: false
            });

            if (result.success) {
                setExamResult(result.result);
                setCurrentView('result');
                toast.success('Exam submitted successfully!');
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
        const result = await fetchLatestExamResult();
        if (result) {
            setExamResult(result);
            setCurrentView('result');
        } else {
            toast.error('No results found for this exam');
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
            />
        )
    }

    // Result view
    if (currentView === 'result') {
        return (
            <ExamResult 
                result={examResult}
                exam={exam}
                onBack={() => setCurrentView('home')}
                onRetake={() => setCurrentView('instructions')}
            />
        )
    }

    // Attempt details view
    if (currentView === 'attemptDetails' && selectedAttempt) {
        return (
            <ExamResult
                result={selectedAttempt}
                exam={exam}
                onBack={() => setCurrentView('home')}
                onRetake={() => setCurrentView('instructions')}
            />
        );
    }

    // Main home view
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="container mx-auto px-4 py-6 max-w-6xl">
                <div className="space-y-6">
                {/* Header */}
                    <ExamHeader
                        student={student}
                        isOnline={isOnline}
                        offlineSubmissions={offlineSubmissions}
                        onSyncOfflineData={syncOfflineData}
                        onViewResults={handleViewResults}
                    />

                    {/* Previous Attempt Alert */}
                    <PreviousAttemptAlert
                        hasAttempted={hasAttempted}
                        onViewPreviousResult={viewPreviousResult}
                    />

                {/* Exam Details */}
                    <ExamDetailsCard
                        exam={exam}
                        hasUncompletedExam={hasUncompletedExam}
                        hasAttempted={hasAttempted}
                        allAttempts={allAttempts}
                        isOnline={isOnline}
                        onStartExam={handleStartExam}
                        onContinueExam={handleContinueExamDirect}
                        onViewPreviousResult={viewPreviousResult}
                    />

                    {/* All Attempts Table */}
                    <ExamAttemptsTable
                        allAttempts={allAttempts}
                        bestAttempt={bestAttempt}
                        onViewAttemptDetails={handleViewAttemptDetails}
                    />

                    {/* Offline Capabilities */}
                    <OfflineCapabilitiesCard />
                        </div>
            </div>
        </div>
    )
}