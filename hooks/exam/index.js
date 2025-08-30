/**
 * Exam Hooks - Centralized Export
 * 
 * This file provides centralized access to all exam-related hooks.
 * Phase 1 State Management Extraction - ExamInterface.js refactoring.
 * 
 * Usage:
 * import { useTimerManagement, useExamState, useQuestionNavigation, useSubmissionLogic } from '../../hooks/exam'
 */

// Timer Management Hook
export { useTimerManagement } from './useTimerManagement'

// Core Exam State Hook
export { useExamState } from './useExamState'

// Question Navigation Hook
export { useQuestionNavigation } from './useQuestionNavigation'

// Submission Logic Hook
export { useSubmissionLogic } from './useSubmissionLogic'

/**
 * Hook Integration Guide:
 * 
 * These hooks are designed to be used together in the ExamInterface component:
 * 
 * ```javascript
 * import { 
 *   useTimerManagement,
 *   useExamState, 
 *   useQuestionNavigation,
 *   useSubmissionLogic 
 * } from '../../hooks/exam'
 * 
 * export default function ExamInterface({ exam, questions, student, onComplete, isOnline, onBack }) {
 *   // Initialize hooks
 *   const timerState = useTimerManagement(exam)
 *   const examState = useExamState(exam, questions)
 *   const navigationState = useQuestionNavigation(exam, questions, examState)
 *   const submissionState = useSubmissionLogic(exam, student, onComplete)
 * 
 *   // Use hook data and functions throughout component
 *   const { timeLeft, isExamStarted, startTimer, stopTimer } = timerState
 *   const { currentQuestionIndex, answers, handleAnswerChange } = examState
 *   const { selectedSubject, handleNext, handlePrevious } = navigationState
 *   const { handleSubmit, submissionState } = submissionState
 * 
 *   // Component render logic...
 * }
 * ```
 * 
 * Benefits of this extraction:
 * - Improved code organization and maintainability
 * - Better separation of concerns
 * - Reduced component complexity
 * - Easier testing and debugging
 * - Reusable state logic
 * - Memory leak prevention through proper cleanup
 */