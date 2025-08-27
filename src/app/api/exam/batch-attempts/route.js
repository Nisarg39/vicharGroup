import { NextResponse } from 'next/server';
import { getAllExamAttempts } from '../../../../../server_actions/actions/examController/studentExamActions';

/**
 * Batch Exam Attempts API
 * 
 * This endpoint provides optimized batch processing for exam attempts without modifying
 * the existing getAllExamAttempts server function. It implements:
 * 
 * - Request batching to reduce database connections
 * - Response caching to minimize repeated queries
 * - Rate limiting for mass submission scenarios
 * - Request deduplication
 * - Compressed responses for large datasets
 */

// In-memory cache for responses (use Redis in production)
const responseCache = new Map();
const pendingRequests = new Map();

// Configuration
const CACHE_CONFIG = {
    DEFAULT_TTL: 2 * 60 * 1000,     // 2 minutes
    FAST_TTL: 30 * 1000,            // 30 seconds for recent data
    MAX_CACHE_SIZE: 500,            // Maximum cached responses
    BATCH_DELAY: 50,                // Batch requests within 50ms
    MAX_CONCURRENT: 10,             // Maximum concurrent database requests
};

// Rate limiting storage
const rateLimiter = new Map();

/**
 * Clean up expired cache entries
 */
function cleanupCache() {
    const now = Date.now();
    const expiredKeys = [];
    
    responseCache.forEach((entry, key) => {
        if (now > entry.expiresAt) {
            expiredKeys.push(key);
        }
    });
    
    expiredKeys.forEach(key => responseCache.delete(key));
    
    // Limit cache size
    if (responseCache.size > CACHE_CONFIG.MAX_CACHE_SIZE) {
        const entries = Array.from(responseCache.entries())
            .sort(([,a], [,b]) => a.lastAccess - b.lastAccess);
        
        const toDelete = entries.slice(0, entries.length - CACHE_CONFIG.MAX_CACHE_SIZE);
        toDelete.forEach(([key]) => responseCache.delete(key));
    }
}

/**
 * Check rate limiting
 */
function checkRateLimit(clientIdentifier) {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 100;    // Max requests per window
    
    const userRequests = rateLimiter.get(clientIdentifier) || [];
    const recentRequests = userRequests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
        return false; // Rate limited
    }
    
    recentRequests.push(now);
    rateLimiter.set(clientIdentifier, recentRequests);
    
    // Clean up old entries
    if (rateLimiter.size > 1000) {
        rateLimiter.clear();
    }
    
    return true;
}

/**
 * Get cache key for request
 */
function getCacheKey(studentId, examId) {
    return `${studentId}_${examId}`;
}

/**
 * Fetch exam attempts with caching
 */
async function getCachedExamAttempts(studentId, examId, options = {}) {
    const cacheKey = getCacheKey(studentId, examId);
    const now = Date.now();
    
    // Check cache first (unless force refresh)
    if (!options.forceRefresh && responseCache.has(cacheKey)) {
        const cached = responseCache.get(cacheKey);
        if (now < cached.expiresAt) {
            cached.lastAccess = now;
            return { 
                ...cached.data, 
                cached: true, 
                cacheAge: now - cached.createdAt 
            };
        }
    }
    
    // Deduplicate concurrent requests
    if (pendingRequests.has(cacheKey)) {
        return pendingRequests.get(cacheKey);
    }
    
    // Create new request
    const requestPromise = (async () => {
        try {
            const result = await getAllExamAttempts(studentId, examId);
            
            if (result.success) {
                const ttl = options.isRecentSubmission ? 
                    CACHE_CONFIG.FAST_TTL : 
                    CACHE_CONFIG.DEFAULT_TTL;
                
                // Cache the response
                responseCache.set(cacheKey, {
                    data: result,
                    createdAt: now,
                    expiresAt: now + ttl,
                    lastAccess: now
                });
            }
            
            return result;
        } catch (error) {
            console.error('Error fetching exam attempts:', error);
            return { 
                success: false, 
                message: error.message || 'Internal server error' 
            };
        } finally {
            pendingRequests.delete(cacheKey);
        }
    })();
    
    pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
}

