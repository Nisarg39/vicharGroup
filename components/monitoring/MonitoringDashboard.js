"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Database,
  Cpu,
  Network,
  Eye,
  Download,
  RefreshCw,
  Settings,
  Bell,
  TrendingUp,
  BarChart3,
  Zap
} from 'lucide-react';
import monitoringService from '../../lib/monitoring/MonitoringService';
import examLogger from '../../lib/monitoring/ExamLogger';

const MonitoringDashboard = ({ onClose, isExamMode = false }) => {
  const [systemHealth, setSystemHealth] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [errors, setErrors] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [examLogs, setExamLogs] = useState(null);
  const [isVisible, setIsVisible] = useState(!isExamMode);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [activeTab, setActiveTab] = useState('overview');

  // Update data from monitoring services
  const updateData = useCallback(() => {
    try {
      // Get system health
      const health = monitoringService.getSystemHealth();
      setSystemHealth(health);

      // Get recent alerts
      const recentAlerts = monitoringService.exportAlerts().slice(-50);
      setAlerts(recentAlerts);

      // Get critical errors
      const criticalErrors = monitoringService.exportCriticalErrors().slice(-20);
      setErrors(criticalErrors);

      // Get performance metrics
      const metrics = monitoringService.exportPerformanceMetrics();
      setPerformanceMetrics(metrics);

      // Get exam logs if in exam mode
      if (isExamMode && examLogger.isExamActive) {
        const logs = examLogger.exportLogs();
        setExamLogs(logs);
      }
    } catch (error) {
      console.error('Error updating monitoring dashboard data:', error);
    }
  }, [isExamMode]);

  useEffect(() => {
    // Initial data load
    updateData();

    // Set up auto-refresh
    const interval = setInterval(updateData, refreshInterval);

    // Subscribe to monitoring service updates
    const unsubscribe = monitoringService.subscribe((eventType, data) => {
      if (eventType === 'alert' || eventType === 'error') {
        updateData();
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [updateData, refreshInterval]);

  // System health color coding
  const getHealthColor = (isHealthy) => {
    return isHealthy ? 'text-green-600' : 'text-red-600';
  };

  const getHealthIcon = (isHealthy) => {
    return isHealthy ? CheckCircle : XCircle;
  };

  // Alert severity colors
  const getAlertColor = (type) => {
    const colors = {
      'CRITICAL_ERROR': 'destructive',
      'HIGH_MEMORY_USAGE': 'destructive', 
      'SLOW_DATABASE_QUERY': 'warning',
      'SLOW_COMPONENT_RENDER': 'warning',
      'TIMER_DISCREPANCY': 'destructive',
      'NETWORK_ERROR': 'destructive',
      'PERFORMANCE_THRESHOLD_EXCEEDED': 'warning'
    };
    return colors[type] || 'secondary';
  };

  // Format time duration
  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  // Format memory size
  const formatMemory = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  // Export data functions
  const exportSystemReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      systemHealth,
      alerts: alerts.slice(-100),
      errors: errors.slice(-50),
      performanceMetrics: Object.fromEntries(
        Object.entries(performanceMetrics).map(([key, metrics]) => [key, metrics.slice(-20)])
      ),
      examLogs: examLogs
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monitoring-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Render performance chart (simplified)
  const renderMetricChart = (metricName, data) => {
    if (!data || data.length === 0) return <div className="text-gray-500">No data available</div>;
    
    const recentData = data.slice(-20);
    const maxValue = Math.max(...recentData.map(d => {
      if (metricName === 'memory_usage') return d.data.used || 0;
      if (metricName === 'database_query') return d.data.duration || 0;
      return d.data.duration || d.data.loadTime || 0;
    }));
    
    return (
      <div className="flex items-end space-x-1 h-20">
        {recentData.map((point, index) => {
          let value = 0;
          if (metricName === 'memory_usage') value = point.data.used || 0;
          else if (metricName === 'database_query') value = point.data.duration || 0;
          else value = point.data.duration || point.data.loadTime || 0;
          
          const height = maxValue > 0 ? (value / maxValue) * 80 : 5;
          
          return (
            <div
              key={index}
              className="bg-blue-500 w-2 min-h-[4px] rounded-t"
              style={{ height: `${height}px` }}
              title={`${value} ${metricName === 'memory_usage' ? 'bytes' : 'ms'}`}
            />
          );
        })}
      </div>
    );
  };

  // Quick toggle visibility for exam mode
  if (isExamMode && !isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg"
        >
          <Activity className="w-4 h-4 mr-2" />
          Monitor
        </Button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-xl border ${isExamMode ? 'fixed top-4 right-4 w-96 max-h-[80vh] z-50' : 'w-full h-full'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">System Monitor</h2>
          {systemHealth && (
            <Badge variant={systemHealth.isHealthy ? "default" : "destructive"}>
              {systemHealth.isHealthy ? "Healthy" : "Issues Detected"}
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={updateData}
            variant="ghost"
            size="sm"
            className="p-1"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          {isExamMode && (
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="p-1"
            >
              <Eye className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`${isExamMode ? 'max-h-[calc(80vh-60px)] overflow-y-auto' : ''}`}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="alerts">
              Alerts
              {alerts.filter(a => !a.acknowledged).length > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">
                  {alerts.filter(a => !a.acknowledged).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="exam">Exam Logs</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {systemHealth && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${systemHealth.isHealthy ? 'bg-green-500' : 'bg-red-500'}`} />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Memory Usage</div>
                      <div className="font-medium">{formatMemory(systemHealth.memoryUsage)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Uptime</div>
                      <div className="font-medium">{formatDuration(systemHealth.uptime)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Critical Errors</div>
                      <div className="font-medium">{systemHealth.criticalErrorsCount}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Active Alerts</div>
                      <div className="font-medium">{systemHealth.unacknowledgedAlertsCount}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {errors.slice(-3).map((error, index) => (
                    <div key={error.id} className="flex items-center space-x-2 text-sm">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <div className="truncate flex-1">
                        <div className="font-medium">{error.category}</div>
                        <div className="text-gray-500 text-xs truncate">{error.message}</div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(error.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                  {errors.length === 0 && (
                    <div className="text-gray-500 text-sm">No recent errors</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Active Alerts</h3>
              <Badge variant="outline">
                {alerts.filter(a => !a.acknowledged).length} active
              </Badge>
            </div>
            
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {alerts.slice(-20).reverse().map((alert) => (
                <Alert key={alert.id} className="text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{alert.type}</div>
                        <div className="text-xs text-gray-500">{alert.message}</div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
              {alerts.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No alerts to display
                </div>
              )}
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-4">
              {Object.entries(performanceMetrics).map(([metricName, data]) => (
                <Card key={metricName}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm capitalize">
                      {metricName.replace(/_/g, ' ')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        {renderMetricChart(metricName, data)}
                      </div>
                      <div className="text-xs text-gray-500 ml-2">
                        {data.length} points
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Exam Logs Tab */}
          <TabsContent value="exam" className="space-y-4">
            {examLogs ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Exam Session</h3>
                  <Badge variant="outline">
                    {examLogs.logs.length} operations
                  </Badge>
                </div>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Session Duration</div>
                        <div className="font-medium">{formatDuration(examLogs.sessionDuration)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Critical Operations</div>
                        <div className="font-medium">{examLogs.criticalOperations.length}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {examLogs.logs.slice(-10).reverse().map((log) => (
                    <div key={log.id} className="border rounded p-2 text-sm">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{log.operation}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      {log.data.questionId && (
                        <div className="text-xs text-gray-500">
                          Question: {log.data.questionId}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No active exam session
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="border-t p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              onClick={exportSystemReport}
              variant="outline"
              size="sm"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
          <div className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringDashboard;