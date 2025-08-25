import { NextResponse } from 'next/server';
import { getQueueStatistics } from '../../../../../server_actions/utils/examSubmissionQueue';
import { getWorkerStats } from '../../../../../server_actions/utils/examSubmissionWorker';

/**
 * ENHANCED EMERGENCY QUEUE SYSTEM - Admin API Endpoint
 * Get queue statistics and worker information for monitoring both setInterval and cron modes
 * GET /api/admin/queue-stats
 */
// Mark as dynamic route to prevent static generation
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Basic auth check - in production, implement proper admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Authentication required' 
        },
        { status: 401 }
      );
    }

    // Detect processing mode
    const isCronMode = process.env.VERCEL || process.env.VERCEL_ENV;
    
    // Get queue statistics (enhanced with cron support)
    const queueStats = await getQueueStatistics();
    
    // Get worker statistics (only in setInterval mode)
    const workerStats = isCronMode ? null : await getWorkerStats();

    // Get cron-specific environment variables
    const cronConfig = isCronMode ? {
      batchSize: parseInt(process.env.EXAM_BATCH_SIZE) || 20,
      maxProcessingTime: parseInt(process.env.CRON_MAX_PROCESSING_TIME) || 750000,
      cronSecret: process.env.VERCEL_CRON_SECRET ? 'configured' : 'missing',
      vercelEnv: process.env.VERCEL_ENV || 'unknown'
    } : null;

    // Combine stats
    const combinedStats = {
      queue: queueStats,
      worker: workerStats,
      processingMode: isCronMode ? "cron-batch" : "setInterval",
      cronConfig: cronConfig,
      timestamp: new Date().toISOString(),
      systemInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        environment: {
          VERCEL: process.env.VERCEL || false,
          VERCEL_ENV: process.env.VERCEL_ENV || 'not-set',
          NODE_ENV: process.env.NODE_ENV || 'not-set'
        }
      }
    };
    
    return NextResponse.json({
      success: true,
      stats: combinedStats
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, max-age=0',
        'Pragma': 'no-cache'
      }
    });

  } catch (error) {
    console.error('API Error - queue stats:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      },
      { status: 500 }
    );
  }
}