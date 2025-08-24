"use client";

/**
 * Emergency Monitoring Service for Exam Portal
 * Provides comprehensive error tracking, performance monitoring, and real-time alerts
 * during the critical refactoring phase
 */

class MonitoringService {
  constructor() {
    this.isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
    this.sessionId = this.generateSessionId();
    this.criticalErrors = [];
    this.performanceMetrics = new Map();
    this.alertQueue = [];
    this.subscribers = new Set();
    this.isInitialized = false;
    
    // Feature flags for safe rollouts
    this.featureFlags = new Map();
    
    // Performance thresholds
    this.thresholds = {
      databaseQueryTime: 5000, // 5 seconds
      componentRenderTime: 1000, // 1 second
      memoryUsage: 100 * 1024 * 1024, // 100MB
      networkRequestTime: 10000, // 10 seconds
      timerDiscrepancy: 5000, // 5 seconds
    };
    
    // Initialize if in browser environment
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  init() {
    if (this.isInitialized) return;
    
    try {
      // Set up global error handlers
      this.setupGlobalErrorHandlers();
      
      // Initialize performance monitoring
      this.initializePerformanceMonitoring();
      
      // Start memory monitoring
      this.startMemoryMonitoring();
      
      // Initialize feature flags from localStorage
      this.loadFeatureFlags();
      
      // Set up periodic health checks
      this.startHealthChecks();
      
      this.isInitialized = true;
      
      this.log('INFO', 'MonitoringService initialized successfully', {
        sessionId: this.sessionId,
        isProduction: this.isProduction,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Failed to initialize MonitoringService:', error);
      // Even if initialization fails, we want to capture this error
      this.captureError(error, 'SYSTEM', 'MonitoringService initialization failed');
    }
  }

  setupGlobalErrorHandlers() {
    // Capture unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError(event.error || new Error(event.message), 'JAVASCRIPT', 'Unhandled JavaScript error', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        url: window.location.href
      });
    });

