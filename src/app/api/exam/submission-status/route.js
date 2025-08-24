import { NextResponse } from 'next/server';
import { checkSubmissionStatus } from '../../../../../server_actions/actions/examController/studentExamActions';

/**
 * EMERGENCY QUEUE SYSTEM - API Endpoint
 * Check the status of a queued exam submission
 * GET /api/exam/submission-status?submissionId=<id>
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get('submissionId');

    if (!submissionId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Submission ID is required' 
        },
        { status: 400 }
      );
    }

    const result = await checkSubmissionStatus(submissionId);
    
    return NextResponse.json(result, { 
      status: result.success ? 200 : 404,
      headers: {
        'Cache-Control': 'no-cache, no-store, max-age=0',
        'Pragma': 'no-cache'
      }
    });

  } catch (error) {
    console.error('API Error - submission status:', error);
    
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