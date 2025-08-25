import { NextResponse } from 'next/server';
import { getDashboardMetrics, generatePerformanceReport } from '../../../../../server_actions/services/performance/DirectStorageMonitor';
import { ConcurrentSubmissionTest } from '../../../../../server_actions/utils/performance/ConcurrentSubmissionTest';

// Mark as dynamic route to prevent static generation
export const dynamic = 'force-dynamic';

/**
 * DIRECT STORAGE PERFORMANCE MONITORING API
 * 
 * Provides comprehensive performance analytics and monitoring data
 * for the 15ms direct storage system.
 */

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const timeRange = parseInt(searchParams.get('timeRange') || '24');
    
    switch (action) {
      case 'dashboard':
        return await handleDashboardRequest(timeRange);
        
      case 'report':
        return await handlePerformanceReport(timeRange);
        
      case 'analytics':
        return await handleAnalyticsRequest(timeRange);
        
      default:
        return await handleDashboardRequest(timeRange);
    }
    
  } catch (error) {
    console.error('❌ Performance monitoring API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch performance data',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { action, config } = await request.json();
    
    switch (action) {
      case 'concurrent-test':
        return await handleConcurrentTest(config);
        
      case 'load-test':
        return await handleLoadTest(config);
        
      case 'stress-test':
        return await handleStressTest(config);
        
      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('❌ Performance testing API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to execute performance test',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// REQUEST HANDLERS
// ============================================================================

async function handleDashboardRequest(timeRange) {
  try {
    const dashboardData = await getDashboardMetrics();
    
    return NextResponse.json({
      success: true,
      data: dashboardData,
      metadata: {
        generatedAt: new Date(),
        timeRangeHours: timeRange,
        apiVersion: '1.0.0'
      }
    });
    
  } catch (error) {
    throw new Error(`Dashboard data fetch failed: ${error.message}`);
  }
}

async function handlePerformanceReport(timeRange) {
  try {
    const performanceReport = await generatePerformanceReport(timeRange);
    
    return NextResponse.json({
      success: true,
      report: performanceReport,
      metadata: {
        reportType: 'comprehensive_performance',
        timeRangeHours: timeRange,
        generatedAt: new Date()
      }
    });
    
  } catch (error) {
    throw new Error(`Performance report generation failed: ${error.message}`);
  }
}

async function handleAnalyticsRequest(timeRange) {
  try {
    const analytics = {
      directStorageAnalytics: await generatePerformanceReport(timeRange),
      systemHealth: await getSystemHealthMetrics(),
      performanceTrends: await getPerformanceTrends(timeRange),
      alertSummary: await getAlertSummary(timeRange)
    };
    
    return NextResponse.json({
      success: true,
      analytics: analytics,
      metadata: {
        analyticsType: 'comprehensive',
        timeRangeHours: timeRange,
        generatedAt: new Date()
      }
    });
    
  } catch (error) {
    throw new Error(`Analytics generation failed: ${error.message}`);
  }
}

async function handleConcurrentTest(config) {
  try {
    const {
      concurrentUsers = 1000,
      testDuration = 30000,
      enableMonitoring = true
    } = config;
    
    console.log(`🚀 Starting API-triggered concurrent test: ${concurrentUsers} users`);
    
    const testResults = await ConcurrentSubmissionTest.testConcurrentCapacity(
      concurrentUsers,
      testDuration
    );
    
    return NextResponse.json({
      success: true,
      testResults: testResults,
      metadata: {
        testType: 'concurrent_capacity',
        triggeredAt: new Date(),
        testCompleted: true
      }
    });
    
  } catch (error) {
    throw new Error(`Concurrent test execution failed: ${error.message}`);
  }
}

async function handleLoadTest(config) {
  try {
    const {
      startUsers = 100,
      maxUsers = 2500,
      incrementSize = 250
    } = config;
    
    console.log(`📈 Starting API-triggered load test: ${startUsers} to ${maxUsers} users`);
    
    const loadTestResults = await ConcurrentSubmissionTest.performLoadTest(
      startUsers,
      maxUsers,
      incrementSize
    );
    
    return NextResponse.json({
      success: true,
      loadTestResults: loadTestResults,
      metadata: {
        testType: 'progressive_load',
        triggeredAt: new Date(),
        testCompleted: true
      }
    });
    
  } catch (error) {
    throw new Error(`Load test execution failed: ${error.message}`);
  }
}

async function handleStressTest(config) {
  try {
    const {
      maxUsers = 5000,
      aggressiveIncrement = 500
    } = config;
    
    console.log(`💥 Starting API-triggered stress test: up to ${maxUsers} users`);
    
    const stressTestResults = await ConcurrentSubmissionTest.performStressTest(
      maxUsers,
      aggressiveIncrement
    );
    
    return NextResponse.json({
      success: true,
      stressTestResults: stressTestResults,
      metadata: {
        testType: 'system_stress',
        triggeredAt: new Date(),
        testCompleted: true
      }
    });
    
  } catch (error) {
    throw new Error(`Stress test execution failed: ${error.message}`);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getSystemHealthMetrics() {
  try {
    return {
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      timestamp: new Date()
    };
  } catch (error) {
    return {
      error: 'Failed to get system health metrics',
      timestamp: new Date()
    };
  }
}

async function getPerformanceTrends(timeRange) {
  try {
    const currentReport = await generatePerformanceReport(timeRange);
    const previousReport = await generatePerformanceReport(timeRange * 2);
    
    return {
      responseTimeTrend: calculateTrend(
        previousReport.directStorage.averageProcessingTime,
        currentReport.directStorage.averageProcessingTime
      ),
      throughputTrend: calculateTrend(
        previousReport.directStorage.totalDirectSubmissions,
        currentReport.directStorage.totalDirectSubmissions
      ),
      errorRateTrend: calculateTrend(
        parseFloat(previousReport.systemHealth.errorRate),
        parseFloat(currentReport.systemHealth.errorRate)
      ),
      timestamp: new Date()
    };
  } catch (error) {
    return {
      error: 'Failed to calculate performance trends',
      timestamp: new Date()
    };
  }
}

async function getAlertSummary(timeRange) {
  try {
    const report = await generatePerformanceReport(timeRange);
    
    const alerts = [];
    
    // Response time alerts
    if (report.directStorage.averageProcessingTime > 15) {
      alerts.push({
        level: 'warning',
        type: 'performance',
        message: `Average response time (${report.directStorage.averageProcessingTime}ms) exceeds 15ms target`,
        timestamp: new Date()
      });
    }
    
    // Error rate alerts
    const errorRate = parseFloat(report.systemHealth.errorRate);
    if (errorRate > 2) {
      alerts.push({
        level: errorRate > 5 ? 'critical' : 'warning',
        type: 'reliability',
        message: `Error rate at ${errorRate}%`,
        timestamp: new Date()
      });
    }
    
    // Target achievement alerts
    const targetRate = parseFloat(report.directStorage.performanceTargetAchieved);
    if (targetRate < 90) {
      alerts.push({
        level: 'info',
        type: 'target',
        message: `Only ${targetRate}% of submissions meet 15ms target`,
        timestamp: new Date()
      });
    }
    
    return {
      totalAlerts: alerts.length,
      alerts: alerts,
      lastUpdated: new Date()
    };
    
  } catch (error) {
    return {
      error: 'Failed to generate alert summary',
      timestamp: new Date()
    };
  }
}

function calculateTrend(previousValue, currentValue) {
  if (previousValue === 0) return { trend: 'stable', change: 0 };
  
  const change = ((currentValue - previousValue) / previousValue) * 100;
  
  let trend = 'stable';
  if (Math.abs(change) > 5) {
    trend = change > 0 ? 'increasing' : 'decreasing';
  }
  
  return {
    trend: trend,
    change: change.toFixed(2),
    previousValue: previousValue,
    currentValue: currentValue
  };
}