    // Capture unhandled Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(event.reason, 'PROMISE', 'Unhandled Promise rejection', {
        url: window.location.href
      });
    });

    // Capture React error boundaries (will be enhanced by component boundaries)
    window.addEventListener('react-error', (event) => {
      this.captureError(event.detail.error, 'REACT', 'React component error', {
        componentStack: event.detail.componentStack,
        errorBoundary: event.detail.errorBoundary
      });
    });
  }

  initializePerformanceMonitoring() {
    // Monitor navigation timing
    if ('performance' in window && 'getEntriesByType' in performance) {
      // Initial page load metrics
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          this.recordPerformanceMetric('page_load', {
            loadTime: navigation.loadEventEnd - navigation.loadEventStart,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            firstContentfulPaint: this.getFirstContentfulPaint(),
            timestamp: Date.now()
          });
        }
      }, 1000);

      // Set up performance observer for future metrics
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'measure') {
              this.recordPerformanceMetric('custom_measure', {
                name: entry.name,
                duration: entry.duration,
                startTime: entry.startTime,
                timestamp: Date.now()
              });
              
              // Check against thresholds
              this.checkPerformanceThreshold(entry.name, entry.duration);
            }
          }
        });
        
        observer.observe({ entryTypes: ['measure', 'navigation'] });
      } catch (error) {
        console.warn('PerformanceObserver not supported:', error);
      }
    }
  }

  startMemoryMonitoring() {
    if ('memory' in performance) {
      setInterval(() => {
        const memoryInfo = performance.memory;
        const memoryUsage = {
          used: memoryInfo.usedJSHeapSize,
          total: memoryInfo.totalJSHeapSize,
          limit: memoryInfo.jsHeapSizeLimit,
          timestamp: Date.now()
        };
        
        this.recordPerformanceMetric('memory_usage', memoryUsage);
        
        // Check for memory leaks or excessive usage
        if (memoryInfo.usedJSHeapSize > this.thresholds.memoryUsage) {
          this.alert('HIGH_MEMORY_USAGE', `Memory usage exceeded threshold: ${Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024)}MB`, {
            memoryUsage,
            threshold: this.thresholds.memoryUsage
          });
        }
      }, 10000); // Check every 10 seconds
    }
  }

  loadFeatureFlags() {
    try {
      const storedFlags = localStorage.getItem('monitoring_feature_flags');
      if (storedFlags) {
        const flags = JSON.parse(storedFlags);
        Object.entries(flags).forEach(([key, value]) => {
          this.featureFlags.set(key, value);
        });
      }
      
      // Set default flags if none exist
      this.setDefaultFeatureFlags();
    } catch (error) {
      console.warn('Failed to load feature flags:', error);
      this.setDefaultFeatureFlags();
    }
  }

  setDefaultFeatureFlags() {
    const defaults = {
      'enhanced_database_monitoring': false,
      'component_performance_tracking': true,
      'timer_validation_strict': false,
      'network_request_logging': true,
      'memory_leak_detection': true,
      'exam_operation_tracking': true,
      'auto_error_recovery': false
    };
    
    Object.entries(defaults).forEach(([key, value]) => {
      if (!this.featureFlags.has(key)) {
        this.featureFlags.set(key, value);
      }
    });
    
    this.saveFeatureFlags();
  }

  saveFeatureFlags() {
    try {
      const flags = Object.fromEntries(this.featureFlags);
      localStorage.setItem('monitoring_feature_flags', JSON.stringify(flags));
    } catch (error) {
      console.warn('Failed to save feature flags:', error);
    }
  }

  startHealthChecks() {
    setInterval(() => {
      this.performHealthCheck();
    }, 30000); // Every 30 seconds
  }

  performHealthCheck() {
    const healthMetrics = {
      timestamp: Date.now(),
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      online: navigator.onLine,
      memoryUsage: performance.memory ? {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize
      } : null,
      performanceEntries: performance.getEntriesByType ? performance.getEntriesByType('navigation').length : 0,
      criticalErrorsCount: this.criticalErrors.length,
      alertsCount: this.alertQueue.length
    };
    
    this.recordPerformanceMetric('health_check', healthMetrics);
    
    // Notify subscribers
    this.notifySubscribers('health_check', healthMetrics);
  }

  // Core monitoring methods
  captureError(error, category = 'UNKNOWN', message = '', context = {}) {
    const errorData = {
      id: this.generateId('error'),
      timestamp: Date.now(),
      sessionId: this.sessionId,
      category,
      message,
      error: {
        name: error.name || 'Unknown',
        message: error.message || message,
        stack: error.stack || '',
        cause: error.cause || null
      },
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        ...context
      },
      severity: this.determineSeverity(category, error)
    };
    
    // Store critical errors
    if (errorData.severity === 'CRITICAL') {
      this.criticalErrors.push(errorData);
      // Limit stored critical errors to prevent memory issues
      if (this.criticalErrors.length > 100) {
        this.criticalErrors.shift();
      }
    }
    
    // Log to console in development
    if (!this.isProduction) {
      console.error(`[MONITORING] ${category}:`, errorData);
    }
    
    // Send alert for critical errors
    if (errorData.severity === 'CRITICAL') {
      this.alert('CRITICAL_ERROR', `Critical error in ${category}: ${message}`, errorData);
    }
    
    // Notify subscribers
    this.notifySubscribers('error', errorData);
    
    // Attempt to send to server if in production
    if (this.isProduction) {
      this.sendToServer('error', errorData);
    }
    
    return errorData.id;
  }

  recordPerformanceMetric(metricName, data) {
    const metricData = {
      id: this.generateId('metric'),
      name: metricName,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      data: {
        ...data,
        url: window.location.href
      }
    };
    
    // Store in memory (with size limit)
    if (!this.performanceMetrics.has(metricName)) {
      this.performanceMetrics.set(metricName, []);
    }
    
    const metrics = this.performanceMetrics.get(metricName);
    metrics.push(metricData);
    
    // Limit stored metrics to prevent memory issues
    if (metrics.length > 1000) {
      metrics.shift();
    }
    
    // Notify subscribers
    this.notifySubscribers('metric', metricData);
    
    return metricData.id;
  }

  alert(type, message, data = {}) {
    const alertData = {
      id: this.generateId('alert'),
      type,
      message,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      data,
      acknowledged: false
    };
    
    this.alertQueue.push(alertData);
    
    // Limit alert queue size
    if (this.alertQueue.length > 500) {
      this.alertQueue.shift();
    }
    
    // Show browser notification for critical alerts
    if (type === 'CRITICAL_ERROR' || type === 'EXAM_FAILURE') {
      this.showBrowserNotification(message);
    }
    
    // Log to console
    console.warn(`[ALERT] ${type}: ${message}`, data);
    
    // Notify subscribers
    this.notifySubscribers('alert', alertData);
    
    return alertData.id;
  }

  // Exam-specific monitoring methods
  trackExamOperation(operation, data = {}) {
    if (!this.getFeatureFlag('exam_operation_tracking')) return;
    
    const operationData = {
      operation,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      ...data
    };
    
    this.recordPerformanceMetric('exam_operation', operationData);
    
    this.log('INFO', `Exam operation: ${operation}`, operationData);
  }

  trackDatabaseQuery(queryType, duration, details = {}) {
    if (!this.getFeatureFlag('enhanced_database_monitoring')) return;
    
    const queryData = {
      queryType,
      duration,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      ...details
    };
    
    this.recordPerformanceMetric('database_query', queryData);
    
    // Check for slow queries
    if (duration > this.thresholds.databaseQueryTime) {
      this.alert('SLOW_DATABASE_QUERY', `Database query took ${duration}ms`, queryData);
    }
    
    // Detect potential N+1 queries
    this.detectN1Queries(queryType, queryData);
  }

  trackComponentRender(componentName, duration, props = {}) {
    if (!this.getFeatureFlag('component_performance_tracking')) return;
    
    const renderData = {
      component: componentName,
      duration,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      propsCount: Object.keys(props).length
    };
    
    this.recordPerformanceMetric('component_render', renderData);
    
    if (duration > this.thresholds.componentRenderTime) {
      this.alert('SLOW_COMPONENT_RENDER', `Component ${componentName} took ${duration}ms to render`, renderData);
    }
  }

  trackTimerDiscrepancy(expectedTime, actualTime, context = {}) {
    const discrepancy = Math.abs(expectedTime - actualTime);
    
    const timerData = {
      expectedTime,
      actualTime,
      discrepancy,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      ...context
    };
    
    this.recordPerformanceMetric('timer_discrepancy', timerData);
    
    if (discrepancy > this.thresholds.timerDiscrepancy) {
      this.alert('TIMER_DISCREPANCY', `Timer discrepancy of ${discrepancy}ms detected`, timerData);
    }
  }

  trackNetworkRequest(url, method, duration, status, error = null) {
    if (!this.getFeatureFlag('network_request_logging')) return;
    
    const networkData = {
      url,
      method,
      duration,
      status,
      error: error ? error.message : null,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };
    
    this.recordPerformanceMetric('network_request', networkData);
    
    if (error) {
      this.captureError(error, 'NETWORK', `Network request failed: ${method} ${url}`, networkData);
    } else if (duration > this.thresholds.networkRequestTime) {
      this.alert('SLOW_NETWORK_REQUEST', `Network request took ${duration}ms`, networkData);
    }
  }

  // Feature flag methods
  getFeatureFlag(flagName) {
    return this.featureFlags.get(flagName) || false;
  }

  setFeatureFlag(flagName, value) {
    this.featureFlags.set(flagName, value);
    this.saveFeatureFlags();
    this.log('INFO', `Feature flag updated: ${flagName} = ${value}`);
  }

  // Subscription methods
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers(eventType, data) {
    this.subscribers.forEach(callback => {
      try {
        callback(eventType, data);
      } catch (error) {
        console.error('Subscriber callback error:', error);
      }
    });
  }

  // Utility methods
  generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  determineSeverity(category, error) {
    // Exam-related errors are always critical
    if (category === 'EXAM' || category === 'TIMER' || category === 'DATABASE') {
      return 'CRITICAL';
    }
    
    // React errors during exam are critical
    if (category === 'REACT' && window.location.pathname.includes('/exam')) {
      return 'CRITICAL';
    }
    
    // Network errors during exam submission are critical
    if (category === 'NETWORK' && error.message && error.message.includes('submit')) {
      return 'CRITICAL';
    }
    
    return 'HIGH';
  }

  checkPerformanceThreshold(metricName, duration) {
    const thresholdMap = {
      'database-query': this.thresholds.databaseQueryTime,
      'component-render': this.thresholds.componentRenderTime,
      'network-request': this.thresholds.networkRequestTime,
      'timer-validation': this.thresholds.timerDiscrepancy
    };
    
    const threshold = thresholdMap[metricName];
    if (threshold && duration > threshold) {
      this.alert('PERFORMANCE_THRESHOLD_EXCEEDED', `${metricName} exceeded threshold: ${duration}ms > ${threshold}ms`, {
        metric: metricName,
        actual: duration,
        threshold
      });
    }
  }

  detectN1Queries(queryType, queryData) {
    // Simple N+1 detection based on rapid repeated queries
    const recentQueries = this.performanceMetrics.get('database_query') || [];
    const lastMinute = Date.now() - 60000;
    const recentSimilarQueries = recentQueries.filter(q => 
      q.timestamp > lastMinute && 
      q.data.queryType === queryType
    );
    
    if (recentSimilarQueries.length > 10) {
      this.alert('POTENTIAL_N1_QUERY', `Detected ${recentSimilarQueries.length} similar queries in the last minute`, {
        queryType,
        count: recentSimilarQueries.length,
        queries: recentSimilarQueries.slice(-5) // Last 5 for context
      });
    }
  }

  getFirstContentfulPaint() {
    try {
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      return fcpEntry ? fcpEntry.startTime : null;
    } catch {
      return null;
    }
  }

  showBrowserNotification(message) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Exam Portal Alert', {
        body: message,
        icon: '/favicon.ico'
      });
    } else if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Exam Portal Alert', {
            body: message,
            icon: '/favicon.ico'
          });
        }
      });
    }
  }

  sendToServer(eventType, data) {
    // Send monitoring data to server endpoint
    if (this.getFeatureFlag('server_logging_enabled')) {
      fetch('/api/monitoring/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType,
          data,
          timestamp: Date.now(),
          sessionId: this.sessionId
        })
      }).catch(error => {
        console.error('Failed to send monitoring data to server:', error);
      });
    }
  }

  log(level, message, data = {}) {
    const logData = {
      level,
      message,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      data
    };
    
    if (!this.isProduction || level === 'ERROR') {
      console[level.toLowerCase()](message, data);
    }
    
    this.notifySubscribers('log', logData);
  }

  // Export/reporting methods
  exportCriticalErrors() {
    return [...this.criticalErrors];
  }

  exportPerformanceMetrics() {
    const metrics = {};
    this.performanceMetrics.forEach((value, key) => {
      metrics[key] = [...value];
    });
    return metrics;
  }

  exportAlerts() {
    return [...this.alertQueue];
  }

  getSystemHealth() {
    return {
      timestamp: Date.now(),
      sessionId: this.sessionId,
      isHealthy: this.criticalErrors.length === 0 && this.alertQueue.filter(a => !a.acknowledged).length < 10,
      criticalErrorsCount: this.criticalErrors.length,
      unacknowledgedAlertsCount: this.alertQueue.filter(a => !a.acknowledged).length,
      memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : null,
      featureFlags: Object.fromEntries(this.featureFlags),
      uptime: Date.now() - (this.initTime || Date.now())
    };
  }

  reset() {
    this.criticalErrors = [];
    this.performanceMetrics.clear();
    this.alertQueue = [];
    this.sessionId = this.generateSessionId();
    this.log('INFO', 'MonitoringService reset completed');
  }
}

// Create singleton instance
const monitoringService = new MonitoringService();

// Export singleton
export default monitoringService;

// Named exports for specific functionality
export {
  MonitoringService,
  monitoringService as monitor
};