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
  Award,
  TrendingUp,
  AlertCircle
} from "lucide-react"
import { useSelector } from "react-redux"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { useEffect } from "react"

export default function ExamResult({ result, exam, onBack, onRetake, allAttempts = [] }) {
  let {
    score,
    totalMarks,
    percentage,
    correctAnswers,
    incorrectAnswers,
    unattempted,
    timeTaken,
    completedAt,
    questionAnalysis = []
  } = result

  // Clamp score and percentage to valid ranges
  score = Math.min(score, totalMarks)
  let displayPercentage = Math.min(parseFloat(percentage), 100).toFixed(2)

  // Calculate safe values for accuracy, time efficiency, and completion rate
  const totalQuestions = (correctAnswers || 0) + (incorrectAnswers || 0) + (unattempted || 0)
  const accuracy = totalQuestions > 0 ? ((correctAnswers / totalQuestions) * 100).toFixed(1) : "0.0"
  const timePerQuestion = totalQuestions > 0 ? Math.round(timeTaken / totalQuestions) : 0
  const completionRate = totalQuestions > 0 ? (((correctAnswers + incorrectAnswers) / totalQuestions) * 100).toFixed(1) : "0.0"

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getPerformanceCategory = (percentage) => {
    if (percentage >= 90) return { category: "Excellent", color: "text-green-600", bg: "bg-green-100", icon: Trophy }
    if (percentage >= 80) return { category: "Very Good", color: "text-blue-600", bg: "bg-blue-100", icon: Award }
    if (percentage >= 70) return { category: "Good", color: "text-purple-600", bg: "bg-purple-100", icon: TrendingUp }
    if (percentage >= 60) return { category: "Average", color: "text-yellow-600", bg: "bg-yellow-100", icon: Target }
    if (percentage >= 50) return { category: "Below Average", color: "text-orange-600", bg: "bg-orange-100", icon: AlertCircle }
    return { category: "Poor", color: "text-red-600", bg: "bg-red-100", icon: XCircle }
  }

  // Helper function to get question by ID
  const getQuestionById = (questionId) => {
    if (!exam?.examQuestions) return null
    return exam.examQuestions.find(q => q._id === questionId)
  }

  const performance = getPerformanceCategory(parseFloat(displayPercentage))
  const IconComponent = performance.icon

  // Get student info from Redux
  const student = useSelector(state => state.login.studentDetails)

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
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-2">
          <div className="flex-1" />
          <div className="flex gap-2">
            <Button
              onClick={onBack}
              variant="outline"
              className="no-print font-semibold px-5 py-2 rounded-lg shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button
              onClick={() => window.print()}
              variant="default"
              className="no-print bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg shadow-sm"
            >
              Print / Download PDF
            </Button>
          </div>
        </div>
        <div id="pdf-result-content">
          {/* Student, College, Exam Info */}
          <Card className="mb-6 bg-white/95 border border-gray-100/80 shadow-xl rounded-2xl">
            <CardContent className="py-6 px-6 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Exam Results</h1>
                <p className="text-gray-600 font-medium">{exam?.examName}</p>
                <p className="text-gray-500 text-sm">Date: {new Date(completedAt).toLocaleDateString()}</p>
              </div>
              <div className="text-sm text-gray-700 space-y-1">
                <div><span className="font-semibold">Student:</span> {student?.name || "-"}</div>
                <div><span className="font-semibold">Email:</span> {student?.email || "-"}</div>
                {student?.rollNumber && <div><span className="font-semibold">Roll No:</span> {student.rollNumber}</div>}
                {exam?.collegeName && <div><span className="font-semibold">College:</span> {exam.collegeName}</div>}
                {exam?.collegeCode && <div><span className="font-semibold">College Code:</span> {exam.collegeCode}</div>}
              </div>
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <Card className="mb-6 bg-white/95 border border-gray-100/80 shadow-xl rounded-2xl">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-3">
                <div className={`p-4 rounded-full shadow ${performance.bg}`}> 
                  <IconComponent className={`w-12 h-12 ${performance.color}`} />
                </div>
              </div>
              <CardTitle className={`text-2xl font-bold ${performance.color}`}>{performance.category}</CardTitle>
              <CardDescription className="text-gray-700 mt-1">
                You scored <span className="font-semibold text-gray-900">{score}</span> out of <span className="font-semibold text-gray-900">{totalMarks}</span> marks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-4">
                <div className="text-center">
                  <div className="text-5xl font-extrabold text-gray-900 mb-1">{displayPercentage}%</div>
                  <div className="text-sm text-gray-600">Percentage Score</div>
                </div>
                <div className="flex flex-row gap-4 md:flex-col md:gap-2">
                  <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-900">{correctAnswers}</span>
                    <span className="text-xs text-green-700">Correct</span>
                  </div>
                  <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-900">{incorrectAnswers}</span>
                    <span className="text-xs text-red-700">Incorrect</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-900">{unattempted}</span>
                    <span className="text-xs text-gray-700">Unattempted</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Time Taken:</span>
                  <span className="text-sm text-blue-700">{formatTime(timeTaken)}</span>
                </div>
                <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Completed On:</span>
                  <span className="text-sm text-purple-700">{new Date(completedAt).toLocaleDateString()} at {new Date(completedAt).toLocaleTimeString()}</span>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col items-center bg-gray-50 rounded-xl p-4">
                  <span className="font-medium text-gray-900 mb-1">Accuracy</span>
                  <Badge variant="outline" className="text-lg font-semibold mb-1">{accuracy}%</Badge>
                  <span className="text-xs text-gray-500">Correct answers</span>
                </div>
                <div className="flex flex-col items-center bg-gray-50 rounded-xl p-4">
                  <span className="font-medium text-gray-900 mb-1">Time Efficiency</span>
                  <Badge variant="outline" className="text-lg font-semibold mb-1">{timePerQuestion}s</Badge>
                  <span className="text-xs text-gray-500">Per question</span>
                </div>
                <div className="flex flex-col items-center bg-gray-50 rounded-xl p-4">
                  <span className="font-medium text-gray-900 mb-1">Completion Rate</span>
                  <Badge variant="outline" className="text-lg font-semibold mb-1">{completionRate}%</Badge>
                  <span className="text-xs text-gray-500">Attempted</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Negative Marking Information */}
          {result.negativeMarkingInfo && (
            <Card className="mb-6 bg-white/95 border border-gray-100/80 shadow-xl rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Negative Marking Scheme
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Details about the negative marking rules applied to this exam
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="font-semibold text-orange-900">Applied Rule</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium text-gray-700">Negative Marks per Wrong Answer:</span> <span className="font-semibold text-orange-800">-{result.negativeMarkingInfo.negativeMarks}</span></div>
                      <div><span className="font-medium text-gray-700">Rule Source:</span> 
                        <Badge variant="outline" className="ml-2 text-xs">
                          {result.negativeMarkingInfo.ruleSource === 'college_specific' ? 'College Specific' : 
                           result.negativeMarkingInfo.ruleSource === 'super_admin_default' ? 'Default Rule' : 'Exam Specific'}
                        </Badge>
                      </div>
                      {result.negativeMarkingInfo.ruleDescription && (
                        <div><span className="font-medium text-gray-700">Description:</span> <span className="text-gray-800">{result.negativeMarkingInfo.ruleDescription}</span></div>
                      )}
                    </div>
                  </div>
                  
                  {/* Show impact of negative marking */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="font-medium text-red-900 text-sm">Marks Deducted</span>
                      </div>
                      <div className="text-lg font-bold text-red-800">
                        -{(incorrectAnswers * result.negativeMarkingInfo.negativeMarks).toFixed(1)} marks
                      </div>
                      <div className="text-xs text-red-700">From {incorrectAnswers} incorrect answers</div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-900 text-sm">Marks Earned</span>
                      </div>
                      <div className="text-lg font-bold text-green-800">
                        +{(score + (incorrectAnswers * result.negativeMarkingInfo.negativeMarks)).toFixed(1)} marks
                      </div>
                      <div className="text-xs text-green-700">From {correctAnswers} correct answers</div>
                    </div>
                  </div>
                  
                  {/* Show comparison between college and default rules */}
                  {result.negativeMarkingInfo.ruleSource === 'college_specific' && (result.negativeMarkingInfo.ruleUsed || result.negativeMarkingInfo.defaultRuleUsed) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="font-medium text-blue-900 text-sm">Rule Comparison - College Customization</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                        {/* College Specific Rule */}
                        {result.negativeMarkingInfo.ruleUsed && (
                          <div className="bg-white border border-blue-300 rounded p-2">
                            <div className="font-medium text-blue-900 text-xs mb-1">✓ Applied College Rule</div>
                            <div className="text-xs space-y-1">
                              <div><span className="font-medium">Negative Marks:</span> -{result.negativeMarkingInfo.ruleUsed.negativeMarks}</div>
                              {result.negativeMarkingInfo.ruleUsed.description && (
                                <div><span className="font-medium">Rule:</span> {result.negativeMarkingInfo.ruleUsed.description}</div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Default System Rule */}
                        {result.negativeMarkingInfo.defaultRuleUsed && (
                          <div className="bg-gray-50 border border-gray-300 rounded p-2">
                            <div className="font-medium text-gray-700 text-xs mb-1">Default System Rule</div>
                            <div className="text-xs space-y-1 text-gray-600">
                              <div><span className="font-medium">Negative Marks:</span> -{result.negativeMarkingInfo.defaultRuleUsed.negativeMarks}</div>
                              {result.negativeMarkingInfo.defaultRuleUsed.description && (
                                <div><span className="font-medium">Rule:</span> {result.negativeMarkingInfo.defaultRuleUsed.description}</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-blue-800">
                        <strong>Note:</strong> This exam uses your college's customized negative marking rules instead of the default system rules. 
                        The comparison above shows how your college has tailored the assessment to match institutional standards.
                      </p>
                    </div>
                  )}
                  
                  {result.negativeMarkingInfo.ruleSource !== 'college_specific' && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        <span className="font-medium text-gray-900 text-sm">Standard System Rule</span>
                      </div>
                      <p className="text-xs text-gray-700">
                        This exam uses the standard system negative marking rules. No college-specific customizations were applied.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

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
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
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
                              return (
                                <div
                                  key={optIndex}
                                  className={`flex items-start gap-3 p-2 rounded-lg border-2 transition-colors duration-200 ${
                                    isCorrectAnswer
                                      ? 'border-green-400 bg-green-50'
                                      : isUserAnswer && !isCorrectAnswer
                                      ? 'border-red-300 bg-red-50'
                                      : 'border-gray-200 bg-white'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded">
                                      {optionKey}
                                    </span>
                                    {isCorrectAnswer && <CheckCircle className="w-4 h-4 text-green-600" />}
                                    {isUserAnswer && !isCorrectAnswer && <XCircle className="w-4 h-4 text-red-600" />}
                                  </div>
                                  <div className="flex-1 text-gray-700 text-sm" dangerouslySetInnerHTML={{ __html: option }} />
                                </div>
                              )
                            })}
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
        <div className="flex gap-4 justify-center mt-2">
          <Button
            onClick={onBack}
            variant="outline"
            className="px-8 py-3 rounded-xl font-semibold"
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
                className="px-8 py-3 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              >
                Retake Exam
              </Button>
            ) : (
              <Button
                disabled
                className="px-8 py-3 rounded-xl font-semibold bg-gray-400 text-gray-600 cursor-not-allowed"
                title={`You have reached the maximum allowed attempts (${allowed}) for this exam.`}
              >
                Max Attempts Reached ({attempts}/{allowed})
              </Button>
            );
          })()}
        </div>
      </div>
      {/* Print-optimized PDF content, rendered off-screen for jsPDF */}
      <div
        id="pdf-print-content"
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          width: "800px",
          background: "#fff",
          color: "#222",
          zIndex: -1,
          padding: "24px"
        }}
      >
        <div style={{ fontFamily: 'Arial, sans-serif', color: '#222', padding: 0, maxWidth: 800 }}>
          <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>Exam Results</h1>
          <div style={{ marginBottom: 8 }}>
            <strong>Exam:</strong> {exam?.examName}<br />
            <strong>Date:</strong> {new Date(result.completedAt).toLocaleDateString()}<br />
            <strong>Student:</strong> {student?.name || "-"}<br />
            <strong>Email:</strong> {student?.email || "-"}<br />
            {student?.rollNumber && (<><strong>Roll No:</strong> {student.rollNumber}<br /></>)}
            {exam?.collegeName && (<><strong>College:</strong> {exam.collegeName}<br /></>)}
            {exam?.collegeCode && (<><strong>College Code:</strong> {exam.collegeCode}<br /></>)}
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Score:</strong> {result.score} / {result.totalMarks}<br />
            <strong>Percentage:</strong> {result.percentage}%<br />
            <strong>Correct:</strong> {result.correctAnswers} &nbsp;
            <strong>Incorrect:</strong> {result.incorrectAnswers} &nbsp;
            <strong>Unattempted:</strong> {result.unattempted}
          </div>
          {result.negativeMarkingInfo && (
            <div style={{ marginBottom: 8, padding: 8, border: '1px solid #ccc', borderRadius: 4 }}>
              <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>Negative Marking Scheme</h3>
              <div><strong>Negative Marks per Wrong Answer:</strong> -{result.negativeMarkingInfo.negativeMarks}</div>
              <div><strong>Rule Source:</strong> {
                result.negativeMarkingInfo.ruleSource === 'college_specific' ? 'College Specific Rule' : 
                result.negativeMarkingInfo.ruleSource === 'super_admin_default' ? 'Default System Rule' : 'Exam Specific Rule'
              }</div>
              {result.negativeMarkingInfo.ruleDescription && (
                <div><strong>Description:</strong> {result.negativeMarkingInfo.ruleDescription}</div>  
              )}
              <div><strong>Total Marks Deducted:</strong> -{(result.incorrectAnswers * result.negativeMarkingInfo.negativeMarks).toFixed(1)} marks</div>
              <div><strong>Total Marks Earned:</strong> +{(result.score + (result.incorrectAnswers * result.negativeMarkingInfo.negativeMarks)).toFixed(1)} marks</div>
              
              {/* Rule Comparison for College Customization */}
              {result.negativeMarkingInfo.ruleSource === 'college_specific' && (result.negativeMarkingInfo.ruleUsed || result.negativeMarkingInfo.defaultRuleUsed) && (
                <div style={{ marginTop: 8, padding: 6, border: '1px solid #bbb', borderRadius: 4, backgroundColor: '#f0f8ff' }}>
                  <h4 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>Rule Comparison - College Customization</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 4 }}>
                    {result.negativeMarkingInfo.ruleUsed && (
                      <div style={{ padding: 4, border: '1px solid #007acc', borderRadius: 3, backgroundColor: '#fff' }}>
                        <div style={{ fontWeight: 'bold', fontSize: 12 }}>✓ Applied College Rule</div>
                        <div style={{ fontSize: 11 }}>
                          <div>Negative Marks: -{result.negativeMarkingInfo.ruleUsed.negativeMarks}</div>
                          {result.negativeMarkingInfo.ruleUsed.description && (
                            <div>Rule: {result.negativeMarkingInfo.ruleUsed.description}</div>
                          )}
                        </div>
                      </div>
                    )}
                    {result.negativeMarkingInfo.defaultRuleUsed && (
                      <div style={{ padding: 4, border: '1px solid #999', borderRadius: 3, backgroundColor: '#f5f5f5' }}>
                        <div style={{ fontWeight: 'bold', fontSize: 12, color: '#666' }}>Default System Rule</div>
                        <div style={{ fontSize: 11, color: '#666' }}>
                          <div>Negative Marks: -{result.negativeMarkingInfo.defaultRuleUsed.negativeMarks}</div>
                          {result.negativeMarkingInfo.defaultRuleUsed.description && (
                            <div>Rule: {result.negativeMarkingInfo.defaultRuleUsed.description}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 11, fontStyle: 'italic' }}>
                    Note: This exam uses your college's customized negative marking rules instead of the default system rules. 
                    The comparison above shows how your college has tailored the assessment to match institutional standards.
                  </div>
                </div>
              )}
              
              {result.negativeMarkingInfo.ruleSource !== 'college_specific' && (
                <div style={{ fontSize: 12, fontStyle: 'italic', marginTop: 4, color: '#666' }}>
                  Note: This exam uses the standard system negative marking rules. No college-specific customizations were applied.
                </div>
              )}
            </div>
          )}
          <hr style={{ margin: '16px 0' }} />
          <h2 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Question Review</h2>
          {questionAnalysis.map((qa, idx) => {
            const question = exam?.examQuestions?.find(q => q._id === qa.questionId)
            if (!question) return null
            return (
              <div key={qa.questionId} style={{ marginBottom: 16 }}>
                <div><strong>Q{idx + 1}:</strong> <span dangerouslySetInnerHTML={{ __html: question.question }} /></div>
                <div>
                  {question.options && question.options.map((opt, i) => {
                    const key = String.fromCharCode(65 + i)
                    const isUser = Array.isArray(qa.userAnswer) ? qa.userAnswer.includes(key) : qa.userAnswer === key
                    const isCorrect = Array.isArray(qa.correctAnswer) ? qa.correctAnswer.includes(key) : qa.correctAnswer === key
                    return (
                      <div key={i} style={{
                        padding: '2px 0',
                        fontWeight: isCorrect ? 'bold' : undefined,
                        color: isCorrect ? 'green' : isUser ? 'red' : undefined
                      }}>
                        {key}. <span dangerouslySetInnerHTML={{ __html: opt }} />
                        {isCorrect && ' (Correct)'}
                        {isUser && !isCorrect && ' (Your Answer)'}
                      </div>
                    )
                  })}
                </div>
                {question.explanation && (
                  <div style={{ fontSize: 13, color: '#333', marginTop: 4 }}>
                    <strong>Solution:</strong> <span dangerouslySetInnerHTML={{ __html: question.explanation }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 