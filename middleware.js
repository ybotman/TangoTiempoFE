import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();
  
  // Extract Cloudflare headers - try both CF-* and X-Geo-* prefixes
  // X-Geo-* headers are from Cloudflare Worker (bypass Vercel stripping)
  const cfHeaders = {
    city: request.headers.get('cf-ipcity') || request.headers.get('x-geo-city') || null,
    country: request.headers.get('cf-ipcountry') || request.headers.get('x-geo-country') || null,
    continent: request.headers.get('cf-ipcontinent') || request.headers.get('x-geo-continent') || null,
    timezone: request.headers.get('cf-timezone') || request.headers.get('x-geo-timezone') || null,
    region: request.headers.get('cf-region') || request.headers.get('x-geo-region') || null,
    regionCode: request.headers.get('x-geo-region-code') || null,
    ip: request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || null,
    latitude: request.headers.get('cf-iplat') || request.headers.get('x-geo-latitude') || null,
    longitude: request.headers.get('cf-iplon') || request.headers.get('x-geo-longitude') || null,
    postalCode: request.headers.get('cf-postal-code') || request.headers.get('x-geo-postal-code') || null,
    ray: request.headers.get('cf-ray') || null,
    visitor: request.headers.get('cf-visitor') || null,
    workerActive: request.headers.get('x-geo-worker') || null,
    timestamp: Date.now()
  };

  // Only log in development or for geo-diagnostics route
  if (process.env.NODE_ENV === 'development' || request.nextUrl.pathname === '/geo-diagnostics') {
    console.log('CF Headers received:', cfHeaders);
  }
  
  // Set as cookie for client access
  response.cookies.set('cf-geo-data', JSON.stringify(cfHeaders), {
    httpOnly: false, // Allow client access
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600 // 1 hour
  });
  
  // Forward as headers for SSR (optional, for backward compatibility)
  Object.entries(cfHeaders).forEach(([key, value]) => {
    if (value) {
      response.headers.set(`x-geo-${key}`, value);
    }
  });
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};