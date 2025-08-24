# Emergency Monitoring System

A comprehensive monitoring and logging system designed to ensure exam portal stability during the critical refactoring phase.

## Overview

This monitoring system provides:
- **Real-time error tracking** and component crash boundaries
- **Performance monitoring** with database query optimization
- **Timer validation** to detect timing discrepancies
- **Feature flags** for safe rollouts during refactoring
- **Comprehensive logging** of all critical exam operations
- **Monitoring dashboard** with health metrics and alerts

## Quick Start

### 1. Basic Integration

Wrap your exam components with the monitoring provider:

```jsx
import ExamMonitoringProvider from './components/monitoring/ExamMonitoringProvider';
import ExamInterface from './components/examPortal/examPageComponents/ExamInterface';

function ExamPage({ exam, student }) {
  return (
    <ExamMonitoringProvider 
      exam={exam} 
      student={student} 
      isExamMode={true}
      showMonitoringDashboard={process.env.NODE_ENV === 'development'}
    >
      <ExamInterface 
        exam={exam}
        student={student}
        // ... other props
      />
    </ExamMonitoringProvider>
  );
}
```

### 2. Component-Level Monitoring

Add monitoring to individual components:

```jsx
import { withMonitoring, useMonitoring } from './components/monitoring/ExamMonitoringProvider';

function QuestionDisplay({ question, onAnswer }) {
  const { trackRenderPerformance, featureFlags } = useMonitoring();
  
  // Check feature flags
  const useEnhancedValidation = featureFlags.getFlag('enhanced_answer_validation');
  
  const handleAnswer = (answer) => {
    // Track answer changes
    if (useEnhancedValidation) {
      // Use new validation logic
    }
    onAnswer(answer);
  };
  
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}

export default withMonitoring(QuestionDisplay, 'QuestionDisplay');
```

### 3. Database Query Monitoring

Add to your server actions:

```javascript
import databaseMonitor from '../lib/monitoring/DatabaseMonitor';

export async function getExamQuestions(examId) {
  const startTime = Date.now();
  
  try {
    const questions = await Exam.findById(examId).populate('examQuestions');
    const duration = Date.now() - startTime;
    
    // Track the query
    databaseMonitor.trackExamQuery(examId, 'findById', 'Exam', duration, {
      populated: true,
      resultCount: questions?.examQuestions?.length || 0
    });
    
    return questions;
  } catch (error) {
    const duration = Date.now() - startTime;
    databaseMonitor.trackExamQuery(examId, 'findById', 'Exam', duration, error);
    throw error;
  }
}
```

### 4. Timer Monitoring

Track timer updates:

```jsx
import { useMonitoring } from './components/monitoring/ExamMonitoringProvider';

function ExamTimer({ examId, studentId, initialTime }) {
  const { trackTimerUpdate, timerId } = useMonitoring();
  const [timeLeft, setTimeLeft] = useState(initialTime);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1000;
        
        // Track timer update for discrepancy detection
        trackTimerUpdate(timerId, newTime, calculateExpectedTime());
        
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timerId, trackTimerUpdate]);
  
  return <div>Time: {formatTime(timeLeft)}</div>;
}
```

## Core Components

### 1. MonitoringService
- Central error tracking and performance monitoring
- Real-time alerts and notifications
- Memory usage tracking
- Network request monitoring

### 2. ExamLogger
- Comprehensive logging of exam operations
- Critical operation tracking (start, save, submit, etc.)
- Suspicious activity detection
- Export capabilities for debugging

### 3. TimerMonitor
- Timer validation and discrepancy detection
- Server time synchronization
- Timing attack detection
- Clock manipulation alerts

### 4. FeatureFlags
- Safe feature rollouts during refactoring
- Runtime configuration management
- A/B testing capabilities
- Dependency validation

### 5. DatabaseMonitor
- Query performance tracking
- N+1 query detection
- Connection pool monitoring
- Optimization suggestions

