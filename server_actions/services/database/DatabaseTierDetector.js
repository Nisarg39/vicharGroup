/**
 * DATABASE TIER DETECTOR AND BATCH SIZE AUTO-SCALER
 * 
 * Automatically detects MongoDB Atlas cluster tier and adjusts batch processing
 * configuration for optimal performance. Eliminates need for manual adjustments
 * when upgrading database infrastructure.
 * 
 * Features:
 * - Automatic cluster tier detection via connection metadata
 * - Dynamic batch size configuration based on tier capabilities
 * - Performance monitoring and adjustment recommendations
 * - Hot-swappable configuration without deployment
 */

import mongoose from 'mongoose';
import { connectDB } from '../../config/mongoose.js';

class DatabaseTierDetector {
  constructor() {
    this.tierCapabilities = {
      // M10 Tier Configuration
      M10: {
        maxConnections: 1490,
        recommendedPoolSize: 400,
        batchSizes: {
          conservative: 50,
          moderate: 75,
          aggressive: 100
        },
        performanceProfile: 'burstable',
        storageType: 'standard',
        memoryTier: 'low'
      },
      
      // M20 Tier Configuration  
      M20: {
        maxConnections: 1490,
        recommendedPoolSize: 500,
        batchSizes: {
          conservative: 75,
          moderate: 125,
          aggressive: 150
        },
        performanceProfile: 'burstable',
        storageType: 'standard',
        memoryTier: 'low'
      },
      
      // M30 Tier Configuration
      M30: {
        maxConnections: 2000,
        recommendedPoolSize: 750,
        batchSizes: {
          conservative: 100,
          moderate: 175,
          aggressive: 250
        },
        performanceProfile: 'dedicated',
        storageType: 'standard',
        memoryTier: 'medium'
      },
      
      // M40 Tier Configuration
      M40: {
        maxConnections: 3000,
        recommendedPoolSize: 1000,
        batchSizes: {
          conservative: 150,
          moderate: 250,
          aggressive: 400
        },
        performanceProfile: 'dedicated',
        storageType: 'standard',
        memoryTier: 'medium'
      },
      
      // M50 Tier Configuration (Target upgrade)
      M50: {
        maxConnections: 4000,
        recommendedPoolSize: 1500,
        batchSizes: {
          conservative: 200,
          moderate: 350,
          aggressive: 500
        },
        performanceProfile: 'dedicated',
        storageType: 'nvme_ssd',
        memoryTier: 'high'
      },
      
      // M60+ Tier Configuration
      'M60+': {
        maxConnections: 6000,
        recommendedPoolSize: 2000,
        batchSizes: {
          conservative: 300,
          moderate: 500,
          aggressive: 750
        },
        performanceProfile: 'dedicated',
        storageType: 'nvme_ssd',
        memoryTier: 'high'
      }
    };
    
    this.detectionCache = {
      tier: null,
      lastDetected: null,
      capabilities: null,
      cacheValidityMs: 300000 // 5 minutes
    };
  }
  
  /**
   * Detect current MongoDB Atlas cluster tier
   */
  async detectClusterTier() {
    try {
      // Check cache first
      if (this.isCacheValid()) {
        return this.detectionCache;
      }
      
      console.log('🔍 Detecting MongoDB Atlas cluster tier...');
      
      await connectDB();
      const db = mongoose.connection.db;
      
      // Method 1: Check server status for instance information
      const serverStatus = await db.admin().serverStatus();
      const hostInfo = await db.admin().command({ hostInfo: 1 });
      
      // Method 2: Analyze connection limits by testing max pool size
      const connectionMetrics = await this.analyzeConnectionCapacity();
      
      // Method 3: Performance benchmarking to determine tier
      const performanceMetrics = await this.benchmarkPerformance();
      
      const detectedTier = this.determineTierFromMetrics(
        serverStatus,
        hostInfo,
        connectionMetrics,
        performanceMetrics
      );
      
      // Update cache
      this.detectionCache = {
        tier: detectedTier,
        lastDetected: new Date(),
        capabilities: this.tierCapabilities[detectedTier] || this.tierCapabilities.M10,
        serverInfo: {
          version: serverStatus.version,
          connections: serverStatus.connections,
          memory: hostInfo?.system?.memSizeMB || 'unknown'
        }
      };
      
      console.log('✅ Detected MongoDB Atlas tier:', {
        tier: detectedTier,
        maxConnections: this.detectionCache.capabilities.maxConnections,
        recommendedBatchSize: this.detectionCache.capabilities.batchSizes.moderate
      });
      
      return this.detectionCache;
      
    } catch (error) {
      console.error('❌ Failed to detect cluster tier:', error);
      
      // Fallback to M10 configuration for safety
      return this.getFallbackConfiguration();
    }
  }
  
