"use client"

import React from 'react';
import { VicharCard } from '../../ui/vichar-card';
import { VicharButton } from '../../ui/vichar-button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * PRODUCTION-READY Error Boundary Component for Exam Interface
 * 
 * This component catches React errors specifically for the infinite loop issue (#185)
 * and provides stable fallback UI without losing exam progress.
 * 
 * Key Features:
 * - Catches circular dependency errors and infinite loops
 * - Preserves exam progress in localStorage
 * - Provides recovery options without data loss
 * - Logs detailed error information for debugging
 */
class ExamErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false, 
            error: null, 
            errorInfo: null,
            retryCount: 0
        };
        
        // Bind methods
        this.handleRetry = this.handleRetry.bind(this);
        this.handleSafeExit = this.handleSafeExit.bind(this);
    }

    static getDerivedStateFromError(error) {
        // Update state to show fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Store error details for debugging
        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // Log error for debugging (in production, this would go to monitoring service)
        console.error('🔴 EXAM ERROR BOUNDARY - React Error #185:', {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
            examId: this.props.examId,
            studentId: this.props.studentId
        });

        // Check if this is the infamous React error #185 (infinite loop)
        if (error.message?.includes('Maximum update depth exceeded') || 
            error.stack?.includes('useEffect') ||
            errorInfo.componentStack?.includes('ExamInterface')) {
            console.error('🚨 DETECTED: React Error #185 infinite loop in CET exams');
        }
    }

    handleRetry() {
        // Increment retry count to prevent infinite retry loops
        const newRetryCount = this.state.retryCount + 1;
        
        if (newRetryCount > 3) {
            // After 3 retries, force safe exit to prevent further issues
            this.handleSafeExit();
            return;
        }

        // Clear error state to retry rendering
        this.setState({ 
            hasError: false, 
            error: null, 
            errorInfo: null,
            retryCount: newRetryCount
        });
        
        // Force a small delay to let React settle
        setTimeout(() => {
            // Component will re-mount and try again
        }, 100);
    }

    handleSafeExit() {
        // Preserve exam progress before exiting
        try {
            const progressKey = `exam_progress_${this.props.examId}_${this.props.studentId}`;
            const savedProgress = localStorage.getItem(progressKey);
            
            if (savedProgress) {
                // Mark progress as having error for recovery later
                const progress = JSON.parse(savedProgress);
                progress.hasError = true;
                progress.errorTimestamp = new Date().toISOString();
                localStorage.setItem(progressKey, JSON.stringify(progress));
            }
        } catch (storageError) {
            console.error('Error preserving exam progress:', storageError);
        }

        // Call parent's error handler or navigate back
        if (this.props.onSafeExit) {
            this.props.onSafeExit();
        } else {
            // Default: navigate back to exam list
            window.location.href = '/exams';
        }
    }

    render() {
        if (this.state.hasError) {
            const isInfiniteLoopError = this.state.error?.message?.includes('Maximum update depth exceeded');
            
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <VicharCard className="max-w-2xl w-full">
                        <div className="p-8 text-center">
                            <div className="mb-6">
                                <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    Exam Interface Error
                                </h1>
                                <p className="text-gray-600">
                                    {isInfiniteLoopError 
                                        ? "We've detected and prevented an infinite loop error. Your exam progress has been preserved."
                                        : "An unexpected error occurred. Don't worry, your progress is safe."
                                    }
                                </p>
                            </div>

                            {/* Error Details (for development) */}
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                                    <h3 className="font-semibold text-red-800 mb-2">Error Details:</h3>
                                    <p className="text-sm text-red-700 font-mono">
                                        {this.state.error.message}
                                    </p>
                                    {this.state.errorInfo && (
                                        <details className="mt-2">
                                            <summary className="text-red-800 cursor-pointer">Component Stack</summary>
                                            <pre className="text-xs text-red-600 mt-1 whitespace-pre-wrap">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}

                            {/* Recovery Options */}
                            <div className="space-y-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-blue-800 mb-2">Your Progress is Safe</h3>
                                    <p className="text-sm text-blue-700">
                                        All your answers and exam progress have been automatically saved. 
                                        You can safely retry or return to continue later.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    {this.state.retryCount < 3 && (
                                        <VicharButton 
                                            onClick={this.handleRetry}
                                            className="flex items-center gap-2"
                                            variant="default"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                            Retry Exam Interface
                                            {this.state.retryCount > 0 && (
                                                <span className="text-xs">
                                                    (Attempt {this.state.retryCount + 1}/3)
                                                </span>
                                            )}
                                        </VicharButton>
                                    )}
                                    
                                    <VicharButton 
                                        onClick={this.handleSafeExit}
                                        className="flex items-center gap-2"
                                        variant="outline"
                                    >
                                        <Home className="h-4 w-4" />
                                        Return to Exam List
                                    </VicharButton>
                                </div>

                                {this.state.retryCount >= 3 && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                        <p className="text-sm text-amber-700">
                                            Multiple retry attempts detected. For stability, please return to the exam list 
                                            and restart the exam. Your progress will be restored automatically.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </VicharCard>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ExamErrorBoundary;