// Serves the invite from Cloudflare. www → apex redirect, security and cache headers.
const APEX = 'anoopsanghmitra.com';

const SECURITY = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-frame-options': 'SAMEORIGIN',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === `www.${APEX}`) {
      url.hostname = APEX;
      return Response.redirect(url.toString(), 301);
    }

    const res = await env.ASSETS.fetch(request);
    const out = new Response(res.body, res);
    for (const [k, v] of Object.entries(SECURITY)) out.headers.set(k, v);

    const type = out.headers.get('content-type') || '';
    if (/^image\/|font\/|audio\//.test(type)) {
      out.headers.set('cache-control', 'public, max-age=604800');
    } else if (type.includes('text/html')) {
      out.headers.set('cache-control', 'public, max-age=0, must-revalidate');
    }
    return out;
  },
};
