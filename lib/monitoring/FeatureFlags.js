"use client";

import monitoringService from './MonitoringService';

/**
 * Feature Flag System for Safe Rollouts During Refactoring
 * Allows toggling features on/off to safely deploy changes during the critical refactoring phase
 */

class FeatureFlagSystem {
  constructor() {
    this.flags = new Map();
    this.subscribers = new Map();
    this.flagHistory = [];
    this.isInitialized = false;
    
    // Default flags for exam portal safety
    this.defaultFlags = {
      // Database optimization flags
      'enhanced_database_queries': false,
      'database_connection_pooling': false,
      'query_caching_enabled': true,
      'n1_query_detection': true,
      'database_retry_logic': true,
      
      // Component enhancement flags
      'new_exam_interface': false,
      'enhanced_question_navigator': false,
      'improved_timer_component': false,
      'new_subject_tabs': false,
      'enhanced_answer_validation': false,
      
      // Performance optimization flags
      'component_lazy_loading': false,
      'memory_optimization': true,
      'render_performance_tracking': true,
      'bundle_size_optimization': false,
      
      // Timer and exam logic flags
      'new_timer_calculation': false,
      'enhanced_exam_validation': false,
      'improved_auto_save': true,
      'better_offline_support': false,
      
      // Monitoring and safety flags
      'comprehensive_logging': true,
      'error_boundary_enhanced': true,
      'performance_monitoring': true,
      'real_time_alerts': true,
      'automatic_error_recovery': false,
      
      // API and network flags
      'new_submission_endpoint': false,
      'enhanced_network_retry': true,
      'api_response_caching': false,
      'background_sync': false,
      
      // UI/UX improvement flags
      'dark_mode_support': false,
      'accessibility_enhancements': false,
      'mobile_optimizations': true,
      'touch_improvements': true,
      
      // Security enhancement flags
      'enhanced_session_validation': false,
      'stricter_timing_validation': false,
      'improved_fullscreen_detection': true,
      'better_cheat_detection': false,
      
      // Development and debugging flags
      'debug_mode': process.env.NODE_ENV === 'development',
      'verbose_logging': process.env.NODE_ENV === 'development',
      'performance_profiling': false,
      'feature_usage_tracking': true
    };
    
    // Flag configuration with metadata
    this.flagConfigs = {
      'enhanced_database_queries': {
        description: 'Enable optimized database queries to reduce N+1 problems',
        category: 'database',
        risk: 'high',
        rolloutPercentage: 0,
        dependencies: ['query_caching_enabled'],
        incompatibleWith: []
      },
      'new_exam_interface': {
        description: 'Enable the redesigned exam interface with improved UX',
        category: 'ui',
        risk: 'high',
        rolloutPercentage: 0,
        dependencies: ['enhanced_question_navigator'],
        incompatibleWith: []
      },
      'comprehensive_logging': {
        description: 'Enable detailed logging for all exam operations',
        category: 'monitoring',
        risk: 'low',
        rolloutPercentage: 100,
        dependencies: [],
        incompatibleWith: []
      },
      'real_time_alerts': {
        description: 'Enable real-time alerts for critical system issues',
        category: 'monitoring',
        risk: 'low',
        rolloutPercentage: 100,
        dependencies: ['comprehensive_logging'],
        incompatibleWith: []
      },
      'enhanced_network_retry': {
        description: 'Improved retry logic for network requests',
        category: 'network',
        risk: 'medium',
        rolloutPercentage: 50,
        dependencies: [],
        incompatibleWith: []
      }
    };
    
    this.init();
  }

  init() {
    if (this.isInitialized) return;
    
    try {
      // Load flags from localStorage
      this.loadFlags();
      
      // Set up remote flag fetching (if configured)
      this.setupRemoteFlagSync();
      
      // Initialize flag validation
      this.validateFlags();
      
      this.isInitialized = true;
      
      monitoringService.log('INFO', 'FeatureFlagSystem initialized', {
        totalFlags: this.flags.size,
        enabledFlags: Array.from(this.flags.entries()).filter(([key, value]) => value).length
      });
      
    } catch (error) {
      console.error('Failed to initialize FeatureFlagSystem:', error);
      monitoringService.captureError(error, 'SYSTEM', 'FeatureFlagSystem initialization failed');
      
      // Fallback to default flags
      this.loadDefaultFlags();
    }
  }

