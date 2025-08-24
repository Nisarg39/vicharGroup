/**
 * EXAM INTERFACE PROGRESSIVE SCORING INTEGRATION
 * 
 * Seamlessly integrates progressive computation with the existing ExamInterface
 * without breaking React state management. Provides real-time score updates
 * and instant submissions while maintaining all existing functionality.
 * 
 * CRITICAL FEATURES:
 * ✅ Zero React state conflicts (uses refs and event listeners)
 * ✅ Non-blocking progressive computation
 * ✅ Real-time score display updates
 * ✅ Instant submission preparation
 * ✅ Automatic fallback to server computation
 * ✅ Maintains all existing ExamInterface features
 * ✅ Performance monitoring integration
 */

import { useRef, useEffect, useCallback, useMemo } from 'react';
import { ProgressiveComputation } from './ProgressiveComputationClient';
import { getSecureMarkingScheme, handleProgressiveSubmission } from '../../server_actions/actions/examController/progressiveSubmissionHandler';

/**
 * Custom hook for progressive scoring integration
 */
export function useProgressiveScoring(exam, questions, student) {
  // Use refs to avoid React state conflicts
  const progressiveClientRef = useRef(null);
  const isInitializedRef = useRef(false);
  const lastAnswersRef = useRef({});
  const initializationPromiseRef = useRef(null);
  
  // Performance and status tracking
  const metricsRef = useRef({
    initializationTime: 0,
    averageComputationTime: 0,
    totalComputations: 0,
    fallbackCount: 0,
    errorCount: 0,
    lastUpdate: null
  });
  
  const statusRef = useRef({
    isSupported: false,
    isInitialized: false,
    isActive: false,
    lastError: null,
    fallbackReason: null
  });

  /**
   * Initialize progressive scoring engine
   */
  const initializeProgressive = useCallback(async () => {
    // Prevent multiple initializations
    if (initializationPromiseRef.current) {
      return initializationPromiseRef.current;
    }

    initializationPromiseRef.current = (async () => {
      try {
        console.log('🎯 Initializing progressive scoring for exam:', exam._id);
        
        // Check if progressive computation is supported
        if (!ProgressiveComputation.isSupported()) {
          console.warn('⚠️ Progressive computation not supported on this browser');
          statusRef.current = {
            ...statusRef.current,
            isSupported: false,
            fallbackReason: 'browser_not_supported'
          };
          return { success: false, reason: 'not_supported' };
        }

        statusRef.current.isSupported = true;
        
        // Get progressive computation client
        progressiveClientRef.current = ProgressiveComputation.getClient();
        
        // Fetch secure marking scheme from server
        const markingSchemeResponse = await getSecureMarkingScheme(exam._id, student._id);
        if (!markingSchemeResponse.success) {
          console.warn('⚠️ Failed to get marking scheme:', markingSchemeResponse.message);
          statusRef.current.fallbackReason = 'marking_scheme_failed';
          return { success: false, reason: 'marking_scheme_failed' };
        }

        // Prepare exam data for progressive engine
        const examData = {
          exam: exam,
          student: student,
          questions: questions,
          markingScheme: markingSchemeResponse.markingScheme
        };

        // Initialize progressive computation engine
        const initResult = await progressiveClientRef.current.initializeEngine(examData);
        
        if (initResult.success) {
          isInitializedRef.current = true;
          statusRef.current.isInitialized = true;
          statusRef.current.isActive = true;
          metricsRef.current.initializationTime = initResult.initializationTime;
          
          console.log(`✅ Progressive scoring initialized in ${initResult.initializationTime.toFixed(2)}ms`);
          console.log(`📊 Engine ready with ${initResult.questionsLoaded} questions`);
          
          // Set up real-time score update listener
          progressiveClientRef.current.addEventListener('scoreUpdate', handleRealTimeScoreUpdate);
          progressiveClientRef.current.addEventListener('error', handleProgressiveError);
          
          return { success: true, ...initResult };
        } else {
          console.warn('⚠️ Progressive engine initialization failed:', initResult.error);
          statusRef.current.fallbackReason = 'engine_initialization_failed';
          statusRef.current.lastError = initResult.error;
          return { success: false, reason: 'initialization_failed', error: initResult.error };
        }
        
      } catch (error) {
        console.error('❌ Progressive scoring initialization error:', error);
        statusRef.current.lastError = error.message;
        statusRef.current.fallbackReason = 'initialization_exception';
        metricsRef.current.errorCount++;
        
        return { success: false, reason: 'exception', error: error.message };
      }
    })();

    return initializationPromiseRef.current;
  }, [exam._id, student._id, questions]);

  /**
   * Update answers in progressive engine (non-blocking)
   */
  const updateProgressiveAnswers = useCallback(async (answers) => {
    // Skip if not initialized or answers haven't changed
    if (!isInitializedRef.current || !progressiveClientRef.current) {
      return;
    }

    // Check if answers actually changed (avoid unnecessary computations)
    const answersChanged = !answersEqual(answers, lastAnswersRef.current);
    if (!answersChanged) {
      return;
    }

    lastAnswersRef.current = { ...answers };
    
    try {
      // Non-blocking update to progressive engine
      const updateResult = await progressiveClientRef.current.updateAnswers(answers);
      
      if (updateResult.success) {
        metricsRef.current.totalComputations++;
        metricsRef.current.lastUpdate = new Date();
        
        // Real-time updates are handled by event listeners
        console.log('📝 Progressive computation updated successfully');
      } else {
        console.warn('⚠️ Progressive update failed:', updateResult.error);
        metricsRef.current.fallbackCount++;
      }
      
    } catch (error) {
      console.error('❌ Progressive update error:', error);
      metricsRef.current.errorCount++;
    }
  }, []);

  /**
   * Get pre-computed results for instant submission (enhanced for direct storage)
   */
  const getProgressiveResults = useCallback(async () => {
    if (!isInitializedRef.current || !progressiveClientRef.current) {
      console.log('🔄 Progressive engine not available - using server computation');
      return { success: false, fallbackToServer: true, reason: 'not_initialized' };
    }

    try {
      console.log('🏁 Retrieving complete ExamResult data for direct storage submission');
      
      // Get progressive results with complete analysis
      const resultsResponse = await progressiveClientRef.current.getProgressiveResults(true);
      
      if (resultsResponse.success && resultsResponse.results) {
        console.log('✅ Complete ExamResult data retrieved successfully');
        console.log(`📊 Final Score: ${resultsResponse.results.finalScore}/${resultsResponse.results.totalMarks}`);
        console.log(`🎯 Completion Rate: ${resultsResponse.results.completionPercentage?.toFixed(1)}%`);
        
        return {
          success: true,
          results: resultsResponse.results,
          isPreComputed: true,
          computationSource: 'progressive_engine_enhanced',
          metrics: resultsResponse.performanceStats,
          directStorageReady: true,
          dataStructure: 'complete_exam_result'
        };
      } else {
        console.warn('⚠️ Complete ExamResult data not available:', resultsResponse.error);
        metricsRef.current.fallbackCount++;
        return { 
          success: false, 
          fallbackToServer: true, 
          reason: resultsResponse.error || 'complete_results_not_available' 
        };
      }
      
    } catch (error) {
      console.error('❌ Error retrieving complete ExamResult data:', error);
      metricsRef.current.errorCount++;
      return { 
        success: false, 
        fallbackToServer: true, 
        error: error.message 
      };
    }
  }, []);

  /**
   * Enhanced submission function with progressive computation
   */
  const submitWithProgressive = useCallback(async (examData) => {
    const startTime = Date.now();
    
    try {
      console.log('🚀 Starting progressive submission process');
      
      // Try to get pre-computed results first
      const progressiveResults = await getProgressiveResults();
      
      if (progressiveResults.success && progressiveResults.isPreComputed) {
        // INSTANT SUBMISSION PATH: Use pre-computed results
        console.log('⚡ Using pre-computed results for instant submission');
        
        const enhancedExamData = {
          ...examData,
          ...progressiveResults.results,
          isPreComputed: true,
          computationSource: 'progressive_engine',
          clientMetrics: metricsRef.current
        };
        
        // Submit with progressive validation
        const submissionResult = await handleProgressiveSubmission(enhancedExamData);
        
        const totalTime = Date.now() - startTime;
        console.log(`✅ Progressive submission completed in ${totalTime}ms`);
        
        return {
          ...submissionResult,
          totalSubmissionTime: totalTime,
          usedProgressiveEngine: true
        };
        
      } else {
        // FALLBACK PATH: Use traditional server computation
        console.log('🔄 Falling back to server-side computation');
        console.log('📝 Fallback reason:', progressiveResults.reason);
        
        // Use the original onComplete function or server action
        const serverResult = await handleProgressiveSubmission({
          ...examData,
          isPreComputed: false,
          computationSource: 'server_fallback',
          fallbackReason: progressiveResults.reason,
          clientMetrics: metricsRef.current
        });
        
        const totalTime = Date.now() - startTime;
        console.log(`✅ Server computation completed in ${totalTime}ms`);
        
        return {
          ...serverResult,
          totalSubmissionTime: totalTime,
          usedProgressiveEngine: false,
          fallbackReason: progressiveResults.reason
        };
      }
      
    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.error('❌ Submission error:', error);
      
      metricsRef.current.errorCount++;
      
      return {
        success: false,
        message: "There was an error submitting your exam. Please try again or contact support.",
        error: error.message,
        totalSubmissionTime: totalTime,
        usedProgressiveEngine: false,
        fallbackReason: 'submission_exception'
      };
    }
  }, [getProgressiveResults]);

  /**
   * Cleanup function
   */
  const cleanupProgressive = useCallback(async () => {
    if (progressiveClientRef.current) {
      try {
        // Remove event listeners
        progressiveClientRef.current.removeEventListener('scoreUpdate', handleRealTimeScoreUpdate);
        progressiveClientRef.current.removeEventListener('error', handleProgressiveError);
        
        // Clear engine data
        await progressiveClientRef.current.clearEngine();
        
        console.log('🧹 Progressive scoring cleaned up');
      } catch (error) {
        console.error('❌ Cleanup error:', error);
      }
    }
    
    // Reset refs
    progressiveClientRef.current = null;
    isInitializedRef.current = false;
    initializationPromiseRef.current = null;
    lastAnswersRef.current = {};
    
    statusRef.current = {
      isSupported: false,
      isInitialized: false,
      isActive: false,
      lastError: null,
      fallbackReason: null
    };
  }, []);

  /**
   * Get current status and metrics
   */
  const getProgressiveStatus = useCallback(() => {
    return {
      status: statusRef.current,
      metrics: metricsRef.current,
      isInitialized: isInitializedRef.current,
      hasClient: !!progressiveClientRef.current
    };
  }, []);

  /**
   * Event handlers for real-time updates
   */
  const handleRealTimeScoreUpdate = useCallback((scoreData) => {
    // This can trigger non-React state updates or emit custom events
    // Avoid updating React state directly to prevent conflicts
    
    console.log('📊 Real-time score update:', scoreData);
    
    // Emit custom event for components that want to listen
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('progressiveScoreUpdate', {
        detail: scoreData
      }));
    }
    
    // Store in ref for access without triggering re-renders
    metricsRef.current.lastScoreUpdate = scoreData;
    metricsRef.current.lastUpdate = new Date();
  }, []);
  
  const handleProgressiveError = useCallback((errorData) => {
    console.error('🚨 Progressive computation error:', errorData);
    
    statusRef.current.lastError = errorData.error;
    statusRef.current.isActive = false;
    metricsRef.current.errorCount++;
    
    // Emit error event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('progressiveError', {
        detail: errorData
      }));
    }
  }, []);

  // Memoized return object to prevent unnecessary re-renders
  return useMemo(() => ({
    // Core functions
    initializeProgressive,
    updateProgressiveAnswers,
    getProgressiveResults,
    submitWithProgressive,
    cleanupProgressive,
    
    // Status and metrics
    getProgressiveStatus,
    
    // Utility functions
    isSupported: ProgressiveComputation.isSupported(),
    isInitialized: () => isInitializedRef.current,
    isActive: () => statusRef.current.isActive,
    
    // Event handlers (for manual integration)
    handleRealTimeScoreUpdate,
    handleProgressiveError
  }), [
    initializeProgressive,
    updateProgressiveAnswers,
    getProgressiveResults,
    submitWithProgressive,
    cleanupProgressive,
    getProgressiveStatus,
    handleRealTimeScoreUpdate,
    handleProgressiveError
  ]);
}

