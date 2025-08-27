"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useExamData } from '../contexts/ExamDataProvider';

/**
 * useOptimizedExamAttempts Hook
 * 
 * This hook provides an optimized interface for fetching exam attempts with:
 * - Automatic caching and deduplication
 * - Smart loading states
 * - Error handling
 * - Cache invalidation after submissions
 * - Background refresh capabilities
 * 
 * Usage:
 * const { attempts, loading, error, refresh, hasAttempted } = useOptimizedExamAttempts(examId);
 */

export function useOptimizedExamAttempts(examId, options = {}) {
    const student = useSelector(state => state.login.studentDetails);
    const examData = useExamData();
    
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasAttempted, setHasAttempted] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    
    const mountedRef = useRef(true);
    const lastExamIdRef = useRef(null);
    
    const {
        autoRefresh = true,
        refreshInterval = 5 * 60 * 1000, // 5 minutes
        enableBackgroundRefresh = true,
        ...fetchOptions
    } = options;

    /**
     * Fetch exam attempts using the optimized data layer
     */
    const fetchAttempts = useCallback(async (forceRefresh = false) => {
        if (!student?._id || !examId) {
            return;
        }

        // Don't set loading if this is a background refresh and we have data
        const isBackgroundRefresh = forceRefresh && attempts.length > 0;
        
        if (!isBackgroundRefresh) {
            setLoading(true);
        }
        setError(null);

        try {
            const result = await examData.getExamAttempts(examId, {
                ...fetchOptions,
                forceRefresh
            });

            // Only update if component is still mounted
            if (mountedRef.current) {
                if (result.success) {
                    setAttempts(result.attempts || []);
                    setHasAttempted(result.attempts?.length > 0);
                    setLastUpdated(Date.now());
                    
                    // Log performance metrics if available
                    if (result.fromCache) {
                        console.debug(`Exam attempts loaded from cache for exam ${examId}`);
                    }
                } else {
                    setError(result.message || 'Failed to load exam attempts');
                    console.error('Failed to fetch exam attempts:', result.message);
                }
            }
        } catch (err) {
            if (mountedRef.current) {
                const errorMessage = err.message || 'An unexpected error occurred';
                setError(errorMessage);
                console.error('Error in useOptimizedExamAttempts:', err);
            }
        } finally {
            if (mountedRef.current && !isBackgroundRefresh) {
                setLoading(false);
            }
        }
    }, [student?._id, examId, examData, attempts.length, fetchOptions]);

    /**
     * Refresh data (exposed to parent components)
     */
    const refresh = useCallback((forceRefresh = true) => {
        return fetchAttempts(forceRefresh);
    }, [fetchAttempts]);

    /**
     * Invalidate cache after exam submission
     */
    const invalidateCache = useCallback(() => {
        if (examId) {
            examData.invalidateExamCache(examId);
            // Immediately fetch fresh data
            fetchAttempts(true);
        }
    }, [examId, examData, fetchAttempts]);

    /**
     * Get specific attempt by index or criteria
     */
    const getAttempt = useCallback((criteria) => {
        if (typeof criteria === 'number') {
            return attempts[criteria] || null;
        }
        
        if (typeof criteria === 'function') {
            return attempts.find(criteria) || null;
        }
        
        if (criteria === 'latest') {
            return attempts[0] || null;
        }
        
        if (criteria === 'best') {
            return attempts.reduce((best, current) => {
                if (!best) return current;
                if (current.score > best.score) return current;
                if (current.score === best.score && new Date(current.completedAt) < new Date(best.completedAt)) {
                    return current;
                }
                return best;
            }, null);
        }
        
        return null;
    }, [attempts]);

    /**
     * Get attempt statistics
     */
    const getStats = useCallback(() => {
        if (attempts.length === 0) {
            return {
                totalAttempts: 0,
                bestScore: 0,
                averageScore: 0,
                improvement: 0,
                lastAttemptDate: null
            };
        }

        const scores = attempts.map(a => a.score || 0);
        const bestScore = Math.max(...scores);
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        
        // Calculate improvement (best vs first attempt)
        const firstScore = scores[scores.length - 1] || 0;
        const improvement = bestScore - firstScore;
        
        return {
            totalAttempts: attempts.length,
            bestScore,
            averageScore: Math.round(averageScore * 100) / 100,
            improvement,
            lastAttemptDate: attempts[0]?.completedAt || null,
            scores
        };
    }, [attempts]);

    // Initial fetch when examId or student changes
    useEffect(() => {
        const examIdChanged = lastExamIdRef.current !== examId;
        lastExamIdRef.current = examId;

        if (student?._id && examId) {
            // Check if we have cached data first
            const cachedData = examData.getCachedExamAttempts(examId);
            if (cachedData && cachedData.success && !examIdChanged) {
                // Use cached data immediately
                setAttempts(cachedData.attempts || []);
                setHasAttempted(cachedData.attempts?.length > 0);
                setLastUpdated(Date.now());
                setError(null);
                setLoading(false);
            } else {
                // Fetch fresh data
                fetchAttempts();
            }
        } else {
            // Clear data if no student or exam
            setAttempts([]);
            setHasAttempted(false);
            setError(null);
            setLoading(false);
            setLastUpdated(null);
        }
    }, [student?._id, examId, examData, fetchAttempts]);

    // Auto refresh interval
    useEffect(() => {
        if (!autoRefresh || !enableBackgroundRefresh || !refreshInterval || refreshInterval <= 0) {
            return;
        }

        const intervalId = setInterval(() => {
            // Only do background refresh if we have data and no error
            if (attempts.length > 0 && !error && !loading) {
                fetchAttempts(true);
            }
        }, refreshInterval);

        return () => clearInterval(intervalId);
    }, [autoRefresh, enableBackgroundRefresh, refreshInterval, attempts.length, error, loading, fetchAttempts]);

    // Check for loading state in the data provider
    useEffect(() => {
        if (examId && student?._id) {
            const isDataLoading = examData.isLoading(examId);
            if (isDataLoading && !loading) {
                setLoading(true);
            }
        }
    }, [examId, student?._id, examData, loading]);

    // Check for errors in the data provider
    useEffect(() => {
        if (examId && student?._id) {
            const dataError = examData.getError(examId);
            if (dataError && !error) {
                setError(dataError);
                setLoading(false);
            }
        }
    }, [examId, student?._id, examData, error]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    return {
        // Data
        attempts,
        hasAttempted,
        lastUpdated,
        
        // State
        loading,
        error,
        
        // Actions
        refresh,
        invalidateCache,
        
        // Utilities
        getAttempt,
        getStats,
        
        // Metadata
        isStale: lastUpdated && (Date.now() - lastUpdated > 5 * 60 * 1000), // 5 minutes
        isEmpty: !loading && attempts.length === 0 && !error
    };
}

