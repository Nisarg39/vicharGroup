"use client";

import { useState, useEffect, useCallback } from 'react';
import { useExamData } from '../../contexts/ExamDataProvider';

/**
 * APIOptimizationMonitor - Real-time monitoring for API optimization performance
 * 
 * Features:
 * - Cache performance metrics
 * - API call reduction tracking
 * - Memory usage monitoring
 * - Error rate tracking
 * - Performance benchmarking
 */

export function APIOptimizationMonitor() {
    const examData = useExamData();
    const [stats, setStats] = useState(null);
    const [history, setHistory] = useState([]);
    const [expanded, setExpanded] = useState(false);
    
    // Only show in development or when explicitly enabled
    const shouldShow = process.env.NODE_ENV === 'development' || 
                      localStorage.getItem('showAPIMonitor') === 'true';

    const updateStats = useCallback(() => {
        if (examData) {
            const currentStats = examData.getCacheStats();
            const timestamp = Date.now();
            
            // Calculate performance metrics
            const performanceMetrics = {
                ...currentStats,
                timestamp,
                callReduction: calculateCallReduction(currentStats),
                memoryEfficiency: calculateMemoryEfficiency(currentStats),
                errorRate: calculateErrorRate(currentStats)
            };
            
            setStats(performanceMetrics);
            
            // Keep history for trending (last 10 minutes)
            setHistory(prev => {
                const newHistory = [...prev, performanceMetrics];
                const tenMinutesAgo = timestamp - (10 * 60 * 1000);
                return newHistory.filter(entry => entry.timestamp > tenMinutesAgo);
            });
        }
    }, [examData]);

    useEffect(() => {
        if (!shouldShow) return;
        
        updateStats();
        const interval = setInterval(updateStats, 5000); // Update every 5 seconds
        
        return () => clearInterval(interval);
    }, [shouldShow, updateStats]);

    const calculateCallReduction = (stats) => {
        if (!stats.managerStats) return 0;
        
        const hitRate = stats.managerStats.hitRate || 0;
        const totalRequests = stats.localCacheSize + stats.loadingRequests;
        
        if (totalRequests === 0) return 0;
        
        // Estimate: Without cache, each UI component would make individual calls
        // With cache, we reduce calls by hit rate percentage
        return Math.round(hitRate * 100);
    };

    const calculateMemoryEfficiency = (stats) => {
        if (!stats.managerStats) return 0;
        
        const memoryKB = stats.managerStats.estimatedMemoryKB || 0;
        const cacheEntries = stats.localCacheSize || 1;
        
        // Memory per cache entry (efficient if < 10KB per entry)
        const memoryPerEntry = memoryKB / cacheEntries;
        return memoryPerEntry < 10 ? 'Efficient' : memoryPerEntry < 50 ? 'Moderate' : 'High';
    };

    const calculateErrorRate = (stats) => {
        const errors = stats.errors || 0;
        const total = stats.localCacheSize + errors;
        
        if (total === 0) return 0;
        return Math.round((errors / total) * 100);
    };

    const getPerformanceColor = (hitRate) => {
        if (hitRate >= 80) return 'text-green-600';
        if (hitRate >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getMemoryColor = (efficiency) => {
        if (efficiency === 'Efficient') return 'text-green-600';
        if (efficiency === 'Moderate') return 'text-yellow-600';
        return 'text-red-600';
    };

    if (!shouldShow || !stats) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className={`bg-black/90 text-white rounded-lg shadow-xl transition-all duration-300 ${
                expanded ? 'w-80 p-4' : 'w-64 p-3'
            }`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        API Monitor
                    </h3>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-gray-400 hover:text-white text-xs"
                    >
                        {expanded ? '−' : '+'}
                    </button>
                </div>

                {/* Core Metrics */}
                <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                        <span>Cache Hit Rate:</span>
                        <span className={getPerformanceColor(stats.managerStats?.hitRate * 100 || 0)}>
                            {((stats.managerStats?.hitRate || 0) * 100).toFixed(1)}%
                        </span>
                    </div>
                    
                    <div className="flex justify-between">
                        <span>Call Reduction:</span>
                        <span className="text-green-400">
                            {calculateCallReduction(stats)}%
                        </span>
                    </div>
                    
                    <div className="flex justify-between">
                        <span>Cache Size:</span>
                        <span className="text-blue-400">{stats.localCacheSize}</span>
                    </div>
                    
                    <div className="flex justify-between">
                        <span>Loading:</span>
                        <span className="text-yellow-400">{stats.loadingRequests}</span>
                    </div>

                    {stats.errors > 0 && (
                        <div className="flex justify-between">
                            <span>Errors:</span>
                            <span className="text-red-400">{stats.errors}</span>
                        </div>
                    )}
                </div>

                {/* Expanded Details */}
                {expanded && (
                    <>
                        <div className="border-t border-gray-700 mt-3 pt-3 space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span>Memory Usage:</span>
                                <span className={getMemoryColor(calculateMemoryEfficiency(stats))}>
                                    {stats.managerStats?.estimatedMemoryKB || 0}KB
                                </span>
                            </div>
                            
                            <div className="flex justify-between">
                                <span>Memory/Entry:</span>
                                <span className="text-gray-400">
                                    {stats.localCacheSize > 0 
                                        ? Math.round((stats.managerStats?.estimatedMemoryKB || 0) / stats.localCacheSize)
                                        : 0
                                    }KB
                                </span>
                            </div>
                            
                            <div className="flex justify-between">
                                <span>Valid Entries:</span>
                                <span className="text-green-400">{stats.managerStats?.validEntries || 0}</span>
                            </div>
                            
                            <div className="flex justify-between">
                                <span>Expired:</span>
                                <span className="text-gray-400">{stats.managerStats?.expiredEntries || 0}</span>
                            </div>
                            
                            <div className="flex justify-between">
                                <span>Pending:</span>
                                <span className="text-yellow-400">{stats.managerStats?.pendingRequests || 0}</span>
                            </div>
                        </div>

                        {/* Performance Trend */}
                        {history.length > 1 && (
                            <div className="border-t border-gray-700 mt-3 pt-3">
                                <div className="text-xs text-gray-400 mb-2">Performance Trend (10min)</div>
                                <div className="h-8 flex items-end space-x-1">
                                    {history.slice(-20).map((entry, index) => {
                                        const hitRate = (entry.managerStats?.hitRate || 0) * 100;
                                        const height = Math.max(2, (hitRate / 100) * 24);
                                        const color = hitRate >= 80 ? 'bg-green-400' : 
                                                     hitRate >= 60 ? 'bg-yellow-400' : 'bg-red-400';
                                        
                                        return (
                                            <div
                                                key={index}
                                                className={`w-1 ${color} rounded-t`}
                                                style={{ height: `${height}px` }}
                                                title={`${hitRate.toFixed(1)}% hit rate`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="border-t border-gray-700 mt-3 pt-3 flex gap-2">
                            <button
                                onClick={() => {
                                    examData.clearCache();
                                    updateStats();
                                }}
                                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-xs rounded"
                            >
                                Clear Cache
                            </button>
                            <button
                                onClick={() => {
                                    console.log('API Optimization Stats:', stats);
                                    console.log('History:', history);
                                }}
                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-xs rounded"
                            >
                                Log Stats
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

/**
 * Performance Alert Component - Shows alerts for performance issues
 */
export function PerformanceAlerts() {
    const examData = useExamData();
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const checkPerformance = () => {
            if (!examData) return;
            
            const stats = examData.getCacheStats();
            const newAlerts = [];
            
            // Low hit rate alert
            if (stats.managerStats?.hitRate < 0.5) {
                newAlerts.push({
                    id: 'low-hit-rate',
                    type: 'warning',
                    message: `Cache hit rate is low (${(stats.managerStats.hitRate * 100).toFixed(1)}%). Consider increasing cache TTL.`,
                    action: () => console.log('Suggested: Increase cache TTL or prefetch more data')
                });
            }
            
            // High memory usage alert
            if (stats.managerStats?.estimatedMemoryKB > 5000) { // > 5MB
                newAlerts.push({
                    id: 'high-memory',
                    type: 'error',
                    message: `High memory usage (${stats.managerStats.estimatedMemoryKB}KB). Cache may need optimization.`,
                    action: () => examData.clearCache()
                });
            }
            
            // High error rate alert
            if (stats.errors > 5) {
                newAlerts.push({
                    id: 'high-errors',
                    type: 'error',
                    message: `High error rate detected (${stats.errors} errors). Check network connectivity.`,
                    action: () => window.location.reload()
                });
            }
            
            setAlerts(newAlerts);
        };
        
        checkPerformance();
        const interval = setInterval(checkPerformance, 30000); // Check every 30 seconds
        
        return () => clearInterval(interval);
    }, [examData]);

    if (process.env.NODE_ENV !== 'development' || alerts.length === 0) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 w-80">
            {alerts.map(alert => (
                <div
                    key={alert.id}
                    className={`p-3 rounded-lg shadow-lg ${
                        alert.type === 'error' 
                            ? 'bg-red-100 border border-red-300 text-red-800'
                            : 'bg-yellow-100 border border-yellow-300 text-yellow-800'
                    }`}
                >
                    <div className="flex justify-between items-start">
                        <p className="text-sm">{alert.message}</p>
                        <button
                            onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
                            className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                            ×
                        </button>
                    </div>
                    {alert.action && (
                        <button
                            onClick={alert.action}
                            className="mt-2 px-3 py-1 bg-white rounded text-xs hover:bg-gray-50"
                        >
                            Fix Issue
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}

export default APIOptimizationMonitor;