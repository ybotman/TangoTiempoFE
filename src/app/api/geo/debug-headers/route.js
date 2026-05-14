export async function GET(request) {
  return Response.json({
    cfIpCity:    request.headers.get('cf-ipcity'),
    cfLat:       request.headers.get('cf-iplatitude'),
    cfLng:       request.headers.get('cf-iplongitude'),
    cfCountry:   request.headers.get('cf-ipcountry'),
    cfRegion:    request.headers.get('cf-region'),
    cfTimezone:  request.headers.get('cf-timezone'),
    xVercelCity: request.headers.get('x-vercel-ip-city'),
  });
}
