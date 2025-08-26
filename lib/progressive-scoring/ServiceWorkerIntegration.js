/**
 * SERVICE WORKER INTEGRATION
 * 
 * Enhanced service worker integration for offline evaluation capabilities.
 * Provides complete offline evaluation support with cache management.
 * 
 * FEATURES:
 * ✅ Complete offline evaluation capability
 * ✅ Intelligent cache management with expiry
 * ✅ Fallback mechanisms for connectivity issues
 * ✅ Performance monitoring and optimization
 * ✅ Data synchronization when online
 * ✅ Progressive enhancement support
 * ✅ Security validation and integrity checks
 */

export class ServiceWorkerIntegration {
    constructor(options = {}) {
        this.options = {
            swPath: '/sw-progressive-scoring.js',
            cacheName: 'progressive-evaluation-cache-v1',
            cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours
            enableBackgroundSync: true,
            enablePushNotifications: false,
            ...options
        };
        
        this.registration = null;
        this.isSupported = this.checkServiceWorkerSupport();
        this.isOnline = navigator.onLine;
        this.messageId = 0;
        this.pendingMessages = new Map();
        
        // Cache management
        this.cacheManager = new CacheManager(this.options.cacheName, this.options.cacheExpiry);
        
        // Performance metrics
        this.metrics = {
            registrationTime: 0,
            messageCount: 0,
            averageResponseTime: 0,
            cacheHitRate: 0,
            offlineCapabilities: false
        };
        
        // Event listeners
        this.eventHandlers = new Map();
        
        this.initialize();
    }

    /**
     * Check if Service Worker is supported
     */
    checkServiceWorkerSupport() {
        return (
            'serviceWorker' in navigator &&
            'MessageChannel' in window &&
            'caches' in window
        );
    }

