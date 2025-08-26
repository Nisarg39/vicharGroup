/**
 * MARKING RULE RESOLVER
 * 
 * Implements 8-level hierarchical rule resolution identical to server-side logic.
 * Provides <1ms rule resolution per question with comprehensive caching.
 * 
 * HIERARCHY LEVELS (Priority Order):
 * 1. Question-specific rules (highest priority)
 * 2. Question Type + Subject + Stream combination
 * 3. Subject + Stream combination
 * 4. Question Type + Stream combination
 * 5. Stream-specific defaults
 * 6. Question Type defaults
 * 7. Subject defaults
 * 8. Global defaults (lowest priority)
 * 
 * FEATURES:
 * ✅ 8-level hierarchical resolution matching server exactly
 * ✅ Stream-specific optimizations (JEE, NEET, MHT-CET)
 * ✅ <1ms resolution time per question
 * ✅ Efficient caching and lookup
 * ✅ Rule validation and fallbacks
 * ✅ 100% server compatibility
 */

export class MarkingRuleResolver {
    constructor(options = {}) {
        this.stream = options.stream || 'default';
        this.standard = options.standard || '12';
        this.examId = options.examId || 'unknown';
        this.enableCaching = options.enableCaching !== false;
        this.performanceTarget = options.performanceTarget || 1; // <1ms target
        
        // Rule cache for performance
        this.ruleCache = new Map();
        this.hierarchyCache = new Map();
        
        // Performance metrics
        this.metrics = {
            totalResolutions: 0,
            cacheHits: 0,
            averageResolutionTime: 0,
            resolutionTimes: []
        };
        
        // Initialize rule hierarchy
        this.initializeRuleHierarchy();
    }

    /**
     * Initialize the complete rule hierarchy matching server logic
     */
    initializeRuleHierarchy() {
        this.ruleHierarchy = {
            // Level 8: Global defaults (lowest priority)
            globalDefaults: {
                positiveMarks: 4,
                negativeMarks: 1,
                partialMarkingEnabled: false,
                description: 'Global default marking scheme'
            },
            
            // Level 7: Subject defaults
            subjectDefaults: {
                'Physics': {
                    positiveMarks: 4,
                    negativeMarks: 1,
                    partialMarkingEnabled: false,
                    description: 'Physics subject default'
                },
                'Chemistry': {
                    positiveMarks: 4,
                    negativeMarks: 1,
                    partialMarkingEnabled: false,
                    description: 'Chemistry subject default'
                },
                'Mathematics': {
                    positiveMarks: 4,
                    negativeMarks: 1,
                    partialMarkingEnabled: false,
                    description: 'Mathematics subject default'
                },
                'Biology': {
                    positiveMarks: 4,
                    negativeMarks: 1,
                    partialMarkingEnabled: false,
                    description: 'Biology subject default'
                }
            },
            
            // Level 6: Question Type defaults
            questionTypeDefaults: {
                'MCQ': {
                    positiveMarks: 4,
                    negativeMarks: 1,
                    partialMarkingEnabled: false,
                    description: 'Multiple Choice Question default'
                },
                'MCMA': {
                    positiveMarks: 4,
                    negativeMarks: 2,
                    partialMarkingEnabled: true,
                    partialMarkingRules: {
                        allCorrect: 4,
                        oneOrMoreCorrect: 1,
                        anyIncorrect: -2,
                        noneSelected: 0
                    },
                    description: 'Multiple Choice Multiple Answer default'
                },
                'Numerical': {
                    positiveMarks: 4,
                    negativeMarks: 1,
                    partialMarkingEnabled: false,
                    numericalTolerance: {
                        enabled: true,
                        tolerance: 0.01,
                        toleranceType: 'absolute'
                    },
                    description: 'Numerical Answer default'
                },
                'Integer': {
                    positiveMarks: 4,
                    negativeMarks: 1,
                    partialMarkingEnabled: false,
                    description: 'Integer Answer default'
                },
                'Text': {
                    positiveMarks: 4,
                    negativeMarks: 0,
                    partialMarkingEnabled: false,
                    caseSensitive: false,
                    description: 'Text Answer default'
                }
            },
            
            // Level 5: Stream-specific defaults
            streamDefaults: this.getStreamDefaults(),
            
            // Level 4: Question Type + Stream combinations
            questionTypeStream: this.getQuestionTypeStreamRules(),
            
            // Level 3: Subject + Stream combinations
            subjectStream: this.getSubjectStreamRules(),
            
            // Level 2: Question Type + Subject + Stream combinations
            questionTypeSubjectStream: this.getQuestionTypeSubjectStreamRules(),
            
            // Level 1: Question-specific rules (highest priority)
            questionSpecific: new Map() // Will be populated with actual question rules
        };
    }

