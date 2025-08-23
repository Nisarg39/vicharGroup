"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/badge"
import { Checkbox } from "../../ui/checkbox"
import { AlertTriangle, Clock, FileText, CheckCircle, ArrowLeft, Play, Target } from "lucide-react"

export default function Instructions({ exam, onStart, onBack }) {
    const [hasReadInstructions, setHasReadInstructions] = useState(false)
    const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false)

    const canStart = hasReadInstructions && hasAgreedToTerms

    // Get marking information from the preview rules provided by server
    const getMarkingInfo = () => {
        // Check if we have marking rule preview from server
        if (exam?.markingRulePreview?.hasMarkingRules) {
            // Check if this is MHT-CET exam that needs subject-wise detection override
            const isMHTCET = exam?.stream?.toLowerCase().includes('mht-cet')
            
            if (isMHTCET && exam?.examSubject && Array.isArray(exam.examSubject) && exam.examSubject.length > 1) {
                console.log('🔍 MHT-CET detected in Instructions, applying subject-wise override...')
                
                // For MHT-CET with multiple subjects, force subject-wise display
                // Create subject-wise marking data using exam.examSubject array
                const subjectWiseMarks = {}
                exam.examSubject.forEach(subject => {
                    subjectWiseMarks[subject] = {
                        correct: exam.markingRulePreview.positiveMarks,
                        incorrect: Math.abs(exam.markingRulePreview.negativeMarks)
                    }
                })
                
                console.log('  MHT-CET Instructions override - subjects detected:', exam.examSubject)
                console.log('  MHT-CET Instructions override - subject-wise marks:', subjectWiseMarks)
                
                // Return subject-wise marking scheme for MHT-CET
                return {
                    positiveMarks: exam.markingRulePreview.positiveMarks,
                    negativeMarks: exam.markingRulePreview.negativeMarks,
                    hasSpecificRules: true,
                    ruleDescription: 'MHT-CET subject-wise marking scheme',
                    ruleSource: exam.markingRulePreview.ruleSource,
                    stream: exam?.stream || "",
                    totalMarks: exam?.totalMarks || null,
                    isSubjectWise: true,  // Override to true for MHT-CET
                    subjects: subjectWiseMarks  // Override with subject-wise data
                }
            }
            
            // For non-MHT-CET or MHT-CET with single subject, use original server data
            return {
                positiveMarks: exam.markingRulePreview.positiveMarks,
                negativeMarks: exam.markingRulePreview.negativeMarks,
                hasSpecificRules: true,
                ruleDescription: exam.markingRulePreview.ruleDescription,
                ruleSource: exam.markingRulePreview.ruleSource,
                stream: exam?.stream || "",
                totalMarks: exam?.totalMarks || null,
                isSubjectWise: exam.markingRulePreview.isSubjectWise || false,
                subjects: exam.markingRulePreview.subjects || {}
            }
        }
        
        // Fallback to exam-specific marking if available
        const hasExamSpecificMarking = !!(exam?.positiveMarks || exam?.marks) || exam?.negativeMarks !== undefined
        
        return {
            positiveMarks: exam?.positiveMarks || exam?.marks || null,
            negativeMarks: exam?.negativeMarks !== undefined ? exam.negativeMarks : null,
            hasSpecificRules: hasExamSpecificMarking,
            ruleDescription: "Exam-specific marking",
            ruleSource: "exam_specific",
            stream: exam?.stream || "",
            totalMarks: exam?.totalMarks || null,
            isSubjectWise: false,
            subjects: {}
        }
    }

    const markingInfo = getMarkingInfo()

    const examInstructions = [
        "Read each question carefully before answering",
        "You cannot go back to previous questions once answered",
        "Ensure stable internet connection for best experience",
        "Your progress is automatically saved",
        "Do not refresh the page during the exam",
        "Submit only when you're sure about all answers",
        "The timer will automatically submit when time expires"
    ]

    const generalInstructions = [
        "This is a timed examination",
        "All questions are mandatory",
        "Negative marking may apply",
        "Use the navigation panel to move between questions",
        "You can mark questions for review",
        "Ensure your device is fully charged",
        "Close all other applications"
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40 relative overflow-hidden p-4 md:p-8">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/10 to-blue-400/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-gradient-to-br from-purple-400/5 to-pink-400/5 rounded-full blur-2xl"></div>
            </div>
            
            <div className="relative z-10 max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-8 group hover:shadow-3xl transition-all duration-500 relative overflow-hidden">
                    {/* Background Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative z-10 flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <Button 
                                variant="ghost" 
                                onClick={onBack}
                                className="p-3 hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-200 rounded-2xl transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-lg"
                            >
                                <ArrowLeft className="w-6 h-6 text-gray-700" />
                            </Button>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                    Exam Instructions
                                </h1>
                                <p className="text-gray-600 text-lg font-medium">{exam?.examName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-0 text-base font-bold">
                                <Clock className="w-5 h-5 mr-2" />
                                {exam?.examDurationMinutes} minutes
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Exam Details */}
                <Card className="bg-white/80 backdrop-blur-2xl shadow-2xl border border-white/30 rounded-3xl overflow-hidden group hover:shadow-3xl transition-all duration-500 relative">
                    {/* Background Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <CardHeader className="relative z-10 pb-4">
                        <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3 group-hover:text-blue-900 transition-colors duration-300">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            Exam Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3 p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-100/50 hover:shadow-md transition-all duration-300">
                                <p className="text-sm font-bold text-blue-900 uppercase tracking-wide">Exam Name</p>
                                <p className="text-xl font-bold text-blue-800">{exam?.examName}</p>
                            </div>
                            <div className="space-y-3 p-5 bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl border border-green-100/50 hover:shadow-md transition-all duration-300">
                                <p className="text-sm font-bold text-green-900 uppercase tracking-wide">Duration</p>
                                <p className="text-xl font-bold text-green-800 flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    {exam?.examDurationMinutes} minutes
                                </p>
                            </div>
                            <div className="space-y-3 p-5 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl border border-purple-100/50 hover:shadow-md transition-all duration-300">
                                <p className="text-sm font-bold text-purple-900 uppercase tracking-wide">Total Marks</p>
                                <p className="text-xl font-bold text-purple-800">{exam?.totalMarks || 'TBD'}</p>
                            </div>
                            <div className="space-y-3 p-5 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-2xl border border-indigo-100/50 hover:shadow-md transition-all duration-300">
                                <p className="text-sm font-bold text-indigo-900 uppercase tracking-wide">Subjects</p>
                                <p className="text-xl font-bold text-indigo-800">
                                    {Array.isArray(exam?.examSubject) ? exam.examSubject.join(', ') : exam?.examSubject}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Marking Scheme */}
                <Card className="bg-white/80 backdrop-blur-2xl shadow-2xl border border-white/30 rounded-3xl overflow-hidden group hover:shadow-3xl transition-all duration-500 relative">
                    {/* Background Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 via-transparent to-orange-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <CardHeader className="relative z-10 pb-4">
                        <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3 group-hover:text-amber-900 transition-colors duration-300">
                            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            Marking Scheme
                        </CardTitle>
                        <CardDescription className="text-gray-600 text-base font-medium">Understanding how your answers will be evaluated</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 relative z-10">
                        {markingInfo.hasSpecificRules ? (
                            markingInfo.isSubjectWise ? (
                                // Show subject-wise marking scheme (for MHT-CET)
                                <div className="space-y-6">
                                    {/* Subject-wise Header */}
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100/50">
                                        <h4 className="font-bold text-blue-900 mb-2 text-lg">Subject-wise Marking Scheme</h4>
                                        <p className="text-blue-800 text-sm">Different subjects may have different marking patterns</p>
                                    </div>
                                    
                                    {/* Subject-wise marking display */}
                                    <div className="space-y-4">
                                        {Object.entries(markingInfo.subjects).map(([subject, marks]) => (
                                            <div key={subject} className="bg-gradient-to-r from-gray-50/50 to-blue-50/30 rounded-2xl p-5 border border-gray-200/50">
                                                <h5 className="font-bold text-gray-900 mb-4 text-lg capitalize">{subject}</h5>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                    {/* Correct */}
                                                    <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200/50">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                            <span className="text-green-900 font-medium">Correct</span>
                                                        </div>
                                                        <p className="text-lg font-bold text-green-800">+{marks.correct}</p>
                                                    </div>
                                                    
                                                    {/* Incorrect */}
                                                    <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl p-4 border border-red-200/50">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                                            <span className="text-red-900 font-medium">Incorrect</span>
                                                        </div>
                                                        <p className="text-lg font-bold text-red-800">-{marks.incorrect}</p>
                                                    </div>
                                                    
                                                    {/* Unanswered */}
                                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 border border-gray-200/50">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                                                            <span className="text-gray-900 font-medium">Unanswered</span>
                                                        </div>
                                                        <p className="text-lg font-bold text-gray-800">0</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                // Show regular marking info if not subject-wise
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Correct Answer */}
                                    <div className="p-5 bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl border border-green-200/50 hover:shadow-md transition-all duration-300">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                                            <span className="text-green-900 font-bold text-lg">Correct Answer</span>
                                        </div>
                                        <p className="text-2xl font-bold text-green-800">+{markingInfo.positiveMarks}</p>
                                        <p className="text-sm text-green-700 mt-1">marks awarded</p>
                                    </div>

                                    {/* Incorrect Answer */}
                                    <div className="p-5 bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl border border-red-200/50 hover:shadow-md transition-all duration-300">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                                            <span className="text-red-900 font-bold text-lg">Incorrect Answer</span>
                                        </div>
                                        <p className="text-2xl font-bold text-red-800">
                                            {markingInfo.negativeMarks !== null ? markingInfo.negativeMarks : 'As per admin rules'}
                                        </p>
                                        <p className="text-sm text-red-700 mt-1">marks deducted</p>
                                    </div>

                                    {/* Unanswered */}
                                    <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl border border-gray-200/50 hover:shadow-md transition-all duration-300">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                                            <span className="text-gray-900 font-bold text-lg">Unanswered</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-800">0</p>
                                        <p className="text-sm text-gray-700 mt-1">no marks</p>
                                    </div>
                                </div>
                            )
                        ) : (
                            // Show generic message when no specific rules available
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100/50">
                                <div className="text-center">
                                    <div className="p-3 bg-blue-500 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                        <Target className="w-8 h-8 text-white" />
                                    </div>
                                    <h4 className="font-bold text-blue-900 mb-3 text-lg">Marking Scheme</h4>
                                    <p className="text-blue-800 text-base mb-4">
                                        This exam will be evaluated according to the marking rules configured by the system administrator.
                                    </p>
                                    <div className="bg-white/60 rounded-xl p-4 border border-blue-200/50">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Stream:</span>
                                                <span className="font-medium text-gray-900">{markingInfo.stream || 'Not specified'}</span>
                                            </div>
                                            {markingInfo.totalMarks && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Total Marks:</span>
                                                    <span className="font-medium text-gray-900">{markingInfo.totalMarks}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-blue-700 text-sm mt-4">
                                        <strong>Note:</strong> The exact marking details will be displayed in your result after exam completion.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Important Guidelines */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100/50">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-500 rounded-lg">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-blue-900 mb-2">Important Guidelines</h4>
                                    <ul className="space-y-2 text-sm text-blue-800">
                                        <li className="flex items-start gap-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                            <span>Marking scheme is configured by system administrators based on exam type and subject</span>
                                        </li>
                                        {markingInfo.isSubjectWise && (
                                            <li className="flex items-start gap-2">
                                                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                                <span className="text-purple-800 font-medium">This exam has subject-wise marking - each subject may have different marking patterns</span>
                                            </li>
                                        )}
                                        <li className="flex items-start gap-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                            <span>Multiple choice questions: Only one correct answer unless marked as multiple correct</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                            <span>Numerical questions: Enter your answer as a number</span>
                                        </li>
                                        {markingInfo.hasSpecificRules && markingInfo.negativeMarks !== null && (
                                            <>
                                                {markingInfo.negativeMarks < 0 && (
                                                    <li className="flex items-start gap-2">
                                                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                                                        <span className="text-red-800 font-medium">Negative marking is applicable - choose your answers carefully</span>
                                                    </li>
                                                )}
                                                {markingInfo.negativeMarks === 0 && (
                                                    <li className="flex items-start gap-2">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                                        <span className="text-green-800 font-medium">No negative marking - attempt all questions without penalty</span>
                                                    </li>
                                                )}
                                            </>
                                        )}
                                        {markingInfo.hasSpecificRules && markingInfo.ruleDescription && (
                                            <li className="flex items-start gap-2">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                                <span><strong>Rule Applied:</strong> {markingInfo.ruleDescription}</span>
                                            </li>
                                        )}
                                        {markingInfo.hasSpecificRules && markingInfo.ruleSource && (
                                            <li className="flex items-start gap-2">
                                                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                                <span><strong>Source:</strong> {markingInfo.ruleSource === 'super_admin_default' ? 'System Default Rules' : 'Exam-Specific Rules'}</span>
                                            </li>
                                        )}
                                        <li className="flex items-start gap-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                            <span>The complete marking breakdown will be shown in your exam result</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Instructions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* General Instructions */}
                    <Card className="bg-white/80 backdrop-blur-2xl shadow-2xl border border-white/30 rounded-3xl overflow-hidden group hover:shadow-3xl transition-all duration-500 relative">
                        {/* Background Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-transparent to-red-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        <CardHeader className="relative z-10 pb-4">
                            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3 group-hover:text-orange-900 transition-colors duration-300">
                                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg">
                                    <AlertTriangle className="w-6 h-6 text-white" />
                                </div>
                                General Instructions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <ul className="space-y-4">
                                {generalInstructions.map((instruction, index) => (
                                    <li key={index} className="flex items-start gap-4 p-4 bg-gradient-to-r from-orange-50/50 to-red-50/30 rounded-xl hover:shadow-md transition-all duration-300 group/item">
                                        <div className="flex-shrink-0 mt-1">
                                            <div className="w-3 h-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-full shadow-sm group-hover/item:scale-110 transition-transform duration-300"></div>
                                        </div>
                                        <span className="text-gray-800 text-base leading-relaxed font-medium">{instruction}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Exam Specific Instructions */}
                    <Card className="bg-white/80 backdrop-blur-2xl shadow-2xl border border-white/30 rounded-3xl overflow-hidden group hover:shadow-3xl transition-all duration-500 relative">
                        {/* Background Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-transparent to-blue-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        <CardHeader className="relative z-10 pb-4">
                            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3 group-hover:text-green-900 transition-colors duration-300">
                                <div className="p-3 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl shadow-lg">
                                    <CheckCircle className="w-6 h-6 text-white" />
                                </div>
                                Exam Instructions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <ul className="space-y-4">
                                {examInstructions.map((instruction, index) => (
                                    <li key={index} className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50/50 to-blue-50/30 rounded-xl hover:shadow-md transition-all duration-300 group/item">
                                        <div className="flex-shrink-0 mt-1">
                                            <div className="w-3 h-3 bg-gradient-to-br from-green-500 to-blue-500 rounded-full shadow-sm group-hover/item:scale-110 transition-transform duration-300"></div>
                                        </div>
                                        <span className="text-gray-800 text-base leading-relaxed font-medium">{instruction}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Custom Instructions */}
                {exam?.examInstructions && (
                    <Card className="bg-white/80 backdrop-blur-2xl shadow-2xl border border-white/30 rounded-3xl overflow-hidden group hover:shadow-3xl transition-all duration-500 relative">
                        {/* Background Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-transparent to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        <CardHeader className="relative z-10 pb-4">
                            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3 group-hover:text-indigo-900 transition-colors duration-300">
                                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                                    <FileText className="w-6 h-6 text-white" />
                                </div>
                                Additional Instructions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100/50 hover:shadow-md transition-all duration-300">
                                <p className="text-gray-800 text-base leading-relaxed font-medium">{exam.examInstructions}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Agreement Section */}
                <Card className="bg-white/80 backdrop-blur-2xl shadow-2xl border border-white/30 rounded-3xl overflow-hidden group hover:shadow-3xl transition-all duration-500 relative">
                    {/* Background Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50/30 via-transparent to-blue-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <CardHeader className="relative z-10 pb-4">
                        <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-blue-900 transition-colors duration-300">Agreement</CardTitle>
                        <CardDescription className="text-gray-600 text-base font-medium">Please confirm the following before starting the exam</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 relative z-10">
                        <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-gray-50/50 to-blue-50/30 rounded-2xl hover:shadow-md transition-all duration-300 group/item">
                            <Checkbox 
                                id="read-instructions"
                                checked={hasReadInstructions}
                                onCheckedChange={setHasReadInstructions}
                                className="mt-1 scale-125"
                            />
                            <label htmlFor="read-instructions" className="text-base text-gray-800 leading-relaxed font-medium cursor-pointer">
                                I have read and understood all the instructions provided above
                            </label>
                        </div>
                        
                        <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-gray-50/50 to-blue-50/30 rounded-2xl hover:shadow-md transition-all duration-300 group/item">
                            <Checkbox 
                                id="agree-terms"
                                checked={hasAgreedToTerms}
                                onCheckedChange={setHasAgreedToTerms}
                                className="mt-1 scale-125"
                            />
                            <label htmlFor="agree-terms" className="text-base text-gray-800 leading-relaxed font-medium cursor-pointer">
                                I agree to follow all exam rules and regulations. I understand that any violation may result in disqualification.
                            </label>
                        </div>

                        <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-green-50/50 to-blue-50/30 rounded-2xl border-2 border-green-200/50 transition-all duration-300">
                            <Checkbox 
                                id="ready-exam"
                                checked={canStart}
                                disabled
                                className="mt-1 scale-125"
                            />
                            <label htmlFor="ready-exam" className="text-base text-gray-800 leading-relaxed font-bold cursor-default">
                                I am ready to begin the examination
                            </label>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <Button 
                        variant="outline" 
                        onClick={onBack}
                        className="border-2 border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:border-gray-400 px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 group/button"
                    >
                        <div className="p-1 bg-gray-200 rounded-lg group-hover/button:bg-gray-300 transition-colors duration-300">
                            <ArrowLeft className="w-5 h-5" />
                        </div>
                        Go Back
                    </Button>
                    
                    <Button 
                        onClick={onStart}
                        disabled={!canStart}
                        className={`px-10 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 group/button transform hover:scale-105 text-lg ${
                            canStart 
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white' 
                                : 'bg-gradient-to-r from-gray-400 to-gray-500 text-gray-300 cursor-not-allowed hover:scale-100'
                        }`}
                    >
                        <div className={`p-1 rounded-lg transition-colors duration-300 ${
                            canStart ? 'bg-white/20 group-hover/button:bg-white/30' : 'bg-gray-300'
                        }`}>
                            <Play className="w-6 h-6" />
                        </div>
                        Start Exam
                    </Button>
                </div>

                {/* Warning */}
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                    {/* Warning Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/20 to-amber-100/20 opacity-50"></div>
                    
                    <div className="relative z-10 flex items-start gap-4">
                        <div className="p-2 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl shadow-md">
                            <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                        
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-yellow-900 font-bold text-lg">Important Notice</span>
                            </div>
                            <p className="text-yellow-800 text-base leading-relaxed font-medium">
                                Once you start the exam, the timer will begin and cannot be paused. Make sure you have a stable environment and are ready to complete the entire exam.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}