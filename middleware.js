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

    // Extract Cloudflare headers (including automatic ones)
    const cfHeaders = {
      city: request.headers.get('cf-ipcity') || null,
      country: request.headers.get('cf-ipcountry') || null,
      continent: request.headers.get('cf-ipcontinent') || null,
      timezone: request.headers.get('cf-timezone') || null,
      region: request.headers.get('cf-region') || null,
      ip: request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || null,
      latitude: request.headers.get('cf-iplat') || null,
      longitude: request.headers.get('cf-iplon') || null,
      postalCode: request.headers.get('cf-postal-code') || null,
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