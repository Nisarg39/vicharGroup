"use client";

import { useState, useEffect } from 'react';
import { VicharCard } from '../../../components/ui/vichar-card';
import { VicharButton } from '../../../components/ui/vichar-button';

export default function DebugLogsPage() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filter, setFilter] = useState({
    level: '',
    search: '',
    sessionId: '',
    since: ''
  });

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filter]);

  const loadLogs = () => {
    try {
      const storedLogs = localStorage.getItem('exam_debug_logs');
      if (storedLogs) {
        const parsedLogs = JSON.parse(storedLogs);
        setLogs(parsedLogs);
      }
    } catch (error) {
      console.error('Failed to load debug logs:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    if (filter.level) {
      filtered = filtered.filter(log => log.level === filter.level);
    }

    if (filter.search) {
      const search = filter.search.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(search) ||
        (log.data && log.data.toLowerCase().includes(search))
      );
    }

    if (filter.sessionId) {
      filtered = filtered.filter(log => log.sessionId === filter.sessionId);
    }

    if (filter.since) {
      const sinceTime = new Date(filter.since);
      filtered = filtered.filter(log => new Date(log.timestamp) >= sinceTime);
    }

    setFilteredLogs(filtered.reverse()); // Show newest first
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = `exam_debug_logs_${Date.now()}.json`;
    link.click();
  };

  const clearLogs = () => {
    if (confirm('Are you sure you want to clear all debug logs?')) {
      localStorage.removeItem('exam_debug_logs');
      setLogs([]);
      setFilteredLogs([]);
    }
  };

  const getUniqueSessions = () => {
    const sessions = [...new Set(logs.map(log => log.sessionId))];
    return sessions.map(sessionId => {
      const sessionLogs = logs.filter(log => log.sessionId === sessionId);
      const firstLog = sessionLogs[0];
      return {
        id: sessionId,
        timestamp: firstLog?.timestamp,
        count: sessionLogs.length
      };
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const getLevelColor = (level) => {
    const colors = {
      info: 'text-blue-600 bg-blue-50',
      warn: 'text-yellow-600 bg-yellow-50',
      error: 'text-red-600 bg-red-50',
      debug: 'text-gray-600 bg-gray-50'
    };
    return colors[level] || 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Debug Logs Viewer</h1>
        <p className="text-gray-600">
          View and analyze debug logs from exam sessions. Total logs: {logs.length}
        </p>
      </div>

      {/* Controls */}
      <VicharCard className="mb-6">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Level Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Level</label>
              <select 
                className="w-full p-2 border rounded"
                value={filter.level}
                onChange={(e) => setFilter(prev => ({...prev, level: e.target.value}))}
              >
                <option value="">All Levels</option>
                <option value="info">Info</option>
                <option value="warn">Warning</option>
                <option value="error">Error</option>
                <option value="debug">Debug</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <input 
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Search in messages..."
                value={filter.search}
                onChange={(e) => setFilter(prev => ({...prev, search: e.target.value}))}
              />
            </div>

            {/* Session Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Session</label>
              <select 
                className="w-full p-2 border rounded"
                value={filter.sessionId}
                onChange={(e) => setFilter(prev => ({...prev, sessionId: e.target.value}))}
              >
                <option value="">All Sessions</option>
                {getUniqueSessions().map(session => (
                  <option key={session.id} value={session.id}>
                    {new Date(session.timestamp).toLocaleString()} ({session.count} logs)
                  </option>
                ))}
              </select>
            </div>

            {/* Since Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Since</label>
              <input 
                type="datetime-local"
                className="w-full p-2 border rounded"
                value={filter.since}
                onChange={(e) => setFilter(prev => ({...prev, since: e.target.value}))}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <VicharButton onClick={exportLogs}>
              Export Filtered Logs
            </VicharButton>
            <VicharButton onClick={clearLogs} variant="destructive">
              Clear All Logs
            </VicharButton>
            <VicharButton onClick={loadLogs} variant="outline">
              Refresh
            </VicharButton>
          </div>
        </div>
      </VicharCard>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredLogs.length} of {logs.length} logs
      </div>

      {/* Logs Display */}
      <div className="space-y-2">
        {filteredLogs.length === 0 ? (
          <VicharCard>
            <div className="p-8 text-center text-gray-500">
              {logs.length === 0 ? 'No debug logs found' : 'No logs match the current filters'}
            </div>
          </VicharCard>
        ) : (
          filteredLogs.map((log, index) => (
            <VicharCard key={index}>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(log.level)}`}>
                      {log.level.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    Session: {log.sessionId.slice(-8)}
                  </span>
                </div>
                
                <div className="mb-2">
                  <div className="font-medium text-gray-900">{log.message}</div>
                  {log.url && (
                    <div className="text-xs text-gray-500 mt-1">URL: {log.url}</div>
                  )}
                </div>
                
                {log.data && (
                  <div className="bg-gray-50 p-3 rounded text-sm overflow-auto">
                    <pre className="whitespace-pre-wrap">{log.data}</pre>
                  </div>
                )}
              </div>
            </VicharCard>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg p-4 border">
        <div className="text-sm font-medium mb-2">Quick Actions</div>
        <div className="space-y-1 text-xs">
          <div>Press F12 to open browser console</div>
          <div>Type: <code>debugLogger.displayLogsModal()</code></div>
          <div>Or: <code>console.log(debugLogger.getFormattedLogs())</code></div>
        </div>
      </div>
    </div>
  );
}