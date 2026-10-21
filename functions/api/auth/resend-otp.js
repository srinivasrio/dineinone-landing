// Cloudflare Pages Function: Proxy /api/auth/resend-otp to https://app.dineinone.com/api/auth/resend-otp

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function onRequestPost(context) {
  const targetUrl = 'https://app.dineinone.com/api/auth/resend-otp';

  try {
    const body = await context.request.text();
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Origin', 'https://dineinone.com');
    headers.set('Accept', 'application/json');

    const clientIp = context.request.headers.get('cf-connecting-ip') || context.request.headers.get('x-forwarded-for');
    if (clientIp) {
      headers.set('x-forwarded-for', clientIp);
    }

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body,
    });

    const resData = await res.text();
    const responseHeaders = new Headers(res.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Content-Type', 'application/json');

    return new Response(resData, {
      status: res.status,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error('[Resend OTP Proxy] Error forwarding request:', err);
    return new Response(JSON.stringify({ error: 'Authentication service temporarily unavailable' }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