    /**
     * Get stream-specific default rules
     */
    getStreamDefaults() {
        return {
            'JEE': {
                positiveMarks: 4,
                negativeMarks: 1,
                partialMarkingEnabled: false,
                description: 'JEE Main/Advanced default scheme',
                specialRules: {
                    mcmaEnabled: true,
                    numericalPrecision: 'high'
                }
            },
            'JEE_MAIN': {
                positiveMarks: 4,
                negativeMarks: 1,
                partialMarkingEnabled: false,
                description: 'JEE Main specific scheme'
            },
            'JEE_ADVANCED': {
                positiveMarks: 4,
                negativeMarks: 1,
                partialMarkingEnabled: true,
                description: 'JEE Advanced with partial marking',
                specialRules: {
                    mcmaPartialMarking: true
                }
            },
            'NEET': {
                positiveMarks: 4,
                negativeMarks: 1,
                partialMarkingEnabled: false,
                description: 'NEET UG default scheme',
                specialRules: {
                    onlyMCQ: true
                }
            },
            'MHT-CET': {
                positiveMarks: 1, // MHT-CET uses different marking
                negativeMarks: 0,
                partialMarkingEnabled: false,
                description: 'MHT-CET default scheme',
                specialRules: {
                    subjectSpecificMarks: true
                }
            },
            'CBSE': {
                positiveMarks: 4,
                negativeMarks: 1,
                partialMarkingEnabled: false,
                description: 'CBSE board exam scheme'
            }
        };
    }

    /**
     * Get question type + stream specific rules
     */
    getQuestionTypeStreamRules() {
        return {
            'MCMA_JEE_ADVANCED': {
                positiveMarks: 4,
                negativeMarks: 2,
                partialMarkingEnabled: true,
                partialMarkingRules: {
                    allCorrect: 4,
                    oneOrMoreCorrect: 1,
                    anyIncorrect: -2,
                    noneSelected: 0
                },
                description: 'JEE Advanced MCMA with complex partial marking'
            },
            'Numerical_JEE': {
                positiveMarks: 4,
                negativeMarks: 1,
                partialMarkingEnabled: false,
                numericalTolerance: {
                    enabled: true,
                    tolerance: 0.01,
                    toleranceType: 'absolute'
                },
                description: 'JEE Numerical with high precision'
            },
            'MCQ_MHT-CET': {
                positiveMarks: 1,
                negativeMarks: 0,
                partialMarkingEnabled: false,
                description: 'MHT-CET MCQ (no negative marking)'
            }
        };
    }

    /**
     * Get subject + stream specific rules
     */
    getSubjectStreamRules() {
        return {
            'Physics_JEE': {
                positiveMarks: 4,
                negativeMarks: 1,
                partialMarkingEnabled: false,
                numericalTolerance: {
                    enabled: true,
                    tolerance: 0.02, // Physics calculations may have slight variations
                    toleranceType: 'percentage'
                },
                description: 'JEE Physics with tolerance for calculations'
            },
            'Chemistry_JEE': {
                positiveMarks: 4,
                negativeMarks: 1,
                partialMarkingEnabled: false,
                numericalTolerance: {
                    enabled: true,
                    tolerance: 0.01,
                    toleranceType: 'absolute'
                },
                description: 'JEE Chemistry with high precision'
            },
            'Mathematics_JEE': {
                positiveMarks: 4,
                negativeMarks: 1,
                partialMarkingEnabled: false,
                numericalTolerance: {
                    enabled: true,
                    tolerance: 0.001,
                    toleranceType: 'absolute'
                },
                description: 'JEE Mathematics with very high precision'
            },
            'Physics_MHT-CET': {
                positiveMarks: 1,
                negativeMarks: 0,
                partialMarkingEnabled: false,
                description: 'MHT-CET Physics (1 mark, no negative)'
            },
            'Chemistry_MHT-CET': {
                positiveMarks: 1,
                negativeMarks: 0,
                partialMarkingEnabled: false,
                description: 'MHT-CET Chemistry (1 mark, no negative)'
            },
            'Mathematics_MHT-CET': {
                positiveMarks: 2,
                negativeMarks: 0,
                partialMarkingEnabled: false,
                description: 'MHT-CET Mathematics (2 marks, no negative)'
            },
            'Biology_MHT-CET': {
                positiveMarks: 1,
                negativeMarks: 0,
                partialMarkingEnabled: false,
                description: 'MHT-CET Biology (1 mark, no negative)'
            }
        };
    }

