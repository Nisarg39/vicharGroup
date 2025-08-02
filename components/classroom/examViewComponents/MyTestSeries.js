"use client"
import { useState, useEffect } from 'react'
import { ClockIcon, DocumentTextIcon, CheckCircleIcon, ChartBarIcon, CalendarIcon, UserGroupIcon, BuildingOfficeIcon, ExclamationTriangleIcon, ArrowRightIcon, AcademicCapIcon, BookOpenIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { getEligibleExamsForStudent, getAllExamAttempts } from '../../../server_actions/actions/examController/studentExamActions'
import toast from 'react-hot-toast'

export default function MyTestSeries() {
    const router = useRouter()
    const student = useSelector(state => state.login.studentDetails)
    const [scheduledExams, setScheduledExams] = useState([])
    const [practiceExams, setPracticeExams] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [enrollments, setEnrollments] = useState([])
    const [activeTab, setActiveTab] = useState('scheduled') // 'scheduled' or 'practice'
    const [examResults, setExamResults] = useState({}) // Store exam results by examId
    const [loadingResults, setLoadingResults] = useState({})

    useEffect(() => {
        const fetchEligibleExams = async () => {
            if (!student?._id) {
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                setError(null)
                
                const result = await getEligibleExamsForStudent(student._id)
                
                if (result.success) {
                    setScheduledExams(result.scheduledExams || [])
                    setPracticeExams(result.practiceExams || [])
                    setEnrollments(result.enrollments || [])
                    
                    // Smart tab selection: default to tab with exams, prioritize scheduled
                    const scheduledCount = result.scheduledExams?.length || 0
                    const practiceCount = result.practiceExams?.length || 0
                    
                    if (scheduledCount > 0) {
                        setActiveTab('scheduled')
                    } else if (practiceCount > 0) {
                        setActiveTab('practice')
                    }
                    
                    console.log('Eligible exams fetched:', {
                        scheduled: scheduledCount,
                        practice: practiceCount,
                        defaultTab: scheduledCount > 0 ? 'scheduled' : practiceCount > 0 ? 'practice' : 'scheduled'
                    })
                } else {
                    setError(result.message)
                    toast.error(result.message)
                }
            } catch (err) {
                console.error('Error fetching eligible exams:', err)
                setError('Failed to fetch eligible exams')
                toast.error('Failed to fetch eligible exams')
            } finally {
                setLoading(false)
            }
        }

        fetchEligibleExams()
    }, [student?._id])

    const handleTakeExam = (examId) => {
        window.open(`/exams/${examId}`, '_blank')
    }

    const checkExamResults = async (examId) => {
        if (!student?._id || loadingResults[examId]) return null
        
        setLoadingResults(prev => ({ ...prev, [examId]: true }))
        
        try {
            const result = await getAllExamAttempts(student._id, examId)
            if (result.success && result.attempts && result.attempts.length > 0) {
                // Store the most recent attempt
                const latestAttempt = result.attempts[0]
                setExamResults(prev => ({ 
                    ...prev, 
                    [examId]: {
                        hasResults: true,
                        latestAttempt,
                        allAttempts: result.attempts
                    }
                }))
                return latestAttempt
            } else {
                setExamResults(prev => ({ 
                    ...prev, 
                    [examId]: { hasResults: false }
                }))
                return null
            }
        } catch (error) {
            console.error('Error checking exam results:', error)
            setExamResults(prev => ({ 
                ...prev, 
                [examId]: { hasResults: false }
            }))
            return null
        } finally {
            setLoadingResults(prev => ({ ...prev, [examId]: false }))
        }
    }

    const handleDownloadPDF = async (examId, examName) => {
        if (!examResults[examId]?.hasResults) {
            toast.error('No results available for this exam')
            return
        }

        try {
            const resultData = examResults[examId].latestAttempt
            const examData = [...scheduledExams, ...practiceExams].find(e => e._id === examId)
            
            if (!resultData || !examData) {
                toast.error('Exam data not found')
                return
            }

            // Open the exam page with result view and print parameter
            const params = new URLSearchParams({
                view: 'result',
                print: 'true'
            })
            
            const resultUrl = `/exams/${examId}?${params.toString()}`
            window.open(resultUrl, '_blank')
            
            toast.success('Opening result page for PDF download...')
            
        } catch (error) {
            console.error('Error opening result page:', error)
            toast.error('Failed to open result page')
        }
    }

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Not scheduled'
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getScheduledExamStatus = (exam) => {
        const now = new Date()
        const startTime = exam.startTime ? new Date(exam.startTime) : null
        const endTime = exam.endTime ? new Date(exam.endTime) : null

        // Check exam status from database first
        if (exam.status === 'cancelled') {
            return {
                status: 'cancelled',
                label: 'Cancelled',
                color: 'bg-red-100 text-red-800',
                canTake: false
            }
        }

        if (exam.status === 'completed') {
            return {
                status: 'completed',
                label: 'Completed',
                color: 'bg-gray-100 text-gray-800',
                canTake: false
            }
        }

        // Check if exam is inactive
        if (!exam.eligibility.isActive) {
            return {
                status: 'inactive',
                label: 'Scheduled (Inactive)',
                color: 'bg-yellow-100 text-yellow-800',
                canTake: false
            }
        }

        // Check if exam has no questions
        if (!exam.eligibility.hasQuestions) {
            return {
                status: 'no_questions',
                label: 'No Questions Assigned',
                color: 'bg-gray-100 text-gray-800',
                canTake: false
            }
        }

        if (!exam.eligibility.canAttempt) {
            return {
                status: 'exhausted',
                label: 'Attempts Exhausted',
                color: 'bg-red-100 text-red-800',
                canTake: false
            }
        }

        if (startTime && endTime) {
            if (now < startTime) {
                return {
                    status: 'upcoming',
                    label: 'Upcoming',
                    color: 'bg-blue-100 text-blue-800',
                    canTake: false
                }
            } else if (now >= startTime && now <= endTime) {
                return {
                    status: 'active',
                    label: 'Active Now',
                    color: 'bg-green-100 text-green-800',
                    canTake: true
                }
            } else {
                return {
                    status: 'expired',
                    label: 'Expired',
                    color: 'bg-gray-100 text-gray-800',
                    canTake: false
                }
            }
        }

        // If no timing, treat as available for scheduled exams
        return {
            status: 'available',
            label: 'Available',
            color: 'bg-green-100 text-green-800',
            canTake: true
        }
    }

    const getPracticeExamStatus = (exam) => {
        // Check if exam is inactive
        if (!exam.eligibility.isActive) {
            return {
                status: 'inactive',
                label: 'Scheduled (Inactive)',
                color: 'bg-yellow-100 text-yellow-800',
                canTake: false
            }
        }

        // Check if exam has no questions
        if (!exam.eligibility.hasQuestions) {
            return {
                status: 'no_questions',
                label: 'No Questions Assigned',
                color: 'bg-gray-100 text-gray-800',
                canTake: false
            }
        }

        if (!exam.eligibility.canAttempt) {
            return {
                status: 'exhausted',
                label: 'Attempts Exhausted',
                color: 'bg-red-100 text-red-800',
                canTake: false
            }
        }

        // Practice exams are always available regardless of timing
        return {
            status: 'practice',
            label: 'Practice Mode',
            color: 'bg-purple-100 text-purple-800',
            canTake: true
        }
    }

    // Helper function to sort scheduled exams
    const sortScheduledExams = (exams) => {
        const now = new Date()
        
        return [...exams].sort((a, b) => {
            const aStartTime = a.startTime ? new Date(a.startTime) : null
            const bStartTime = b.startTime ? new Date(b.startTime) : null
            
            // Get exam statuses to determine priority
            const aStatus = getScheduledExamStatus(a)
            const bStatus = getScheduledExamStatus(b)
            
            // Priority order: active > upcoming (nearest first) > cancelled > completed > expired > rest
            const statusPriority = {
                'active': 1,
                'upcoming': 2,
                'cancelled': 3,
                'completed': 4,
                'expired': 5,
                'available': 6,
                'exhausted': 7,
                'inactive': 8,
                'no_questions': 9
            }
            
            const aPriority = statusPriority[aStatus.status] || 6
            const bPriority = statusPriority[bStatus.status] || 6
            
            // First sort by status priority
            if (aPriority !== bPriority) {
                return aPriority - bPriority
            }
            
            // Special handling for upcoming exams - show nearest first
            if (aStatus.status === 'upcoming' && bStatus.status === 'upcoming') {
                if (aStartTime && bStartTime) {
                    return aStartTime - bStartTime // Nearest upcoming first
                }
            }
            
            // For active exams, show ones ending sooner first
            if (aStatus.status === 'active' && bStatus.status === 'active') {
                const aEndTime = a.endTime ? new Date(a.endTime) : null
                const bEndTime = b.endTime ? new Date(b.endTime) : null
                if (aEndTime && bEndTime) {
                    return aEndTime - bEndTime // Ending sooner first
                }
            }
            
            // For cancelled exams that were upcoming, show the ones that were nearer
            if (aStatus.status === 'cancelled' && bStatus.status === 'cancelled') {
                if (aStartTime && bStartTime) {
                    return aStartTime - bStartTime // Originally nearer first
                }
            }
            
            // General time-based sorting for same status
            if (aStartTime && bStartTime) {
                return aStartTime - bStartTime
            }
            
            // If one has start time and other doesn't, prioritize the one with start time
            if (aStartTime && !bStartTime) return -1
            if (!aStartTime && bStartTime) return 1
            
            // If neither has start time, maintain original order
            return 0
        })
    }

    // Check for exam results for all exams
    useEffect(() => {
        if (student?._id && (scheduledExams.length > 0 || practiceExams.length > 0)) {
            const allExams = [...scheduledExams, ...practiceExams]
            allExams.forEach(exam => {
                if (!examResults[exam._id] && !loadingResults[exam._id]) {
                    checkExamResults(exam._id)
                }
            })
        }
    }, [scheduledExams.length, practiceExams.length, student?._id])

    // Helper function to render exam card
    const renderExamCard = (exam, isScheduled = true) => {
        const examStatus = isScheduled ? getScheduledExamStatus(exam) : getPracticeExamStatus(exam)
        const hasResults = examResults[exam._id]?.hasResults
        const isLoadingResults = loadingResults[exam._id]
        
        return (
            <div 
                key={exam._id} 
                className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
                <div className="flex flex-col gap-4 sm:gap-6">
                    <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                <span className={`px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold ${examStatus.color}`}>
                                    {examStatus.label}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${isScheduled ? 'bg-orange-100 text-orange-800' : 'bg-purple-100 text-purple-800'}`}>
                                    {isScheduled ? 'Scheduled' : 'Practice'}
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-2 sm:gap-3 text-gray-600 min-w-0">
                                <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-[#1d77bc]/10 to-[#2d8bd4]/10 flex items-center justify-center flex-shrink-0">
                                    <img 
                                        src={exam.college.collegeLogo || '/default-college-logo.png'} 
                                        alt={exam.college.collegeName}
                                        className="h-5 w-5 sm:h-7 sm:w-7 rounded-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextElementSibling.style.display = 'flex';
                                        }}
                                    />
                                    <BuildingOfficeIcon className="h-3 w-3 sm:h-4 sm:w-4 text-[#1d77bc] hidden" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="font-medium text-xs sm:text-sm truncate block">{exam.college.collegeName}</span>
                                    <span className="text-gray-500 text-xs block">
                                        ({exam.college.collegeCode})
                                    </span>
                                </div>
                            </div>
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 break-words">
                            {exam.examName}
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                            <div className="flex items-center gap-2 text-gray-600 min-w-0">
                                <DocumentTextIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#1d77bc] flex-shrink-0" />
                                <span className="text-xs sm:text-sm truncate">{exam.examSubject.join(', ')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#1d77bc] flex-shrink-0" />
                                <span className="text-xs sm:text-sm">{exam.examDurationMinutes} minutes</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#1d77bc] flex-shrink-0" />
                                <span className="text-xs sm:text-sm">{exam.questionCount} questions</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#1d77bc] flex-shrink-0" />
                                <span className="text-xs sm:text-sm">{exam.totalMarks} marks</span>
                            </div>
                        </div>

                        {/* Exam timing info - only for scheduled exams */}
                        {isScheduled && (exam.startTime || exam.endTime) && (
                            <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                <div className="grid grid-cols-1 gap-2 text-xs sm:text-sm">
                                    <div className="break-words">
                                        <span className="font-medium text-gray-700">Start: </span>
                                        <span className="text-gray-600">{formatDateTime(exam.startTime)}</span>
                                    </div>
                                    <div className="break-words">
                                        <span className="font-medium text-gray-700">End: </span>
                                        <span className="text-gray-600">{formatDateTime(exam.endTime)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Practice exam note */}
                        {!isScheduled && examStatus.status !== 'inactive' && examStatus.status !== 'no_questions' && (
                            <div className="bg-purple-50 rounded-lg p-3 mb-4">
                                <p className="text-xs sm:text-sm text-purple-700 break-words">
                                    <BookOpenIcon className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                                    This is a practice exam. You can take it anytime without time restrictions.
                                </p>
                            </div>
                        )}

                        {/* Inactive exam note */}
                        {examStatus.status === 'inactive' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                                <div className="flex items-start gap-2">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs sm:text-sm font-medium text-yellow-800">Exam Scheduled but Inactive</p>
                                        <p className="text-xs sm:text-sm text-yellow-700 mt-1 break-words">
                                            This exam has been scheduled by your college but is currently inactive. You cannot attempt it yet as the college is still preparing the exam content. This is an indication that the exam will be conducted soon.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* No questions assigned note */}
                        {examStatus.status === 'no_questions' && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                                <div className="flex items-start gap-2">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs sm:text-sm font-medium text-gray-800">Questions Not Yet Assigned</p>
                                        <p className="text-xs sm:text-sm text-gray-700 mt-1 break-words">
                                            Your college has scheduled this exam but hasn't assigned questions yet. You cannot attempt it until questions are added by the college administrators.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Attempt info */}
                        <div className="text-xs sm:text-sm text-gray-600 mb-4">
                            <span className="font-medium">Attempts: </span>
                            {exam.eligibility.attemptsUsed}/{exam.eligibility.maxAttempts}
                            {exam.eligibility.maxAttempts === 0 && ' (Unlimited)'}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 sm:gap-4">
                        <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4 shadow-md flex-1 sm:flex-none sm:min-w-[160px]">
                            <div className="text-lg sm:text-2xl font-bold text-[#1d77bc] mb-1">
                                {exam.stream}
                            </div>
                            <div className="text-gray-600 text-xs sm:text-sm">Class {exam.standard}</div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            {/* Download PDF Button - Show when results are available */}
                            {hasResults && (
                                <button 
                                    onClick={() => handleDownloadPDF(exam._id, exam.examName)}
                                    className="w-full sm:min-w-[120px] py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transform transition-all duration-200 shadow-lg text-xs sm:text-sm bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:scale-[1.02] cursor-pointer"
                                >
                                    <DocumentArrowDownIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="truncate">Download PDF</span>
                                </button>
                            )}
                            
                            {/* Loading indicator for results check */}
                            {isLoadingResults && !hasResults && (
                                <div className="w-full sm:min-w-[120px] py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg bg-gray-100 flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-500"></div>
                                    <span className="text-xs text-gray-600">Checking...</span>
                                </div>
                            )}

                            {/* Take Exam Button */}
                            <button 
                                onClick={() => handleTakeExam(exam._id)}
                                disabled={!examStatus.canTake}
                                className={`w-full sm:min-w-[140px] py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transform transition-all duration-200 shadow-lg text-xs sm:text-sm ${
                                    examStatus.canTake 
                                        ? 'bg-gradient-to-r from-[#1d77bc] to-[#2d8bd4] hover:from-[#1d77bc]/90 hover:to-[#2d8bd4]/90 hover:scale-[1.02] cursor-pointer' 
                                        : 'bg-gray-400 cursor-not-allowed opacity-60'
                                }`}
                            >
                                <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="truncate">{examStatus.canTake ? 'Take Exam' : examStatus.label}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div>
                <div className="mb-6 sm:mb-8 lg:mb-10 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1d77bc] to-[#2d8bd4] mb-2 sm:mb-3">My Exams</h2>
                    <p className="text-gray-600 text-base sm:text-lg px-2">Loading your eligible exams...</p>
                </div>
                
                <div className="flex justify-center items-center py-8 sm:py-12">
                    <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#1d77bc]"></div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-6 sm:mb-8 lg:mb-10 text-center">
                <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1d77bc] to-[#2d8bd4] mb-2 sm:mb-3">My Exams</h2>
                <p className="text-gray-600 text-base sm:text-lg px-2">Take scheduled and practice exams from colleges you've joined</p>
                
                {/* Show enrolled colleges info */}
                {enrollments.length > 0 && (
                    <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 justify-center px-2">
                        {enrollments.map((enrollment) => (
                            <span 
                                key={enrollment.college._id}
                                className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-blue-50 text-blue-700 rounded-full border border-blue-200 flex items-center gap-1.5 sm:gap-2 max-w-full"
                            >
                                <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-gradient-to-br from-[#1d77bc]/10 to-[#2d8bd4]/10 flex items-center justify-center flex-shrink-0">
                                    <img 
                                        src={enrollment.college.collegeLogo || '/default-college-logo.png'} 
                                        alt={enrollment.college.collegeName}
                                        className="h-3 w-3 sm:h-4 sm:w-4 rounded-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextElementSibling.style.display = 'flex';
                                        }}
                                    />
                                    <BuildingOfficeIcon className="h-2 w-2 sm:h-3 sm:w-3 text-[#1d77bc] hidden" />
                                </div>
                                <span className="truncate">{enrollment.college.collegeName} ({enrollment.college.collegeCode})</span>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {error ? (
                <div className="text-center py-8 sm:py-12 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl mx-2">
                    <ExclamationTriangleIcon className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Error Loading Exams</h3>
                    <p className="text-gray-600 text-sm sm:text-base px-4">{error}</p>
                </div>
            ) : enrollments.length === 0 ? (
                <div className="text-center py-8 sm:py-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl mx-2">
                    <DocumentTextIcon className="w-12 h-12 sm:w-16 sm:h-16 text-[#1d77bc] mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No College Enrollments</h3>
                    <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base px-4">Join a college first to see available exams</p>
                    <p className="text-xs sm:text-sm text-gray-500 px-4">
                        Go to the "Join College" tab to request enrollment in colleges
                    </p>
                </div>
            ) : (
                <div>
                    {/* Tab Navigation */}
                    <div className="flex items-center justify-center mb-6 sm:mb-8 px-2">
                        <div className="flex bg-gray-100 rounded-2xl p-1.5 sm:p-2 gap-1 w-full sm:w-auto overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('scheduled')}
                                className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap text-xs sm:text-sm lg:text-base ${
                                    activeTab === 'scheduled'
                                        ? 'bg-white text-orange-700 shadow-lg'
                                        : 'text-gray-600 hover:text-orange-600 hover:bg-white/50'
                                }`}
                            >
                                <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline">Scheduled Exams</span>
                                <span className="sm:hidden">Scheduled</span>
                                <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold ${
                                    activeTab === 'scheduled'
                                        ? 'bg-orange-100 text-orange-700'
                                        : 'bg-gray-200 text-gray-600'
                                }`}>
                                    {scheduledExams.length}
                                </span>
                            </button>
                            
                            <button
                                onClick={() => setActiveTab('practice')}
                                className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap text-xs sm:text-sm lg:text-base ${
                                    activeTab === 'practice'
                                        ? 'bg-white text-purple-700 shadow-lg'
                                        : 'text-gray-600 hover:text-purple-600 hover:bg-white/50'
                                }`}
                            >
                                <AcademicCapIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline">Practice Exams</span>
                                <span className="sm:hidden">Practice</span>
                                <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold ${
                                    activeTab === 'practice'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-gray-200 text-gray-600'
                                }`}>
                                    {practiceExams.length}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[400px]">
                        {activeTab === 'scheduled' ? (
                            <div>
                                {/* Scheduled Exams Header */}
                                <div className="text-center mb-6 sm:mb-8">
                                    <div className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-3 bg-orange-50 px-4 sm:px-6 py-3 rounded-2xl mx-2">
                                        <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                                        <div className="text-center sm:text-left">
                                            <h3 className="text-base sm:text-lg font-bold text-orange-900">Scheduled Exams</h3>
                                            <p className="text-orange-700 text-xs sm:text-sm">Time-based exams with specific start and end times</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Scheduled Exams List */}
                                <div className="grid gap-4 sm:gap-6 px-2">
                                    {scheduledExams.length > 0 ? (
                                        sortScheduledExams(scheduledExams).map((exam) => renderExamCard(exam, true))
                                    ) : (
                                        <div className="text-center py-8 sm:py-12 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl">
                                            <CalendarIcon className="w-12 h-12 sm:w-16 sm:h-16 text-orange-400 mx-auto mb-3 sm:mb-4" />
                                            <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Scheduled Exams</h4>
                                            <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base px-4">No time-based exams are currently available for your enrolled colleges</p>
                                            <p className="text-xs sm:text-sm text-gray-500 px-4">
                                                Scheduled exams will appear here when colleges create them with specific timings
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div>
                                {/* Practice Exams Header */}
                                <div className="text-center mb-6 sm:mb-8">
                                    <div className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-3 bg-purple-50 px-4 sm:px-6 py-3 rounded-2xl mx-2">
                                        <AcademicCapIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                                        <div className="text-center sm:text-left">
                                            <h3 className="text-base sm:text-lg font-bold text-purple-900">Practice Exams</h3>
                                            <p className="text-purple-700 text-xs sm:text-sm">Practice anytime without time restrictions</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Practice Exams List */}
                                <div className="grid gap-4 sm:gap-6 px-2">
                                    {practiceExams.length > 0 ? (
                                        practiceExams.map((exam) => renderExamCard(exam, false))
                                    ) : (
                                        <div className="text-center py-8 sm:py-12 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl">
                                            <BookOpenIcon className="w-12 h-12 sm:w-16 sm:h-16 text-purple-400 mx-auto mb-3 sm:mb-4" />
                                            <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Practice Exams</h4>
                                            <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base px-4">No practice exams are currently available for your enrolled colleges</p>
                                            <p className="text-xs sm:text-sm text-gray-500 px-4">
                                                Practice exams allow you to test your knowledge without time pressure
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
