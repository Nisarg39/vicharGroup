import { NextResponse } from 'next/server';
import { getQueueStatistics } from '../../../../../server_actions/actions/examController/studentExamActions';
import { getWorkerStats } from '../../../../../server_actions/utils/examSubmissionWorker';

/**
 * EMERGENCY QUEUE SYSTEM - Admin API Endpoint
 * Get queue statistics and worker information for monitoring
 * GET /api/admin/queue-stats
 */
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

    // Get queue statistics
    const queueStats = await getQueueStatistics();
    
    // Get worker statistics
    const workerStats = getWorkerStats();

    // Combine stats
    const combinedStats = {
      queue: queueStats,
      worker: workerStats,
      timestamp: new Date().toISOString(),
      systemInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage()
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