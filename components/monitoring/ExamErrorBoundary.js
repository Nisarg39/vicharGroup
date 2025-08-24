"use client";

import React from 'react';
import { AlertTriangle, RefreshCw, FileText, Home } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import monitoringService from '../../lib/monitoring/MonitoringService';
import examLogger from '../../lib/monitoring/ExamLogger';

/**
 * Enhanced Error Boundary for Exam Components
 * Captures React component crashes, logs them for monitoring, and provides recovery options
 * Critical for maintaining exam integrity during refactoring
 */

class ExamErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      isExamCritical: false,
      examContext: null
    };
    
    this.maxRetries = 3;
    this.errorReportSent = false;
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Determine if this is exam-critical
    const isExamCritical = this.isExamCriticalError(error, errorInfo);
    const examContext = this.getExamContext();
    
    // Generate unique error ID
    const errorId = this.generateErrorId();
    
    // Update state with error details
    this.setState({
      error,
      errorInfo,
      errorId,
      isExamCritical,
      examContext
    });
    
    // Log the error
    this.logComponentError(error, errorInfo, errorId, isExamCritical, examContext);
    
    // Send error report
    this.sendErrorReport(error, errorInfo, errorId, isExamCritical, examContext);
    
    // Dispatch custom event for other error handlers
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('react-error', {
        detail: {
          error,
          componentStack: errorInfo.componentStack,
          errorBoundary: this.props.boundaryName || 'ExamErrorBoundary',
          errorId,
          isExamCritical
        }
      }));
    }
  }

  isExamCriticalError(error, errorInfo) {
    // Check if error occurred in exam-related components
    const examComponents = [
      'ExamInterface',
      'QuestionDisplay', 
      'ExamNavigation',
      'QuestionNavigator',
      'ExamHeader',
      'Timer',
      'SubmitModal'
    ];
    
    const componentStack = errorInfo.componentStack || '';
    const isExamComponent = examComponents.some(comp => 
      componentStack.includes(comp)
    );
    
    // Check current URL for exam context
    const isExamPage = typeof window !== 'undefined' && 
      window.location.pathname.includes('/exam');
    
    // Error during exam is critical
    const isDuringExam = examLogger.isExamActive;
    
    return isExamComponent || isExamPage || isDuringExam;
  }

  getExamContext() {
    try {
      // Try to extract exam context from various sources
      const context = {
        url: typeof window !== 'undefined' ? window.location.href : null,
        isExamActive: examLogger.isExamActive,
        examSessionId: examLogger.examSessionId,
        examId: examLogger.examId,
        studentId: examLogger.studentId
      };
      
      // Get additional context from props if available
      if (this.props.examContext) {
        Object.assign(context, this.props.examContext);
      }
      
      return context;
    } catch (contextError) {
      console.error('Error getting exam context:', contextError);
      return { contextError: contextError.message };
    }
  }

  logComponentError(error, errorInfo, errorId, isExamCritical, examContext) {
    try {
      // Log to exam logger if exam is active
      if (examLogger.isExamActive) {
        examLogger.logCritical('component_error', {
          errorId,
          errorMessage: error.message,
          errorStack: error.stack,
          componentStack: errorInfo.componentStack,
          boundaryName: this.props.boundaryName,
          isExamCritical,
          retryCount: this.state.retryCount,
          props: this.sanitizeProps(this.props)
        });
      }
      
      // Log to monitoring service
      monitoringService.captureError(error, 'REACT_COMPONENT', `Component error in ${this.props.boundaryName || 'ExamErrorBoundary'}`, {
        errorId,
        componentStack: errorInfo.componentStack,
        boundaryName: this.props.boundaryName,
        isExamCritical,
        examContext,
        retryCount: this.state.retryCount,
        props: this.sanitizeProps(this.props)
      });
      
    } catch (loggingError) {
      console.error('Error logging component error:', loggingError);
    }
  }

  sendErrorReport(error, errorInfo, errorId, isExamCritical, examContext) {
    if (this.errorReportSent) return;
    this.errorReportSent = true;
    
    try {
      const report = {
        errorId,
        timestamp: new Date().toISOString(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        errorInfo: {
          componentStack: errorInfo.componentStack
        },
        context: {
          boundaryName: this.props.boundaryName,
          isExamCritical,
          examContext,
          retryCount: this.state.retryCount,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
          url: typeof window !== 'undefined' ? window.location.href : null,
          viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : null
        },
        props: this.sanitizeProps(this.props)
      };
      
      // Send to server if configured
      if (typeof fetch !== 'undefined' && this.shouldSendToServer(isExamCritical)) {
        fetch('/api/monitoring/component-error', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(report)
        }).catch(fetchError => {
          console.error('Failed to send error report to server:', fetchError);
        });
      }
      
    } catch (reportError) {
      console.error('Error creating error report:', reportError);
    }
  }

  shouldSendToServer(isExamCritical) {
    // Always send exam-critical errors
    if (isExamCritical) return true;
    
    // Send production errors
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      return true;
    }
    
    return false;
  }

  sanitizeProps(props) {
    try {
      const sanitized = {};
      
      Object.keys(props).forEach(key => {
        const value = props[key];
        
        // Skip functions and React elements
        if (typeof value === 'function' || React.isValidElement(value)) {
          sanitized[key] = `[${typeof value}]`;
          return;
        }
        
        // Skip sensitive data
        if (key.toLowerCase().includes('password') || 
            key.toLowerCase().includes('token') ||
            key.toLowerCase().includes('secret')) {
          sanitized[key] = '[REDACTED]';
          return;
        }
        
        // Limit object size
        if (typeof value === 'object' && value !== null) {
          try {
            const serialized = JSON.stringify(value);
            if (serialized.length > 1000) {
              sanitized[key] = '[LARGE_OBJECT]';
            } else {
              sanitized[key] = value;
            }
          } catch {
            sanitized[key] = '[UNSERIALIZABLE]';
          }
        } else {
          sanitized[key] = value;
        }
      });
      
      return sanitized;
    } catch {
      return { sanitizationError: true };
    }
  }

  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  handleRetry = () => {
    if (this.state.retryCount >= this.maxRetries) {
      return;
    }
    
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: prevState.retryCount + 1,
      isExamCritical: false,
      examContext: null
    }));
    
    this.errorReportSent = false;
    
    // Log retry attempt
    monitoringService.log('INFO', `Component retry attempt ${this.state.retryCount + 1}`, {
      boundaryName: this.props.boundaryName,
      errorId: this.state.errorId
    });
  };

  handleReloadPage = () => {
    if (typeof window !== 'undefined') {
      // Save current state before reload if in exam
      if (this.state.isExamCritical && examLogger.isExamActive) {
        examLogger.logCritical('forced_page_reload', {
          reason: 'component_error_recovery',
          errorId: this.state.errorId
        });
      }
      
      window.location.reload();
    }
  };

  handleGoHome = () => {
    if (typeof window !== 'undefined') {
      // Log navigation away from exam
      if (this.state.isExamCritical && examLogger.isExamActive) {
        examLogger.logCritical('navigation_away_from_exam', {
          reason: 'component_error_recovery',
          errorId: this.state.errorId
        });
      }
      
      window.location.href = '/';
    }
  };

  exportErrorDetails = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      error: {
        name: this.state.error?.name,
        message: this.state.error?.message,
        stack: this.state.error?.stack
      },
      componentStack: this.state.errorInfo?.componentStack,
      context: this.state.examContext,
      isExamCritical: this.state.isExamCritical,
      retryCount: this.state.retryCount,
      boundaryName: this.props.boundaryName
    };
    
    const blob = new Blob([JSON.stringify(errorDetails, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-report-${this.state.errorId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, isExamCritical, retryCount } = this.state;
      const canRetry = retryCount < this.maxRetries;
      
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className={`w-16 h-16 ${isExamCritical ? 'text-red-500' : 'text-orange-500'}`} />
              </div>
              <CardTitle className="text-2xl">
                {isExamCritical ? 'Exam System Error' : 'Application Error'}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {isExamCritical && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    <strong>Critical Error During Exam</strong>
                    <br />
                    Your exam progress has been automatically saved. Please try to recover or contact support immediately.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2">Something went wrong</h3>
                <p className="text-gray-600 mb-4">
                  {isExamCritical 
                    ? "We've encountered an error in the exam system. Don't worry - your progress is safe."
                    : "We've encountered an unexpected error. Please try one of the options below."}
                </p>
                
                {process.env.NODE_ENV === 'development' && (
                  <details className="text-left bg-gray-100 p-4 rounded-lg mb-4">
                    <summary className="font-medium cursor-pointer mb-2">
                      Error Details (Development)
                    </summary>
                    <div className="text-sm space-y-2">
                      <div>
                        <strong>Error:</strong> {error?.message}
                      </div>
                      <div>
                        <strong>Error ID:</strong> {this.state.errorId}
                      </div>
                      <div>
                        <strong>Boundary:</strong> {this.props.boundaryName}
                      </div>
                      <div>
                        <strong>Retry Count:</strong> {retryCount}/{this.maxRetries}
                      </div>
                      {errorInfo?.componentStack && (
                        <div>
                          <strong>Component Stack:</strong>
                          <pre className="mt-1 text-xs bg-gray-200 p-2 rounded overflow-auto max-h-32">
                            {errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>
              
              <div className="grid gap-3">
                {canRetry && (
                  <Button 
                    onClick={this.handleRetry}
                    className="w-full"
                    variant="default"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again ({this.maxRetries - retryCount} attempts remaining)
                  </Button>
                )}
                
                {!canRetry && (
                  <Button 
                    onClick={this.handleReloadPage}
                    className="w-full"
                    variant="default"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reload Page
                  </Button>
                )}
                
                {!isExamCritical && (
                  <Button 
                    onClick={this.handleGoHome}
                    variant="outline"
                    className="w-full"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go to Home
                  </Button>
                )}
                
                <Button 
                  onClick={this.exportErrorDetails}
                  variant="outline"
                  className="w-full"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export Error Report
                </Button>
              </div>
              
              {isExamCritical && (
                <div className="text-center text-sm text-gray-600">
                  <p>If you continue to experience issues:</p>
                  <p>1. Contact your exam administrator immediately</p>
                  <p>2. Note the Error ID: <code className="bg-gray-100 px-1 rounded">{this.state.errorId}</code></p>
                  <p>3. Your exam progress has been saved automatically</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component wrapper for easy use
export function withErrorBoundary(Component, boundaryName = null) {
  return function WrappedComponent(props) {
    return (
      <ExamErrorBoundary boundaryName={boundaryName}>
        <Component {...props} />
      </ExamErrorBoundary>
    );
  };
}

// Hook for error boundary context
export function useErrorHandler() {
  const throwError = React.useCallback((error) => {
    throw error;
  }, []);
  
  return throwError;
}

export default ExamErrorBoundary;