    /**
     * Get question type + subject + stream specific rules
     */
    getQuestionTypeSubjectStreamRules() {
        return {
            'Numerical_Physics_JEE': {
                positiveMarks: 4,
                negativeMarks: 1,
                partialMarkingEnabled: false,
                numericalTolerance: {
                    enabled: true,
                    tolerance: 2, // 2% tolerance for complex physics calculations
                    toleranceType: 'percentage'
                },
                description: 'JEE Physics Numerical with calculation tolerance'
            },
            'Numerical_Chemistry_JEE': {
                positiveMarks: 4,
                negativeMarks: 1,
                partialMarkingEnabled: false,
                numericalTolerance: {
                    enabled: true,
                    tolerance: 0.01,
                    toleranceType: 'absolute'
                },
                description: 'JEE Chemistry Numerical with high precision'
            },
            'Numerical_Mathematics_JEE': {
                positiveMarks: 4,
                negativeMarks: 1,
                partialMarkingEnabled: false,
                numericalTolerance: {
                    enabled: true,
                    tolerance: 0.001,
                    toleranceType: 'absolute'
                },
                description: 'JEE Mathematics Numerical with very high precision'
            },
            'MCMA_Physics_JEE_ADVANCED': {
                positiveMarks: 4,
                negativeMarks: 2,
                partialMarkingEnabled: true,
                partialMarkingRules: {
                    allCorrect: 4,
                    oneOrMoreCorrect: 1,
                    anyIncorrect: -2,
                    noneSelected: 0
                },
                description: 'JEE Advanced Physics MCMA with complex partial marking'
            }
        };
    }

    /**
     * Resolve marking rule for a question using 8-level hierarchy
     * @param {Object} question - Question object with subject, type, etc.
     * @returns {Object} Resolved marking rule
     */
    async resolveMarkingRule(question) {
        const startTime = performance.now();
        
        try {
            // Generate cache key
            const cacheKey = this.generateCacheKey(question);
            
            // Check cache first for performance
            if (this.enableCaching && this.ruleCache.has(cacheKey)) {
                this.metrics.cacheHits++;
                const cached = this.ruleCache.get(cacheKey);
                this.recordResolutionTime(performance.now() - startTime, true);
                return cached.rule;
            }
            
            // Resolve rule using hierarchy
            const resolvedRule = this.resolveRuleFromHierarchy(question);
            
            // Cache the result
            if (this.enableCaching) {
                this.ruleCache.set(cacheKey, {
                    rule: resolvedRule,
                    timestamp: Date.now(),
                    ttl: 300000 // 5 minutes
                });
            }
            
            const resolutionTime = performance.now() - startTime;
            this.recordResolutionTime(resolutionTime, false);
            
            // Check performance target
            if (resolutionTime > this.performanceTarget) {
                console.warn(`⚠️ Rule resolution exceeded target: ${resolutionTime.toFixed(3)}ms > ${this.performanceTarget}ms`);
            }
            
            return resolvedRule;
            
        } catch (error) {
            console.error('❌ Rule resolution failed:', error);
            
            // Return safe fallback
            this.recordResolutionTime(performance.now() - startTime, false);
            return this.getSafeDefaultRule();
        }
    }