  loadFlags() {
    try {
      // Load from localStorage first
      const storedFlags = localStorage.getItem('vichar_feature_flags');
      const storedTimestamp = localStorage.getItem('vichar_feature_flags_timestamp');
      
      if (storedFlags) {
        const flags = JSON.parse(storedFlags);
        Object.entries(flags).forEach(([key, value]) => {
          this.flags.set(key, value);
        });
        
        // Check if flags are stale (older than 1 hour)
        const timestamp = storedTimestamp ? parseInt(storedTimestamp) : 0;
        const isStale = Date.now() - timestamp > 3600000; // 1 hour
        
        if (isStale) {
          monitoringService.log('WARN', 'Feature flags are stale, consider refreshing', {
            lastUpdated: new Date(timestamp).toISOString(),
            staleness: Date.now() - timestamp
          });
        }
      }
      
      // Load default flags for any missing ones
      Object.entries(this.defaultFlags).forEach(([key, value]) => {
        if (!this.flags.has(key)) {
          this.flags.set(key, value);
        }
      });
      
    } catch (error) {
      console.error('Error loading feature flags:', error);
      this.loadDefaultFlags();
    }
  }

  loadDefaultFlags() {
    Object.entries(this.defaultFlags).forEach(([key, value]) => {
      this.flags.set(key, value);
    });
    monitoringService.log('INFO', 'Loaded default feature flags');
  }

  saveFlags() {
    try {
      const flagsObject = Object.fromEntries(this.flags);
      localStorage.setItem('vichar_feature_flags', JSON.stringify(flagsObject));
      localStorage.setItem('vichar_feature_flags_timestamp', Date.now().toString());
    } catch (error) {
      console.error('Error saving feature flags:', error);
      monitoringService.captureError(error, 'SYSTEM', 'Failed to save feature flags');
    }
  }

