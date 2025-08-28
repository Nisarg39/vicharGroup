/**
 * Persistent Debug Logger for Exam Portal
 * Logs debug information to localStorage for later retrieval
 * Works even when tabs close or fullscreen mode is used
 */

class DebugLogger {
  constructor() {
    this.storageKey = 'exam_debug_logs';
    this.maxLogs = 1000; // Prevent localStorage overflow
    this.sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Log a debug message with timestamp and session info
   */
  log(level, message, data = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: data ? JSON.stringify(data, null, 2) : null,
      sessionId: this.sessionId,
      url: window.location.href
    };

    try {
      // Get existing logs
      const existingLogs = this.getLogs();
      
      // Add new log
      existingLogs.push(logEntry);
      
      // Keep only last maxLogs entries
      if (existingLogs.length > this.maxLogs) {
        existingLogs.splice(0, existingLogs.length - this.maxLogs);
      }
      
      // Store back to localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(existingLogs));
      
      // Also log to console if available
      console[level] && console[level](`[${level.toUpperCase()}] ${message}`, data || '');
      
    } catch (error) {
      // Fallback to console if localStorage fails
      console.error('Failed to persist debug log:', error);
      console[level] && console[level](`[${level.toUpperCase()}] ${message}`, data || '');
    }
  }

  /**
   * Convenience methods for different log levels
   */
  info(message, data) { this.log('info', message, data); }
  warn(message, data) { this.log('warn', message, data); }
  error(message, data) { this.log('error', message, data); }
  debug(message, data) { this.log('debug', message, data); }

  /**
   * Log exam-specific events with structured data
   */
  logExamEvent(event, data) {
    this.log('info', `EXAM_EVENT: ${event}`, {
      event,
      timestamp: Date.now(),
      ...data
    });
  }

  /**
   * Log submission process with detailed information
   */
  logSubmission(stage, data) {
    this.log('info', `SUBMISSION_${stage}`, {
      stage,
      timestamp: Date.now(),
      ...data
    });
  }

  /**
   * Retrieve all stored logs
   */
  getLogs() {
    try {
      const logs = localStorage.getItem(this.storageKey);
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Failed to retrieve debug logs:', error);
      return [];
    }
  }

  /**
   * Get logs filtered by session or time range
   */
  getFilteredLogs(options = {}) {
    const logs = this.getLogs();
    let filtered = logs;

    if (options.sessionId) {
      filtered = filtered.filter(log => log.sessionId === options.sessionId);
    }

    if (options.level) {
      filtered = filtered.filter(log => log.level === options.level);
    }

    if (options.since) {
      const sinceTime = new Date(options.since);
      filtered = filtered.filter(log => new Date(log.timestamp) >= sinceTime);
    }

    if (options.search) {
      const search = options.search.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(search) ||
        (log.data && log.data.toLowerCase().includes(search))
      );
    }

    return filtered;
  }

  /**
   * Export logs as downloadable file
   */
  exportLogs(filename = `exam_debug_logs_${Date.now()}.json`) {
    const logs = this.getLogs();
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = filename;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  /**
   * Clear all stored logs
   */
  clearLogs() {
    try {
      localStorage.removeItem(this.storageKey);
      console.log('Debug logs cleared');
    } catch (error) {
      console.error('Failed to clear debug logs:', error);
    }
  }

  /**
   * Get a formatted string of recent logs for easy viewing
   */
  getFormattedLogs(limit = 50) {
    const logs = this.getLogs().slice(-limit);
    return logs.map(log => {
      const time = new Date(log.timestamp).toLocaleString();
      const data = log.data ? `\n${log.data}` : '';
      return `[${time}] [${log.level.toUpperCase()}] ${log.message}${data}`;
    }).join('\n\n');
  }

  /**
   * Display logs in a modal for easy viewing
   */
  displayLogsModal() {
    const logs = this.getFormattedLogs();
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.8); z-index: 10000; padding: 20px;
      box-sizing: border-box; overflow: auto;
    `;
    
    modal.innerHTML = `
      <div style="background: white; padding: 20px; border-radius: 8px; max-width: 90%; margin: 0 auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2>Debug Logs</h2>
          <div>
            <button id="exportLogs" style="margin-right: 10px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Export</button>
            <button id="clearLogs" style="margin-right: 10px; padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">Clear</button>
            <button id="closeLogs" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
          </div>
        </div>
        <pre style="background: #f8f9fa; padding: 15px; border-radius: 4px; overflow: auto; max-height: 70vh; font-family: monospace; font-size: 12px;">${logs || 'No logs found'}</pre>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    modal.querySelector('#exportLogs').onclick = () => this.exportLogs();
    modal.querySelector('#clearLogs').onclick = () => {
      this.clearLogs();
      document.body.removeChild(modal);
    };
    modal.querySelector('#closeLogs').onclick = () => document.body.removeChild(modal);
    modal.onclick = (e) => e.target === modal && document.body.removeChild(modal);
  }
}

// Create singleton instance
const debugLogger = new DebugLogger();

// Global access for debugging
if (typeof window !== 'undefined') {
  window.debugLogger = debugLogger;
}

export default debugLogger;

/**
 * Usage Examples:
 * 
 * // Basic logging
 * debugLogger.info('Exam started', { examId: 123 });
 * debugLogger.error('Submission failed', { error: errorObject });
 * 
 * // Exam-specific events
 * debugLogger.logExamEvent('QUESTION_ANSWERED', { 
 *   questionId: 5, 
 *   answer: 'option_a', 
 *   timeSpent: 45000 
 * });
 * 
 * // Submission tracking
 * debugLogger.logSubmission('START', { answers, totalQuestions: 50 });
 * debugLogger.logSubmission('COMPLETE', { result: submissionResult });
 * 
 * // View logs after exam (in browser console)
 * debugLogger.displayLogsModal();
 * debugLogger.exportLogs();
 * 
 * // Or access directly
 * console.log(debugLogger.getFormattedLogs());
 */