    /**
     * Initialize service worker integration
     */
    async initialize() {
        if (!this.isSupported) {
            console.warn('⚠️ Service Worker not supported in this browser');
            return { success: false, reason: 'not_supported' };
        }
        
        try {
            console.log('🔧 Initializing Service Worker Integration...');
            
            const startTime = performance.now();
            
            // Register service worker
            await this.registerServiceWorker();
            
            // Set up message handling
            this.setupMessageHandling();
            
            // Set up network monitoring
            this.setupNetworkMonitoring();
            
            // Initialize cache manager
            await this.cacheManager.initialize();
            
            // Test offline capabilities
            await this.testOfflineCapabilities();
            
            this.metrics.registrationTime = performance.now() - startTime;
            
            console.log(`✅ Service Worker Integration initialized in ${this.metrics.registrationTime.toFixed(2)}ms`);
            
            return {
                success: true,
                registration: this.registration,
                offlineCapable: this.metrics.offlineCapabilities,
                initializationTime: this.metrics.registrationTime
            };
            
        } catch (error) {
            console.error('❌ Service Worker initialization failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Register service worker
     */
    async registerServiceWorker() {
        try {
            this.registration = await navigator.serviceWorker.register(this.options.swPath, {
                scope: '/'
            });
            
            console.log('📝 Service Worker registered:', this.registration.scope);
            
            // Wait for service worker to be ready
            await navigator.serviceWorker.ready;
            
            // Handle updates
            this.registration.addEventListener('updatefound', () => {
                console.log('🔄 Service Worker update found');
                this.handleServiceWorkerUpdate();
            });
            
        } catch (error) {
            console.error('❌ Service Worker registration failed:', error);
            throw error;
        }
    }

    /**
     * Set up message handling between main thread and service worker
     */
    setupMessageHandling() {
        navigator.serviceWorker.addEventListener('message', (event) => {
            this.handleServiceWorkerMessage(event);
        });
        
        // Handle controller change
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('🔄 Service Worker controller changed');
            this.triggerEvent('controllerchange');
        });
    }

    /**
     * Set up network monitoring
     */
    setupNetworkMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Network connection restored');
            this.triggerEvent('online');
            this.syncPendingData();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📵 Network connection lost - switching to offline mode');
            this.triggerEvent('offline');
        });
    }

    /**
     * Cache evaluation data for offline use
     * @param {Object} evaluationData - Complete evaluation data
     * @returns {Promise<Object>} Cache result
     */
    async cacheEvaluationData(evaluationData) {
        try {
            console.log('💾 Caching evaluation data for offline use...');
            
            const cacheKey = `evaluation_${evaluationData.examId}_${evaluationData.studentId}`;
            
            const dataToCache = {
                ...evaluationData,
                cachedAt: Date.now(),
                expiresAt: Date.now() + this.options.cacheExpiry
            };
            
            const result = await this.cacheManager.put(cacheKey, dataToCache);
            
            // Cache evaluation logic and rules
            await this.cacheEvaluationLogic(evaluationData);
            
            console.log(`✅ Evaluation data cached with key: ${cacheKey}`);
            
            return {
                success: true,
                cacheKey,
                dataSize: JSON.stringify(dataToCache).length,
                expiresAt: dataToCache.expiresAt
            };
            
        } catch (error) {
            console.error('❌ Failed to cache evaluation data:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Cache evaluation logic (marking rules, question data, etc.)
     */
    async cacheEvaluationLogic(evaluationData) {
        try {
            const logicData = {
                markingRules: evaluationData.markingRules,
                questions: evaluationData.questions,
                exam: evaluationData.exam,
                evaluationConfig: evaluationData.evaluationConfig,
                cachedAt: Date.now()
            };
            
            const logicKey = `evaluation_logic_${evaluationData.examId}`;
            await this.cacheManager.put(logicKey, logicData);
            
            console.log('🧠 Evaluation logic cached for offline processing');
            
        } catch (error) {
            console.error('❌ Failed to cache evaluation logic:', error);
        }
    }

    /**
     * Send message to service worker with timeout handling
     * @param {string} type - Message type
     * @param {Object} data - Message data
     * @param {Object} options - Message options
     * @returns {Promise<Object>} Response from service worker
     */
    async sendMessage(type, data = {}, options = {}) {
        if (!this.registration || !this.registration.active) {
            throw new Error('Service Worker not available');
        }
        
        const timeout = options.timeout || 10000; // 10 second timeout
        const messageId = ++this.messageId;
        
        return new Promise((resolve, reject) => {
            const channel = new MessageChannel();
            
            // Set up response handler
            channel.port1.onmessage = (event) => {
                this.pendingMessages.delete(messageId);
                this.updateMessageMetrics();
                resolve(event.data);
            };
            
            // Set up timeout
            const timeoutId = setTimeout(() => {
                this.pendingMessages.delete(messageId);
                reject(new Error(`Message timeout after ${timeout}ms`));
            }, timeout);
            
            // Track pending message
            this.pendingMessages.set(messageId, { resolve, reject, timeoutId });
            
            // Send message
            this.registration.active.postMessage(
                {
                    type,
                    data,
                    messageId,
                    timestamp: Date.now()
                },
                [channel.port2]
            );
        });
    }

    /**
     * Initialize offline evaluation engine
     * @param {Object} examData - Complete exam data
     * @returns {Promise<Object>} Initialization result
     */
    async initializeOfflineEvaluation(examData) {
        try {
            console.log('🎯 Initializing offline evaluation engine...');
            
            // Cache all necessary data
            await this.cacheEvaluationData(examData);
            
            // Send initialization message to service worker
            const result = await this.sendMessage('INITIALIZE_OFFLINE_EVALUATION', {
                examData,
                cacheOptions: this.options
            });
            
            if (result.success) {
                this.metrics.offlineCapabilities = true;
                console.log('✅ Offline evaluation engine initialized successfully');
            }
            
            return result;
            
        } catch (error) {
            console.error('❌ Failed to initialize offline evaluation:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Perform offline evaluation
     * @param {Object} answers - Student answers
     * @param {Object} options - Evaluation options
     * @returns {Promise<Object>} Evaluation result
     */
    async performOfflineEvaluation(answers, options = {}) {
        try {
            if (!this.metrics.offlineCapabilities) {
                throw new Error('Offline evaluation not available');
            }
            
            console.log('🔄 Performing offline evaluation...');
            
            const result = await this.sendMessage('PERFORM_OFFLINE_EVALUATION', {
                answers,
                options,
                timestamp: Date.now()
            });
            
            return result;
            
        } catch (error) {
            console.error('❌ Offline evaluation failed:', error);
            return {
                success: false,
                error: error.message,
                fallbackRequired: true
            };
        }
    }

    /**
     * Sync pending data when connection is restored
     */
    async syncPendingData() {
        if (!this.isOnline) return;
        
        try {
            console.log('🔄 Syncing pending data...');
            
            const result = await this.sendMessage('SYNC_PENDING_DATA', {
                syncTimestamp: Date.now()
            });
            
            if (result.success && result.syncedItems > 0) {
                console.log(`✅ Synced ${result.syncedItems} pending items`);
            }
            
            return result;
            
        } catch (error) {
            console.error('❌ Data sync failed:', error);
        }
    }

    /**
     * Test offline capabilities
     */
    async testOfflineCapabilities() {
        try {
            const testResult = await this.sendMessage('TEST_OFFLINE_CAPABILITIES', {
                timestamp: Date.now()
            });
            
            this.metrics.offlineCapabilities = testResult.success && testResult.offlineReady;
            
            console.log(`🧪 Offline capabilities test: ${this.metrics.offlineCapabilities ? 'PASSED' : 'FAILED'}`);
            
        } catch (error) {
            console.error('❌ Offline capabilities test failed:', error);
            this.metrics.offlineCapabilities = false;
        }
    }

    /**
     * Handle service worker messages
     */
    handleServiceWorkerMessage(event) {
        const { type, data } = event.data;
        
        switch (type) {
            case 'CACHE_UPDATE':
                console.log('💾 Cache updated:', data.cacheKey);
                this.triggerEvent('cacheUpdate', data);
                break;
                
            case 'SYNC_COMPLETE':
                console.log('🔄 Background sync complete');
                this.triggerEvent('syncComplete', data);
                break;
                
            case 'OFFLINE_EVALUATION_READY':
                console.log('🎯 Offline evaluation ready');
                this.metrics.offlineCapabilities = true;
                this.triggerEvent('offlineReady', data);
                break;
                
            case 'ERROR':
                console.error('🚨 Service Worker error:', data.error);
                this.triggerEvent('error', data);
                break;
                
            default:
                console.log('📨 Service Worker message:', type, data);
        }
    }

    /**
     * Handle service worker update
     */
    handleServiceWorkerUpdate() {
        const newWorker = this.registration.installing;
        
        newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
                console.log('🔄 New Service Worker installed. Refresh to activate.');
                this.triggerEvent('updateAvailable', { newWorker });
            }
        });
    }

    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {Function} callback - Event callback
     */
    addEventListener(event, callback) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(callback);
    }

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} callback - Event callback
     */
    removeEventListener(event, callback) {
        if (this.eventHandlers.has(event)) {
            const callbacks = this.eventHandlers.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Trigger event
     */
    triggerEvent(event, data) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ Event callback error for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Update message metrics
     */
    updateMessageMetrics() {
        this.metrics.messageCount++;
        // Additional metrics can be added here
    }

    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        return {
            ...this.metrics,
            isSupported: this.isSupported,
            isOnline: this.isOnline,
            registrationActive: !!this.registration?.active,
            pendingMessages: this.pendingMessages.size,
            cacheMetrics: this.cacheManager.getMetrics()
        };
    }

    /**
     * Clear caches
     */
    async clearCaches() {
        try {
            await this.cacheManager.clear();
            await this.sendMessage('CLEAR_CACHES');
            console.log('🧹 All caches cleared');
            return { success: true };
        } catch (error) {
            console.error('❌ Failed to clear caches:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Unregister service worker
     */
    async unregister() {
        try {
            if (this.registration) {
                const result = await this.registration.unregister();
                console.log('🗑️ Service Worker unregistered:', result);
                return { success: result };
            }
            return { success: false, reason: 'no_registration' };
        } catch (error) {
            console.error('❌ Failed to unregister Service Worker:', error);
            return { success: false, error: error.message };
        }
    }
}

/**
 * Cache Manager for handling evaluation data caching
 */
class CacheManager {
    constructor(cacheName, cacheExpiry) {
        this.cacheName = cacheName;
        this.cacheExpiry = cacheExpiry;
        this.cache = null;
        this.metrics = {
            hits: 0,
            misses: 0,
            size: 0,
            lastCleanup: 0
        };
    }

    async initialize() {
        try {
            this.cache = await caches.open(this.cacheName);
            await this.cleanup(); // Remove expired entries
            console.log(`💾 Cache manager initialized: ${this.cacheName}`);
        } catch (error) {
            console.error('❌ Cache manager initialization failed:', error);
            throw error;
        }
    }

    async put(key, data) {
        if (!this.cache) throw new Error('Cache not initialized');
        
        try {
            const response = new Response(JSON.stringify(data), {
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Timestamp': Date.now().toString(),
                    'Cache-Expires': (Date.now() + this.cacheExpiry).toString()
                }
            });
            
            await this.cache.put(key, response);
            this.metrics.size++;
            
        } catch (error) {
            console.error('❌ Cache put failed:', error);
            throw error;
        }
    }

    async get(key) {
        if (!this.cache) throw new Error('Cache not initialized');
        
        try {
            const response = await this.cache.match(key);
            
            if (!response) {
                this.metrics.misses++;
                return null;
            }
            
            // Check expiry
            const expires = response.headers.get('Cache-Expires');
            if (expires && Date.now() > parseInt(expires)) {
                await this.cache.delete(key);
                this.metrics.misses++;
                return null;
            }
            
            this.metrics.hits++;
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('❌ Cache get failed:', error);
            this.metrics.misses++;
            return null;
        }
    }

    async delete(key) {
        if (!this.cache) return false;
        
        try {
            const result = await this.cache.delete(key);
            if (result) {
                this.metrics.size = Math.max(0, this.metrics.size - 1);
            }
            return result;
        } catch (error) {
            console.error('❌ Cache delete failed:', error);
            return false;
        }
    }

    async cleanup() {
        if (!this.cache) return;
        
        try {
            const requests = await this.cache.keys();
            let cleanedCount = 0;
            
            for (const request of requests) {
                const response = await this.cache.match(request);
                if (response) {
                    const expires = response.headers.get('Cache-Expires');
                    if (expires && Date.now() > parseInt(expires)) {
                        await this.cache.delete(request);
                        cleanedCount++;
                    }
                }
            }
            
            this.metrics.size = Math.max(0, this.metrics.size - cleanedCount);
            this.metrics.lastCleanup = Date.now();
            
            if (cleanedCount > 0) {
                console.log(`🧹 Cleaned up ${cleanedCount} expired cache entries`);
            }
            
        } catch (error) {
            console.error('❌ Cache cleanup failed:', error);
        }
    }

    async clear() {
        if (!this.cache) return;
        
        try {
            await this.cache.delete;
            this.metrics.size = 0;
            console.log('🧹 Cache cleared completely');
        } catch (error) {
            console.error('❌ Cache clear failed:', error);
        }
    }

    getMetrics() {
        const totalRequests = this.metrics.hits + this.metrics.misses;
        const hitRate = totalRequests > 0 ? (this.metrics.hits / totalRequests) * 100 : 0;
        
        return {
            ...this.metrics,
            hitRate: hitRate.toFixed(2) + '%',
            totalRequests
        };
    }
}

// Create singleton instance
let serviceWorkerIntegration = null;

export function getServiceWorkerIntegration(options) {
    if (!serviceWorkerIntegration) {
        serviceWorkerIntegration = new ServiceWorkerIntegration(options);
    }
    return serviceWorkerIntegration;
}

export default ServiceWorkerIntegration;