/**
 * ATOMIC SUBMISSION MANAGER
 * 
 * Eliminates race conditions between manual and auto-submit operations
 * by implementing atomic locking mechanisms with session-based tracking.
 * 
 * CORE FEATURES:
 * - Atomic submission locking with timeout mechanisms
 * - Session-based lock tracking to prevent conflicts
 * - Automatic lock release on browser refresh/network failures
 * - Comprehensive error handling and debugging
 * - Memory management and cleanup capabilities
 * 
 * PERFORMANCE CONSIDERATIONS:
 * - Optimized for minimal overhead during normal operations
 * - Fast lock acquisition/release cycles
 * - Efficient session storage management
 * - Non-blocking lock attempts with proper fallbacks
 */

// Lock timeout constants
const LOCK_TIMEOUT_MS = 30000; // 30 seconds maximum lock duration
const LOCK_HEARTBEAT_INTERVAL_MS = 5000; // 5 seconds heartbeat interval
const LOCK_CLEANUP_INTERVAL_MS = 60000; // 1 minute cleanup interval

// Lock states
const LOCK_STATES = {
    IDLE: 'idle',
    ACQUIRED: 'acquired',
    EXPIRED: 'expired',
    RELEASED: 'released'
};

// Submission types
const SUBMISSION_TYPES = {
    MANUAL: 'manual_submit',
    AUTO: 'auto_submit',
    EMERGENCY: 'emergency_submit'
};

/**
 * AtomicSubmissionManager Class
 * 
 * Manages atomic submission operations with session-based locking
 * to prevent race conditions between different submission triggers.
 */
class AtomicSubmissionManager {
    constructor() {
        this.lockData = null;
        this.heartbeatInterval = null;
        this.cleanupInterval = null;
        this.sessionId = this.generateSessionId();
        this.lockKey = 'exam_submission_lock';
        this.debugMode = process.env.NODE_ENV === 'development';
        
        // Initialize cleanup and monitoring
        this.initializeManager();
        
        if (this.debugMode) {
            console.log('🔒 AtomicSubmissionManager initialized with session:', this.sessionId);
        }
    }

    /**
     * Generate unique session ID for this browser instance
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Initialize manager with cleanup and monitoring
     */
    initializeManager() {
        // Clean up any expired locks on initialization
        this.cleanupExpiredLocks();
        
        // Set up periodic cleanup
        this.cleanupInterval = setInterval(() => {
            this.cleanupExpiredLocks();
        }, LOCK_CLEANUP_INTERVAL_MS);

        // Handle browser refresh/close cleanup
        this.setupBrowserEventListeners();
        
        if (this.debugMode) {
            console.log('🔧 AtomicSubmissionManager manager initialized');
        }
    }

