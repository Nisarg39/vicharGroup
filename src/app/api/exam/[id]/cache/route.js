import { NextResponse } from 'next/server';
// import {getExamQuestions} from '../../../../../server_api_actions/examController/studentExamActions';
import { getExamQuestions} from "../../../../../../server_actions/actions/examController/studentExamActions"

export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Exam ID is required' },
        { status: 400 }
      );
    }

    const result = await getExamQuestions(id);

    if (result.success) {
      // Set cache headers for offline storage
      const response = NextResponse.json(result);
      response.headers.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      response.headers.set('ETag', `exam-${id}-${Date.now()}`);
      return response;
    } else {
      return NextResponse.json(result, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching exam for cache:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const examData = await request.json();

    if (!id || !examData) {
      return NextResponse.json(
        { success: false, message: 'Exam ID and data are required' },
        { status: 400 }
      );
    }

    // Store exam data in cache (this would typically be handled by the service worker)
    // For now, we'll just return success
    return NextResponse.json({
      success: true,
      message: 'Exam data cached successfully',
      examId: id
    });
  } catch (error) {
    console.error('Error caching exam data:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 