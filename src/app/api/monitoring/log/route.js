import { NextResponse } from 'next/server';

/**
 * API endpoint for receiving monitoring logs from the client
 * Processes and stores monitoring data during the critical refactoring phase
 */

export async function POST(request) {
  try {
    const { eventType, data, timestamp, sessionId } = await request.json();
    
    // Basic validation
    if (!eventType || !data || !timestamp) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields' 
      }, { status: 400 });
    }
    
    // Log to server console for immediate visibility
    console.log(`[MONITORING] ${eventType}:`, {
      sessionId,
      timestamp: new Date(timestamp).toISOString(),
      data: typeof data === 'object' ? JSON.stringify(data, null, 2) : data
    });
    
    // In a production environment, you would:
    // 1. Store in a database (MongoDB, PostgreSQL, etc.)
    // 2. Send to a logging service (Winston, Bunyan, etc.)
    // 3. Forward to monitoring services (DataDog, New Relic, etc.)
    // 4. Trigger alerts for critical events
    
    // For now, we'll simulate storage and processing
    const processedLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      eventType,
      data,
      timestamp,
      sessionId,
      serverTimestamp: Date.now(),
      processed: true
    };
    
    // Simulate database storage
    // await storeMonitoringLog(processedLog);
    
    // Handle critical events immediately
    if (isCriticalEvent(eventType, data)) {
      await handleCriticalEvent(processedLog);
    }
    
    return NextResponse.json({
      success: true,
      logId: processedLog.id,
      processed: true
    });
    
  } catch (error) {
    console.error('Error processing monitoring log:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

function isCriticalEvent(eventType, data) {
  const criticalEvents = [
    'error',
    'alert'
  ];
  
  if (!criticalEvents.includes(eventType)) {
    return false;
  }
  
  // Check for critical error categories
  if (eventType === 'error') {
    const criticalCategories = ['EXAM', 'TIMER', 'DATABASE', 'REACT_COMPONENT'];
    return criticalCategories.includes(data.category);
  }
  
  // Check for critical alert types
  if (eventType === 'alert') {
    const criticalAlerts = [
      'CRITICAL_ERROR',
      'EXAM_FAILURE', 
      'TIMER_DISCREPANCY',
      'SYSTEM_TIME_MANIPULATION'
    ];
    return criticalAlerts.includes(data.type);
  }
  
  return false;
}

async function handleCriticalEvent(logData) {
  // In a production environment, you would:
  // 1. Send immediate notifications (email, Slack, SMS)
  // 2. Create incident tickets
  // 3. Trigger automated responses
  // 4. Store in high-priority queue for immediate review
  
  console.error(`[CRITICAL EVENT] ${logData.eventType}:`, logData);
  
  // Simulate sending alert notification
  // await sendCriticalAlert(logData);
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'monitoring-log-endpoint'
  });
}