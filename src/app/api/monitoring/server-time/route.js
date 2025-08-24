import { NextResponse } from 'next/server';

/**
 * Server time synchronization endpoint
 * Provides accurate server time for client-side timer calibration
 */

export async function GET() {
  try {
    const serverTime = Date.now();
    
    return NextResponse.json({
      timestamp: new Date(serverTime).toISOString(),
      unixTimestamp: serverTime,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      service: 'server-time-sync'
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('Error getting server time:', error);
    
    return NextResponse.json({
      error: 'Failed to get server time',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}