"use client"

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { examAttemptsManager } from '../lib/examAttemptsManager';

/**
 * ExamDataProvider - Centralized state management for exam attempts data
 * Prevents redundant API calls across components
 */

// Action types
const EXAM_DATA_ACTIONS = {
    SET_LOADING: 'SET_LOADING',
    SET_ATTEMPTS: 'SET_ATTEMPTS',
    SET_ERROR: 'SET_ERROR',
    CLEAR_ATTEMPTS: 'CLEAR_ATTEMPTS',
    INVALIDATE_CACHE: 'INVALIDATE_CACHE'
};

// Initial state
const initialState = {
    attempts: {}, // { examId: attemptsArray }
    loading: {}, // { examId: boolean }
    errors: {}, // { examId: errorMessage }
    lastUpdated: {} // { examId: timestamp }
};

// Reducer
function examDataReducer(state, action) {
    switch (action.type) {
        case EXAM_DATA_ACTIONS.SET_LOADING:
            return {
                ...state,
                loading: {
                    ...state.loading,
                    [action.examId]: action.isLoading
                },
                errors: {
                    ...state.errors,
                    [action.examId]: null
                }
            };

        case EXAM_DATA_ACTIONS.SET_ATTEMPTS:
            return {
                ...state,
                attempts: {
                    ...state.attempts,
                    [action.examId]: action.attempts
                },
                loading: {
                    ...state.loading,
                    [action.examId]: false
                },
                errors: {
                    ...state.errors,
                    [action.examId]: null
                },
                lastUpdated: {
                    ...state.lastUpdated,
                    [action.examId]: Date.now()
                }
            };

        case EXAM_DATA_ACTIONS.SET_ERROR:
            return {
                ...state,
                loading: {
                    ...state.loading,
                    [action.examId]: false
                },
                errors: {
                    ...state.errors,
                    [action.examId]: action.error
                }
            };

        case EXAM_DATA_ACTIONS.CLEAR_ATTEMPTS:
            const newState = { ...state };
            if (action.examId) {
                // Clear specific exam
                delete newState.attempts[action.examId];
                delete newState.loading[action.examId];
                delete newState.errors[action.examId];
                delete newState.lastUpdated[action.examId];
            } else {
                // Clear all
                newState.attempts = {};
                newState.loading = {};
                newState.errors = {};
                newState.lastUpdated = {};
            }
            return newState;

        case EXAM_DATA_ACTIONS.INVALIDATE_CACHE:
            if (action.examId) {
                examAttemptsManager.invalidateCache(action.studentId, action.examId);
            } else {
                examAttemptsManager.invalidateStudentCache(action.studentId);
            }
            return state;

        default:
            return state;
    }
}

// Create contexts
const ExamDataContext = createContext();
const ExamDataDispatchContext = createContext();

// Custom hook to use exam data context
export function useExamData() {
    const context = useContext(ExamDataContext);
    if (!context) {
        throw new Error('useExamData must be used within an ExamDataProvider');
    }
    return context;
}

// Custom hook to use exam data dispatch
export function useExamDataDispatch() {
    const dispatch = useContext(ExamDataDispatchContext);
    if (!dispatch) {
        throw new Error('useExamDataDispatch must be used within an ExamDataProvider');
    }
    return dispatch;
}

// Custom hook for exam attempts operations
export function useExamAttempts() {
    const state = useExamData();
    const dispatch = useExamDataDispatch();

    // Get attempts for a specific exam
    const getExamAttempts = useCallback(async (studentId, examId, forceRefresh = false) => {
        // Return cached data if available and not forcing refresh
        if (!forceRefresh && state.attempts[examId] && !state.loading[examId]) {
            return state.attempts[examId];
        }

        dispatch({ type: EXAM_DATA_ACTIONS.SET_LOADING, examId, isLoading: true });

        try {
            if (forceRefresh) {
                examAttemptsManager.invalidateCache(studentId, examId);
            }

            const attempts = await examAttemptsManager.getExamAttempts(studentId, examId);
            dispatch({ 
                type: EXAM_DATA_ACTIONS.SET_ATTEMPTS, 
                examId, 
                attempts 
            });
            return attempts;
        } catch (error) {
            dispatch({ 
                type: EXAM_DATA_ACTIONS.SET_ERROR, 
                examId, 
                error: error.message 
            });
            throw error;
        }
    }, [state.attempts, state.loading, dispatch]);

    // Batch get attempts for multiple exams
    const getBatchExamAttempts = useCallback(async (studentId, examIds, forceRefresh = false) => {
        const promises = examIds.map(examId => 
            getExamAttempts(studentId, examId, forceRefresh)
        );

        try {
            const results = await Promise.all(promises);
            return examIds.reduce((acc, examId, index) => {
                acc[examId] = results[index];
                return acc;
            }, {});
        } catch (error) {
            console.error('Failed to batch fetch exam attempts:', error);
            throw error;
        }
    }, [getExamAttempts]);

    // Preload attempts for multiple exams
    const preloadExamAttempts = useCallback((studentId, examIds) => {
        examIds.forEach(examId => {
            if (!state.attempts[examId] && !state.loading[examId]) {
                getExamAttempts(studentId, examId).catch(error => {
                    console.warn(`Failed to preload attempts for exam ${examId}:`, error);
                });
            }
        });
    }, [state.attempts, state.loading, getExamAttempts]);

    // Clear attempts data
    const clearExamAttempts = useCallback((examId = null) => {
        dispatch({ type: EXAM_DATA_ACTIONS.CLEAR_ATTEMPTS, examId });
    }, [dispatch]);

    // Invalidate cache
    const invalidateCache = useCallback((studentId, examId = null) => {
        dispatch({ 
            type: EXAM_DATA_ACTIONS.INVALIDATE_CACHE, 
            studentId, 
            examId 
        });
    }, [dispatch]);

    return {
        // State
        attempts: state.attempts,
        loading: state.loading,
        errors: state.errors,
        lastUpdated: state.lastUpdated,
        
        // Actions
        getExamAttempts,
        getBatchExamAttempts,
        preloadExamAttempts,
        clearExamAttempts,
        invalidateCache
    };
}

// Provider component
export function ExamDataProvider({ children }) {
    const [state, dispatch] = useReducer(examDataReducer, initialState);

    return (
        <ExamDataContext.Provider value={state}>
            <ExamDataDispatchContext.Provider value={dispatch}>
                {children}
            </ExamDataDispatchContext.Provider>
        </ExamDataContext.Provider>
    );
}

export default ExamDataProvider;