    /**
     * Set up browser event listeners for cleanup
     */
    setupBrowserEventListeners() {
        // Clean up locks on page unload
        window.addEventListener('beforeunload', () => {
            this.forceReleaseLock();
        });

        // Clean up locks on visibility change (tab switch, etc.)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.lockData) {
                // Don't release immediately on tab switch, but reduce heartbeat
                this.adjustHeartbeatForVisibility();
            }
        });
    }

    /**
     * Adjust heartbeat timing based on page visibility
     */
    adjustHeartbeatForVisibility() {
        if (document.hidden && this.heartbeatInterval) {
            // Reduce heartbeat frequency when tab is hidden
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = setInterval(() => {
                this.updateLockHeartbeat();
            }, LOCK_HEARTBEAT_INTERVAL_MS * 2); // Double the interval
        } else if (!document.hidden && this.lockData) {
            // Restore normal heartbeat when tab becomes visible
            this.startHeartbeat();
        }
    }

    /**
     * Attempt to acquire submission lock atomically
     * 
     * @param {string} submissionType - Type of submission (manual/auto/emergency)
     * @param {Object} metadata - Additional metadata for the lock
     * @returns {Object} Lock acquisition result
     */
    async acquireLock(submissionType = SUBMISSION_TYPES.MANUAL, metadata = {}) {
        const startTime = Date.now();
        
        try {
            // Check if we already have a valid lock
            if (this.hasValidLock()) {
                if (this.debugMode) {
                    console.log('🔒 Already have valid lock, extending it');
                }
                
                // Extend the current lock
                this.extendLock(metadata);
                return {
                    success: true,
                    lockId: this.lockData.lockId,
                    message: 'Lock extended successfully',
                    alreadyAcquired: true,
                    acquisitionTime: Date.now() - startTime
                };
            }

            // Check for existing locks from other sessions/triggers
            const existingLock = this.getExistingLock();
            if (existingLock && this.isLockValid(existingLock)) {
                // Handle priority-based lock acquisition
                const canOverride = this.canOverrideLock(existingLock, submissionType);
                
                if (!canOverride) {
                    if (this.debugMode) {
                        console.warn('🚫 Cannot acquire lock, another submission in progress:', existingLock);
                    }
                    
                    return {
                        success: false,
                        error: 'LOCK_ALREADY_HELD',
                        message: `Another ${existingLock.submissionType} submission is in progress`,
                        existingLock: existingLock,
                        canRetry: true,
                        acquisitionTime: Date.now() - startTime
                    };
                }
            }

            // Acquire new lock
            const lockData = {
                lockId: this.generateLockId(),
                sessionId: this.sessionId,
                submissionType: submissionType,
                acquiredAt: Date.now(),
                expiresAt: Date.now() + LOCK_TIMEOUT_MS,
                lastHeartbeat: Date.now(),
                metadata: {
                    ...metadata,
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString()
                },
                state: LOCK_STATES.ACQUIRED
            };

            // Atomic lock storage
            this.storeLock(lockData);
            this.lockData = lockData;
            
            // Start heartbeat to keep lock alive
            this.startHeartbeat();
            
            const acquisitionTime = Date.now() - startTime;
            
            if (this.debugMode) {
                console.log(`🔐 Lock acquired successfully in ${acquisitionTime}ms:`, lockData);
            }

            return {
                success: true,
                lockId: lockData.lockId,
                message: 'Lock acquired successfully',
                alreadyAcquired: false,
                acquisitionTime: acquisitionTime
            };

        } catch (error) {
            console.error('❌ Error acquiring submission lock:', error);
            
            return {
                success: false,
                error: 'LOCK_ACQUISITION_FAILED',
                message: 'Failed to acquire submission lock',
                originalError: error.message,
                canRetry: true,
                acquisitionTime: Date.now() - startTime
            };
        }
    }

    /**
     * Release submission lock
     * 
     * @param {string} lockId - Optional lock ID to verify ownership
     * @returns {Object} Lock release result
     */
    async releaseLock(lockId = null) {
        const startTime = Date.now();
        
        try {
            if (!this.lockData) {
                if (this.debugMode) {
                    console.log('🔓 No lock to release');
                }
                
                return {
                    success: true,
                    message: 'No lock to release',
                    releaseTime: Date.now() - startTime
                };
            }

            // Verify lock ownership if lockId provided
            if (lockId && this.lockData.lockId !== lockId) {
                console.warn('🚫 Cannot release lock, ID mismatch:', lockId, this.lockData.lockId);
                
                return {
                    success: false,
                    error: 'LOCK_ID_MISMATCH',
                    message: 'Cannot release lock, invalid lock ID',
                    releaseTime: Date.now() - startTime
                };
            }

            // Stop heartbeat
            this.stopHeartbeat();

            // Mark lock as released
            this.lockData.state = LOCK_STATES.RELEASED;
            this.lockData.releasedAt = Date.now();

            // Remove from storage
            this.removeLockFromStorage();
            
            const releaseTime = Date.now() - startTime;
            
            if (this.debugMode) {
                console.log(`🔓 Lock released successfully in ${releaseTime}ms:`, this.lockData.lockId);
            }

            // Clear local lock data
            this.lockData = null;

            return {
                success: true,
                message: 'Lock released successfully',
                releaseTime: releaseTime
            };

        } catch (error) {
            console.error('❌ Error releasing submission lock:', error);
            
            return {
                success: false,
                error: 'LOCK_RELEASE_FAILED',
                message: 'Failed to release submission lock',
                originalError: error.message,
                releaseTime: Date.now() - startTime
            };
        }
    }

    /**
     * Check if current instance has a valid lock
     */
    hasValidLock() {
        if (!this.lockData) return false;
        
        // Check expiration
        if (Date.now() > this.lockData.expiresAt) {
            if (this.debugMode) {
                console.log('🕰️ Current lock has expired');
            }
            this.lockData = null;
            return false;
        }
        
        // Verify lock still exists in storage
        const storedLock = this.getExistingLock();
        if (!storedLock || storedLock.lockId !== this.lockData.lockId) {
            if (this.debugMode) {
                console.log('🔍 Current lock no longer exists in storage');
            }
            this.lockData = null;
            return false;
        }
        
        return true;
    }

    /**
     * Get current lock status
     */
    getLockStatus() {
        if (!this.lockData) {
            return {
                hasLock: false,
                state: LOCK_STATES.IDLE,
                remainingTime: 0
            };
        }

        const now = Date.now();
        const remainingTime = Math.max(0, this.lockData.expiresAt - now);
        
        return {
            hasLock: true,
            lockId: this.lockData.lockId,
            submissionType: this.lockData.submissionType,
            state: remainingTime > 0 ? LOCK_STATES.ACQUIRED : LOCK_STATES.EXPIRED,
            acquiredAt: this.lockData.acquiredAt,
            expiresAt: this.lockData.expiresAt,
            remainingTime: remainingTime,
            metadata: this.lockData.metadata
        };
    }

    /**
     * Force release lock (for emergency cleanup)
     */
    forceReleaseLock() {
        if (this.lockData) {
            if (this.debugMode) {
                console.log('🚨 Force releasing lock:', this.lockData.lockId);
            }
            
            this.stopHeartbeat();
            this.removeLockFromStorage();
            this.lockData = null;
        }
    }

    /**
     * Clean up expired locks
     */
    cleanupExpiredLocks() {
        try {
            const storedLock = this.getExistingLock();
            if (storedLock && !this.isLockValid(storedLock)) {
                if (this.debugMode) {
                    console.log('🧹 Cleaning up expired lock:', storedLock.lockId);
                }
                this.removeLockFromStorage();
            }
        } catch (error) {
            console.error('❌ Error during lock cleanup:', error);
        }
    }

    /**
     * Destroy manager and cleanup resources
     */
    destroy() {
        if (this.debugMode) {
            console.log('🗑️ Destroying AtomicSubmissionManager');
        }
        
        // Force release any held locks
        this.forceReleaseLock();
        
        // Clear intervals
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        
        // Remove event listeners
        window.removeEventListener('beforeunload', this.forceReleaseLock);
        document.removeEventListener('visibilitychange', this.adjustHeartbeatForVisibility);
    }

    // ========== PRIVATE METHODS ==========

    /**
     * Generate unique lock ID
     */
    generateLockId() {
        return `lock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get existing lock from storage
     */
    getExistingLock() {
        try {
            const lockJson = sessionStorage.getItem(this.lockKey);
            return lockJson ? JSON.parse(lockJson) : null;
        } catch (error) {
            console.error('❌ Error reading lock from storage:', error);
            return null;
        }
    }

    /**
     * Store lock in session storage
     */
    storeLock(lockData) {
        try {
            sessionStorage.setItem(this.lockKey, JSON.stringify(lockData));
        } catch (error) {
            console.error('❌ Error storing lock:', error);
            throw error;
        }
    }

    /**
     * Remove lock from storage
     */
    removeLockFromStorage() {
        try {
            sessionStorage.removeItem(this.lockKey);
        } catch (error) {
            console.error('❌ Error removing lock from storage:', error);
        }
    }

    /**
     * Check if lock is still valid
     */
    isLockValid(lock) {
        if (!lock) return false;
        
        const now = Date.now();
        
        // Check basic expiration
        if (now > lock.expiresAt) {
            return false;
        }
        
        // Check heartbeat (lock is considered dead if no heartbeat for 2x interval)
        if (now - lock.lastHeartbeat > LOCK_HEARTBEAT_INTERVAL_MS * 2) {
            return false;
        }
        
        return true;
    }

    /**
     * Check if current submission can override existing lock
     */
    canOverrideLock(existingLock, newSubmissionType) {
        // Emergency submissions can override any lock
        if (newSubmissionType === SUBMISSION_TYPES.EMERGENCY) {
            return true;
        }
        
        // Auto-submit can override manual if lock is about to expire
        if (newSubmissionType === SUBMISSION_TYPES.AUTO && 
            existingLock.submissionType === SUBMISSION_TYPES.MANUAL &&
            (existingLock.expiresAt - Date.now()) < 5000) { // Less than 5 seconds left
            return true;
        }
        
        // Otherwise, cannot override
        return false;
    }

    /**
     * Extend current lock
     */
    extendLock(metadata = {}) {
        if (this.lockData) {
            this.lockData.expiresAt = Date.now() + LOCK_TIMEOUT_MS;
            this.lockData.lastHeartbeat = Date.now();
            this.lockData.metadata = { ...this.lockData.metadata, ...metadata };
            this.storeLock(this.lockData);
        }
    }

    /**
     * Start heartbeat to keep lock alive
     */
    startHeartbeat() {
        this.stopHeartbeat(); // Ensure no duplicate intervals
        
        this.heartbeatInterval = setInterval(() => {
            this.updateLockHeartbeat();
        }, LOCK_HEARTBEAT_INTERVAL_MS);
    }

    /**
     * Stop heartbeat
     */
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    /**
     * Update lock heartbeat
     */
    updateLockHeartbeat() {
        if (this.lockData && this.hasValidLock()) {
            this.lockData.lastHeartbeat = Date.now();
            this.storeLock(this.lockData);
            
            if (this.debugMode) {
                console.log('💓 Lock heartbeat updated:', this.lockData.lockId);
            }
        }
    }
}

// Singleton instance for global use
let atomicSubmissionManagerInstance = null;

/**
 * Get singleton instance of AtomicSubmissionManager
 */
export function getAtomicSubmissionManager() {
    if (!atomicSubmissionManagerInstance) {
        atomicSubmissionManagerInstance = new AtomicSubmissionManager();
    }
    return atomicSubmissionManagerInstance;
}

/**
 * Destroy singleton instance (for cleanup)
 */
export function destroyAtomicSubmissionManager() {
    if (atomicSubmissionManagerInstance) {
        atomicSubmissionManagerInstance.destroy();
        atomicSubmissionManagerInstance = null;
    }
}

// Export constants for external use
export { LOCK_STATES, SUBMISSION_TYPES, AtomicSubmissionManager };

export default {
    getAtomicSubmissionManager,
    destroyAtomicSubmissionManager,
    LOCK_STATES,
    SUBMISSION_TYPES,
    AtomicSubmissionManager
};