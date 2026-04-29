export default {
  async fetch(request, env, ctx) {
    const ORIGIN = 'https://tangotiempo.com';
    const DEFAULT_PATH = '/calendar/boston';
    const url = new URL(request.url);

    // Map root to /calendar/boston; otherwise proxy path as-is
    const upstreamPath = url.pathname === '/' ? DEFAULT_PATH : url.pathname;
    const upstreamUrl = new URL(ORIGIN + upstreamPath + (url.search || ''));

    // Clone request with TT origin + headers
    const reqHeaders = new Headers(request.headers);
    reqHeaders.set('host', new URL(ORIGIN).host);
    reqHeaders.set('x-forwarded-host', url.host);
    reqHeaders.set('x-forwarded-proto', 'https');

    const method = request.method;
    const init = {
      method,
      headers: reqHeaders,
      redirect: 'manual',
      body: ['GET', 'HEAD'].includes(method) ? undefined : request.body
    };

    // Assets → cache; HTML → no-store
    const assetLike = upstreamUrl.pathname.startsWith('/_next')
      || upstreamUrl.pathname.startsWith('/assets')
      || upstreamUrl.pathname.startsWith('/images')
      || upstreamUrl.pathname.startsWith('/brand')
      || upstreamUrl.pathname === '/favicon.ico';

    const cf = assetLike
      ? { cacheTtl: 3600, cacheEverything: true }
      : { cacheTtl: 0, cacheEverything: false };

    const upstreamResp = await fetch(upstreamUrl.toString(), { ...init, cf });

    // Pass through non-HTML (JS/CSS/images/JSON)
    const ctype = upstreamResp.headers.get('content-type') || '';
    if (!ctype.includes('text/html')) {
      return rewriteHeaders(upstreamResp, url);
    }

    // HTML: fix Next.js pathname + rewrite absolute TT links → BTC
    const btcOrigin = `${url.protocol}//${url.host}`;
    const ttOrigin = ORIGIN;

    const rewriter = new HTMLRewriter()
      // Inject before Next.js hydrates so usePathname() sees /calendar/boston.
      // history.replaceState keeps bostontangocalendar.com in the address bar
      // while giving the Next.js router the correct path to render against.
      .on('head', {
        element(el) {
          el.prepend(
            `<script>history.replaceState(null,'','/calendar/boston'+(location.search||''));</script>`,
            { html: true }
          );
        }
      })
      .on('a[href]',          new AttrRewriter('href',   ttOrigin, btcOrigin))
      .on('link[href]',       new AttrRewriter('href',   ttOrigin, btcOrigin))
      .on('script[src]',      new AttrRewriter('src',    ttOrigin, btcOrigin))
      .on('img[src]',         new AttrRewriter('src',    ttOrigin, btcOrigin))
      .on('form[action]',     new AttrRewriter('action', ttOrigin, btcOrigin))
      .on('link[rel="canonical"]', {
        element(e) { e.setAttribute('href', new URL(request.url).href); }
      })
      .on('meta[property="og:url"]', {
        element(e) { e.setAttribute('content', new URL(request.url).href); }
      });

    return rewriter.transform(rewriteHeaders(upstreamResp, url));
  }
}

class AttrRewriter {
  constructor(attr, fromOrigin, toOrigin) {
    this.attr = attr;
    this.fromOrigin = fromOrigin;
    this.toOrigin = toOrigin;
    this.fromHost = new URL(fromOrigin).host;
  }
  element(e) {
    const v = e.getAttribute(this.attr);
    if (!v) return;

    if (v.startsWith(this.fromOrigin)) {
      e.setAttribute(this.attr, v.replace(this.fromOrigin, this.toOrigin));
      return;
    }

    try {
      const u = new URL(v, this.toOrigin);
      if (u.host === this.fromHost) {
        u.host = new URL(this.toOrigin).host;
        e.setAttribute(this.attr, u.toString());
      }
    } catch (_) { /* ignore */ }
  }
}

function rewriteHeaders(resp, reqUrl) {
  const newHeaders = new Headers(resp.headers);

  if ((newHeaders.get('content-type') || '').includes('text/html')) {
    newHeaders.delete('content-security-policy');
    if (!newHeaders.has('x-robots-tag')) {
      newHeaders.set('x-robots-tag', 'index, follow');
    }
  }

  if (!newHeaders.has('strict-transport-security')) {
    newHeaders.set('strict-transport-security', 'max-age=31536000; includeSubDomains; preload');
  }

  return new Response(resp.body, {
    status: resp.status,
    statusText: resp.statusText,
    headers: newHeaders
  });
}
