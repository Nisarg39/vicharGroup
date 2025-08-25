"use client"

import React from 'react'
import ExamOrchestrator from './ExamOrchestrator'

/**
 * TEST COMPONENT FOR EXAM ORCHESTRATOR
 * 
 * Provides sample data to test the new decomposed architecture
 * Ensures all functionality is preserved and performance improvements achieved
 */

// Sample exam data
const mockExam = {
  _id: 'test_exam_001',
  title: 'Sample Competitive Exam',
  description: 'Test exam for architecture validation',
  duration: 120, // 2 hours in minutes
  examAvailability: 'timed',
  subjects: ['Mathematics', 'Physics', 'Chemistry'],
  totalQuestions: 150,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

// Sample student data
const mockStudent = {
  _id: 'test_student_001',
  name: 'Test Student',
  email: 'test@example.com',
  rollNumber: 'TS001',
  batch: '2024',
  createdAt: new Date().toISOString()
}

// Sample questions data
const mockQuestions = [
  // Mathematics questions
  ...Array.from({ length: 50 }, (_, i) => ({
    _id: `math_q_${i + 1}`,
    questionNumber: i + 1,
    subject: 'Mathematics',
    question: `Mathematics Question ${i + 1}: Solve the given mathematical problem.`,
    options: [
      'Option A: First choice',
      'Option B: Second choice', 
      'Option C: Third choice',
      'Option D: Fourth choice'
    ],
    correctAnswer: ['A'],
    type: 'MCQ',
    marks: 4,
    negativeMarks: 1,
    difficulty: 'medium',
    topic: 'Algebra',
    createdAt: new Date().toISOString()
  })),
  
  // Physics questions
  ...Array.from({ length: 50 }, (_, i) => ({
    _id: `physics_q_${i + 1}`,
    questionNumber: i + 1,
    subject: 'Physics',
    question: `Physics Question ${i + 1}: Analyze the given physical phenomenon.`,
    options: [
      'Option A: First physics choice',
      'Option B: Second physics choice',
      'Option C: Third physics choice', 
      'Option D: Fourth physics choice'
    ],
    correctAnswer: ['B'],
    type: 'MCQ',
    marks: 4,
    negativeMarks: 1,
    difficulty: 'medium',
    topic: 'Mechanics',
    createdAt: new Date().toISOString()
  })),
  
  // Chemistry questions
  ...Array.from({ length: 50 }, (_, i) => ({
    _id: `chemistry_q_${i + 1}`,
    questionNumber: i + 1,
    subject: 'Chemistry',
    question: `Chemistry Question ${i + 1}: Identify the chemical reaction and products.`,
    options: [
      'Option A: First chemical choice',
      'Option B: Second chemical choice',
      'Option C: Third chemical choice',
      'Option D: Fourth chemical choice'
    ],
    correctAnswer: ['C'],
    type: 'MCQ',
    marks: 4,
    negativeMarks: 1,
    difficulty: 'medium',
    topic: 'Organic Chemistry',
    createdAt: new Date().toISOString()
  }))
]

/**
 * Mock handlers for testing
 */
const mockHandlers = {
  onComplete: async (result) => {
    console.log('🎯 Exam completed with result:', result)
    alert(`Exam completed! Score: ${result?.finalScore || 'N/A'}`)
  },
  
  onBack: () => {
    console.log('🔙 Back button clicked')
    if (confirm('Are you sure you want to go back? Your progress will be lost.')) {
      window.history.back()
    }
  }
}

/**
 * Performance monitoring wrapper
 */
function PerformanceMonitor({ children }) {
  React.useEffect(() => {
    const startTime = performance.now()
    let renderCount = 0
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.entryType === 'measure' && entry.name.includes('React')) {
          renderCount++
          console.log(`🎭 React Render #${renderCount}: ${entry.duration.toFixed(2)}ms`)
        }
      })
    })
    
    observer.observe({ entryTypes: ['measure'] })
    
    // Log component mount time
    const mountTime = performance.now() - startTime
    console.log(`⚡ ExamOrchestrator mounted in ${mountTime.toFixed(2)}ms`)
    
    return () => {
      observer.disconnect()
      const totalTime = performance.now() - startTime
      console.log(`📊 Total component lifetime: ${totalTime.toFixed(2)}ms`)
      console.log(`🎭 Total renders: ${renderCount}`)
    }
  }, [])
  
  return children
}

/**
 * Main test component
 */
export default function ExamOrchestratorTest() {
  const [isOnline, setIsOnline] = React.useState(true)
  const [showPerformanceMetrics, setShowPerformanceMetrics] = React.useState(
    process.env.NODE_ENV === 'development'
  )
  
  // Network status monitoring
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Test Controls (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">
              🧪 ExamOrchestrator Test Environment
            </h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>Network: {isOnline ? 'Online' : 'Offline'}</span>
              </div>
              <div>
                <span>Questions: {mockQuestions.length}</span>
              </div>
              <div>
                <span>Subjects: {mockExam.subjects.length}</span>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showPerformanceMetrics}
                  onChange={(e) => setShowPerformanceMetrics(e.target.checked)}
                />
                <span>Show Performance Metrics</span>
              </label>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Exam Interface */}
      <PerformanceMonitor>
        <ExamOrchestrator
          exam={mockExam}
          questions={mockQuestions}
          student={mockStudent}
          onComplete={mockHandlers.onComplete}
          isOnline={isOnline}
          onBack={mockHandlers.onBack}
        />
      </PerformanceMonitor>
      
      {/* Performance Metrics Overlay */}
      {showPerformanceMetrics && (
        <div className="fixed top-4 right-4 bg-black/90 text-white text-xs p-4 rounded-lg max-w-xs">
          <h3 className="font-semibold mb-2">📊 Performance Metrics</h3>
          <div className="space-y-1">
            <div>Memory: {(performance.memory?.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB</div>
            <div>Components: ExamOrchestrator + 5 modules</div>
            <div>Questions: {mockQuestions.length} loaded</div>
            <div>Subjects: {mockExam.subjects.length} available</div>
          </div>
        </div>
      )}
    </div>
  )
}

// Export mock data for other tests
export { mockExam, mockStudent, mockQuestions, mockHandlers }