  /**
   * Get optimal batch size based on detected tier and current performance
   */
  async getOptimalBatchSize(performanceProfile = 'moderate') {
    const tierInfo = await this.detectClusterTier();
    const capabilities = tierInfo.capabilities;
    
    // Base batch size from tier capabilities
    let batchSize = capabilities.batchSizes[performanceProfile] || capabilities.batchSizes.moderate;
    
    // Apply performance-based adjustments
    const performanceAdjustment = await this.getPerformanceAdjustment();
    batchSize = Math.floor(batchSize * performanceAdjustment);
    
    // Apply current system load factor
    const loadFactor = await this.getCurrentSystemLoad();
    batchSize = Math.floor(batchSize * loadFactor);
    
    // Ensure minimum and maximum bounds
    const minBatch = 20;
    const maxBatch = Math.floor(capabilities.maxConnections * 0.1); // Never exceed 10% of connections
    
    batchSize = Math.max(minBatch, Math.min(batchSize, maxBatch));
    
    console.log('📊 Optimal batch size calculated:', {
      tier: tierInfo.tier,
      baseBatchSize: capabilities.batchSizes[performanceProfile],
      performanceAdjustment,
      loadFactor,
      finalBatchSize: batchSize
    });
    
    return {
      batchSize,
      tier: tierInfo.tier,
      reasoning: {
        baseTier: capabilities.batchSizes[performanceProfile],
        performanceMultiplier: performanceAdjustment,
        loadMultiplier: loadFactor,
        bounds: { min: minBatch, max: maxBatch }
      }
    };
  }
  
  /**
   * Get recommended connection pool size for detected tier
   */
  async getOptimalConnectionPoolSize() {
    const tierInfo = await this.detectClusterTier();
    const capabilities = tierInfo.capabilities;
    
    // Calculate pool size based on tier and expected load
    const basePoolSize = capabilities.recommendedPoolSize;
    const loadAdjustment = await this.getCurrentSystemLoad();
    
    const poolSize = Math.floor(basePoolSize * loadAdjustment);
    const maxPoolSize = Math.floor(capabilities.maxConnections * 0.8); // Never exceed 80%
    
    return Math.min(poolSize, maxPoolSize);
  }
  
  /**
   * Analyze connection capacity to help determine tier
   */
  async analyzeConnectionCapacity() {
    try {
      const db = mongoose.connection.db;
      const serverStatus = await db.admin().serverStatus();
      
      return {
        current: serverStatus.connections?.current || 0,
        available: serverStatus.connections?.available || 0,
        totalCreated: serverStatus.connections?.totalCreated || 0
      };
      
    } catch (error) {
      console.error('Failed to analyze connection capacity:', error);
      return { current: 0, available: 1000, totalCreated: 0 };
    }
  }
  
  /**
   * Benchmark database performance to help determine tier
   */
  async benchmarkPerformance() {
    try {
      const startTime = Date.now();
      
      // Test simple operation performance
      const db = mongoose.connection.db;
      const testCollection = db.collection('tier_detection_test');
      
      // Insert test
      await testCollection.insertOne({ test: true, timestamp: new Date() });
      
      // Find test  
      await testCollection.findOne({ test: true });
      
      // Delete test
      await testCollection.deleteOne({ test: true });
      
      const operationTime = Date.now() - startTime;
      
      // Classify performance tier
      let performanceTier = 'standard';
      if (operationTime < 10) {
        performanceTier = 'high'; // Likely M50+ with NVMe
      } else if (operationTime < 25) {
        performanceTier = 'medium'; // Likely M30-M40
      }
      
      return {
        operationTimeMs: operationTime,
        performanceTier
      };
      
    } catch (error) {
      console.error('Performance benchmark failed:', error);
      return { operationTimeMs: 50, performanceTier: 'standard' };
    }
  }
  
