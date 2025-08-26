"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/badge"
import {
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  Target,
  BarChart3,
  ArrowLeft,
  AlertCircle,
  BookOpen
} from "lucide-react"
import { useSelector } from "react-redux"
import { useEffect, useState } from "react"

export default function ExamResult({ result, exam, onBack, onRetake, allAttempts = [] }) {
  
  // ALL HOOKS MUST BE AT THE TOP - React Rules of Hooks
  // Get student info from Redux
  const student = useSelector(state => state.login.studentDetails)
  
  // State for subject filtering (moved to top)
  const [selectedSubject, setSelectedSubject] = useState('All')
  
  // Add print-specific CSS for clean PDF/print output (moved to top)
  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      @media print {
        html, body {
          background: #fff !important;
          color: #222 !important;
          font-family: system-ui, Arial, 'Segoe UI', 'Liberation Sans', sans-serif !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body * { visibility: hidden !important; }
        #pdf-result-content, #pdf-result-content * { visibility: visible !important; }
        #pdf-result-content {
          position: absolute !important;
          left: 0; top: 0;
          width: 100vw !important;
          max-width: 800px !important;
          margin: 0 auto !important;
          padding: 32px 32px 32px 32px !important;
          background: #f8f9fa !important;
          color: #222 !important;
          border-radius: 8px !important;
        }
        .no-print, .no-print * { display: none !important; }
        .print-question { page-break-inside: avoid !important; break-inside: avoid !important; }
        /* Show all questions in print, regardless of filter */
        .print-all-questions { display: block !important; }
        .screen-only { display: none !important; }
        /* Card backgrounds and borders */
        .bg-white, .bg-white\/95, .bg-white\/90, .bg-gray-50 {
          background: #f8f9fa !important;
        }
        .border, .border-gray-100, .border-gray-200, .border-blue-200, .border-green-200, .border-red-200, .border-purple-200, .border-yellow-200, .border-orange-200 {
          border-color: #bbb !important;
        }
        /* Remove box-shadows and blurs */
        .shadow, .shadow-xl, .shadow-sm, .backdrop-blur-xl {
          box-shadow: none !important;
          filter: none !important;
        }
        /* Typography */
        .text-xs, .text-sm, .text-lg, .text-2xl, .text-4xl, .text-5xl {
          font-size: 12pt !important;
        }
        .font-bold, .font-semibold, .font-medium {
          font-weight: 600 !important;
        }
        /* Icon handling: grayscale for print */
        svg, [class*="lucide-"] {
          filter: grayscale(100%) !important;
        }
        /* Padding and margin adjustments */
        .p-2, .p-3, .p-4, .p-6, .p-8, .px-2, .px-3, .px-4, .px-5, .px-6, .px-8, .py-2, .py-3, .py-4, .py-6 {
          padding: 0.5em 1em !important;
        }
        .mb-1, .mb-2, .mb-3, .mb-4, .mb-6, .mt-1, .mt-2, .mt-3, .mt-4, .mt-6, .mt-8 {
          margin-bottom: 0.7em !important;
          margin-top: 0.7em !important;
        }
        /* Hide action buttons and navigation */
        button, .no-print, .no-print * {
          display: none !important;
        }
        /* Ensure page breaks between questions if needed */
        .print-question {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        /* Avoid breaking inside cards */
        .card, .Card, [class*="card"], [class*="Card"] {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
      }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])
  
  // Helper function to check if exam is scheduled and still in progress
  const isScheduledExamInProgress = () => {
    // Check if exam is scheduled type
    const isScheduled = exam?.examAvailability === 'scheduled'
    
    if (isScheduled && exam?.endTime) {
      const currentTime = new Date()
      const examEndTime = new Date(exam.endTime)
      return currentTime < examEndTime
    }
    
    return false
  }
  
  // EMERGENCY QUEUE SYSTEM: Handle queued submissions
  if (result?.isQueued) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <CardTitle className="text-2xl text-blue-600">Submission Successful!</CardTitle>
            <CardDescription className="text-lg">
              Your exam has been submitted and is being processed
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3">
              <div className="flex justify-center items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="text-lg font-medium text-green-700">Submission Confirmed</span>
              </div>
              
              <p className="text-gray-700">
                {result.message || "Your answers have been received and are being processed in the background."}
              </p>
              
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Processing Status:</span>
                  <Badge variant={result.status === 'processing' ? 'default' : 'secondary'}>
                    {result.status === 'processing' ? 'Computing Scores' : 'In Queue'}
                  </Badge>
                </div>
                
                {result.processingMessage && (
                  <p className="text-sm text-blue-600 mb-2">{result.processingMessage}</p>
                )}
                
                {result.processingPercentage && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${result.processingPercentage}%` }}
                    ></div>
                  </div>
                )}
                
                <p className="text-xs text-gray-500">
                  Estimated completion: {result.estimatedProcessingTime || "1-2 minutes"}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white rounded-lg p-3 border">
                  <div className="text-sm text-gray-600">Time Taken</div>
                  <div className="font-medium">
                    {Math.floor(result.timeTaken / 60)}:{(result.timeTaken % 60).toString().padStart(2, '0')}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border">
                  <div className="text-sm text-gray-600">Warnings</div>
                  <div className="font-medium">{result.warnings || 0}</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4 mt-6">
              <Button onClick={onBack} variant="outline" className="px-8">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            
            <div className="text-sm text-gray-500 mt-4">
              <Clock className="h-4 w-4 inline mr-1" />
              Your results will appear here automatically once processing is complete.
              <br />
              You can safely close this page and check back later.
            </div>
            
            {result.submissionId && (
              <div className="text-xs text-gray-400 mt-2">
                Submission ID: {result.submissionId}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Early return with warning if scheduled exam is still in progress
  if (isScheduledExamInProgress()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border-orange-200">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl font-bold text-orange-800">
                Results Not Available Yet
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                This is a scheduled exam that is currently in progress. Results will be available after the exam ends.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-orange-700 font-medium">
                  Exam ends at: {new Date(exam.endTime).toLocaleString()}
                </p>
              </div>
              <Button
                onClick={onBack}
                variant="outline"
                className="w-full font-semibold px-5 py-2 rounded-lg"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  // Utility function for safe numeric conversion with bounds checking
  const safeNumber = (value, defaultValue = 0, min = null, max = null) => {
    let num = parseFloat(value)
    if (isNaN(num) || !isFinite(num)) {
      num = defaultValue
    }
    if (min !== null && num < min) num = min
    if (max !== null && num > max) num = max
    return num
  }

  // Helper function to get marks for subject with proper type safety
  const getMarksForSubject = (subject, markingDetails) => {
    if (markingDetails.isSubjectWise && markingDetails.subjects && markingDetails.subjects[subject]) {
      return safeNumber(markingDetails.subjects[subject].correct, 4, 0, 100)
    }
    return safeNumber(markingDetails.positiveMarks, 4, 0, 100)
  }

  let {
    score,
    totalMarks,
    timeTaken,
    completedAt,
    questionAnalysis = [],
    collegeDetails = null,
    warnings = 0, // Extract warnings from result
    statistics = {} // Extract statistics object
  } = result

  // Extract statistics data from the nested statistics object
  let {
    correctAnswers = 0,
    incorrectAnswers = 0,
    unattempted = 0
  } = statistics

  // Apply comprehensive numeric validation to all extracted values
  score = safeNumber(score, 0, 0, totalMarks)
  totalMarks = safeNumber(totalMarks, 0, 0)
  correctAnswers = safeNumber(correctAnswers, 0, 0)
  incorrectAnswers = safeNumber(incorrectAnswers, 0, 0)
  unattempted = safeNumber(unattempted, 0, 0)
  timeTaken = safeNumber(timeTaken, 0, 0)
  warnings = safeNumber(warnings, 0, 0)

  // Clamp score to valid ranges after numeric validation
  score = Math.min(score, totalMarks)

  // Helper function to get actual marking scheme used for evaluation
  const getGeneralMarkingScheme = () => {
    // Priority 1: Use server-provided marking rules (database-driven)
    if (exam?.markingRulePreview?.hasMarkingRules) {
      // Trust server-provided database values directly
      return {
        positiveMarks: exam.markingRulePreview.positiveMarks,
        negativeMarks: exam.markingRulePreview.negativeMarks,
        isSubjectWise: exam.markingRulePreview.isSubjectWise || false,
        subjects: exam.markingRulePreview.subjects || {},
        ruleSource: exam.markingRulePreview.ruleSource || 'super_admin_default',
        ruleDescription: exam.markingRulePreview.ruleDescription || 'Database-configured marking scheme'
      }
    }

    // Priority 2: Fallback to result's negativeMarkingInfo if no preview rules
    if (result?.negativeMarkingInfo) {
      return {
        positiveMarks: result.negativeMarkingInfo.positiveMarks || exam?.positiveMarks || exam?.marks || 1,
        negativeMarks: result.negativeMarkingInfo.negativeMarks || 0,
        isSubjectWise: false,
        subjects: {},
        ruleSource: result.negativeMarkingInfo.ruleSource || 'super_admin_default',
        ruleDescription: result.negativeMarkingInfo.ruleDescription || 'Applied marking scheme'
      }
    }

    // Priority 3: Final fallback to exam basic properties (least preferred)
    console.log('✅ Using Priority 3: fallback to exam properties')
    return {
      positiveMarks: exam?.positiveMarks || exam?.marks || 1,
      negativeMarks: exam?.negativeMarks || 0,
      isSubjectWise: false,
      subjects: {},
      ruleSource: 'exam_specific',
      ruleDescription: 'Basic exam configuration (no super admin rules found)'
    }
  }


  // Fallback: Try to get college details from student object if not in result
  const finalCollegeDetails = collegeDetails || (() => {
    if (student?.college && typeof student.college === 'object' && student.college.collegeName) {
      return student.college;
    } else if (exam?.college && typeof exam.college === 'object' && exam.college.collegeName) {
      return exam.college;
    } else if (student?.college && typeof student.college === 'string') {
      return { collegeName: 'College', collegeCode: student.college };
    } else if (exam?.college && typeof exam.college === 'string') {
      return { collegeName: 'College', collegeCode: exam.college };
    }
    return null;
  })();

  // Calculate safe values for accuracy, time efficiency, and completion rate with comprehensive validation
  const totalQuestions = safeNumber(correctAnswers + incorrectAnswers + unattempted, 0, 0)
  const accuracy = totalQuestions > 0 ? safeNumber(((correctAnswers / totalQuestions) * 100), 0, 0, 100).toFixed(2) : "0.00"
  const timePerQuestion = totalQuestions > 0 ? Math.round(safeNumber(timeTaken / totalQuestions, 0, 0)) : 0
  const completionRate = totalQuestions > 0 ? safeNumber((((correctAnswers + incorrectAnswers) / totalQuestions) * 100), 0, 0, 100).toFixed(1) : "0.0"

  // Calculate marks breakdown - will be set after markingDetails is available

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }


  // Helper function to get question by ID
  const getQuestionById = (questionId) => {
    if (!exam?.examQuestions) return null
    return exam.examQuestions.find(q => q._id === questionId)
  }

  // Calculate actual marks earned and deducted from question analysis
  const calculateActualMarks = () => {
    if (!questionAnalysis || questionAnalysis.length === 0) {
      // Fallback calculation if no question analysis - use safe numeric handling
      const safePositiveMarks = safeNumber(typeof positiveMarksPerQuestion === 'number' ? positiveMarksPerQuestion : 4, 4, 0)
      const safeNegativeMarks = safeNumber(negativeMarksPerQuestion, 0, 0)
      return {
        totalMarksEarned: correctAnswers * safePositiveMarks,
        totalMarksDeducted: incorrectAnswers * safeNegativeMarks
      }
    }

    let earned = 0
    let deducted = 0

    questionAnalysis.forEach(analysis => {
      const marks = safeNumber(analysis.marks, 0)
      if (marks > 0) {
        earned += marks
      } else if (marks < 0) {
        deducted += Math.abs(marks)
      }
    })

    return { totalMarksEarned: earned, totalMarksDeducted: deducted }
  }

  const { totalMarksEarned, totalMarksDeducted } = calculateActualMarks()

  // Get general marking scheme for display to students
  const generalMarkingScheme = getGeneralMarkingScheme()
  const markingDetails = generalMarkingScheme

  // Calculate marks breakdown using marking details with proper type safety
  const positiveMarksPerQuestion = markingDetails.isSubjectWise ? markingDetails.positiveMarks : safeNumber(markingDetails.positiveMarks, 4, 0)
  const negativeMarksPerQuestion = safeNumber(result?.negativeMarkingInfo?.negativeMarks || markingDetails.negativeMarks, 0, 0)

  // Check if this is a JEE exam
  const isJeeExam = exam?.stream?.toLowerCase().includes('jee')
  
  // Get unique subjects from questions with competitive exam ordering
  const getUniqueSubjects = () => {
    if (!exam?.examQuestions || !questionAnalysis.length) return []
    
    const subjects = new Set()
    questionAnalysis.forEach(analysis => {
      const question = getQuestionById(analysis.questionId)
      if (question?.subject) {
        subjects.add(question.subject)
      }
    })
    
    // Apply competitive exam ordering (Physics, Chemistry, then others alphabetically)
    const uniqueSubjects = Array.from(subjects)
    const priorityOrder = ['Physics', 'Chemistry']
    const orderedSubjects = []
    
    // Add priority subjects first if they exist
    priorityOrder.forEach(subject => {
      if (uniqueSubjects.includes(subject)) {
        orderedSubjects.push(subject)
      }
    })
    
    // Add remaining subjects alphabetically
    const remainingSubjects = uniqueSubjects
      .filter(subject => !priorityOrder.includes(subject))
      .sort()
    
    return [...orderedSubjects, ...remainingSubjects]
  }

  const uniqueSubjects = getUniqueSubjects()

  // Sort question analysis to match exam interface display order
  const getSortedQuestionAnalysis = () => {
    if (!questionAnalysis || questionAnalysis.length === 0) return []
    
    // Create a copy to avoid mutating original
    const analysisCopy = [...questionAnalysis]
    
    // For JEE exams, we need to sort by subject order, then by section, then by question number
    if (isJeeExam) {
      analysisCopy.sort((a, b) => {
        const questionA = getQuestionById(a.questionId)
        const questionB = getQuestionById(b.questionId)
        
        if (!questionA || !questionB) return 0
        
        // First, sort by subject order (Physics, Chemistry, then others)
        const subjectIndexA = uniqueSubjects.indexOf(questionA.subject)
        const subjectIndexB = uniqueSubjects.indexOf(questionB.subject)
        
        if (subjectIndexA !== subjectIndexB) {
          return subjectIndexA - subjectIndexB
        }
        
        // Within same subject, sort by section (Section A = 1 before Section B = 2)
        const sectionA = questionA.section || 1
        const sectionB = questionB.section || 1
        
        if (sectionA !== sectionB) {
          return sectionA - sectionB
        }
        
        // Within same section, sort by question number
        return (questionA.questionNumber || 0) - (questionB.questionNumber || 0)
      })
    }
    // For other exams, sort by subject order only
    else {
      analysisCopy.sort((a, b) => {
        const questionA = getQuestionById(a.questionId)
        const questionB = getQuestionById(b.questionId)
        
        if (!questionA || !questionB) return 0
        
        // Sort by subject order
        const subjectIndexA = uniqueSubjects.indexOf(questionA.subject)
        const subjectIndexB = uniqueSubjects.indexOf(questionB.subject)
        
        if (subjectIndexA !== subjectIndexB) {
          return subjectIndexA - subjectIndexB
        }
        
        // Within same subject, maintain original order or use question number if available
        return (questionA.questionNumber || 0) - (questionB.questionNumber || 0)
      })
    }
    
    return analysisCopy
  }

  // Get sorted question analysis
  const sortedQuestionAnalysis = getSortedQuestionAnalysis()

  // Filter questions based on selected subject (using sorted array)
  const filteredQuestionAnalysis = selectedSubject === 'All' 
    ? sortedQuestionAnalysis 
    : sortedQuestionAnalysis.filter(analysis => {
        const question = getQuestionById(analysis.questionId)
        return question?.subject === selectedSubject
      })

  // Calculate subject-wise performance
  const calculateSubjectPerformance = () => {
    // First priority: Use server-provided subjectPerformance if available
    if (result?.subjectPerformance && Array.isArray(result.subjectPerformance) && result.subjectPerformance.length > 0) {
      // Use server-calculated data with proper totalMarks
      return result.subjectPerformance.map(serverSubject => {
        // Estimate time spent per subject (proportional to questions)
        const totalQuestionsInExam = sortedQuestionAnalysis.length || 1
        const timeSpent = serverSubject.totalQuestions > 0 ? 
          Math.round((timeTaken * serverSubject.totalQuestions) / totalQuestionsInExam) : 0
        
        // Calculate difficulty breakdown (estimated)
        const difficultyBreakdown = {
          easy: Math.floor(serverSubject.correct * 0.6),
          medium: Math.floor(serverSubject.correct * 0.3),
          hard: Math.floor(serverSubject.correct * 0.1)
        }
        
        return {
          subject: serverSubject.subject,
          totalQuestions: serverSubject.totalQuestions,
          attempted: serverSubject.attempted,
          correct: serverSubject.correct,
          incorrect: serverSubject.incorrect,
          unanswered: serverSubject.unanswered,
          marks: serverSubject.marks,
          maxMarks: serverSubject.totalMarks, // Use server-calculated totalMarks instead of recalculating
          percentage: serverSubject.percentage || 0,
          accuracy: serverSubject.accuracy || 0,
          timeSpent,
          difficulty: difficultyBreakdown
        }
      })
    }
    
    // Fallback: Calculate client-side if server data not available
    if (!sortedQuestionAnalysis.length || !uniqueSubjects.length) return []
    
    return uniqueSubjects.map(subject => {
      const subjectQuestions = sortedQuestionAnalysis.filter(analysis => {
        const question = getQuestionById(analysis.questionId)
        return question?.subject === subject
      })
      
      const totalQuestions = subjectQuestions.length
      const correct = subjectQuestions.filter(q => q.status === 'correct').length
      const incorrect = subjectQuestions.filter(q => q.status === 'incorrect').length
      const unanswered = subjectQuestions.filter(q => q.status === 'unattempted').length
      const attempted = correct + incorrect
      
      const subjectMarks = subjectQuestions.reduce((sum, q) => sum + (q.marks || 0), 0)
      
      // Calculate max possible marks correctly for subject-wise marking
      let maxPossibleMarks = 0
      if (markingDetails.isSubjectWise && markingDetails.subjects[subject]) {
        // Use subject-specific positive marks
        maxPossibleMarks = totalQuestions * markingDetails.subjects[subject].correct
      } else {
        // Use standard positive marks with proper numeric validation
        const standardMarks = getMarksForSubject(subject, markingDetails)
        maxPossibleMarks = totalQuestions * standardMarks
      }
      
      const accuracy = attempted > 0 ? safeNumber(((correct / attempted) * 100), 0, 0, 100).toFixed(2) : '0.00'
      const percentage = maxPossibleMarks > 0 ? safeNumber(((subjectMarks / maxPossibleMarks) * 100), 0, 0, 100).toFixed(1) : '0.0'
      
      // Estimate time spent per subject (proportional to questions)
      const timeSpent = totalQuestions > 0 ? Math.round((timeTaken * totalQuestions) / sortedQuestionAnalysis.length) : 0
      
      // Calculate difficulty breakdown (estimated)
      const difficultyBreakdown = {
        easy: Math.floor(correct * 0.6),
        medium: Math.floor(correct * 0.3),
        hard: Math.floor(correct * 0.1)
      }
      
      return {
        subject,
        totalQuestions,
        attempted,
        correct,
        incorrect,
        unanswered,
        marks: subjectMarks,
        maxMarks: maxPossibleMarks,
        percentage: safeNumber(parseFloat(percentage), 0, 0, 100),
        accuracy: safeNumber(parseFloat(accuracy), 0, 0, 100),
        timeSpent,
        difficulty: difficultyBreakdown
      }
    })
  }


  // Helper function for performance colors (CSS classes)
  const getPerformanceColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 75) return 'text-blue-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Helper function for performance colors (hex values for SVG)
  const getPerformanceColorHex = (percentage) => {
    if (percentage >= 90) return '#10B981' // green-600
    if (percentage >= 75) return '#3B82F6' // blue-600
    if (percentage >= 60) return '#F59E0B' // yellow-600
    return '#EF4444' // red-600
  }

  // Calculate the data
  const subjectPerformance = calculateSubjectPerformance()

  // Helper component for circular progress
  const CircularProgress = ({ percentage, size = 120, strokeWidth = 8, color = "#3B82F6" }) => {
    const safePercentage = safeNumber(percentage, 0, 0, 100)
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (safePercentage / 100) * circumference

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-900">{safePercentage.toFixed(1)}%</span>
        </div>
      </div>
    )
  }

  // Helper component for progress bar
  const ProgressBar = ({ percentage, color = "bg-blue-500", label }) => {
    const safePercentage = safeNumber(percentage, 0, 0, 100)
    return (
      <div className="w-full">
        {label && <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">{label}</span>
          <span className="font-medium">{safePercentage.toFixed(1)}%</span>
        </div>}
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`${color} h-2.5 rounded-full transition-all duration-1000 ease-out`}
            style={{ width: `${safePercentage}%` }}
          ></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8 flex flex-col items-center" style={{ position: 'relative' }}>
      <div className="w-full max-w-3xl space-y-8">
        {/* Header & Actions */}
        <div className="flex flex-col sm:flex-row justify-center sm:justify-end items-center gap-3 mb-2">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={onBack}
              variant="outline"
              className="no-print font-semibold px-5 py-2 rounded-lg shadow-sm w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button
              onClick={() => window.print()}
              variant="default"
              className="no-print bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg shadow-sm w-full sm:w-auto"
            >
              Print / Download PDF
            </Button>
          </div>
        </div>
        <div id="pdf-result-content">
          {/* Student, College, Exam Info */}
          <Card className="mb-6 bg-white/95 border border-gray-100/80 shadow-xl rounded-2xl">
            <CardContent className="py-6 px-6">
              {/* Header Section */}
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-6">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">Exam Results</h1>
                  <p className="text-gray-600 font-medium text-lg">{exam?.examName}</p>
                  <p className="text-gray-500 text-sm">Date: {new Date(completedAt).toLocaleDateString()}</p>
                </div>
                
                {/* College Logo Section */}
                {finalCollegeDetails?.collegeLogo && (
                  <div className="flex justify-center lg:justify-end">
                    <img 
                      src={finalCollegeDetails.collegeLogo} 
                      alt={`${finalCollegeDetails?.collegeName || 'College'} Logo`}
                      className="h-16 w-16 object-cover rounded-full border-2 border-gray-300 shadow-sm"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student Information */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    Student Information
                  </h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Name:</span>
                      <span className="font-semibold text-gray-900">{student?.name || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Email:</span>
                      <span className="font-semibold text-gray-900">{student?.email || "-"}</span>
                    </div>
                    {student?.rollNumber && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Roll No:</span>
                        <span className="font-semibold text-gray-900">{student.rollNumber}</span>
                      </div>
                    )}
                    {student?.phoneNumber && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Phone:</span>
                        <span className="font-semibold text-gray-900">{student.phoneNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* College Information */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    College Information
                  </h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    {finalCollegeDetails?.collegeName ? (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">College:</span>
                        <span className="font-semibold text-gray-900 text-right">{finalCollegeDetails.collegeName}</span>
                      </div>
                    ) : (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">College:</span>
                        <span className="text-gray-500">-</span>
                      </div>
                    )}
                    {finalCollegeDetails?.collegeCode && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">College Code:</span>
                        <span className="font-semibold text-gray-900">{finalCollegeDetails.collegeCode}</span>
                      </div>
                    )}
                    {finalCollegeDetails?.collegeLocation && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Location:</span>
                        <span className="font-semibold text-gray-900">{finalCollegeDetails.collegeLocation}</span>
                      </div>
                    )}
                    {exam?.stream && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Stream:</span>
                        <span className="font-semibold text-gray-900">{exam.stream}</span>
                      </div>
                    )}
                    {exam?.department && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Department:</span>
                        <span className="font-semibold text-gray-900">{exam.department}</span>
                      </div>
                    )}
                    {exam?.academicYear && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Academic Year:</span>
                        <span className="font-semibold text-gray-900">{exam.academicYear}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <Card className="mb-6 bg-white/95 border border-gray-100/80 shadow-xl rounded-2xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-blue-600">Exam Result</CardTitle>
              <CardDescription className="text-gray-700 mt-1">
                You scored <span className="font-semibold text-gray-900">{score}</span> out of <span className="font-semibold text-gray-900">{totalMarks}</span> marks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Circular Diagrams - Side by side on desktop, stacked on mobile */}
              <div className="flex flex-col lg:flex-row lg:justify-center lg:items-start gap-8 lg:gap-12 mb-6">
                {/* Main Performance Circle */}
                <div className="flex flex-col items-center">
                  <CircularProgress 
                    percentage={totalMarks > 0 ? safeNumber((score / totalMarks) * 100, 0, 0, 100) : 0} 
                    size={150}
                    strokeWidth={12}
                    color={getPerformanceColorHex(totalMarks > 0 ? safeNumber((score / totalMarks) * 100, 0, 0, 100) : 0)}
                  />
                  <div className="mt-3 text-center">
                    <div className="text-lg font-semibold text-gray-900">Overall Score</div>
                    <div className="text-sm text-gray-600">{score} / {totalMarks} marks</div>
                  </div>
                </div>

                {/* Question Distribution Pie Chart */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                  <svg width="150" height="150" className="transform -rotate-90">
                    {(() => {
                      const total = correctAnswers + incorrectAnswers + unattempted;
                      if (total === 0) return null;
                      
                      const correctPercentage = safeNumber((correctAnswers / total) * 100, 0, 0, 100);
                      const incorrectPercentage = safeNumber((incorrectAnswers / total) * 100, 0, 0, 100);
                      const unattemptedPercentage = safeNumber((unattempted / total) * 100, 0, 0, 100);
                      
                      const radius = 60;
                      const circumference = 2 * Math.PI * radius;
                      
                      const correctStroke = (correctPercentage / 100) * circumference;
                      const incorrectStroke = (incorrectPercentage / 100) * circumference;
                      const unattemptedStroke = (unattemptedPercentage / 100) * circumference;
                      
                      let currentOffset = 0;
                      
                      return (
                        <>
                          {/* Correct answers segment */}
                          {correctAnswers > 0 && (
                            <circle
                              cx="75"
                              cy="75"
                              r={radius}
                              fill="transparent"
                              stroke="#10B981"
                              strokeWidth="16"
                              strokeLinecap="round"
                              strokeDasharray={`${correctStroke} ${circumference - correctStroke}`}
                              strokeDashoffset={currentOffset}
                              className="transition-all duration-1000 ease-out"
                            />
                          )}
                          {/* Incorrect answers segment */}
                          {incorrectAnswers > 0 && (
                            <circle
                              cx="75"
                              cy="75"
                              r={radius}
                              fill="transparent"
                              stroke="#EF4444"
                              strokeWidth="16"
                              strokeLinecap="round"
                              strokeDasharray={`${incorrectStroke} ${circumference - incorrectStroke}`}
                              strokeDashoffset={currentOffset - correctStroke}
                              className="transition-all duration-1000 ease-out"
                            />
                          )}
                          {/* Unattempted segment */}
                          {unattempted > 0 && (
                            <circle
                              cx="75"
                              cy="75"
                              r={radius}
                              fill="transparent"
                              stroke="#9CA3AF"
                              strokeWidth="16"
                              strokeLinecap="round"
                              strokeDasharray={`${unattemptedStroke} ${circumference - unattemptedStroke}`}
                              strokeDashoffset={currentOffset - correctStroke - incorrectStroke}
                              className="transition-all duration-1000 ease-out"
                            />
                          )}
                        </>
                      );
                    })()}
                  </svg>
                  <div className="absolute top-0 left-0 w-[150px] h-[150px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{totalQuestions}</div>
                      <div className="text-xs text-gray-600">Questions</div>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <div className="text-lg font-semibold text-gray-900">Question Distribution</div>
                    <div className="text-sm text-gray-600">{totalQuestions} total questions</div>
                  </div>
                  </div>
                </div>
              </div>

              {/* Legend for the pie chart */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg mx-auto mb-6">
                <div className="flex items-center justify-center gap-2 bg-green-50 px-3 py-3 rounded-lg min-h-[60px]">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></div>
                  <div className="text-center">
                    <div className="font-semibold text-green-900 text-lg">{correctAnswers}</div>
                    <div className="text-xs text-green-700">Correct</div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 bg-red-50 px-3 py-3 rounded-lg min-h-[60px]">
                  <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0"></div>
                  <div className="text-center">
                    <div className="font-semibold text-red-900 text-lg">{incorrectAnswers}</div>
                    <div className="text-xs text-red-700">Incorrect</div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 bg-gray-50 px-3 py-3 rounded-lg min-h-[60px]">
                  <div className="w-4 h-4 bg-gray-400 rounded-full flex-shrink-0"></div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 text-lg">{unattempted}</div>
                    <div className="text-xs text-gray-700">Unattempted</div>
                  </div>
                </div>
              </div>

              {/* Time and completion info - Mobile responsive */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <div className="flex items-center justify-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-blue-900">Time Taken:</span>
                  <span className="text-sm text-blue-700">{formatTime(timeTaken)}</span>
                </div>
                <div className="flex items-center justify-center gap-2 bg-purple-50 px-4 py-2 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <div className="flex flex-col sm:flex-row items-center gap-1">
                    <span className="text-sm font-medium text-purple-900">Completed On:</span>
                    <span className="text-sm text-purple-700 text-center sm:text-left">{new Date(completedAt).toLocaleDateString()} at {new Date(completedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Analysis */}
          <Card className="mb-6 bg-white/95 border border-gray-100/80 shadow-xl rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Accuracy */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900">Accuracy</span>
                    <span className="text-lg font-bold text-blue-600">{accuracy}%</span>
                  </div>
                  <ProgressBar 
                    percentage={parseFloat(accuracy)} 
                    color="bg-blue-500"
                  />
                  <span className="text-xs text-gray-500 mt-2 block">Correct answers ratio</span>
                </div>

                {/* Time Efficiency */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900">Time Efficiency</span>
                    <span className="text-lg font-bold text-purple-600">{timePerQuestion}s</span>
                  </div>
                  {(() => {
                    // Calculate dynamic time target based on exam duration and total questions
                    const examDurationMinutes = safeNumber(exam?.examDurationMinutes, 180, 1) // Default 3 hours
                    const examDurationSeconds = examDurationMinutes * 60
                    const avgTimeTarget = totalQuestions > 0 ? Math.round(examDurationSeconds / totalQuestions) : 90
                    
                    // Calculate efficiency: better efficiency for faster completion within reasonable bounds
                    const efficiency = avgTimeTarget > 0 ? 
                      safeNumber(Math.max(0, Math.min(100, ((avgTimeTarget - timePerQuestion) / avgTimeTarget) * 100 + 50)), 0, 0, 100) :
                      50 // Default middle efficiency if no target available
                    
                    return (
                      <ProgressBar 
                        percentage={efficiency} 
                        color="bg-purple-500"
                      />
                    );
                  })()}
                  <span className="text-xs text-gray-500 mt-2 block">Per question average</span>
                </div>

                {/* Completion Rate */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900">Completion Rate</span>
                    <span className="text-lg font-bold text-green-600">{completionRate}%</span>
                  </div>
                  <ProgressBar 
                    percentage={parseFloat(completionRate)} 
                    color="bg-green-500"
                  />
                  <span className="text-xs text-gray-500 mt-2 block">Questions attempted</span>
                </div>

                {/* Warnings */}
                <div className={`rounded-xl p-4 ${warnings > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900">Warnings</span>
                    <span className={`text-lg font-bold ${warnings > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {safeNumber(warnings, 0, 0)}
                    </span>
                  </div>
                  <div className={`w-full rounded-full h-2 ${warnings > 0 ? 'bg-red-200' : 'bg-green-200'}`}>
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${warnings > 0 ? 'bg-red-500' : 'bg-green-500'}`} 
                      style={{ width: warnings > 0 ? `${safeNumber(Math.min(100, (warnings / 5) * 100), 0, 0, 100)}%` : '100%' }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2 block">
                    {warnings === 0 ? 'Perfect conduct!' : `${warnings} exam violation${warnings > 1 ? 's' : ''}`}
                  </span>
                </div>
              </div>

              {/* Percentile Information */}
              {result?.comparativeStats?.percentileRank !== null && result?.comparativeStats?.percentileRank !== undefined && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Your Performance Ranking
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          {safeNumber(result.comparativeStats.percentileRank, 0, 0, 100).toFixed(1)}th
                        </div>
                        <div className="text-sm text-blue-800 font-medium">Percentile</div>
                        <div className="text-xs text-blue-600 mt-1">
                          You scored better than {safeNumber(result.comparativeStats.percentileRank, 0, 0, 100).toFixed(1)}% of students
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          #{safeNumber(result.comparativeStats.rank, 0, 1) || '-'}
                        </div>
                        <div className="text-sm text-green-800 font-medium">Rank</div>
                        <div className="text-xs text-green-600 mt-1">
                          Out of {safeNumber(result.comparativeStats.totalStudentsAppeared, 0, 0)} students
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Performance Metrics */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Score Distribution */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Score Breakdown</h4>
                    <div className="space-y-3">
                      <div>
                        <ProgressBar 
                          percentage={totalMarks > 0 ? safeNumber((totalMarksEarned / totalMarks) * 100, 0, 0, 100) : 0}
                          color="bg-green-500"
                          label="Marks Earned"
                        />
                      </div>
                      {negativeMarksPerQuestion > 0 && totalMarksDeducted > 0 && (
                        <div>
                          <ProgressBar 
                            percentage={totalMarks > 0 ? safeNumber((totalMarksDeducted / totalMarks) * 100, 0, 0, 100) : 0}
                            color="bg-red-500"
                            label="Marks Deducted"
                          />
                        </div>
                      )}
                      <div>
                        <ProgressBar 
                          percentage={totalMarks > 0 ? safeNumber((score / totalMarks) * 100, 0, 0, 100) : 0}
                          color="bg-blue-500"
                          label="Final Score"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Question Type Performance */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Question Analysis</h4>
                    <div className="space-y-3">
                      <div>
                        <ProgressBar 
                          percentage={totalQuestions > 0 ? safeNumber((correctAnswers / totalQuestions) * 100, 0, 0, 100) : 0}
                          color="bg-green-500"
                          label="Correct Questions"
                        />
                      </div>
                      <div>
                        <ProgressBar 
                          percentage={totalQuestions > 0 ? safeNumber((incorrectAnswers / totalQuestions) * 100, 0, 0, 100) : 0}
                          color="bg-red-500"  
                          label="Incorrect Questions"
                        />
                      </div>
                      <div>
                        <ProgressBar 
                          percentage={totalQuestions > 0 ? safeNumber((unattempted / totalQuestions) * 100, 0, 0, 100) : 0}
                          color="bg-gray-500"
                          label="Unattempted Questions"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subject-wise Performance */}
          {subjectPerformance.length > 1 && (
            <Card className="mb-6 bg-white/95 border border-gray-100/80 shadow-xl rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  Subject-wise Performance
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Detailed breakdown of your performance across different subjects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subjectPerformance.map((subject, index) => (
                    <div key={index} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900 text-lg">{subject.subject}</h4>
                        <span className={`text-xl font-bold ${getPerformanceColor(safeNumber(subject.percentage, 0, 0, 100))}`}>
                          {safeNumber(subject.percentage, 0, 0, 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Score</span>
                          <span className="font-medium">{subject.marks}/{subject.maxMarks}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Questions</span>
                          <span className="font-medium">{subject.attempted}/{subject.totalQuestions}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Correct</span>
                          <span className="font-medium text-green-600">{subject.correct}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Incorrect</span>
                          <span className="font-medium text-red-600">{subject.incorrect}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Unanswered</span>
                          <span className="font-medium text-gray-600">{subject.unanswered}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Accuracy</span>
                          <span className="font-medium text-blue-600">{safeNumber(subject.accuracy, 0, 0, 100).toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}


          {/* Marking Scheme Information */}
          <Card className="mb-6 bg-white/95 border border-gray-100/80 shadow-xl rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-600" />
                Marking Scheme
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                console.log('🎯 DEBUG MARKING SCHEME DISPLAY:')
                console.log('  markingDetails:', markingDetails)
                console.log('  markingDetails.isSubjectWise:', markingDetails.isSubjectWise)
                console.log('  markingDetails.subjects:', markingDetails.subjects)
                return null
              })()}
              
              <div className="space-y-4">
                {markingDetails.isSubjectWise ? (
                  // Subject-wise marking scheme for CET
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100/50">
                      <h4 className="font-bold text-blue-900 mb-4 text-lg">Subject-wise Marking Scheme</h4>
                      <div className="space-y-3">
                        {Object.entries(markingDetails.subjects).map(([subject, marks]) => (
                          <div key={subject} className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                            <span className="font-medium text-gray-800 capitalize">{subject}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-green-600 font-bold">+{marks.correct}</span>
                              <span className="text-red-600 font-bold">{marks.incorrect}</span>
                              <span className="text-gray-600">{marks.unanswered}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex justify-between text-sm text-gray-600">
                        <span>Subject</span>
                        <div className="flex gap-4">
                          <span>Correct</span>
                          <span>Incorrect</span>
                          <span>Unanswered</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Standard marking scheme for other exams
                  <div className="grid grid-cols-2 gap-4">
                    {/* Correct Answer */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-900">Correct Answer</span>
                      </div>
                      <div className="text-2xl font-bold text-green-800">
                        +{markingDetails.positiveMarks}
                      </div>
                      <div className="text-xs text-green-700">marks awarded</div>
                    </div>

                    {/* Incorrect Answer */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="font-semibold text-red-900">Incorrect Answer</span>
                      </div>
                      <div className="text-2xl font-bold text-red-800">
                        -{markingDetails.negativeMarks}
                      </div>
                      <div className="text-xs text-red-700">marks deducted</div>
                    </div>
                  </div>
                )}


                {/* Additional actual rule details if available */}
                {result?.negativeMarkingInfo?.defaultRuleUsed && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      <span className="font-semibold text-gray-900">Rule Details</span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div><span className="font-medium">Stream:</span> {result.negativeMarkingInfo.defaultRuleUsed.stream}</div>
                      <div><span className="font-medium">Standard:</span> {result.negativeMarkingInfo.defaultRuleUsed.standard}</div>
                      {result.negativeMarkingInfo.defaultRuleUsed.subject && (
                        <div><span className="font-medium">Subject:</span> {result.negativeMarkingInfo.defaultRuleUsed.subject}</div>
                      )}
                      {result.negativeMarkingInfo.defaultRuleUsed.examType && (
                        <div><span className="font-medium">Exam Type:</span> {result.negativeMarkingInfo.defaultRuleUsed.examType}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Score Breakdown */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-900">Total Marks Earned</span>
                    </div>
                    <div className="text-xl font-bold text-green-800">
                      +{totalMarksEarned} marks
                    </div>
                    <div className="text-sm text-green-700">From {correctAnswers} correct answers</div>
                  </div>
                  
                  {(negativeMarksPerQuestion > 0 && incorrectAnswers > 0) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="font-semibold text-red-900">Total Marks Deducted</span>
                      </div>
                      <div className="text-xl font-bold text-red-800">
                        -{totalMarksDeducted} marks
                      </div>
                      <div className="text-sm text-red-700">From {incorrectAnswers} incorrect answers</div>
                    </div>
                  )}
                </div>

                {/* Final Score Calculation */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">Final Score Calculation</span>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-lg font-medium">
                    <span className="text-green-700">+{totalMarksEarned}</span>
                    <span className="text-gray-600">-</span>
                    <span className="text-red-700">{totalMarksDeducted}</span>
                    <span className="text-gray-600">=</span>
                    <span className="text-blue-800 font-bold text-xl">{score} marks</span>
                  </div>
                  <div className="text-center text-sm text-blue-700 mt-2">
                    Marks Earned - Marks Deducted = Final Score
                  </div>
                </div>


              </div>
            </CardContent>
          </Card>

          {/* Detailed Question Review */}
          {questionAnalysis.length > 0 && (
            <Card className="mb-6 bg-white/95 border border-gray-100/80 shadow-xl rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Question Review
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Review your answers and see the correct solutions
                </CardDescription>
                
                {/* Subject Filter Badges */}
                {uniqueSubjects.length > 1 && (
                  <div className="flex flex-wrap gap-2 mt-4 no-print">
                    <Badge
                      variant={selectedSubject === 'All' ? "default" : "outline"}
                      className={`cursor-pointer px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                        selectedSubject === 'All' 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedSubject('All')}
                    >
                      All ({questionAnalysis.length})
                    </Badge>
                    {uniqueSubjects.map(subject => {
                      const subjectCount = questionAnalysis.filter(analysis => {
                        const question = getQuestionById(analysis.questionId)
                        return question?.subject === subject
                      }).length
                      
                      return (
                        <Badge
                          key={subject}
                          variant={selectedSubject === subject ? "default" : "outline"}
                          className={`cursor-pointer px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                            selectedSubject === subject 
                              ? 'bg-blue-600 text-white hover:bg-blue-700' 
                              : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedSubject(subject)}
                        >
                          {subject} ({subjectCount})
                        </Badge>
                      )
                    })}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {/* Screen view - filtered questions */}
                <div className="screen-only">
                  {filteredQuestionAnalysis.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No questions found for the selected subject.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {filteredQuestionAnalysis.map((analysis) => {
                    const question = getQuestionById(analysis.questionId)
                    if (!question) return null
                    const isCorrect = analysis.status === 'correct'
                    const isUnattempted = analysis.status === 'unattempted'
                    // Find question number in sorted list for consistent display
                    const sortedIndex = sortedQuestionAnalysis.findIndex(qa => qa.questionId === analysis.questionId)
                    return (
                      <div key={analysis.questionId} className="border border-gray-200 rounded-xl p-4 print-question bg-gray-50/80">
                        {/* Question Header */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">Q{sortedIndex + 1}</span>
                            {question.subject && (
                              <Badge variant="outline" className="text-xs bg-gray-100 text-gray-700 border-gray-300">
                                {question.subject}
                              </Badge>
                            )}
                            {/* Show section info for JEE exams */}
                            {isJeeExam && question.section && (
                              <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-300">
                                Section {question.section === 1 ? 'A' : question.section === 2 ? 'B' : question.section}
                              </Badge>
                            )}
                            <Badge
                              variant={isCorrect ? "default" : isUnattempted ? "secondary" : "destructive"}
                              className={isCorrect ? "bg-green-100 text-green-800" : isUnattempted ? "bg-gray-100 text-gray-800" : "bg-red-100 text-red-800"}
                            >
                              {isCorrect ? <CheckCircle className="w-3 h-3 mr-1" /> : isUnattempted ? <AlertCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                              {analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            {analysis.marks > 0 ? `+${analysis.marks}` : analysis.marks} marks
                          </div>
                        </div>
                        {/* Question Text */}
                        <div className="mb-3">
                          <div className="text-gray-900 leading-relaxed text-base font-medium" dangerouslySetInnerHTML={{ __html: question.question }} />
                        </div>
                        {/* Options */}
                        {question.options && question.options.length > 0 && (
                          <div className="space-y-2 mb-3">
                            {question.options.map((option, optIndex) => {
                              const optionKey = String.fromCharCode(65 + optIndex)
                              const isUserAnswer = Array.isArray(analysis.userAnswer)
                                ? analysis.userAnswer.includes(optionKey)
                                : analysis.userAnswer === optionKey
                              const isCorrectAnswer = Array.isArray(analysis.correctAnswer)
                                ? analysis.correctAnswer.includes(optionKey)
                                : analysis.correctAnswer === optionKey
                              
                              // Determine the status of this option
                              let optionStatus = ''
                              let statusColor = 'text-gray-700'
                              let borderColor = 'border-gray-200'
                              let bgColor = 'bg-white'
                              let statusIcon = null
                              
                              if (isCorrectAnswer && isUserAnswer) {
                                // User selected correct answer
                                optionStatus = 'Correct Selection'
                                statusColor = 'text-green-700'
                                borderColor = 'border-green-400'
                                bgColor = 'bg-green-50'
                                statusIcon = <CheckCircle className="w-4 h-4 text-green-600" />
                              } else if (isCorrectAnswer && !isUserAnswer) {
                                // Correct answer but user didn't select
                                optionStatus = 'Correct Answer (Missed)'
                                statusColor = 'text-amber-700'
                                borderColor = 'border-amber-300'
                                bgColor = 'bg-amber-50'
                                statusIcon = <CheckCircle className="w-4 h-4 text-amber-600" />
                              } else if (!isCorrectAnswer && isUserAnswer) {
                                // User selected wrong answer
                                optionStatus = 'Wrong Selection'
                                statusColor = 'text-red-700'
                                borderColor = 'border-red-400'
                                bgColor = 'bg-red-50'
                                statusIcon = <XCircle className="w-4 h-4 text-red-600" />
                              } else {
                                // Neither correct nor selected
                                optionStatus = ''
                                statusColor = 'text-gray-700'
                                borderColor = 'border-gray-200'
                                bgColor = 'bg-white'
                              }
                              
                              return (
                                <div
                                  key={optIndex}
                                  className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-colors duration-200 ${borderColor} ${bgColor}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded">
                                      {optionKey}
                                    </span>
                                    {statusIcon}
                                  </div>
                                  <div className="flex-1">
                                    <div 
                                      className={`text-sm ${statusColor} `}
                                                                            dangerouslySetInnerHTML={{ __html: option }} 
                                    />
                                    {optionStatus && (
                                      <div className={`text-xs mt-1 font-medium ${statusColor}`}>
                                        {optionStatus}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                        
                        {/* MCMA Analysis Summary */}
                        {analysis.mcmaDetails && (
                          <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs font-medium text-blue-700 mb-2">MCMA Analysis:</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-blue-600">Total Correct Options:</span>
                                <span className="font-medium text-blue-800">{analysis.mcmaDetails.totalCorrectOptions}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-green-600">Correctly Selected:</span>
                                <span className="font-medium text-green-800">{analysis.mcmaDetails.correctSelected}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-red-600">Wrong Selections:</span>
                                <span className="font-medium text-red-800">{analysis.mcmaDetails.wrongSelected}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-purple-600">Partial Credit:</span>
                                <span className="font-medium text-purple-800">{analysis.mcmaDetails.partialCredit ? 'Yes' : 'No'}</span>
                              </div>
                            </div>
                            {analysis.negativeMarkingRule && (
                              <div className="mt-2 pt-2 border-t border-blue-300">
                                <p className="text-xs text-blue-600">
                                  <strong>Rule Applied:</strong> {analysis.negativeMarkingRule}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* User Input Answer */}
                        {question.userInputAnswer && (
                          <div className="mb-3">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                              <p className="text-xs font-medium text-gray-700 mb-1">Your Answer:</p>
                              <p className="text-gray-900 text-sm">{analysis.userAnswer || 'No answer provided'}</p>
                            </div>
                            {/* Show correct answer if question was unattempted or answered incorrectly */}
                            {(!analysis.userAnswer || analysis.status !== 'correct') && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                                <p className="text-xs font-medium text-green-700 mb-1">Correct Answer:</p>
                                <p className="text-green-900 text-sm">{question.answer}</p>
                              </div>
                            )}
                          </div>
                        )}
                        {/* Explanation or Additional Info */}
                        {question.explanation && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                            <p className="text-xs font-medium text-blue-700 mb-1">Explanation:</p>
                            <div className="text-blue-900 text-xs" dangerouslySetInnerHTML={{ __html: question.explanation }} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                    </div>
                  )}
                </div>
                
                {/* Print view - all questions */}
                <div className="print-all-questions space-y-6" style={{ display: 'none' }}>
                  {sortedQuestionAnalysis.map((analysis, index) => {
                    const question = getQuestionById(analysis.questionId)
                    if (!question) return null
                    const isCorrect = analysis.status === 'correct'
                    const isUnattempted = analysis.status === 'unattempted'
                    return (
                      <div key={analysis.questionId} className="border border-gray-200 rounded-xl p-4 print-question bg-gray-50/80">
                        {/* Question Header */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">Q{index + 1}</span>
                            {question.subject && (
                              <Badge variant="outline" className="text-xs bg-gray-100 text-gray-700 border-gray-300">
                                {question.subject}
                              </Badge>
                            )}
                            {/* Show section info for JEE exams in print view */}
                            {isJeeExam && question.section && (
                              <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-300">
                                Section {question.section === 1 ? 'A' : question.section === 2 ? 'B' : question.section}
                              </Badge>
                            )}
                            <Badge
                              variant={isCorrect ? "default" : isUnattempted ? "secondary" : "destructive"}
                              className={isCorrect ? "bg-green-100 text-green-800" : isUnattempted ? "bg-gray-100 text-gray-800" : "bg-red-100 text-red-800"}
                            >
                              {isCorrect ? <CheckCircle className="w-3 h-3 mr-1" /> : isUnattempted ? <AlertCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                              {analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            {analysis.marks > 0 ? `+${analysis.marks}` : analysis.marks} marks
                          </div>
                        </div>
                        {/* Question Text */}
                        <div className="mb-3">
                          <div className="text-gray-900 leading-relaxed text-base font-medium" dangerouslySetInnerHTML={{ __html: question.question }} />
                        </div>
                        {/* Options */}
                        {question.options && question.options.length > 0 && (
                          <div className="space-y-2 mb-3">
                            {question.options.map((option, optIndex) => {
                              const optionKey = String.fromCharCode(65 + optIndex)
                              const isUserAnswer = Array.isArray(analysis.userAnswer)
                                ? analysis.userAnswer.includes(optionKey)
                                : analysis.userAnswer === optionKey
                              const isCorrectAnswer = Array.isArray(analysis.correctAnswer)
                                ? analysis.correctAnswer.includes(optionKey)
                                : analysis.correctAnswer === optionKey
                              
                              // Determine the status of this option
                              let optionStatus = ''
                              let statusColor = 'text-gray-700'
                              let borderColor = 'border-gray-200'
                              let bgColor = 'bg-white'
                              let statusIcon = null
                              
                              if (isCorrectAnswer && isUserAnswer) {
                                // User selected correct answer
                                optionStatus = 'Correct Selection'
                                statusColor = 'text-green-700'
                                borderColor = 'border-green-400'
                                bgColor = 'bg-green-50'
                                statusIcon = <CheckCircle className="w-4 h-4 text-green-600" />
                              } else if (isCorrectAnswer && !isUserAnswer) {
                                // Correct answer but user didn't select
                                optionStatus = 'Correct Answer (Missed)'
                                statusColor = 'text-amber-700'
                                borderColor = 'border-amber-300'
                                bgColor = 'bg-amber-50'
                                statusIcon = <CheckCircle className="w-4 h-4 text-amber-600" />
                              } else if (!isCorrectAnswer && isUserAnswer) {
                                // User selected wrong answer
                                optionStatus = 'Wrong Selection'
                                statusColor = 'text-red-700'
                                borderColor = 'border-red-400'
                                bgColor = 'bg-red-50'
                                statusIcon = <XCircle className="w-4 h-4 text-red-600" />
                              } else {
                                // Neither correct nor selected
                                optionStatus = ''
                                statusColor = 'text-gray-700'
                                borderColor = 'border-gray-200'
                                bgColor = 'bg-white'
                              }
                              
                              return (
                                <div
                                  key={optIndex}
                                  className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-colors duration-200 ${borderColor} ${bgColor}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded">
                                      {optionKey}
                                    </span>
                                    {statusIcon}
                                  </div>
                                  <div className="flex-1">
                                    <div 
                                      className={`text-sm ${statusColor} `}
                                      dangerouslySetInnerHTML={{ __html: option }} 
                                    />
                                    {optionStatus && (
                                      <div className={`text-xs mt-1 font-medium ${statusColor}`}>
                                        {optionStatus}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                        
                        {/* MCMA Analysis Summary */}
                        {analysis.mcmaDetails && (
                          <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs font-medium text-blue-700 mb-2">MCMA Analysis:</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-blue-600">Total Correct Options:</span>
                                <span className="font-medium text-blue-800">{analysis.mcmaDetails.totalCorrectOptions}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-green-600">Correctly Selected:</span>
                                <span className="font-medium text-green-800">{analysis.mcmaDetails.correctSelected}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-red-600">Wrong Selections:</span>
                                <span className="font-medium text-red-800">{analysis.mcmaDetails.wrongSelected}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-purple-600">Partial Credit:</span>
                                <span className="font-medium text-purple-800">{analysis.mcmaDetails.partialCredit ? 'Yes' : 'No'}</span>
                              </div>
                            </div>
                            {analysis.negativeMarkingRule && (
                              <div className="mt-2 pt-2 border-t border-blue-300">
                                <p className="text-xs text-blue-600">
                                  <strong>Rule Applied:</strong> {analysis.negativeMarkingRule}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* User Input Answer */}
                        {question.userInputAnswer && (
                          <div className="mb-3">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                              <p className="text-xs font-medium text-gray-700 mb-1">Your Answer:</p>
                              <p className="text-gray-900 text-sm">{analysis.userAnswer || 'No answer provided'}</p>
                            </div>
                            {/* Show correct answer if question was unattempted or answered incorrectly */}
                            {(!analysis.userAnswer || analysis.status !== 'correct') && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                                <p className="text-xs font-medium text-green-700 mb-1">Correct Answer:</p>
                                <p className="text-green-900 text-sm">{question.answer}</p>
                              </div>
                            )}
                          </div>
                        )}
                        {/* Explanation or Additional Info */}
                        {question.explanation && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                            <p className="text-xs font-medium text-blue-700 mb-1">Explanation:</p>
                            <div className="text-blue-900 text-xs" dangerouslySetInnerHTML={{ __html: question.explanation }} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-2">
          <Button
            onClick={onBack}
            variant="outline"
            className="px-8 py-3 rounded-xl font-semibold w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          {onRetake && (() => {
            // Check reattempt validation (match server logic)
            const allowed = exam?.reattempt || 1; // Default to 1 attempt like server
            const attempts = allAttempts.length;
            const canRetake = attempts < allowed;
            
            return canRetake ? (
              <Button
                onClick={onRetake}
                className="px-8 py-3 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              >
                Retake Exam
              </Button>
            ) : (
              <Button
                disabled
                className="px-8 py-3 rounded-xl font-semibold bg-gray-400 text-gray-600 cursor-not-allowed w-full sm:w-auto text-xs sm:text-sm"
                title={`You have reached the maximum allowed attempts (${allowed}) for this exam.`}
              >
                Max Attempts Reached ({attempts}/{allowed})
              </Button>
            );
          })()}
        </div>
      </div>
    </div>
  )
} 