import { NextResponse } from 'next/server';

export function middleware(request) {
  // Only process geo-diagnostics routes
  if (request.nextUrl.pathname === '/geo-diagnostics') {
    const response = NextResponse.next();
    
    // Log ALL headers to see what's coming through
    const allHeaders = {};
    request.headers.forEach((value, key) => {
      allHeaders[key] = value;
    });
    console.log('ALL Headers received:', allHeaders);

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
      workerActive: request.headers.get('x-geo-worker') || null,
    };

    // Log what headers we actually received
    console.log('CF Headers received:', cfHeaders);
    
    // Set as cookie for client access (diagnostics page only)
    response.cookies.set('cf-geo-data', JSON.stringify(cfHeaders), {
      httpOnly: false, // Allow client access for diagnostics
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600 // 1 hour
    });
    
    // Forward as headers for SSR
    Object.entries(cfHeaders).forEach(([key, value]) => {
      if (value) {
        response.headers.set(`x-geo-${key}`, value);
      }
    });

    // Add timestamp
    response.headers.set('x-geo-timestamp', Date.now().toString());
    
    return response;
  }
  
  // For all other routes, continue normally
  return NextResponse.next();
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