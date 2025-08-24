"use server";

import monitoringService from './MonitoringService';
import featureFlags from './FeatureFlags';

/**
 * Database Query Performance Monitor with N+1 Detection
 * Monitors database operations, detects performance issues, and prevents N+1 query problems
 * Critical for maintaining exam portal performance during refactoring
 */

class DatabaseMonitor {
  constructor() {
    this.queryHistory = [];
    this.connectionPool = new Map();
    this.slowQueryThreshold = 5000; // 5 seconds
    this.n1QueryThreshold = 10; // 10 similar queries in a short time
    this.alertCooldown = new Map();
    this.isMonitoring = false;
    this.performanceMetrics = {
      totalQueries: 0,
      slowQueries: 0,
      failedQueries: 0,
      averageQueryTime: 0,
      n1QueriesDetected: 0
    };
  }

  // Initialize monitoring
  init() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.setupQueryInterception();
    
    // Start cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldQueries();
    }, 60000); // Every minute
    
    console.log('DatabaseMonitor initialized');
  }

  // Set up mongoose query interception
  setupQueryInterception() {
    // Note: This would require modification to the mongoose connection
    // For now, we'll provide methods that can be manually called
    console.log('Database query interception setup (manual integration required)');
  }

  // Track a database query
  trackQuery(operation, model, filter = {}, duration = 0, error = null, metadata = {}) {
    if (!featureFlags.getFlag('enhanced_database_monitoring')) {
      return;
    }

    const queryData = {
      id: this.generateQueryId(),
      timestamp: Date.now(),
      operation, // 'find', 'findOne', 'save', 'update', 'delete', etc.
      model, // Model name
      filter: this.sanitizeFilter(filter),
      duration,
      error: error ? {
        message: error.message,
        code: error.code,
        stack: error.stack ? error.stack.substring(0, 500) : null
      } : null,
      metadata: {
        ...metadata,
        stackTrace: this.captureRelevantStackTrace()
      }
    };

    // Add to history
    this.queryHistory.push(queryData);
    
    // Update performance metrics
    this.updatePerformanceMetrics(queryData);
    
    // Check for issues
    this.analyzeQuery(queryData);
    
    // Detect N+1 queries
    this.detectN1Queries(queryData);
    
    // Log to monitoring service
    monitoringService.trackDatabaseQuery(operation, duration, {
      model,
      hasError: !!error,
      queryId: queryData.id
    });
    
    return queryData.id;
  }

  // Update performance metrics
  updatePerformanceMetrics(queryData) {
    this.performanceMetrics.totalQueries++;
    
    if (queryData.error) {
      this.performanceMetrics.failedQueries++;
    }
    
    if (queryData.duration > this.slowQueryThreshold) {
      this.performanceMetrics.slowQueries++;
    }
    
    // Update average query time (rolling average)
    const totalTime = this.performanceMetrics.averageQueryTime * (this.performanceMetrics.totalQueries - 1);
    this.performanceMetrics.averageQueryTime = (totalTime + queryData.duration) / this.performanceMetrics.totalQueries;
  }

  // Analyze individual query for issues
  analyzeQuery(queryData) {
    const issues = [];
    
    // Check for slow query
    if (queryData.duration > this.slowQueryThreshold) {
      issues.push({
        type: 'SLOW_QUERY',
        severity: 'HIGH',
        message: `Query took ${queryData.duration}ms`,
        suggestions: this.getSlowQuerySuggestions(queryData)
      });
    }
    
    // Check for missing indexes (basic heuristics)
    if (this.likelyMissingIndex(queryData)) {
      issues.push({
        type: 'MISSING_INDEX',
        severity: 'MEDIUM',
        message: 'Query may benefit from an index',
        suggestions: this.getIndexingSuggestions(queryData)
      });
    }
    
    // Check for inefficient queries
    if (this.isInefficientQuery(queryData)) {
      issues.push({
        type: 'INEFFICIENT_QUERY',
        severity: 'MEDIUM',
        message: 'Query pattern may be inefficient',
        suggestions: this.getOptimizationSuggestions(queryData)
      });
    }
    
    // Send alerts for critical issues
    if (issues.length > 0) {
      this.sendQueryAlert(queryData, issues);
    }
  }

  // Detect N+1 query patterns
  detectN1Queries(newQuery) {
    // Look for similar queries in the recent past
    const recentTime = Date.now() - 30000; // Last 30 seconds
    const recentQueries = this.queryHistory.filter(q => q.timestamp > recentTime);
    
    // Group by similar query signatures
    const queryGroups = this.groupSimilarQueries(recentQueries);
    
    // Check for N+1 patterns
    Object.entries(queryGroups).forEach(([signature, queries]) => {
      if (queries.length > this.n1QueryThreshold) {
        this.handleN1QueryDetection(signature, queries);
      }
    });
  }

  // Group queries by similarity
  groupSimilarQueries(queries) {
    const groups = {};
    
    queries.forEach(query => {
      const signature = this.generateQuerySignature(query);
      if (!groups[signature]) {
        groups[signature] = [];
      }
      groups[signature].push(query);
    });
    
    return groups;
  }

  // Generate query signature for similarity matching
  generateQuerySignature(query) {
    // Create a signature based on operation, model, and filter structure
    const filterStructure = this.getFilterStructure(query.filter);
    return `${query.operation}:${query.model}:${filterStructure}`;
  }

  // Get filter structure (keys only, not values)
  getFilterStructure(filter) {
    if (!filter || typeof filter !== 'object') return '';
    return Object.keys(filter).sort().join(',');
  }

  // Handle N+1 query detection
  handleN1QueryDetection(signature, queries) {
    const cooldownKey = `n1_${signature}`;
    
    // Check cooldown to avoid spam alerts
    if (this.isInCooldown(cooldownKey)) {
      return;
    }
    
    this.performanceMetrics.n1QueriesDetected++;
    
    const alertData = {
      type: 'N1_QUERY_DETECTED',
      signature,
      queryCount: queries.length,
      timespan: queries[queries.length - 1].timestamp - queries[0].timestamp,
      sampleQueries: queries.slice(0, 3), // First 3 for analysis
      suggestions: this.getN1QuerySolutions(queries[0])
    };
    
    // Send alert
    monitoringService.alert('POTENTIAL_N1_QUERY', 
      `Detected ${queries.length} similar queries in ${Math.round(alertData.timespan / 1000)}s`, 
      alertData
    );
    
    // Set cooldown
    this.setCooldown(cooldownKey, 300000); // 5 minutes
    
    console.warn('[DB_MONITOR] N+1 Query Pattern Detected:', alertData);
  }

  // Check if query likely needs an index
  likelyMissingIndex(queryData) {
    // Simple heuristics for missing indexes
    if (queryData.duration < 1000) return false; // Fast queries likely have indexes
    
    const { operation, filter } = queryData;
    
    // Queries that scan entire collections without indexes
    if (operation === 'find' && this.hasComplexFilter(filter)) {
      return true;
    }
    
    // Sorting without indexes
    if (queryData.metadata?.sort && !this.hasIndexForSort(queryData.metadata.sort)) {
      return true;
    }
    
    return false;
  }

  // Check if query has complex filter
  hasComplexFilter(filter) {
    if (!filter || typeof filter !== 'object') return false;
    
    // Check for regex, range queries, or multiple fields
    const keys = Object.keys(filter);
    if (keys.length > 2) return true;
    
    return keys.some(key => {
      const value = filter[key];
      return (
        (typeof value === 'object' && value !== null && !Array.isArray(value)) ||
        (typeof value === 'string' && value.includes('*'))
      );
    });
  }

  // Check if query is inefficient
  isInefficientQuery(queryData) {
    const { operation, duration, metadata = {} } = queryData;
    
    // Very slow queries are likely inefficient
    if (duration > 10000) return true;
    
    // Large limit without proper filtering
    if (operation === 'find' && metadata.limit > 1000 && !metadata.filter) {
      return true;
    }
    
    // Queries with very large result sets
    if (metadata.resultCount > 10000) {
      return true;
    }
    
    return false;
  }

  // Generate suggestions for slow queries
  getSlowQuerySuggestions(queryData) {
    const suggestions = [];
    
    if (this.likelyMissingIndex(queryData)) {
      suggestions.push('Consider adding an index for the queried fields');
      suggestions.push(`Potential index: db.${queryData.model}.createIndex(${JSON.stringify(queryData.filter)})`);
    }
    
    if (queryData.metadata?.limit > 100) {
      suggestions.push('Consider pagination for large result sets');
    }
    
    if (this.hasComplexFilter(queryData.filter)) {
      suggestions.push('Consider simplifying the query or splitting it into multiple queries');
    }
    
    return suggestions;
  }

  // Generate suggestions for N+1 queries
  getN1QuerySolutions(sampleQuery) {
    const suggestions = [];
    
    suggestions.push('Use populate() or aggregation to fetch related data in a single query');
    suggestions.push('Consider caching frequently accessed data');
    suggestions.push('Batch similar queries together');
    
    if (sampleQuery.operation === 'findOne') {
      suggestions.push('Use find() with $in operator to fetch multiple records at once');
    }
    
    return suggestions;
  }

  // Generate indexing suggestions
  getIndexingSuggestions(queryData) {
    const suggestions = [];
    const { model, filter, metadata = {} } = queryData;
    
    if (filter && typeof filter === 'object') {
      const keys = Object.keys(filter);
      if (keys.length > 0) {
        suggestions.push(`Consider creating an index on ${model}: ${keys.join(', ')}`);
      }
    }
    
    if (metadata.sort) {
      suggestions.push(`Consider creating a compound index for sorting: ${JSON.stringify(metadata.sort)}`);
    }
    
    return suggestions;
  }

  // Generate optimization suggestions
  getOptimizationSuggestions(queryData) {
    const suggestions = [];
    
    suggestions.push('Review query structure and filter criteria');
    suggestions.push('Consider using lean() for read-only operations');
    suggestions.push('Implement proper pagination');
    suggestions.push('Use projection to limit returned fields');
    
    return suggestions;
  }

  // Cooldown management
  isInCooldown(key) {
    const cooldownEnd = this.alertCooldown.get(key);
    return cooldownEnd && Date.now() < cooldownEnd;
  }

  setCooldown(key, duration) {
    this.alertCooldown.set(key, Date.now() + duration);
  }

  // Send query alert
  sendQueryAlert(queryData, issues) {
    const alertType = issues[0].type;
    const message = `Database ${alertType}: ${issues[0].message}`;
    
    const alertData = {
      query: {
        id: queryData.id,
        operation: queryData.operation,
        model: queryData.model,
        duration: queryData.duration
      },
      issues,
      timestamp: queryData.timestamp
    };
    
    monitoringService.alert(alertType, message, alertData);
  }

  // Utility methods
  sanitizeFilter(filter) {
    if (!filter || typeof filter !== 'object') return filter;
    
    // Remove sensitive data and limit size
    const sanitized = {};
    Object.keys(filter).forEach(key => {
      const value = filter[key];
      if (typeof value === 'string' && value.length > 100) {
        sanitized[key] = value.substring(0, 100) + '...';
      } else if (key.toLowerCase().includes('password') || key.toLowerCase().includes('token')) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    });
    
    return sanitized;
  }

  captureRelevantStackTrace() {
    try {
      const stack = new Error().stack;
      if (!stack) return null;
      
      const lines = stack.split('\n');
      // Return relevant lines, excluding this monitor code
      return lines
        .filter(line => !line.includes('DatabaseMonitor'))
        .slice(1, 4) // Top 3 stack frames
        .map(line => line.trim());
    } catch {
      return null;
    }
  }

  generateQueryId() {
    return `dbq_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  hasIndexForSort(sortObj) {
    // This is a simplified check - in reality, you'd need to query the database
    // for actual index information
    return false; // Conservative assumption
  }

  cleanupOldQueries() {
    const cutoffTime = Date.now() - 3600000; // 1 hour
    const oldCount = this.queryHistory.length;
    
    this.queryHistory = this.queryHistory.filter(query => query.timestamp > cutoffTime);
    
    const cleanedCount = oldCount - this.queryHistory.length;
    if (cleanedCount > 0) {
      console.log(`[DB_MONITOR] Cleaned up ${cleanedCount} old queries`);
    }
  }

  // Exam-specific monitoring methods
  trackExamQuery(examId, operation, model, duration, metadata = {}) {
    return this.trackQuery(operation, model, { exam: examId }, duration, null, {
      ...metadata,
      context: 'exam_operation',
      examId
    });
  }

  trackStudentQuery(studentId, operation, model, duration, metadata = {}) {
    return this.trackQuery(operation, model, { student: studentId }, duration, null, {
      ...metadata,
      context: 'student_operation',
      studentId
    });
  }

  trackSubmissionQuery(examId, studentId, operation, model, duration, error = null) {
    return this.trackQuery(operation, model, { exam: examId, student: studentId }, duration, error, {
      context: 'exam_submission',
      examId,
      studentId,
      critical: true
    });
  }

  // Connection pool monitoring
  trackConnectionPool(poolName, activeConnections, totalConnections, waitingCount = 0) {
    const poolData = {
      poolName,
      activeConnections,
      totalConnections,
      waitingCount,
      utilization: (activeConnections / totalConnections) * 100,
      timestamp: Date.now()
    };
    
    this.connectionPool.set(poolName, poolData);
    
    // Alert on high utilization
    if (poolData.utilization > 90) {
      monitoringService.alert('HIGH_DB_POOL_UTILIZATION', 
        `Database connection pool ${poolName} at ${poolData.utilization.toFixed(1)}% capacity`,
        poolData
      );
    }
    
    // Track in monitoring service
    monitoringService.recordPerformanceMetric('database_connection_pool', poolData);
  }

  // Query analysis and reporting
  getQueryAnalytics(timeRange = 3600000) { // Default 1 hour
    const cutoffTime = Date.now() - timeRange;
    const recentQueries = this.queryHistory.filter(q => q.timestamp > cutoffTime);
    
    const analytics = {
      totalQueries: recentQueries.length,
      averageQueryTime: 0,
      slowQueries: recentQueries.filter(q => q.duration > this.slowQueryThreshold).length,
      failedQueries: recentQueries.filter(q => q.error).length,
      modelBreakdown: {},
      operationBreakdown: {},
      timeDistribution: this.getTimeDistribution(recentQueries)
    };
    
    // Calculate averages and breakdowns
    let totalDuration = 0;
    recentQueries.forEach(query => {
      totalDuration += query.duration;
      
      // Model breakdown
      analytics.modelBreakdown[query.model] = (analytics.modelBreakdown[query.model] || 0) + 1;
      
      // Operation breakdown
      analytics.operationBreakdown[query.operation] = (analytics.operationBreakdown[query.operation] || 0) + 1;
    });
    
    analytics.averageQueryTime = recentQueries.length > 0 ? totalDuration / recentQueries.length : 0;
    
    return analytics;
  }

  getTimeDistribution(queries) {
    const distribution = {
      fast: 0,    // < 100ms
      medium: 0,  // 100ms - 1s
      slow: 0,    // 1s - 5s
      verySlow: 0 // > 5s
    };
    
    queries.forEach(query => {
      if (query.duration < 100) distribution.fast++;
      else if (query.duration < 1000) distribution.medium++;
      else if (query.duration < 5000) distribution.slow++;
      else distribution.verySlow++;
    });
    
    return distribution;
  }

  // Export methods
  exportQueryHistory() {
    return {
      queries: [...this.queryHistory],
      performanceMetrics: { ...this.performanceMetrics },
      connectionPools: Object.fromEntries(this.connectionPool),
      analytics: this.getQueryAnalytics(),
      timestamp: Date.now()
    };
  }

  // Reset monitoring
  reset() {
    this.queryHistory = [];
    this.connectionPool.clear();
    this.alertCooldown.clear();
    this.performanceMetrics = {
      totalQueries: 0,
      slowQueries: 0,
      failedQueries: 0,
      averageQueryTime: 0,
      n1QueriesDetected: 0
    };
    
    console.log('[DB_MONITOR] Reset completed');
  }

  // Cleanup
  cleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.isMonitoring = false;
  }
}

// Helper function to instrument mongoose queries
export function instrumentMongooseQuery(model, operation, originalMethod) {
  return async function(...args) {
    const startTime = Date.now();
    const filter = args[0] || {};
    
    // Execute original method
    const result = originalMethod.apply(this, args);
    
    // Handle both callback and promise styles
    if (result && typeof result.then === 'function') {
      return result
        .then(data => {
          const duration = Date.now() - startTime;
          databaseMonitor.trackQuery(operation, model.modelName, filter, duration, null, {
            resultCount: Array.isArray(data) ? data.length : (data ? 1 : 0)
          });
          return data;
        })
        .catch(error => {
          const duration = Date.now() - startTime;
          databaseMonitor.trackQuery(operation, model.modelName, filter, duration, error);
          throw error;
        });
    }
    
    return result;
  };
}

// Create singleton instance
const databaseMonitor = new DatabaseMonitor();

export default databaseMonitor;
export { DatabaseMonitor };