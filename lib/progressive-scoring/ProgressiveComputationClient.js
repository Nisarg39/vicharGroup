/**
 * PROGRESSIVE COMPUTATION CLIENT API
 * 
 * Client-side interface for the Service Worker-based progressive scoring engine.
 * Provides seamless integration with ExamInterface without breaking React state.
 * 
 * FEATURES:
 * ✅ Non-blocking Service Worker communication
 * ✅ Real-time score updates (no React state conflicts)
 * ✅ Instant submission preparation (<10ms)
 * ✅ Automatic fallback to server computation
 * ✅ Zero data loss with comprehensive error handling
 * ✅ Performance monitoring and metrics
 */

class ProgressiveComputationClient {
  constructor() {
    this.serviceWorker = null;
    this.isInitialized = false;
    this.initializationPromise = null;
    this.messageId = 0;
    this.pendingMessages = new Map();
    
    // Performance tracking
    this.metrics = {
      initializationTime: 0,
      averageComputationTime: 0,
      totalComputations: 0,
      cacheHitRate: 0,
      fallbackCount: 0,
      errorCount: 0
    };
    
    // Configuration
    this.config = {
      maxRetries: 3,
      timeoutMs: 5000,
      fallbackEnabled: true,
      performanceLogging: true
    };
    
    // Event listeners for real-time updates
    this.eventListeners = new Map();
    
    this.initializeServiceWorker();
  }

  /**
   * Initialize Service Worker connection
   */
  async initializeServiceWorker() {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._performServiceWorkerInitialization();
    return this.initializationPromise;
  }

  async _performServiceWorkerInitialization() {
    try {
      console.log('🔧 Initializing Progressive Computation Client...');
      
      // Check if Service Worker is supported
      if (!('serviceWorker' in navigator)) {
        console.warn('⚠️ Service Worker not supported - falling back to server computation');
        return { success: false, reason: 'not_supported', fallback: true };
      }

      // Register Service Worker
      const registration = await navigator.serviceWorker.register('/sw-progressive-scoring.js', {
        scope: '/'
      });
      
      console.log('📝 Service Worker registered:', registration.scope);
      
      // Wait for Service Worker to be ready
      await navigator.serviceWorker.ready;
      
      // Get active Service Worker
      this.serviceWorker = registration.active || registration.installing || registration.waiting;
      
      if (!this.serviceWorker) {
        throw new Error('No active Service Worker found');
      }
      
      // Set up message listener
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));
      