    /**
     * Resolve rule from hierarchy following exact server logic
     */
    resolveRuleFromHierarchy(question) {
        const questionId = question._id || question.id;
        const subject = this.normalizeSubject(question.subject);
        const questionType = this.normalizeQuestionType(question.type || question.questionType);
        const stream = this.normalizeStream(this.stream);
        
        // Start with global defaults (Level 8)
        let rule = { ...this.ruleHierarchy.globalDefaults };
        let resolutionLevel = 8;
        let resolutionPath = ['global_defaults'];
        
        // Level 7: Subject defaults
        if (subject && this.ruleHierarchy.subjectDefaults[subject]) {
            rule = { ...rule, ...this.ruleHierarchy.subjectDefaults[subject] };
            resolutionLevel = 7;
            resolutionPath.push(`subject_defaults_${subject}`);
        }
        
        // Level 6: Question Type defaults
        if (questionType && this.ruleHierarchy.questionTypeDefaults[questionType]) {
            rule = { ...rule, ...this.ruleHierarchy.questionTypeDefaults[questionType] };
            resolutionLevel = 6;
            resolutionPath.push(`question_type_defaults_${questionType}`);
        }
        
        // Level 5: Stream defaults
        if (stream && this.ruleHierarchy.streamDefaults[stream]) {
            rule = { ...rule, ...this.ruleHierarchy.streamDefaults[stream] };
            resolutionLevel = 5;
            resolutionPath.push(`stream_defaults_${stream}`);
        }
        
        // Level 4: Question Type + Stream combination
        const questionTypeStreamKey = `${questionType}_${stream}`;
        if (this.ruleHierarchy.questionTypeStream[questionTypeStreamKey]) {
            rule = { ...rule, ...this.ruleHierarchy.questionTypeStream[questionTypeStreamKey] };
            resolutionLevel = 4;
            resolutionPath.push(`question_type_stream_${questionTypeStreamKey}`);
        }
        
        // Level 3: Subject + Stream combination
        const subjectStreamKey = `${subject}_${stream}`;
        if (this.ruleHierarchy.subjectStream[subjectStreamKey]) {
            rule = { ...rule, ...this.ruleHierarchy.subjectStream[subjectStreamKey] };
            resolutionLevel = 3;
            resolutionPath.push(`subject_stream_${subjectStreamKey}`);
        }
        
        // Level 2: Question Type + Subject + Stream combination
        const questionTypeSubjectStreamKey = `${questionType}_${subject}_${stream}`;
        if (this.ruleHierarchy.questionTypeSubjectStream[questionTypeSubjectStreamKey]) {
            rule = { ...rule, ...this.ruleHierarchy.questionTypeSubjectStream[questionTypeSubjectStreamKey] };
            resolutionLevel = 2;
            resolutionPath.push(`question_type_subject_stream_${questionTypeSubjectStreamKey}`);
        }
        
        // Level 1: Question-specific rules (highest priority)
        if (questionId && this.ruleHierarchy.questionSpecific.has(questionId)) {
            rule = { ...rule, ...this.ruleHierarchy.questionSpecific.get(questionId) };
            resolutionLevel = 1;
            resolutionPath.push(`question_specific_${questionId}`);
        }
        
        // Add metadata for debugging and validation
        rule._metadata = {
            questionId,
            subject,
            questionType,
            stream,
            resolutionLevel,
            resolutionPath,
            timestamp: Date.now(),
            examId: this.examId,
            resolverVersion: '1.0.0'
        };
        
        // Validate resolved rule
        this.validateResolvedRule(rule);
        
        return rule;
    }

    /**
     * Generate cache key for rule caching
     */
    generateCacheKey(question) {
        const questionId = question._id || question.id || 'unknown';
        const subject = this.normalizeSubject(question.subject);
        const questionType = this.normalizeQuestionType(question.type || question.questionType);
        
        return `${this.stream}_${subject}_${questionType}_${questionId}`;
    }

    /**
     * Normalize subject name for consistent matching
     */
    normalizeSubject(subject) {
        if (!subject) return 'Unknown';
        
        const normalized = subject.trim();
        
        // Handle common variations
        const subjectMap = {
            'Phy': 'Physics',
            'Chem': 'Chemistry',
            'Math': 'Mathematics',
            'Maths': 'Mathematics',
            'Bio': 'Biology',
            'Zoology': 'Biology',
            'Botany': 'Biology'
        };
        
        return subjectMap[normalized] || normalized;
    }

