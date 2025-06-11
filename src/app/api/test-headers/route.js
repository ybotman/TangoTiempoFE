import { NextResponse } from 'next/server';

export async function GET(request) {
  // Get all headers
  const headers = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  // Filter for geo-related headers
  const geoHeaders = {};
  Object.entries(headers).forEach(([key, value]) => {
    if (key.toLowerCase().includes('geo') || 
        key.toLowerCase().includes('cf') || 
        key.toLowerCase().includes('x-')) {
      geoHeaders[key] = value;
    }
  });

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    url: request.url,
    allHeaders: headers,
    geoHeaders: geoHeaders,
    hasWorkerHeader: headers['x-geo-worker'] || 'NO',
    hasCityHeader: headers['x-geo-city'] || 'NO'
  }, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    }
  });
}