/**
 * React component wrapper for real-time score display
 */
export function ProgressiveScoreDisplay({ 
  enabled = true, 
  showMetrics = false, 
  className = "",
  onScoreUpdate = null 
}) {
  const scoreRef = useRef(null);
  const metricsRef = useRef(null);
  
  useEffect(() => {
    if (!enabled) return;
    
    const handleScoreUpdate = (event) => {
      const scoreData = event.detail;
      
      if (scoreRef.current) {
        // Update display without triggering React re-render
        scoreRef.current.textContent = `${scoreData.score}/${scoreData.totalMarks} (${scoreData.percentage}%)`;
      }
      
      if (metricsRef.current && showMetrics) {
        metricsRef.current.textContent = `Updated: ${new Date(scoreData.lastUpdated).toLocaleTimeString()}`;
      }
      
      // Call optional callback
      if (onScoreUpdate) {
        onScoreUpdate(scoreData);
      }
    };
    
    // Listen for progressive score updates
    window.addEventListener('progressiveScoreUpdate', handleScoreUpdate);
    
    return () => {
      window.removeEventListener('progressiveScoreUpdate', handleScoreUpdate);
    };
  }, [enabled, showMetrics, onScoreUpdate]);
  
  if (!enabled) return null;
  
  return (
    <div className={`progressive-score-display ${className}`}>
      <div className="score-text">
        Live Score: <span ref={scoreRef} className="score-value">Computing...</span>
      </div>
      {showMetrics && (
        <div className="metrics-text text-sm text-gray-500">
          <span ref={metricsRef}>Waiting for updates...</span>
        </div>
      )}
    </div>
  );
}

