"use client";

import React, { useEffect, useRef } from 'react';
import ExamErrorBoundary from './ExamErrorBoundary';
import MonitoringDashboard from './MonitoringDashboard';
import monitoringService from '../../lib/monitoring/MonitoringService';
import examLogger from '../../lib/monitoring/ExamLogger';
import timerMonitor from '../../lib/monitoring/TimerMonitor';
import featureFlags from '../../lib/monitoring/FeatureFlags';
import databaseMonitor from '../../lib/monitoring/DatabaseMonitor';

/**
 * Exam Monitoring Provider
 * Integrates all monitoring services with the exam interface
 * Provides comprehensive safety monitoring during refactoring
 */

const ExamMonitoringProvider = ({ 
  children, 
  exam, 
  student, 
  isExamMode = false,
  showMonitoringDashboard = false 
}) => {
  const monitoringInitialized = useRef(false);
  const timerId = useRef(null);

  useEffect(() => {
    if (!monitoringInitialized.current) {
      initializeMonitoring();
      monitoringInitialized.current = true;
    }

    return () => {
      cleanupMonitoring();
    };
  }, []);

  useEffect(() => {
    // Initialize exam-specific monitoring when exam starts
    if (exam && student && isExamMode) {
      initializeExamMonitoring(exam, student);
    }

    return () => {
      if (isExamMode) {
        cleanupExamMonitoring();
      }
    };
  }, [exam, student, isExamMode]);

  const initializeMonitoring = () => {
    try {
      // Initialize core monitoring services
      monitoringService.init();
      featureFlags.init();
      
      // Initialize database monitoring if enabled
      if (featureFlags.getFlag('enhanced_database_monitoring')) {
        databaseMonitor.init();
      }
      
      // Set up global error handlers
      setupGlobalMonitoring();
      
      console.log('[EXAM_MONITORING] Monitoring system initialized');
      
    } catch (error) {
      console.error('Failed to initialize monitoring:', error);
      // Don't let monitoring failure break the exam
    }
  };

  const initializeExamMonitoring = (examData, studentData) => {
    try {
      // Start exam logging session
      const sessionId = examLogger.startExamSession(
        examData._id, 
        studentData._id, 
        {
          examName: examData.examName,
          examDurationMinutes: examData.examDurationMinutes,
          totalQuestions: examData.examQuestions?.length || 0,
          examAvailability: examData.examAvailability,
          stream: examData.stream
        }
      );
      
      // Register exam timer
      if (examData.examDurationMinutes) {
        timerId.current = timerMonitor.registerTimer(
          `exam_${examData._id}`,
          examData._id,
          studentData._id,
          examData.examDurationMinutes * 60 * 1000, // Convert to milliseconds
          examData.examDurationMinutes,
          'exam'
        );
      }
      
      // Track exam start
      monitoringService.trackExamOperation('exam_started', {
        examId: examData._id,
        studentId: studentData._id,
        sessionId,
        timerId: timerId.current
      });
      
      console.log('[EXAM_MONITORING] Exam monitoring initialized:', {
        sessionId,
        timerId: timerId.current
      });
      
    } catch (error) {
      console.error('Failed to initialize exam monitoring:', error);
      monitoringService.captureError(error, 'EXAM', 'Failed to initialize exam monitoring');
    }
  };

  const setupGlobalMonitoring = () => {
    // Monitor performance
    if ('performance' in window && 'getEntriesByType' in performance) {
      // Track navigation timing
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0];
          if (navigation) {
            monitoringService.recordPerformanceMetric('page_load_complete', {
              loadTime: navigation.loadEventEnd - navigation.loadEventStart,
              domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
              totalTime: navigation.loadEventEnd - navigation.fetchStart
            });
          }
        }, 1000);
      });
    }

    // Monitor memory usage if available
    if ('memory' in performance) {
      const checkMemory = () => {
        const memory = performance.memory;
        monitoringService.recordPerformanceMetric('memory_usage', {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        });
      };
      
      // Check memory every 30 seconds
      setInterval(checkMemory, 30000);
      checkMemory(); // Initial check
    }

    // Monitor network status
    const handleOnline = () => {
      monitoringService.log('INFO', 'Network connection restored');
      examLogger.log('network_status_change', { online: true });
    };

    const handleOffline = () => {
      monitoringService.alert('NETWORK_OFFLINE', 'Network connection lost');
      examLogger.logNetworkError('connection_lost', new Error('Network offline'), {
        context: 'network_status_change'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Monitor page visibility for exam integrity
    const handleVisibilityChange = () => {
      if (isExamMode) {
        examLogger.log('visibility_change', {
          hidden: document.hidden,
          visibilityState: document.visibilityState
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
  };

  const cleanupMonitoring = () => {
    try {
      // Cleanup monitoring services
      if (monitoringService.cleanup) {
        monitoringService.cleanup();
      }
      
      if (featureFlags.cleanup) {
        featureFlags.cleanup();
      }
      
      if (databaseMonitor.cleanup) {
        databaseMonitor.cleanup();
      }
      
      if (timerMonitor.cleanup) {
        timerMonitor.cleanup();
      }
      
    } catch (error) {
      console.error('Error during monitoring cleanup:', error);
    }
  };

  const cleanupExamMonitoring = () => {
    try {
      // End exam logging session
      examLogger.endExamSession('monitoring_cleanup');
      
      // Stop exam timer
      if (timerId.current) {
        timerMonitor.stopTimer(timerId.current);
      }
      
      // Final exam metrics
      monitoringService.trackExamOperation('exam_monitoring_ended', {
        sessionDuration: examLogger.getSessionDuration(),
        totalOperations: examLogger.exportLogs().logs?.length || 0
      });
      
    } catch (error) {
      console.error('Error during exam monitoring cleanup:', error);
    }
  };

  // Enhanced component crash tracking
  const handleComponentError = (error, errorInfo) => {
    const errorId = monitoringService.captureError(
      error, 
      'REACT_COMPONENT', 
      'Component crashed in exam monitoring provider',
      {
        componentStack: errorInfo.componentStack,
        examMode: isExamMode,
        examId: exam?._id,
        studentId: student?._id
      }
    );
    
    // Log to exam logger if exam is active
    if (isExamMode && examLogger.isExamActive) {
      examLogger.logCritical('component_crash', {
        errorId,
        component: 'ExamMonitoringProvider',
        error: error.message,
        stack: error.stack?.substring(0, 500)
      });
    }
    
    return errorId;
  };

  // Performance monitoring hooks
  const trackRenderPerformance = (componentName, renderTime) => {
    if (featureFlags.getFlag('render_performance_tracking')) {
      monitoringService.trackComponentRender(componentName, renderTime);
    }
  };

  const trackNetworkRequest = (url, method, duration, status, error = null) => {
    monitoringService.trackNetworkRequest(url, method, duration, status, error);
    
    // Log exam-related network requests
    if (isExamMode && (url.includes('/exam') || url.includes('/submit'))) {
      examLogger.log('network_request', {
        url,
        method,
        duration,
        status,
        hasError: !!error,
        context: 'exam_operation'
      });
    }
  };

  const trackTimerUpdate = (timerId, currentTime, expectedTime) => {
    if (timerId && currentTime !== undefined && expectedTime !== undefined) {
      timerMonitor.updateTimer(timerId, currentTime);
    }
  };

  // Provide monitoring context to child components
  const monitoringContext = {
    // Core services
    monitoringService,
    examLogger,
    timerMonitor,
    featureFlags,
    databaseMonitor,
    
    // Helper functions
    trackRenderPerformance,
    trackNetworkRequest,
    trackTimerUpdate,
    handleComponentError,
    
    // State
    isExamMode,
    examId: exam?._id,
    studentId: student?._id,
    sessionId: examLogger.examSessionId,
    timerId: timerId.current
  };

  return (
    <ExamErrorBoundary 
      boundaryName="ExamMonitoringProvider"
      examContext={{
        examId: exam?._id,
        studentId: student?._id,
        isExamMode
      }}
    >
      <MonitoringContext.Provider value={monitoringContext}>
        {children}
        
        {/* Show monitoring dashboard if requested */}
        {showMonitoringDashboard && (
          <MonitoringDashboard
            isExamMode={isExamMode}
            onClose={() => {
              // Dashboard close handler
              console.log('[MONITORING] Dashboard closed');
            }}
          />
        )}
      </MonitoringContext.Provider>
    </ExamErrorBoundary>
  );
};

// Create context for monitoring services
const MonitoringContext = React.createContext(null);

// Hook to use monitoring context
export const useMonitoring = () => {
  const context = React.useContext(MonitoringContext);
  if (!context) {
    console.warn('useMonitoring must be used within ExamMonitoringProvider');
    return {
      // Fallback methods that do nothing
      trackRenderPerformance: () => {},
      trackNetworkRequest: () => {},
      trackTimerUpdate: () => {},
      handleComponentError: () => null,
      featureFlags: { getFlag: () => false },
      isExamMode: false
    };
  }
  return context;
};

// Higher-order component to add monitoring to any component
export const withMonitoring = (WrappedComponent, componentName) => {
  const MonitoredComponent = React.forwardRef((props, ref) => {
    const monitoring = useMonitoring();
    const renderStartTime = useRef(Date.now());
    
    useEffect(() => {
      // Track render performance
      const renderTime = Date.now() - renderStartTime.current;
      monitoring.trackRenderPerformance(componentName || WrappedComponent.name, renderTime);
    });
    
    return (
      <ExamErrorBoundary boundaryName={componentName || WrappedComponent.name}>
        <WrappedComponent ref={ref} {...props} monitoring={monitoring} />
      </ExamErrorBoundary>
    );
  });
  
  MonitoredComponent.displayName = `withMonitoring(${componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return MonitoredComponent;
};

export default ExamMonitoringProvider;