      console.log('✅ Progressive Computation Client initialized successfully');
      return { success: true, registration };
      
    } catch (error) {
      console.error('❌ Service Worker initialization failed:', error);
      this.metrics.errorCount++;
      
      return { 
        success: false, 
        error: error.message, 
        fallback: true 
      };
    }
  }

  /**
   * Initialize progressive engine with exam data
   */
  async initializeEngine(examData) {
    const startTime = performance.now();
    
    try {
      console.log('🎯 Initializing Progressive Scoring Engine...');
      
      // Ensure Service Worker is ready
      const swResult = await this.initializeServiceWorker();
      if (!swResult.success) {
        console.warn('⚠️ Service Worker not available - using server-only computation');
        return { success: false, fallbackToServer: true, reason: swResult.reason };
      }

      // Prepare secure marking scheme data
      const engineData = await this.prepareEngineData(examData);
      
      // Send initialization message to Service Worker
      const result = await this.sendMessageToServiceWorker('INITIALIZE_ENGINE', engineData);
      
      if (result.success) {
        this.isInitialized = true;
        this.metrics.initializationTime = performance.now() - startTime;
        
        console.log(`✅ Progressive Engine initialized in ${this.metrics.initializationTime.toFixed(2)}ms`);
        console.log(`📊 Loaded ${engineData.questions.length} questions with marking rules`);
        
        // Start listening for real-time updates
        this.startListeningForUpdates();
        
        return {
          success: true,
          initializationTime: this.metrics.initializationTime,
          questionsLoaded: engineData.questions.length,
          engineVersion: result.engineVersion
        };
      } else {
        console.warn('⚠️ Engine initialization failed:', result.error);
        return { success: false, error: result.error, fallbackToServer: true };
      }
      
    } catch (error) {
      console.error('❌ Engine initialization error:', error);
      this.metrics.errorCount++;
      
      return { 
        success: false, 
        error: error.message, 
        fallbackToServer: true 
      };
    }
  }

  /**
   * Prepare engine data with secure marking schemes
   */
  async prepareEngineData(examData) {
    try {
      // Extract marking scheme from server response or generate from exam data
      const markingRules = await this.extractMarkingScheme(examData);
      
      return {
        examId: examData.exam._id,
        studentId: examData.student._id,
        exam: examData.exam, // FIXED: Pass complete exam object including totalMarks
        questions: examData.questions || [],
        markingRules: markingRules,
        
        // Security data
        securityData: {
          examId: examData.exam._id,
          timestamp: Date.now(),
          clientVersion: '1.2.0',
          schemeHash: examData.markingScheme?.metadata?.securityHash
        }
      };
      
    } catch (error) {
      console.error('❌ Error preparing engine data:', error);
      throw new Error('Failed to prepare engine data: ' + error.message);
    }
  }

  /**
   * Extract or build marking scheme from exam data
   */
  async extractMarkingScheme(examData) {
    try {
      // If server provides pre-computed marking scheme
      if (examData.markingScheme) {
        console.log('📋 Using server-provided marking scheme');
        return examData.markingScheme;
      }
      
      // Build marking scheme from exam and question data
      console.log('🔨 Building marking scheme from exam data');
      
      const scheme = {
        examId: examData.exam._id,
        stream: examData.exam.stream,
        standard: examData.exam.standard,
        
        // Default exam-wide rule
        examDefault: {
          positiveMarks: 4,
          negativeMarks: examData.exam.negativeMarks || 1,
          partialMarkingEnabled: false
        },
        
        // Type-based rules
        typeRules: {},
        
        // Subject-based rules
        subjectRules: {},
        
        // Subject + Type combinations
        subjectType: {},
        
        // Question-specific overrides (if any)
        questionSpecific: {}
      };
      
      // Build type-specific rules based on stream
      if (examData.exam.stream?.toLowerCase().includes('jee')) {
        scheme.typeRules = {
          'MCQ': { positiveMarks: 4, negativeMarks: 1, partialMarkingEnabled: false },
          'Numerical': { positiveMarks: 4, negativeMarks: 1, partialMarkingEnabled: false },
          'MCMA': { positiveMarks: 4, negativeMarks: 2, partialMarkingEnabled: true }
        };
      } else if (examData.exam.stream?.toLowerCase().includes('neet')) {
        scheme.typeRules = {
          'MCQ': { positiveMarks: 4, negativeMarks: 1, partialMarkingEnabled: false }
        };
      } else if (examData.exam.stream?.toLowerCase().includes('cet')) {
        // MHT-CET uses subject-based marking
        scheme.subjectRules = {
          'Physics': { positiveMarks: 1, negativeMarks: 0, partialMarkingEnabled: false },
          'Chemistry': { positiveMarks: 1, negativeMarks: 0, partialMarkingEnabled: false },
          'Mathematics': { positiveMarks: 2, negativeMarks: 0, partialMarkingEnabled: false },
          'Biology': { positiveMarks: 1, negativeMarks: 0, partialMarkingEnabled: false }
        };
      }
      
      // Add any question-specific marks from question objects
      if (examData.questions) {
        for (const question of examData.questions) {
          if (question.marks && question.marks !== 4) {
            scheme.questionSpecific[question._id] = {
              positiveMarks: question.marks,
              negativeMarks: examData.exam.negativeMarks || 1,
              partialMarkingEnabled: false,
              description: `Question-specific: ${question.marks} marks`
            };
          }
        }
      }
      
      console.log(`📊 Built marking scheme with ${Object.keys(scheme.questionSpecific).length} question-specific rules`);
      
      return scheme;
      
    } catch (error) {
      console.error('❌ Error building marking scheme:', error);
      
      // Return minimal fallback scheme
      return {
        examId: examData.exam._id,
        stream: examData.exam.stream,
        examDefault: {
          positiveMarks: 4,
          negativeMarks: examData.exam.negativeMarks || 1,
          partialMarkingEnabled: false
        }
      };
    }
  }

  /**
   * Update single answer and trigger progressive computation
   * Optimized for real-time computation without blocking
   */
  async updateAnswer(questionId, answer) {
    if (!this.isInitialized) {
      console.warn('⚠️ Progressive engine not initialized - skipping update');
      return { success: false, fallbackToServer: true };
    }
    
    const startTime = performance.now();
    
    try {
      const result = await this.sendMessageToServiceWorker('UPDATE_ANSWER', { 
        questionId, 
        answer,
        timestamp: Date.now()
      });
      
      if (result.success) {
        this.updateMetrics(performance.now() - startTime);
        
        // Trigger enhanced event listeners for real-time updates
        this.triggerEventListeners('scoreUpdate', {
          ...result.overallResults,
          timestamp: Date.now(),
          questionId: questionId,
          computationTime: performance.now() - startTime
        });
        
        return result;
      } else {
        console.warn('⚠️ Answer update failed:', result.error);
        this.metrics.fallbackCount++;
        return { success: false, fallbackToServer: true, error: result.error };
      }
      
    } catch (error) {
      console.error('❌ Answer update error:', error);
      this.metrics.errorCount++;
      return { success: false, fallbackToServer: true, error: error.message };
    }
  }

  /**
   * Update multiple answers efficiently (batch processing)
   * Optimized for direct storage preparation
   */
  async updateAnswers(answers) {
    if (!this.isInitialized) {
      console.warn('⚠️ Progressive engine not initialized - batch update skipped');
      return { success: false, fallbackToServer: true };
    }
    
    const startTime = performance.now();
    const results = [];
    let successCount = 0;
    
    try {
      // Process answers in parallel for better performance
      const updatePromises = Object.entries(answers).map(async ([questionId, answer]) => {
        try {
          const result = await this.updateAnswer(questionId, answer);
          if (result.success) successCount++;
          return { questionId, result };
        } catch (error) {
          return { 
            questionId, 
            result: { success: false, error: error.message, fallbackToServer: true }
          };
        }
      });
      
      const batchResults = await Promise.all(updatePromises);
      results.push(...batchResults);
      
      const totalTime = performance.now() - startTime;
      const allSuccessful = results.every(r => r.result.success);
      
      console.log(`📝 Batch update: ${successCount}/${results.length} answers processed in ${totalTime.toFixed(2)}ms`);
      
      return {
        success: allSuccessful,
        results: results,
        successCount: successCount,
        totalAnswers: results.length,
        batchProcessingTime: totalTime,
        fallbackToServer: results.some(r => r.result.fallbackToServer)
      };
      
    } catch (error) {
      console.error('❌ Batch answer update error:', error);
      this.metrics.errorCount++;
      return { 
        success: false, 
        fallbackToServer: true, 
        error: error.message,
        results: results
      };
    }
  }

  /**
   * Get current progressive results
   */
  async getProgressiveResults(includeAnalysis = false) {
    if (!this.isInitialized) {
      return { success: false, fallbackToServer: true };
    }
    
    try {
      const result = await this.sendMessageToServiceWorker('GET_PROGRESSIVE_RESULTS', { 
        includeAnalysis 
      });
      
      return result;
      
    } catch (error) {
      console.error('❌ Get progressive results error:', error);
      return { success: false, fallbackToServer: true, error: error.message };
    }
  }

  /**
   * Finalize computation and get COMPLETE ExamResult data for direct storage
   * Enhanced for 15ms direct storage submission target
   */
  async finalizeForSubmission(submissionMetadata) {
    if (!this.isInitialized) {
      console.warn('⚠️ Progressive engine not initialized - using server computation');
      return { success: false, fallbackToServer: true };
    }
    
    try {
      console.log('🏁 Finalizing computation for direct storage submission');
      
      const result = await this.sendMessageToServiceWorker('FINALIZE_COMPUTATION', {
        submissionMetadata
      });
      
      if (result.success && result.completeExamResultData) {
        console.log('✅ Complete ExamResult data ready for direct storage');
        console.log(`📊 Score: ${result.completeExamResultData.finalScore}/${result.completeExamResultData.totalMarks} (${result.completeExamResultData.percentage}%)`);
        console.log(`🔒 Computation hash: ${result.completeExamResultData.computationHash.substring(0, 16)}...`);
        console.log(`⚡ Direct storage ready: ${result.directStorageReady}`);
        
        return {
          success: true,
          completeExamResultData: result.completeExamResultData,
          finalizationTime: result.finalizationTime,
          isPreComputed: true,
          directStorageReady: result.directStorageReady,
          computationSource: 'progressive_engine_enhanced',
          dataStructure: 'complete_exam_result',
          validationLayers: result.securityValidation.validationLayers
        };
      } else {
        console.warn('⚠️ Complete ExamResult generation failed:', result.error);
        this.metrics.fallbackCount++;
        return { success: false, fallbackToServer: true, error: result.error };
      }
      
    } catch (error) {
      console.error('❌ Enhanced finalization error:', error);
      this.metrics.errorCount++;
      return { success: false, fallbackToServer: true, error: error.message };
    }
  }

  /**
   * Get engine status and performance metrics
   */
  async getEngineStatus() {
    if (!this.serviceWorker) {
      return { 
        isAvailable: false, 
        isInitialized: false, 
        reason: 'service_worker_not_available' 
      };
    }
    
    try {
      const result = await this.sendMessageToServiceWorker('GET_ENGINE_STATUS', {});
      
      return {
        isAvailable: true,
        isInitialized: result.isInitialized,
        engineVersion: result.engineVersion,
        lastComputed: result.lastComputed,
        serviceWorkerMetrics: result.metrics,
        clientMetrics: this.metrics
      };
      
    } catch (error) {
      console.error('❌ Engine status error:', error);
      return { 
        isAvailable: false, 
        isInitialized: false, 
        error: error.message 
      };
    }
  }

  /**
   * Clear engine data (for cleanup)
   */
  async clearEngine() {
    try {
      if (this.serviceWorker) {
        await this.sendMessageToServiceWorker('CLEAR_ENGINE', {});
      }
      
      this.isInitialized = false;
      this.pendingMessages.clear();
      this.eventListeners.clear();
      
      console.log('🧹 Progressive engine cleared');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Engine cleanup error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add event listener for real-time updates
   */
  addEventListener(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   */
  removeEventListener(event, callback) {
    if (this.eventListeners.has(event)) {
      const callbacks = this.eventListeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Send message to Service Worker with timeout and retry logic
   */
  async sendMessageToServiceWorker(type, data, options = {}) {
    const { 
      timeout = this.config.timeoutMs,
      retries = this.config.maxRetries
    } = options;
    
    let lastError = null;
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await this._sendSingleMessage(type, data, timeout);
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Message attempt ${attempt + 1} failed:`, error.message);
        
        if (attempt < retries - 1) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 100;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError || new Error('All retry attempts failed');
  }

  /**
   * Send single message to Service Worker
   */
  async _sendSingleMessage(type, data, timeout) {
    return new Promise((resolve, reject) => {
      const messageId = ++this.messageId;
      const channel = new MessageChannel();
      
      // Set up response handler
      channel.port1.onmessage = (event) => {
        this.pendingMessages.delete(messageId);
        resolve(event.data);
      };
      
      // Set up timeout
      const timeoutId = setTimeout(() => {
        this.pendingMessages.delete(messageId);
        reject(new Error(`Message timeout after ${timeout}ms`));
      }, timeout);
      
      // Track pending message
      this.pendingMessages.set(messageId, { resolve, reject, timeoutId });
      
      // Send message to Service Worker
      if (this.serviceWorker) {
        this.serviceWorker.postMessage(
          { type, data, messageId },
          [channel.port2]
        );
      } else {
        clearTimeout(timeoutId);
        this.pendingMessages.delete(messageId);
        reject(new Error('Service Worker not available'));
      }
    });
  }

  /**
   * Handle Service Worker messages
   */
  handleServiceWorkerMessage(event) {
    const { type, data } = event.data;
    
    switch (type) {
      case 'SCORE_UPDATED':
        // Handle real-time score updates
        this.triggerEventListeners('scoreUpdate', data);
        break;
        
      case 'ENGINE_ERROR':
        console.error('🚨 Service Worker engine error:', data.error);
        this.metrics.errorCount++;
        this.triggerEventListeners('error', data);
        break;
        
      case 'PERFORMANCE_UPDATE':
        if (this.config.performanceLogging) {
          console.log('📈 Engine performance:', data);
        }
        break;
        
      default:
        console.log('📨 Service Worker message:', type, data);
    }
  }

  /**
   * Start listening for real-time updates
   */
  startListeningForUpdates() {
    // Service Worker will automatically send updates via postMessage
    console.log('👂 Started listening for real-time score updates');
  }

  /**
   * Trigger event listeners
   */
  triggerEventListeners(event, data) {
    if (this.eventListeners.has(event)) {
      const callbacks = this.eventListeners.get(event);
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Event listener error for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Update performance metrics
   */
  updateMetrics(computationTime) {
    this.metrics.totalComputations++;
    this.metrics.averageComputationTime = 
      (this.metrics.averageComputationTime * (this.metrics.totalComputations - 1) + computationTime) 
      / this.metrics.totalComputations;
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    const fallbackRate = this.metrics.totalComputations > 0 ?
      (this.metrics.fallbackCount / this.metrics.totalComputations) * 100 : 0;
      
    const errorRate = this.metrics.totalComputations > 0 ?
      (this.metrics.errorCount / this.metrics.totalComputations) * 100 : 0;
    
    return {
      ...this.metrics,
      fallbackRate: fallbackRate.toFixed(2) + '%',
      errorRate: errorRate.toFixed(2) + '%',
      isInitialized: this.isInitialized,
      serviceWorkerAvailable: !!this.serviceWorker
    };
  }

  /**
   * Static method to check Service Worker support
   */
  static isSupported() {
    return 'serviceWorker' in navigator && 'MessageChannel' in window;
  }
}

// Create singleton instance
let progressiveComputationClient = null;

export function getProgressiveComputationClient() {
  if (!progressiveComputationClient) {
    progressiveComputationClient = new ProgressiveComputationClient();
  }
  return progressiveComputationClient;
}

export default ProgressiveComputationClient;

// Export static helper functions with enhanced direct storage support
export const ProgressiveComputation = {
  isSupported: ProgressiveComputationClient.isSupported,
  getClient: getProgressiveComputationClient,
  
  /**
   * Quick initialization helper with enhanced logging
   */
  async initialize(examData) {
    const client = getProgressiveComputationClient();
    const result = await client.initializeEngine(examData);
    
    if (result.success) {
      console.log(`🎯 Progressive computation initialized for direct storage`);
    }
    
    return result;
  },
  
  /**
   * Quick answer update helper with performance tracking
   */
  async updateAnswer(questionId, answer) {
    const client = getProgressiveComputationClient();
    return await client.updateAnswer(questionId, answer);
  },
  
  /**
   * Quick batch answers update helper
   */
  async updateAnswers(answers) {
    const client = getProgressiveComputationClient();
    return await client.updateAnswers(answers);
  },
  
  /**
   * Enhanced submission helper for direct storage
   */
  async finalizeForSubmission(submissionMetadata) {
    const client = getProgressiveComputationClient();
    const result = await client.finalizeForSubmission(submissionMetadata);
    
    if (result.success && result.directStorageReady) {
      console.log(`⚡ Complete ExamResult ready for 15ms direct storage submission`);
    }
    
    return result;
  },
  
  /**
   * Get comprehensive performance summary
   */
  async getPerformanceSummary() {
    const client = getProgressiveComputationClient();
    return client.getPerformanceSummary();
  },
  
  /**
   * Enhanced cleanup helper
   */
  async cleanup() {
    const client = getProgressiveComputationClient();
    const result = await client.clearEngine();
    console.log('🧹 Progressive computation client cleaned up for direct storage');
    return result;
  }
};