/**
 * Hook for multiple exam attempts (for MyTestSeries component)
 */
export function useBatchExamAttempts(examIds, options = {}) {
    const student = useSelector(state => state.login.studentDetails);
    const examData = useExamData();
    
    const [batchData, setBatchData] = useState({});
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    const fetchBatchAttempts = useCallback(async (forceRefresh = false) => {
        if (!student?._id || !examIds?.length) {
            return;
        }

        setLoading(true);
        
        try {
            const results = await examData.batchGetExamAttempts(examIds, {
                ...options,
                forceRefresh
            });
            
            setBatchData(results);
            
            // Extract errors
            const newErrors = {};
            Object.entries(results).forEach(([examId, result]) => {
                if (!result.success) {
                    newErrors[examId] = result.message;
                }
            });
            setErrors(newErrors);
            
        } catch (error) {
            console.error('Batch fetch error:', error);
            const errorMessage = error.message || 'Failed to fetch batch exam attempts';
            const newErrors = {};
            examIds.forEach(examId => {
                newErrors[examId] = errorMessage;
            });
            setErrors(newErrors);
        } finally {
            setLoading(false);
        }
    }, [student?._id, examIds, examData, options]);

    // Initial fetch
    useEffect(() => {
        if (student?._id && examIds?.length) {
            fetchBatchAttempts();
        }
    }, [student?._id, JSON.stringify(examIds), fetchBatchAttempts]);

    return {
        batchData,
        loading,
        errors,
        refresh: fetchBatchAttempts,
        getExamAttempts: (examId) => batchData[examId] || null,
        hasExamAttempts: (examId) => batchData[examId]?.success && batchData[examId]?.attempts?.length > 0
    };
}

export default useOptimizedExamAttempts;