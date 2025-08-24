"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Activity,
  Server,
  Database,
  Users
} from 'lucide-react';

/**
 * EMERGENCY QUEUE SYSTEM - Admin Monitoring Component
 * Displays real-time queue statistics and allows management of failed submissions
 */
export default function ExamQueueMonitor() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch queue statistics
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/queue-stats', {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'admin-token'}`,
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setStats(result.stats);
        setLastUpdated(new Date());
      } else {
        throw new Error(result.message || 'Failed to fetch stats');
      }
    } catch (err) {
      console.error('Error fetching queue stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Retry failed submission
  const retrySubmission = async (submissionId) => {
    try {
      const response = await fetch('/api/admin/retry-submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'admin-token'}`
        },
        body: JSON.stringify({ submissionId })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Submission queued for retry successfully!');
        fetchStats(); // Refresh stats
      } else {
        alert('Failed to retry submission: ' + result.message);
      }
    } catch (err) {
      console.error('Error retrying submission:', err);
      alert('Error retrying submission: ' + err.message);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    fetchStats();

    if (autoRefresh) {
      const interval = setInterval(fetchStats, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  if (loading && !stats) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span>Loading queue statistics...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
              <div>
                <h3 className="text-lg font-medium">Error Loading Stats</h3>
                <p className="text-gray-600">{error}</p>
                <Button onClick={fetchStats} className="mt-2">
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const queueStats = stats?.queue?.stats || [];
  const workerStats = stats?.worker || {};
  const failedSubmissions = stats?.queue?.failedSubmissions || [];

  // Process queue stats
  const queueSummary = queueStats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {});

  const totalQueued = queueSummary.queued || 0;
  const totalProcessing = queueSummary.processing || 0;
  const totalCompleted = queueSummary.completed || 0;
  const totalFailed = queueSummary.failed || 0;
  const totalRetrying = queueSummary.retrying || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Exam Queue Monitor</h1>
          <p className="text-gray-600">Real-time monitoring of the emergency submission queue system</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className={`h-4 w-4 mr-2 ${autoRefresh ? 'text-green-500' : 'text-gray-400'}`} />
            Auto-refresh {autoRefresh ? 'On' : 'Off'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchStats}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {lastUpdated && (
        <div className="text-sm text-gray-500">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}

      {/* Queue Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Queued</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalQueued}</div>
            <Badge variant="secondary" className="mt-1">
              <Clock className="h-3 w-3 mr-1" />
              Waiting
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{totalProcessing}</div>
            <Badge variant="default" className="mt-1">
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Active
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalCompleted}</div>
            <Badge variant="outline" className="mt-1 text-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Success
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalFailed}</div>
            <Badge variant="destructive" className="mt-1">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Error
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Retrying</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalRetrying}</div>
            <Badge variant="outline" className="mt-1 text-orange-600">
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Worker Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="h-5 w-5 mr-2" />
            Worker Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Worker ID:</span>
                <span className="text-sm font-mono">{workerStats.workerId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge variant={workerStats.isProcessing ? 'default' : 'secondary'}>
                  {workerStats.isProcessing ? 'Running' : 'Stopped'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Uptime:</span>
                <span className="text-sm">{workerStats.uptime ? Math.round(workerStats.uptime / 1000 / 60) + 'm' : 'N/A'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Processed:</span>
                <span className="text-sm font-bold text-green-600">{workerStats.processedCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Errors:</span>
                <span className="text-sm font-bold text-red-600">{workerStats.errorCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Time:</span>
                <span className="text-sm">{workerStats.averageProcessingTime ? Math.round(workerStats.averageProcessingTime) + 'ms' : 'N/A'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Started:</span>
                <span className="text-sm">{workerStats.startedAt ? new Date(workerStats.startedAt).toLocaleTimeString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Success Rate:</span>
                <span className="text-sm font-bold">
                  {workerStats.processedCount && workerStats.errorCount 
                    ? Math.round((workerStats.processedCount / (workerStats.processedCount + workerStats.errorCount)) * 100) + '%'
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Failed Submissions */}
      {failedSubmissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              Failed Submissions ({failedSubmissions.length})
            </CardTitle>
            <CardDescription>
              Submissions that failed processing and may need manual intervention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {failedSubmissions.map((submission, index) => (
                <div key={submission._id || index} className="flex items-center justify-between p-3 border rounded">
                  <div className="space-y-1">
                    <div className="font-mono text-sm">{submission.submissionId}</div>
                    <div className="text-xs text-gray-600">
                      Student: {submission.student?.name || submission.student || 'Unknown'} • 
                      Exam: {submission.exam?.examName || submission.exam || 'Unknown'} •
                      Attempts: {submission.processing?.attempts || 0}
                    </div>
                    {submission.errors?.length > 0 && (
                      <div className="text-xs text-red-600">
                        Latest error: {submission.errors[submission.errors.length - 1]?.error?.message}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="destructive">Failed</Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => retrySubmission(submission.submissionId)}
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Node Version:</strong> {stats?.systemInfo?.nodeVersion || 'N/A'}
            </div>
            <div>
              <strong>Platform:</strong> {stats?.systemInfo?.platform || 'N/A'}
            </div>
            <div>
              <strong>Process Uptime:</strong> {stats?.systemInfo?.uptime ? Math.round(stats.systemInfo.uptime / 60) + ' minutes' : 'N/A'}
            </div>
            <div>
              <strong>Memory Usage:</strong> {stats?.systemInfo?.memoryUsage?.used ? Math.round(stats.systemInfo.memoryUsage.used / 1024 / 1024) + 'MB' : 'N/A'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}