  /**
   * Determine tier from collected metrics
   */
  determineTierFromMetrics(serverStatus, hostInfo, connectionMetrics, performanceMetrics) {
    const memoryMB = hostInfo?.system?.memSizeMB || 0;
    const availableConnections = connectionMetrics.available || 1000;
    const performanceTier = performanceMetrics.performanceTier;
    
    // Memory-based tier detection (primary method)
    if (memoryMB >= 32000) { // 32GB+
      return performanceTier === 'high' ? 'M60+' : 'M50';
    } else if (memoryMB >= 16000) { // 16GB
      return 'M40';
    } else if (memoryMB >= 8000) { // 8GB
      return 'M30';
    } else if (memoryMB >= 4000) { // 4GB
      return 'M20';
    } else {
      return 'M10';
    }
  }
  
  /**
   * Get performance-based adjustment factor
   */
  async getPerformanceAdjustment() {
    try {
      // Check recent submission performance metrics
      const recentPerformance = await this.getRecentPerformanceMetrics();
      
      if (recentPerformance.averageProcessingTime < 50) {
        return 1.2; // System performing well, can handle 20% more
      } else if (recentPerformance.averageProcessingTime > 200) {
        return 0.8; // System struggling, reduce by 20%
      }
      
      return 1.0; // Normal performance
      
    } catch (error) {
      return 1.0;
    }
  }
  
  /**
   * Get current system load factor
   */
  async getCurrentSystemLoad() {
    try {
      // Check current queue depth and processing metrics
      const db = mongoose.connection.db;
      const queueCollection = db.collection('examsubmissionqueues');
      
      const queuedCount = await queueCollection.countDocuments({ status: 'queued' });
      const processingCount = await queueCollection.countDocuments({ status: 'processing' });
      
      const totalLoad = queuedCount + processingCount;
      
      if (totalLoad < 50) {
        return 1.1; // Low load, can increase batch size
      } else if (totalLoad > 200) {
        return 0.9; // High load, decrease batch size
      }
      
      return 1.0;
      
    } catch (error) {
      return 1.0;
    }
  }
  
  /**
   * Get recent performance metrics for adjustment calculations
   */
  async getRecentPerformanceMetrics() {
    // Mock implementation - replace with actual performance monitoring
    return {
      averageProcessingTime: 125,
      successRate: 98.5,
      errorRate: 1.5
    };
  }
  
  /**
   * Check if detection cache is still valid
   */
  isCacheValid() {
    if (!this.detectionCache.lastDetected) return false;
    
    const cacheAge = Date.now() - this.detectionCache.lastDetected.getTime();
    return cacheAge < this.detectionCache.cacheValidityMs;
  }
  
  /**
   * Get fallback configuration when detection fails
   */
  getFallbackConfiguration() {
    return {
      tier: 'M10',
      capabilities: this.tierCapabilities.M10,
      lastDetected: new Date(),
      fallback: true
    };
  }
  
  /**
   * Generate configuration recommendations for upgrade paths
   */
  async generateUpgradeRecommendations() {
    const currentTier = await this.detectClusterTier();
    const recommendations = [];
    
    if (currentTier.tier === 'M10') {
      recommendations.push({
        upgrade: 'M50',
        benefits: [
          '4x higher connection limit (4,000 vs 1,490)',
          '2.5x higher batch processing (350 vs 75 submissions)',
          'NVMe SSD storage for 3x faster I/O',
          'Dedicated performance (no CPU throttling)',
          'Production-grade reliability and scaling'
        ],
        costImpact: 'Higher monthly cost but significantly better performance',
        automationBenefit: 'Automatic batch size scaling from 75 to 350 submissions'
      });
    }
    
    return recommendations;
  }
}

// Singleton instance
const databaseTierDetector = new DatabaseTierDetector();

export default databaseTierDetector;

/**
 * Utility functions for easy integration
 */

export async function getAutoScaledBatchSize(performanceProfile = 'moderate') {
  const result = await databaseTierDetector.getOptimalBatchSize(performanceProfile);
  return result.batchSize;
}

export async function getAutoScaledConnectionPool() {
  return await databaseTierDetector.getOptimalConnectionPoolSize();
}

export async function getCurrentDatabaseTier() {
  const tierInfo = await databaseTierDetector.detectClusterTier();
  return tierInfo.tier;
}

export async function shouldUpgradeDatabase() {
  const recommendations = await databaseTierDetector.generateUpgradeRecommendations();
  return recommendations.length > 0 ? recommendations[0] : null;
}