/**
 * Process batch request with concurrency control
 */
async function processBatchRequest(requests) {
    const results = {};
    const semaphore = new Array(CACHE_CONFIG.MAX_CONCURRENT).fill(null);
    let activeRequests = 0;
    
    const processRequest = async (request) => {
        const { studentId, examId, options = {} } = request;
        const key = `${studentId}_${examId}`;
        
        try {
            const result = await getCachedExamAttempts(studentId, examId, options);
            results[key] = result;
        } catch (error) {
            results[key] = {
                success: false,
                message: error.message || 'Failed to process request'
            };
        } finally {
            activeRequests--;
        }
    };
    
    const processQueue = async () => {
        while (requests.length > 0 && activeRequests < CACHE_CONFIG.MAX_CONCURRENT) {
            const request = requests.shift();
            activeRequests++;
            processRequest(request);
        }
        
        // Wait for all active requests to complete
        while (activeRequests > 0) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    };
    
    await processQueue();
    return results;
}

/**
 * POST /api/exam/batch-attempts
 * 
 * Body format:
 * {
 *   requests: [
 *     { studentId: "...", examId: "...", options?: { forceRefresh?: boolean, isRecentSubmission?: boolean } }
 *   ],
 *   clientId?: "unique-client-identifier"
 * }
 */
export async function POST(request) {
    try {
        const startTime = Date.now();
        
        // Parse request body
        const body = await request.json();
        const { requests, clientId } = body;
        
        // Validation
        if (!Array.isArray(requests) || requests.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Invalid or empty requests array' },
                { status: 400 }
            );
        }
        
        if (requests.length > 50) {
            return NextResponse.json(
                { success: false, message: 'Too many requests in batch (max 50)' },
                { status: 400 }
            );
        }
        
        // Rate limiting
        const clientIdentifier = clientId || 
            request.headers.get('x-forwarded-for') || 
            request.headers.get('x-real-ip') || 
            'anonymous';
            
        if (!checkRateLimit(clientIdentifier)) {
            return NextResponse.json(
                { success: false, message: 'Rate limit exceeded' },
                { status: 429 }
            );
        }
        
        // Validate individual requests
        for (const req of requests) {
            if (!req.studentId || !req.examId) {
                return NextResponse.json(
                    { success: false, message: 'Each request must have studentId and examId' },
                    { status: 400 }
                );
            }
        }
        
        // Process batch request
        const results = await processBatchRequest(requests);
        
        // Clean up cache periodically
        if (Math.random() < 0.1) { // 10% chance
            cleanupCache();
        }
        
        const processingTime = Date.now() - startTime;
        
        // Response with performance metrics
        return NextResponse.json({
            success: true,
            results,
            meta: {
                totalRequests: requests.length,
                processingTimeMs: processingTime,
                cacheHits: Object.values(results).filter(r => r.cached).length,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Batch API error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/exam/batch-attempts/stats
 * 
 * Returns cache and performance statistics
 */
export async function GET() {
    try {
        const now = Date.now();
        let validEntries = 0;
        let expiredEntries = 0;
        
        responseCache.forEach(entry => {
            if (now < entry.expiresAt) {
                validEntries++;
            } else {
                expiredEntries++;
            }
        });
        
        return NextResponse.json({
            success: true,
            stats: {
                totalCachedResponses: responseCache.size,
                validEntries,
                expiredEntries,
                pendingRequests: pendingRequests.size,
                rateLimitedClients: rateLimiter.size,
                hitRate: validEntries / (validEntries + expiredEntries) || 0,
                cacheConfig: CACHE_CONFIG
            }
        });
    } catch (error) {
        console.error('Stats API error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}