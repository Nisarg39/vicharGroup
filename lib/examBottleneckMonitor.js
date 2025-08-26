/**
 * EMERGENCY BOTTLENECK MONITORING SYSTEM
 * 
 * Monitors and logs the performance impact of the "close exam immediately" 
 * feature during mass submission scenarios.
 * 
 * This helps track the effectiveness of the bottleneck fix and provides
 * data for optimization and rollback decisions.
 */

class ExamBottleneckMonitor {
    constructor() {
        this.metrics = {
            totalSubmissions: 0,
            immediateCloseSubmissions: 0,
            traditionalResultNavigations: 0,
            errorsDuringSubmission: 0,
            averageSubmissionTime: 0,
            peakConcurrentSubmissions: 0,
            databaseCallsSaved: 0
        };
        
        this.sessionId = `monitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.startTime = Date.now();
        
        // Track concurrent submissions
        this.activeSubmissions = new Set();
        
        console.log(`🔍 Exam Bottleneck Monitor initialized: ${this.sessionId}`);
    }
    
    /**
     * Log submission start
     */
    logSubmissionStart(studentId, examId, submissionType = 'manual_submit') {
        const submissionId = `${studentId}_${examId}_${Date.now()}`;
        
        this.activeSubmissions.add({
            submissionId,
            studentId,
            examId,
            submissionType,
            startTime: Date.now()
        });
        
        this.metrics.totalSubmissions++;
        this.metrics.peakConcurrentSubmissions = Math.max(
            this.metrics.peakConcurrentSubmissions,
            this.activeSubmissions.size
        );
        
        console.log(`📊 Submission started: ${submissionId} (${submissionType}), Concurrent: ${this.activeSubmissions.size}`);
        
        return submissionId;
    }
    
    /**
     * Log successful immediate exam close
     */
    logImmediateClose(submissionId, processingTime) {
        this.metrics.immediateCloseSubmissions++;
        this.metrics.databaseCallsSaved++; // Each immediate close saves at least 1 getAllExamAttempts call
        
        const submission = [...this.activeSubmissions].find(s => s.submissionId === submissionId);
        if (submission) {
            this.activeSubmissions.delete(submission);
            
            console.log(`🚀 IMMEDIATE CLOSE: ${submissionId} completed in ${processingTime}ms`);
            console.log(`💾 Database calls saved: ${this.metrics.databaseCallsSaved}`);
            console.log(`📈 Immediate close rate: ${((this.metrics.immediateCloseSubmissions / this.metrics.totalSubmissions) * 100).toFixed(1)}%`);
        }
    }
    
    /**
     * Log traditional result navigation (when feature is disabled)
     */
    logTraditionalNavigation(submissionId, processingTime) {
        this.metrics.traditionalResultNavigations++;
        
        const submission = [...this.activeSubmissions].find(s => s.submissionId === submissionId);
        if (submission) {
            this.activeSubmissions.delete(submission);
            
            console.log(`⚠️ TRADITIONAL NAVIGATION: ${submissionId} completed in ${processingTime}ms`);
            console.log(`📊 Traditional navigation rate: ${((this.metrics.traditionalResultNavigations / this.metrics.totalSubmissions) * 100).toFixed(1)}%`);
        }
    }
    
    /**
     * Log submission error
     */
    logSubmissionError(submissionId, error, closeExamAnyway = false) {
        this.metrics.errorsDuringSubmission++;
        
        const submission = [...this.activeSubmissions].find(s => s.submissionId === submissionId);
        if (submission) {
            this.activeSubmissions.delete(submission);
            
            console.error(`❌ SUBMISSION ERROR: ${submissionId}`, error);
            
            if (closeExamAnyway) {
                console.log(`🚨 Closing exam despite error to prevent bottleneck`);
                this.metrics.databaseCallsSaved++; // Still prevents DB bottleneck
            }
        }
    }
    
    /**
     * Get current performance metrics
     */
    getMetrics() {
        const runtime = Date.now() - this.startTime;
        
        return {
            ...this.metrics,
            sessionId: this.sessionId,
            sessionRuntime: runtime,
            activeSubmissions: this.activeSubmissions.size,
            bottleneckPreventionRate: this.metrics.totalSubmissions > 0 ? 
                ((this.metrics.immediateCloseSubmissions / this.metrics.totalSubmissions) * 100).toFixed(1) + '%' : '0%',
            estimatedDatabaseLoadReduction: `${this.metrics.databaseCallsSaved} calls saved`
        };
    }
    
    /**
     * Generate performance report
     */
    generateReport() {
        const metrics = this.getMetrics();
        
        const report = {
            summary: {
                totalSubmissions: metrics.totalSubmissions,
                bottleneckPreventionRate: metrics.bottleneckPreventionRate,
                databaseCallsSaved: metrics.databaseCallsSaved,
                peakConcurrentSubmissions: metrics.peakConcurrentSubmissions
            },
            performance: {
                immediateCloses: metrics.immediateCloseSubmissions,
                traditionalNavigations: metrics.traditionalResultNavigations,
                errors: metrics.errorsDuringSubmission,
                sessionRuntime: `${Math.round(metrics.sessionRuntime / 1000)}s`
            },
            impact: {
                bottleneckMitigation: metrics.databaseCallsSaved > 0 ? 'ACTIVE' : 'NONE',
                estimatedLoadReduction: `${((metrics.databaseCallsSaved / Math.max(metrics.totalSubmissions, 1)) * 100).toFixed(1)}% reduction in result page DB calls`,
                concurrencyHandling: metrics.peakConcurrentSubmissions > 10 ? 'HIGH LOAD DETECTED' : 'NORMAL LOAD'
            }
        };
        
        console.group(`📊 EXAM BOTTLENECK MONITOR REPORT - Session: ${metrics.sessionId}`);
        console.log('Summary:', report.summary);
        console.log('Performance:', report.performance);
        console.log('Impact:', report.impact);
        console.groupEnd();
        
        return report;
    }
    
    /**
     * Export metrics for external analysis
     */
    exportMetrics() {
        return {
            timestamp: new Date().toISOString(),
            ...this.getMetrics()
        };
    }
}

// Global monitor instance
let globalMonitor = null;

/**
 * Get or create the global monitor instance
 */
export function getExamBottleneckMonitor() {
    if (!globalMonitor) {
        globalMonitor = new ExamBottleneckMonitor();
    }
    return globalMonitor;
}

/**
 * Reset the global monitor (useful for testing)
 */
export function resetExamBottleneckMonitor() {
    globalMonitor = new ExamBottleneckMonitor();
    return globalMonitor;
}

/**
 * Quick logging functions
 */
export const logSubmissionStart = (studentId, examId, submissionType) => 
    getExamBottleneckMonitor().logSubmissionStart(studentId, examId, submissionType);

export const logImmediateClose = (submissionId, processingTime) => 
    getExamBottleneckMonitor().logImmediateClose(submissionId, processingTime);

export const logTraditionalNavigation = (submissionId, processingTime) => 
    getExamBottleneckMonitor().logTraditionalNavigation(submissionId, processingTime);

export const logSubmissionError = (submissionId, error, closeExamAnyway) => 
    getExamBottleneckMonitor().logSubmissionError(submissionId, error, closeExamAnyway);

export const getBottleneckMetrics = () => 
    getExamBottleneckMonitor().getMetrics();

export const generateBottleneckReport = () => 
    getExamBottleneckMonitor().generateReport();