  setupRemoteFlagSync() {
    // Set up periodic sync with server if API endpoint is available
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      this.remoteSyncInterval = setInterval(() => {
        this.syncWithRemote();
      }, 300000); // Every 5 minutes
    }
  }

  async syncWithRemote() {
    try {
      const response = await fetch('/api/monitoring/feature-flags', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const remoteFlags = await response.json();
        let hasChanges = false;
        
        Object.entries(remoteFlags).forEach(([key, value]) => {
          if (this.flags.get(key) !== value) {
            this.setFlag(key, value, 'remote_sync');
            hasChanges = true;
          }
        });
        
        if (hasChanges) {
          monitoringService.log('INFO', 'Feature flags updated from remote', {
            updatedFlags: Object.keys(remoteFlags)
          });
        }
      }
    } catch (error) {
      console.error('Error syncing feature flags from remote:', error);
      // Don't treat this as a critical error
    }
  }

  validateFlags() {
    const invalidFlags = [];
    
    // Check for dependency violations
    this.flags.forEach((enabled, flagName) => {
      if (enabled && this.flagConfigs[flagName]?.dependencies) {
        const dependencies = this.flagConfigs[flagName].dependencies;
        const missingDependencies = dependencies.filter(dep => !this.flags.get(dep));
        
        if (missingDependencies.length > 0) {
          invalidFlags.push({
            flag: flagName,
            issue: 'missing_dependencies',
            dependencies: missingDependencies
          });
        }
      }
    });
    
    // Check for incompatible flags
    this.flags.forEach((enabled, flagName) => {
      if (enabled && this.flagConfigs[flagName]?.incompatibleWith) {
        const incompatible = this.flagConfigs[flagName].incompatibleWith;
        const activeIncompatible = incompatible.filter(flag => this.flags.get(flag));
        
        if (activeIncompatible.length > 0) {
          invalidFlags.push({
            flag: flagName,
            issue: 'incompatible_flags',
            conflicts: activeIncompatible
          });
        }
      }
    });
    
    if (invalidFlags.length > 0) {
      monitoringService.alert('FEATURE_FLAG_VALIDATION_ERROR', 'Feature flag validation failed', {
        invalidFlags
      });
    }
  }

  // Core flag methods
  getFlag(flagName) {
    if (!this.flags.has(flagName)) {
      monitoringService.log('WARN', `Unknown feature flag requested: ${flagName}`);
      return false;
    }
    
    const value = this.flags.get(flagName);
    
    // Track flag usage
    if (this.getFlag('feature_usage_tracking')) {
      monitoringService.recordPerformanceMetric('feature_flag_usage', {
        flag: flagName,
        value,
        timestamp: Date.now()
      });
    }
    
    return value;
  }

  setFlag(flagName, value, source = 'manual') {
    const oldValue = this.flags.get(flagName);
    this.flags.set(flagName, value);
    
    // Record flag change
    const change = {
      flag: flagName,
      oldValue,
      newValue: value,
      source,
      timestamp: Date.now(),
      user: source === 'manual' ? 'admin' : source
    };
    
    this.flagHistory.push(change);
    
    // Limit history size
    if (this.flagHistory.length > 1000) {
      this.flagHistory.shift();
    }
    
    // Save to localStorage
    this.saveFlags();
    
    // Validate after change
    this.validateFlags();
    
    // Notify subscribers
    this.notifySubscribers(flagName, value, oldValue);
    
    // Log the change
    monitoringService.log('INFO', `Feature flag changed: ${flagName} = ${value}`, {
      previousValue: oldValue,
      source,
      config: this.flagConfigs[flagName]
    });
    
    return true;
  }

  toggleFlag(flagName) {
    const currentValue = this.getFlag(flagName);
    return this.setFlag(flagName, !currentValue, 'toggle');
  }

  // Batch operations
  setFlags(flagsObject, source = 'batch') {
    const changes = [];
    
    Object.entries(flagsObject).forEach(([flagName, value]) => {
      const oldValue = this.flags.get(flagName);
      if (oldValue !== value) {
        this.flags.set(flagName, value);
        changes.push({ flagName, oldValue, newValue: value });
      }
    });
    
    if (changes.length > 0) {
      // Record batch change
      this.flagHistory.push({
        type: 'batch_change',
        changes,
        source,
        timestamp: Date.now()
      });
      
      this.saveFlags();
      this.validateFlags();
      
      // Notify subscribers for each changed flag
      changes.forEach(({ flagName, newValue, oldValue }) => {
        this.notifySubscribers(flagName, newValue, oldValue);
      });
      
      monitoringService.log('INFO', `Batch feature flag update: ${changes.length} flags changed`, {
        changes: changes.map(c => `${c.flagName}: ${c.oldValue} -> ${c.newValue}`),
        source
      });
    }
    
    return changes.length;
  }

  // Conditional flag methods
  isFlagEnabled(flagName) {
    return this.getFlag(flagName) === true;
  }

  isFlagDisabled(flagName) {
    return this.getFlag(flagName) === false;
  }

  // Advanced flag queries
  getFlagsByCategory(category) {
    const categoryFlags = {};
    
    Object.entries(this.flagConfigs).forEach(([flagName, config]) => {
      if (config.category === category) {
        categoryFlags[flagName] = this.flags.get(flagName);
      }
    });
    
    return categoryFlags;
  }

  getEnabledFlags() {
    const enabled = {};
    this.flags.forEach((value, key) => {
      if (value) {
        enabled[key] = value;
      }
    });
    return enabled;
  }

  getDisabledFlags() {
    const disabled = {};
    this.flags.forEach((value, key) => {
      if (!value) {
        disabled[key] = value;
      }
    });
    return disabled;
  }

  // Rollout and gradual release
  isInRollout(flagName, userId = null) {
    const config = this.flagConfigs[flagName];
    if (!config) return this.getFlag(flagName);
    
    // If flag is fully enabled/disabled
    if (config.rolloutPercentage === 100) return this.getFlag(flagName);
    if (config.rolloutPercentage === 0) return false;
    
    // Determine if user is in rollout group
    const hash = userId ? this.hashString(userId) : this.hashString(navigator.userAgent);
    const userPercentile = hash % 100;
    
    return userPercentile < config.rolloutPercentage && this.getFlag(flagName);
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Subscription system
  subscribe(flagName, callback) {
    if (!this.subscribers.has(flagName)) {
      this.subscribers.set(flagName, new Set());
    }
    
    this.subscribers.get(flagName).add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.get(flagName)?.delete(callback);
    };
  }

  subscribeToAll(callback) {
    const flagName = '*'; // Special key for all flags
    if (!this.subscribers.has(flagName)) {
      this.subscribers.set(flagName, new Set());
    }
    
    this.subscribers.get(flagName).add(callback);
    
    return () => {
      this.subscribers.get(flagName)?.delete(callback);
    };
  }

  notifySubscribers(flagName, newValue, oldValue) {
    // Notify specific flag subscribers
    const flagSubscribers = this.subscribers.get(flagName);
    if (flagSubscribers) {
      flagSubscribers.forEach(callback => {
        try {
          callback(flagName, newValue, oldValue);
        } catch (error) {
          console.error('Error in feature flag subscriber callback:', error);
        }
      });
    }
    
    // Notify global subscribers
    const globalSubscribers = this.subscribers.get('*');
    if (globalSubscribers) {
      globalSubscribers.forEach(callback => {
        try {
          callback(flagName, newValue, oldValue);
        } catch (error) {
          console.error('Error in global feature flag subscriber callback:', error);
        }
      });
    }
  }

  // Utility methods
  getAllFlags() {
    return Object.fromEntries(this.flags);
  }

  getFlagConfig(flagName) {
    return this.flagConfigs[flagName] || null;
  }

  getFlagHistory(flagName = null) {
    if (flagName) {
      return this.flagHistory.filter(entry => 
        entry.flag === flagName || 
        (entry.changes && entry.changes.some(c => c.flagName === flagName))
      );
    }
    return [...this.flagHistory];
  }

  exportFlags() {
    return {
      flags: this.getAllFlags(),
      configs: this.flagConfigs,
      history: this.flagHistory,
      timestamp: Date.now(),
      version: '1.0.0'
    };
  }

  importFlags(data) {
    try {
      if (data.flags) {
        this.setFlags(data.flags, 'import');
      }
      
      if (data.configs) {
        Object.assign(this.flagConfigs, data.configs);
      }
      
      monitoringService.log('INFO', 'Feature flags imported successfully', {
        importedFlags: Object.keys(data.flags || {}),
        importedConfigs: Object.keys(data.configs || {})
      });
      
      return true;
    } catch (error) {
      monitoringService.captureError(error, 'SYSTEM', 'Failed to import feature flags');
      return false;
    }
  }

  reset() {
    this.flags.clear();
    this.loadDefaultFlags();
    this.saveFlags();
    
    monitoringService.log('INFO', 'Feature flags reset to defaults');
  }

  cleanup() {
    if (this.remoteSyncInterval) {
      clearInterval(this.remoteSyncInterval);
    }
    
    this.subscribers.clear();
  }
}

// React hook for using feature flags
export function useFeatureFlag(flagName) {
  const [flagValue, setFlagValue] = React.useState(() => 
    featureFlags.getFlag(flagName)
  );

  React.useEffect(() => {
    const unsubscribe = featureFlags.subscribe(flagName, (name, newValue) => {
      setFlagValue(newValue);
    });

    return unsubscribe;
  }, [flagName]);

  return flagValue;
}

// Higher-order component for feature flag gating
export function withFeatureFlag(flagName, fallbackComponent = null) {
  return function(WrappedComponent) {
    return function FeatureFlagComponent(props) {
      const isEnabled = useFeatureFlag(flagName);
      
      if (isEnabled) {
        return <WrappedComponent {...props} />;
      }
      
      return fallbackComponent ? fallbackComponent : null;
    };
  };
}

// Create singleton instance
const featureFlags = new FeatureFlagSystem();

export default featureFlags;
export { FeatureFlagSystem };