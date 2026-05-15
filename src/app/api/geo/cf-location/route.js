// TIEMPO-458: Read Cloudflare edge geo headers injected by the CF Managed Transform
// "Add visitor location headers". Returns a structured geo object with confidence score.
// On TEST (CNAME/O2O passthrough), all CF fields return null — expected, not a bug.
// On PROD (A-record, full CF proxy), city-level resolution works correctly.
export async function GET(request) {
  const h = request.headers;
  const city     = h.get('cf-ipcity')     || null;
  const country  = h.get('cf-ipcountry')  || null;
  const region   = h.get('cf-region')     || null;
  const timezone = h.get('cf-timezone')   || null;
  const rawLat   = h.get('cf-iplatitude');
  const rawLng   = h.get('cf-iplongitude');
  const lat      = rawLat  ? parseFloat(rawLat)  : null;
  const lng      = rawLng  ? parseFloat(rawLng)  : null;

  const validCoords    = lat !== null && lng !== null && isFinite(lat) && isFinite(lng);
  const unknownCountry = country === 'XX' || country === 'T1' || !country;

  // TIEMPO-465: log Private Relay presence for analytics (do not bypass — CF already maps relay IPs to metro)
  const isPrivateRelay = (h.get('cf-ip-organization') ?? '').toLowerCase().includes('icloud private relay');

  let confidence = 0.0;
  let source = 'default';

  if (!unknownCountry && validCoords) {
    if (city) {
      confidence = 0.70;
      source = 'cfEdge';
    } else {
      confidence = 0.30;
      source = 'countryCenter';
    }
  }

  return Response.json(
    { city, country, region, timezone, lat, lng, confidence, source, isPrivateRelay, resolvedAt: Date.now() },
    { headers: { 'cache-control': 'private, max-age=0, no-store' } }
  );
}
