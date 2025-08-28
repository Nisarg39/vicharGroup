import { NextResponse } from 'next/server';
import { getQueueStatistics } from '../../../../../server_actions/utils/examSubmissionQueue';
import { getWorkerStats } from '../../../../../server_actions/utils/examSubmissionWorker';

/**
 * VERCEL CRON QUEUE SYSTEM - Admin API Endpoint
 * Get queue statistics for monitoring cron-based processing
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

    // Always cron mode - setInterval worker removed
    const isCronMode = true;
    
    // Get queue statistics (cron-only)
    const queueStats = await getQueueStatistics();
    
    // Get processor statistics (legacy compatibility)
    const processorStats = await getWorkerStats();

    // Get cron-specific environment variables
    const cronConfig = {
      batchSize: parseInt(process.env.EXAM_BATCH_SIZE) || 20,
      maxProcessingTime: parseInt(process.env.CRON_MAX_PROCESSING_TIME) || 750000,
      cronSecret: process.env.VERCEL_CRON_SECRET ? 'configured' : 'missing',
      vercelEnv: process.env.VERCEL_ENV || 'unknown'
    };

    // Combine stats
    const combinedStats = {
      queue: queueStats,
      processor: processorStats, // Renamed from worker
      processingMode: "cron-batch",
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