### 6. ExamErrorBoundary
- React component crash recovery
- Exam-critical error handling
- Automatic retry mechanisms
- Error reporting to server

## API Endpoints

The system includes several API endpoints for server-side integration:

- `POST /api/monitoring/log` - Receive client-side logs
- `GET /api/monitoring/server-time` - Server time synchronization  
- `GET/POST /api/monitoring/feature-flags` - Feature flag management
- `POST /api/monitoring/component-error` - Component error reporting

## Feature Flags

Key feature flags for safe refactoring:

```javascript
// Database optimizations
'enhanced_database_queries': false,     // New query optimization
'n1_query_detection': true,            // Detect N+1 patterns
'database_retry_logic': true,          // Auto-retry failed queries

// Component improvements
'new_exam_interface': false,           // Redesigned interface
'enhanced_question_navigator': false,   // Improved navigation
'improved_timer_component': false,      // New timer logic

// Performance features
'memory_optimization': true,           // Memory leak prevention
'render_performance_tracking': true,   // Component performance
'component_lazy_loading': false,       // Lazy load components

// Monitoring features
'comprehensive_logging': true,         // Detailed logging
'real_time_alerts': true,             // Instant alerts
'performance_monitoring': true,       // System health tracking
```

## Monitoring Dashboard

Access the monitoring dashboard during development:

```jsx
<ExamMonitoringProvider showMonitoringDashboard={true}>
  {/* Your exam components */}
</ExamMonitoringProvider>
```

The dashboard shows:
- System health metrics
- Real-time alerts
- Performance graphs
- Exam operation logs
- Error reports

## Best Practices

### 1. Error Handling
Always wrap critical components in error boundaries:

```jsx
import ExamErrorBoundary from './components/monitoring/ExamErrorBoundary';

<ExamErrorBoundary boundaryName="CriticalExamComponent">
  <CriticalComponent />
</ExamErrorBoundary>
```

### 2. Feature Flag Usage
Check flags before using new features:

```jsx
const { featureFlags } = useMonitoring();

if (featureFlags.getFlag('new_submission_endpoint')) {
  // Use new endpoint
} else {
  // Use existing endpoint
}
```

### 3. Performance Tracking
Monitor expensive operations:

```jsx
const startTime = Date.now();
const result = await expensiveOperation();
const duration = Date.now() - startTime;

monitoringService.recordPerformanceMetric('expensive_operation', { duration });
```

### 4. Logging Critical Operations
Log all critical exam events:

```jsx
examLogger.logCritical('exam_submit', {
  examId: exam._id,
  studentId: student._id,
  answers: Object.keys(answers).length,
  submissionMethod: 'auto'
});
```

## Production Deployment

### Environment Variables
```env
# Feature flag admin key
ADMIN_FEATURE_FLAG_KEY=your-secure-key

# Monitoring endpoints
MONITORING_ENABLED=true
MONITORING_LOG_LEVEL=INFO
```

### Monitoring Setup
1. Enable server-side logging
2. Configure alert notifications
3. Set up database for log storage
4. Configure monitoring dashboard access
5. Test all error boundaries

## Troubleshooting

### Common Issues
1. **High Memory Usage**: Enable memory optimization flag
2. **Slow Database Queries**: Check N+1 detection alerts
3. **Timer Discrepancies**: Review timer synchronization logs
4. **Component Crashes**: Check error boundary reports

### Debug Mode
Enable verbose logging in development:

```javascript
featureFlags.setFlag('verbose_logging', true);
featureFlags.setFlag('debug_mode', true);
```

## Support

For issues during refactoring:
1. Check monitoring dashboard for alerts
2. Export error reports for analysis
3. Review feature flag configurations
4. Check server logs for critical errors

The monitoring system is designed to be non-intrusive and failsafe - it will not break existing functionality even if monitoring itself fails.