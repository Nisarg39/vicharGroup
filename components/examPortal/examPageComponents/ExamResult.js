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
import negativeMarkingRules from "../../../utils/examUtils/negative_marking_rules"

export default function ExamResult({ result, exam, onBack, onRetake, allAttempts = [] }) {
  let {
    score,
    totalMarks,
    correctAnswers,
    incorrectAnswers,
    unattempted,
    timeTaken,
    completedAt,
    questionAnalysis = [],
    collegeDetails = null
  } = result

  // Clamp score to valid ranges
  score = Math.min(score, totalMarks)

  // Get student info from Redux
  const student = useSelector(state => state.login.studentDetails)

  // State for subject filtering
  const [selectedSubject, setSelectedSubject] = useState('All')

  // Helper function to get actual marking scheme details from the evaluated result
  const getActualMarkingDetails = () => {
    if (!questionAnalysis || questionAnalysis.length === 0) {
      // Fallback to basic marking info if no question analysis available
      return {
        positiveMarks: result?.negativeMarkingInfo?.positiveMarks || exam?.positiveMarks || exam?.marks || 4,
        negativeMarks: result?.negativeMarkingInfo?.negativeMarks || 0,
        isSubjectWise: false,
        subjects: {},
        ruleSource: result?.negativeMarkingInfo?.ruleSource || 'unknown',
        ruleDescription: result?.negativeMarkingInfo?.ruleDescription || 'Standard marking'
      }
    }

    // Analyze actual questions to determine if subject-wise marking was used
    const subjectMarkingMap = {}
    let hasSubjectWiseMarking = false

    questionAnalysis.forEach(analysis => {
      const question = getQuestionById(analysis.questionId)
      if (!question?.subject) return

      const subject = question.subject
      if (!subjectMarkingMap[subject]) {
        subjectMarkingMap[subject] = {
          correct: [],
          incorrect: [],
          unanswered: []
        }
      }

      if (analysis.status === 'correct' && analysis.marks > 0) {
        subjectMarkingMap[subject].correct.push(analysis.marks)
      } else if (analysis.status === 'incorrect' && analysis.marks < 0) {
        subjectMarkingMap[subject].incorrect.push(Math.abs(analysis.marks))
      }
    })

    // Check if different subjects have different marking patterns
    const subjectKeys = Object.keys(subjectMarkingMap)
    if (subjectKeys.length > 1) {
      const markingPatterns = subjectKeys.map(subject => {
        const correctMarks = subjectMarkingMap[subject].correct
        const avgCorrect = correctMarks.length > 0 ? correctMarks[0] : 0 // Take first value as they should be consistent per subject
        return { subject, avgCorrect }
      })

      // Check if subjects have different positive marks
      const uniqueMarks = [...new Set(markingPatterns.map(p => p.avgCorrect))]
      hasSubjectWiseMarking = uniqueMarks.length > 1

      if (hasSubjectWiseMarking) {
        const subjects = {}
        markingPatterns.forEach(({ subject, avgCorrect }) => {
          const incorrectMarks = subjectMarkingMap[subject].incorrect
          const avgIncorrect = incorrectMarks.length > 0 ? incorrectMarks[0] : 0

          subjects[subject] = {
            correct: avgCorrect,
            incorrect: -avgIncorrect, // Show as negative
            unanswered: 0
          }
        })

        return {
          positiveMarks: 'Subject-wise',
          negativeMarks: 'Varies by subject',
          isSubjectWise: true,
          subjects,
          ruleSource: result?.negativeMarkingInfo?.ruleSource || 'unknown',
          ruleDescription: result?.negativeMarkingInfo?.ruleDescription || 'Subject-wise marking applied'
        }
      }
    }

    // Standard marking scheme (all subjects same)
    const allCorrectMarks = questionAnalysis.filter(a => a.status === 'correct' && a.marks > 0).map(a => a.marks)
    const allIncorrectMarks = questionAnalysis.filter(a => a.status === 'incorrect' && a.marks < 0).map(a => Math.abs(a.marks))
    
    const standardPositive = allCorrectMarks.length > 0 ? allCorrectMarks[0] : (exam?.positiveMarks || exam?.marks || 4)
    const standardNegative = allIncorrectMarks.length > 0 ? allIncorrectMarks[0] : 0

    return {
      positiveMarks: standardPositive,
      negativeMarks: standardNegative,
      isSubjectWise: false,
      subjects: {},
      ruleSource: result?.negativeMarkingInfo?.ruleSource || 'unknown',
      ruleDescription: result?.negativeMarkingInfo?.ruleDescription || 'Standard marking applied'
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

  // Calculate safe values for accuracy, time efficiency, and completion rate
  const totalQuestions = (correctAnswers || 0) + (incorrectAnswers || 0) + (unattempted || 0)
  const accuracy = totalQuestions > 0 ? ((correctAnswers / totalQuestions) * 100).toFixed(2) : "0.00"
  const timePerQuestion = totalQuestions > 0 ? Math.round(timeTaken / totalQuestions) : 0
  const completionRate = totalQuestions > 0 ? (((correctAnswers + incorrectAnswers) / totalQuestions) * 100).toFixed(1) : "0.0"

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
      // Fallback calculation if no question analysis
      return {
        totalMarksEarned: correctAnswers * (typeof positiveMarksPerQuestion === 'number' ? positiveMarksPerQuestion : 4),
        totalMarksDeducted: incorrectAnswers * negativeMarksPerQuestion
      }
    }

    let earned = 0
    let deducted = 0

    questionAnalysis.forEach(analysis => {
      if (analysis.marks > 0) {
        earned += analysis.marks
      } else if (analysis.marks < 0) {
        deducted += Math.abs(analysis.marks)
      }
    })

    return { totalMarksEarned: earned, totalMarksDeducted: deducted }
  }

  const { totalMarksEarned, totalMarksDeducted } = calculateActualMarks()

  // Now we can safely call getActualMarkingDetails after getQuestionById is defined
  const markingDetails = getActualMarkingDetails()

  // Calculate marks breakdown using marking details (now that markingDetails is available)
  const positiveMarksPerQuestion = markingDetails.isSubjectWise ? 'varies' : markingDetails.positiveMarks
  const negativeMarksPerQuestion = result?.negativeMarkingInfo?.negativeMarks || markingDetails.negativeMarks

  // Get unique subjects from questions
  const getUniqueSubjects = () => {
    if (!exam?.examQuestions || !questionAnalysis.length) return []
    
    const subjects = new Set()
    questionAnalysis.forEach(analysis => {
      const question = getQuestionById(analysis.questionId)
      if (question?.subject) {
        subjects.add(question.subject)
      }
    })
    
    return Array.from(subjects).sort()
  }

  const uniqueSubjects = getUniqueSubjects()

  // Filter questions based on selected subject
  const filteredQuestionAnalysis = selectedSubject === 'All' 
    ? questionAnalysis 
    : questionAnalysis.filter(analysis => {
        const question = getQuestionById(analysis.questionId)
        return question?.subject === selectedSubject
      })

  // Calculate subject-wise performance
  const calculateSubjectPerformance = () => {
    if (!questionAnalysis.length || !uniqueSubjects.length) return []
    
    return uniqueSubjects.map(subject => {
      const subjectQuestions = questionAnalysis.filter(analysis => {
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
        // Use standard positive marks (ensure it's a number)
        const standardMarks = typeof positiveMarksPerQuestion === 'number' ? positiveMarksPerQuestion : (markingDetails.positiveMarks || 4)
        maxPossibleMarks = totalQuestions * standardMarks
      }
      
      const accuracy = attempted > 0 ? ((correct / attempted) * 100).toFixed(2) : '0.00'
      const percentage = maxPossibleMarks > 0 ? ((subjectMarks / maxPossibleMarks) * 100).toFixed(1) : '0.0'
      
      // Estimate time spent per subject (proportional to questions)
      const timeSpent = totalQuestions > 0 ? Math.round((timeTaken * totalQuestions) / questionAnalysis.length) : 0
      
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
        percentage: parseFloat(percentage),
        accuracy: parseFloat(accuracy),
        timeSpent,
        difficulty: difficultyBreakdown
      }
    })
  }


  // Helper functions for performance colors
  const getPerformanceColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 75) return 'text-blue-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceBg = (percentage) => {
    if (percentage >= 90) return 'bg-green-100'
    if (percentage >= 75) return 'bg-blue-100'
    if (percentage >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  // Calculate the data
  const subjectPerformance = calculateSubjectPerformance()

  // Helper component for circular progress
  const CircularProgress = ({ percentage, size = 120, strokeWidth = 8, color = "#3B82F6" }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference

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
          <span className="text-xl font-bold text-gray-900">{percentage.toFixed(1)}%</span>
        </div>
      </div>
    )
  }

  // Helper component for progress bar
  const ProgressBar = ({ percentage, color = "bg-blue-500", label }) => {
    return (
      <div className="w-full">
        {label && <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">{label}</span>
          <span className="font-medium">{percentage.toFixed(1)}%</span>
        </div>}
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`${color} h-2.5 rounded-full transition-all duration-1000 ease-out`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
      </div>
    )
  }

  // Add print-specific CSS for clean PDF/print output
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
              {/* Main Performance Circle */}
              <div className="flex flex-col items-center justify-center gap-6 mb-6">
                <div className="flex flex-col items-center">
                  <CircularProgress 
                    percentage={totalMarks > 0 ? (score / totalMarks) * 100 : 0} 
                    size={150}
                    strokeWidth={12}
                    color={getPerformanceColor(totalMarks > 0 ? (score / totalMarks) * 100 : 0).replace('text-', '#').replace('600', '600').replace('green', '10B981').replace('blue', '3B82F6').replace('yellow', 'F59E0B').replace('red', 'EF4444')}
                  />
                  <div className="mt-3 text-center">
                    <div className="text-lg font-semibold text-gray-900">Overall Score</div>
                    <div className="text-sm text-gray-600">{score} / {totalMarks} marks</div>
                  </div>
                </div>
              </div>

              {/* Question Distribution Pie Chart */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <svg width="200" height="200" className="transform -rotate-90">
                    {(() => {
                      const total = correctAnswers + incorrectAnswers + unattempted;
                      if (total === 0) return null;
                      
                      const correctPercentage = (correctAnswers / total) * 100;
                      const incorrectPercentage = (incorrectAnswers / total) * 100;
                      const unattemptedPercentage = (unattempted / total) * 100;
                      
                      const radius = 80;
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
                              cx="100"
                              cy="100"
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
                              cx="100"
                              cy="100"
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
                              cx="100"
                              cy="100"
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
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{totalQuestions}</div>
                      <div className="text-xs text-gray-600">Questions</div>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    const avgTimeTarget = 90; // 90 seconds target per question
                    const efficiency = Math.max(0, Math.min(100, ((avgTimeTarget - timePerQuestion) / avgTimeTarget) * 100 + 50));
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
              </div>

              {/* Additional Performance Metrics */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Score Distribution */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Score Breakdown</h4>
                    <div className="space-y-3">
                      <div>
                        <ProgressBar 
                          percentage={totalMarks > 0 ? (totalMarksEarned / totalMarks) * 100 : 0}
                          color="bg-green-500"
                          label="Marks Earned"
                        />
                      </div>
                      {negativeMarksPerQuestion > 0 && totalMarksDeducted > 0 && (
                        <div>
                          <ProgressBar 
                            percentage={totalMarks > 0 ? (totalMarksDeducted / totalMarks) * 100 : 0}
                            color="bg-red-500"
                            label="Marks Deducted"
                          />
                        </div>
                      )}
                      <div>
                        <ProgressBar 
                          percentage={totalMarks > 0 ? (score / totalMarks) * 100 : 0}
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
                          percentage={totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0}
                          color="bg-green-500"
                          label="Correct Questions"
                        />
                      </div>
                      <div>
                        <ProgressBar 
                          percentage={totalQuestions > 0 ? (incorrectAnswers / totalQuestions) * 100 : 0}
                          color="bg-red-500"  
                          label="Incorrect Questions"
                        />
                      </div>
                      <div>
                        <ProgressBar 
                          percentage={totalQuestions > 0 ? (unattempted / totalQuestions) * 100 : 0}
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
                        <span className={`text-xl font-bold ${getPerformanceColor(subject.percentage)}`}>
                          {subject.percentage.toFixed(1)}%
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
                          <span className="font-medium text-blue-600">{subject.accuracy.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Est. Time</span>
                          <span className="font-medium">{Math.floor(subject.timeSpent / 60)}:{(subject.timeSpent % 60).toString().padStart(2, '0')}</span>
                        </div>
                        <div className="pt-2 border-t border-gray-200">
                          <div className="text-xs text-gray-600 mb-2">Question Difficulty Breakdown</div>
                          <div className="flex gap-3 text-xs">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span>Easy: {subject.difficulty.easy}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                              <span>Med: {subject.difficulty.medium}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                              <span>Hard: {subject.difficulty.hard}</span>
                            </div>
                          </div>
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
                Marking Scheme Applied
              </CardTitle>
              <CardDescription className="text-gray-600">
                Details about the marking rules applied to this exam
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {markingDetails.isSubjectWise ? (
                  // Subject-wise marking scheme for CET
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100/50">
                      <h4 className="font-bold text-blue-900 mb-4 text-lg">Subject-wise Marking Scheme Applied</h4>
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
                      <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-blue-800 font-medium text-sm">
                          <strong>Applied Rule:</strong> {markingDetails.ruleDescription}
                        </p>
                        <p className="text-blue-700 text-xs mt-1">
                          Source: {markingDetails.ruleSource === 'super_admin_default' ? 'System Default Rules' : 'Exam-Specific Rules'}
                        </p>
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

                {/* Rule Information for all exam types */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-semibold text-blue-900">Applied Marking Rule</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium text-gray-700">Description:</span> 
                      <span className="text-gray-800 ml-1">{markingDetails.ruleDescription}</span>
                    </div>
                    <div><span className="font-medium text-gray-700">Source:</span> 
                      <Badge variant="outline" className="ml-2 text-xs">
                        {markingDetails.ruleSource === 'super_admin_default' ? 'System Default Rules' : 'Exam-Specific Rules'}
                      </Badge>
                    </div>
                  </div>
                </div>

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

                {/* Rule Source Information */}
                {result?.negativeMarkingInfo && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="font-semibold text-blue-900">Applied Rule Details</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium text-gray-700">Rule Source:</span> 
                        <Badge variant="outline" className="ml-2 text-xs">
                          {result.negativeMarkingInfo.ruleSource === 'super_admin_default' ? 'System Default' : 'Exam Specific'}
                        </Badge>
                      </div>
                      {result.negativeMarkingInfo.ruleDescription && (
                        <div><span className="font-medium text-gray-700">Description:</span> <span className="text-gray-800">{result.negativeMarkingInfo.ruleDescription}</span></div>
                      )}
                    </div>
                  </div>
                )}

                {/* General Guidelines */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span className="font-semibold text-gray-900">Marking Guidelines</span>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {markingDetails.isSubjectWise ? (
                      // Subject-wise marking guidelines
                      <>
                        {Object.entries(markingDetails.subjects).map(([subject, marks]) => (
                          <li key={subject} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{subject} questions carry {marks.correct} mark{marks.correct !== 1 ? 's' : ''} each for correct answers</span>
                          </li>
                        ))}
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-green-800 font-medium">
                            {totalMarksDeducted > 0 ? 'Minimal negative marking applied' : 'No negative marking was applied to this exam'}
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Multiple choice questions: Only one correct answer per question</span>
                        </li>
                      </>
                    ) : (
                      // Standard guidelines for other exams
                      <>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Each question carries {markingDetails.positiveMarks} mark{markingDetails.positiveMarks !== 1 ? 's' : ''} for correct answers</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Multiple choice questions: Only one correct answer unless marked as multiple correct</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Numerical questions: Usually no negative marking applies</span>
                        </li>
                        {markingDetails.negativeMarks > 0 && (
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-red-800 font-medium">Negative marking: -{markingDetails.negativeMarks} mark{markingDetails.negativeMarks !== 1 ? 's' : ''} for incorrect answers</span>
                          </li>
                        )}
                        {markingDetails.negativeMarks === 0 && (
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-green-800 font-medium">No negative marking was applied to this exam</span>
                          </li>
                        )}
                      </>
                    )}
                  </ul>
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
                    // Find original question number in full list
                    const originalIndex = questionAnalysis.findIndex(qa => qa.questionId === analysis.questionId)
                    return (
                      <div key={analysis.questionId} className="border border-gray-200 rounded-xl p-4 print-question bg-gray-50/80">
                        {/* Question Header */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">Q{originalIndex + 1}</span>
                            {question.subject && (
                              <Badge variant="outline" className="text-xs bg-gray-100 text-gray-700 border-gray-300">
                                {question.subject}
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
                                statusColor = 'text-green-700'
                                borderColor = 'border-green-300'
                                bgColor = 'bg-green-25'
                                statusIcon = <CheckCircle className="w-4 h-4 text-green-500" />
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
                  {questionAnalysis.map((analysis, index) => {
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
                                statusColor = 'text-green-700'
                                borderColor = 'border-green-300'
                                bgColor = 'bg-green-25'
                                statusIcon = <CheckCircle className="w-4 h-4 text-green-500" />
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