import { NextResponse } from 'next/server';
import { retryFailedSubmission } from '../../../../../server_actions/actions/examController/studentExamActions';

// Mark as dynamic route to prevent static generation
export const dynamic = 'force-dynamic';

/**
 * EMERGENCY QUEUE SYSTEM - Admin API Endpoint
 * Retry a failed submission
 * POST /api/admin/retry-submission
 */
export async function POST(request) {
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

    const body = await request.json();
    const { submissionId } = body;

    if (!submissionId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Submission ID is required' 
        },
        { status: 400 }
      );
    }

    const result = await retryFailedSubmission(submissionId);
    
    return NextResponse.json(result, { 
      status: result.success ? 200 : 400
    });

  } catch (error) {
    console.error('API Error - retry submission:', error);
    
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