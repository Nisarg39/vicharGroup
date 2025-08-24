"use client"

import { useEffect, useRef } from "react"
import toast from "react-hot-toast"
import { calculateRemainingTime } from "../../../utils/examTimingUtils"

/**
 * ExamTimer Component
 * 
 * Handles exam timer countdown, warning notifications, and auto-submit functionality.
 * Extracted from ExamInterface.js to improve code organization and maintainability.
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isExamStarted - Whether the exam has started
 * @param {number} props.startTime - Exam start time in milliseconds
 * @param {Object} props.exam - Exam object containing timing configuration
 * @param {Function} props.onTimeUpdate - Callback when time updates (receives timeLeft in seconds)
 * @param {Function} props.onTimeExpired - Callback when time expires (auto-submit)
 * @param {Set} props.warningsShownRef - Ref to Set tracking shown warnings to prevent duplicates
 */
export default function ExamTimer({ 
    isExamStarted, 
    startTime, 
    exam, 
    onTimeUpdate, 
    onTimeExpired, 
    warningsShownRef 
}) {
    const timerRef = useRef(null)
    const lastTimeUpdateRef = useRef(0)
    const autoSubmitTriggeredRef = useRef(false)

    useEffect(() => {
        if (!isExamStarted || !startTime) return;
        
        timerRef.current = setInterval(() => {
            try {
                // Use consistent helper function for time calculation
                const calculatedTimeLeft = calculateRemainingTime(exam, startTime);
                
                // STABLE UPDATE: Only update state if time has actually changed by at least 1 second
                // This prevents unnecessary re-renders and cascading effects
                if (Math.abs(calculatedTimeLeft - lastTimeUpdateRef.current) >= 1) {
                    lastTimeUpdateRef.current = calculatedTimeLeft;
                    onTimeUpdate(calculatedTimeLeft);
                }
                
                // Show time warnings - using stable warning thresholds
                const warnings = [
                    { time: 300, message: "⚠️ 5 minutes remaining! Please review your answers.", type: "warning" },
                    { time: 60, message: "🚨 1 minute remaining! Exam will auto-submit soon.", type: "error" },
                    { time: 30, message: "⏰ 30 seconds remaining! Auto-submit imminent.", type: "error" },
                    { time: 10, message: "🔥 10 seconds remaining! Submitting now...", type: "error" }
                ];
                
                // STABLE WARNING SYSTEM: Check warnings without triggering state changes
                warnings.forEach(warning => {
                    if (calculatedTimeLeft === warning.time && !warningsShownRef.current.has(warning.time)) {
                        warningsShownRef.current.add(warning.time);
                        if (warning.type === "error") {
                            toast.error(warning.message, { duration: 4000 });
                        } else {
                            toast(warning.message, {
                                icon: '⚠️',
                                style: {
                                    background: '#f59e0b',
                                    color: '#fff',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                },
                                duration: 4000
                            });
                        }
                    }
                });
                
                // STABLE AUTO-SUBMIT: Prevent multiple auto-submit calls
                if (calculatedTimeLeft <= 0 && !autoSubmitTriggeredRef.current) {
                    autoSubmitTriggeredRef.current = true;
                    onTimeExpired();
                }
            } catch (error) {
                console.error('Timer calculation error:', error);
                // Continue timer but skip this update
            }
        }, 1000);
        
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [
        isExamStarted, 
        startTime,
        exam._id, // Only essential exam properties
        exam.examAvailability,
        exam.endTime,
        onTimeUpdate,
        onTimeExpired,
        warningsShownRef
    ]);

    // Reset auto-submit flag when exam restarts or startTime changes
    useEffect(() => {
        autoSubmitTriggeredRef.current = false;
    }, [startTime, isExamStarted]);

    // This component doesn't render anything - it's purely for timer logic
    return null;
}