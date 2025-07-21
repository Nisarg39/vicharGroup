import { NextResponse } from 'next/server';
// import { syncOfflineSubmissions } from '../../../../server_api_actions/examController/studentExamActions';
import { syncOfflineSubmissions } from '../../../../../server_actions/actions/examController/studentExamActions';

export async function POST(request) {
  try {
    const { submissions, studentId } = await request.json();

    if (!submissions || !Array.isArray(submissions)) {
      return NextResponse.json(
        { success: false, message: 'Invalid submissions data' },
        { status: 400 }
      );
    }

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: 'Student ID is required' },
        { status: 400 }
      );
    }

    const result = await syncOfflineSubmissions(studentId, submissions);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error('Error syncing offline submissions:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 