    /**
     * Normalize question type for consistent matching
     */
    normalizeQuestionType(type) {
        if (!type) return 'MCQ';
        
        const normalized = type.toUpperCase().trim();
        
        // Handle common variations
        const typeMap = {
            'MULTIPLE_CHOICE': 'MCQ',
            'MULTIPLE_CHOICE_SINGLE': 'MCQ',
            'MULTIPLE_CHOICE_MULTIPLE': 'MCMA',
            'NUMERICAL_ANSWER': 'Numerical',
            'INTEGER_ANSWER': 'Integer',
            'TEXT_ANSWER': 'Text',
            'FILL_BLANK': 'Text'
        };
        
        return typeMap[normalized] || normalized;
    }

    /**
     * Normalize stream name for consistent matching
     */
    normalizeStream(stream) {
        if (!stream) return 'default';
        
        const normalized = stream.toUpperCase().trim();
        
        // Handle common variations
        const streamMap = {
            'JEE_MAIN': 'JEE',
            'JEE_ADVANCED': 'JEE_ADVANCED',
            'NEET_UG': 'NEET',
            'MHTCET': 'MHT-CET',
            'MHT_CET': 'MHT-CET'
        };
        
        return streamMap[normalized] || normalized;
    }

    /**
     * Validate resolved rule for correctness
     */
    validateResolvedRule(rule) {
        if (!rule) {
            throw new Error('Resolved rule is null or undefined');
        }
        
        if (typeof rule.positiveMarks !== 'number' || rule.positiveMarks < 0) {
            console.warn('Invalid positive marks in resolved rule:', rule.positiveMarks);
            rule.positiveMarks = 4;
        }
        
        if (typeof rule.negativeMarks !== 'number' || rule.negativeMarks < 0) {
            console.warn('Invalid negative marks in resolved rule:', rule.negativeMarks);
            rule.negativeMarks = 1;
        }
        
        if (typeof rule.partialMarkingEnabled !== 'boolean') {
            rule.partialMarkingEnabled = false;
        }
    }

    /**
     * Get safe default rule for error cases
     */
    getSafeDefaultRule() {
        return {
            positiveMarks: 4,
            negativeMarks: 1,
            partialMarkingEnabled: false,
            description: 'Safe default rule (fallback)',
            _metadata: {
                resolutionLevel: 9, // Below global defaults
                resolutionPath: ['safe_fallback'],
                timestamp: Date.now(),
                resolverVersion: '1.0.0'
            }
        };
    }

    /**
     * Add question-specific rule override
     */
    addQuestionSpecificRule(questionId, rule) {
        this.ruleHierarchy.questionSpecific.set(questionId, rule);
        
        // Clear related cache entries
        if (this.enableCaching) {
            for (const [key] of this.ruleCache) {
                if (key.includes(questionId)) {
                    this.ruleCache.delete(key);
                }
            }
        }
    }

    /**
     * Record resolution time for performance tracking
     */
    recordResolutionTime(time, fromCache) {
        this.metrics.totalResolutions++;
        
        if (!fromCache) {
            this.metrics.resolutionTimes.push(time);
            
            // Keep only last 1000 measurements for performance
            if (this.metrics.resolutionTimes.length > 1000) {
                this.metrics.resolutionTimes = this.metrics.resolutionTimes.slice(-1000);
            }
            
            // Recalculate average
            this.metrics.averageResolutionTime = 
                this.metrics.resolutionTimes.reduce((sum, time) => sum + time, 0) / 
                this.metrics.resolutionTimes.length;
        }
    }

    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        const cacheHitRate = this.metrics.totalResolutions > 0 
            ? (this.metrics.cacheHits / this.metrics.totalResolutions) * 100 
            : 0;
        
        return {
            ...this.metrics,
            cacheHitRate: cacheHitRate.toFixed(2) + '%',
            cacheSize: this.ruleCache.size,
            performanceTarget: this.performanceTarget,
            withinTarget: this.metrics.averageResolutionTime <= this.performanceTarget
        };
    }

    /**
     * Clear all caches
     */
    clearCache() {
        this.ruleCache.clear();
        this.hierarchyCache.clear();
        console.log('🧹 Rule resolver caches cleared');
    }

    /**
     * Export rule hierarchy for testing/debugging
     */
    exportRuleHierarchy() {
        return {
            ...this.ruleHierarchy,
            questionSpecific: Array.from(this.ruleHierarchy.questionSpecific.entries())
        };
    }
}

export default MarkingRuleResolver;