/**
 * Integration wrapper component for existing ExamInterface
 */
export function withProgressiveScoring(ExamInterfaceComponent) {
  return function ProgressiveExamInterface(props) {
    const progressive = useProgressiveScoring(props.exam, props.questions, props.student);
    
    // Initialize progressive scoring when component mounts
    useEffect(() => {
      if (progressive.isSupported) {
        console.log('🔧 Starting progressive scoring initialization...');
        
        progressive.initializeProgressive().then(result => {
          if (result.success) {
            console.log('✅ Progressive scoring ready for exam interface');
          } else {
            console.log('⚠️ Progressive scoring initialization failed, using server-only mode');
          }
        });
      }
      
      // Cleanup on unmount
      return () => {
        progressive.cleanupProgressive();
      };
    }, [progressive]);
    
    // Update progressive computation when answers change
    useEffect(() => {
      if (props.answers && progressive.isInitialized()) {
        progressive.updateProgressiveAnswers(props.answers);
      }
    }, [props.answers, progressive]);
    
    // Enhanced onComplete function with progressive submission
    const enhancedOnComplete = useCallback(async (examData) => {
      console.log('🎯 Enhanced submission starting with progressive computation');
      
      const result = await progressive.submitWithProgressive(examData);
      
      // Call original onComplete if provided
      if (props.onComplete) {
        props.onComplete(result);
      }
      
      return result;
    }, [props.onComplete, progressive]);
    
    // Pass through all original props with enhanced onComplete
    return (
      <ExamInterfaceComponent
        {...props}
        onComplete={enhancedOnComplete}
        progressiveScoring={progressive}
      />
    );
  };
}

// Utility functions

/**
 * Deep comparison of answers objects
 */
function answersEqual(answers1, answers2) {
  const keys1 = Object.keys(answers1);
  const keys2 = Object.keys(answers2);
  
  if (keys1.length !== keys2.length) {
    return false;
  }
  
  for (const key of keys1) {
    const val1 = answers1[key];
    const val2 = answers2[key];
    
    // Handle array answers (for MCMA)
    if (Array.isArray(val1) && Array.isArray(val2)) {
      if (val1.length !== val2.length) {
        return false;
      }
      
      for (let i = 0; i < val1.length; i++) {
        if (val1[i] !== val2[i]) {
          return false;
        }
      }
    } else if (val1 !== val2) {
      return false;
    }
  }
  
  return true;
}

export default useProgressiveScoring;