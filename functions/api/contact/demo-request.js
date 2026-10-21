// Cloudflare Pages Function: /api/contact/demo-request
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
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const body = await context.request.json().catch(() => null);
    if (!body) {
      return new Response(JSON.stringify({ error: 'Invalid JSON request payload' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const name = String(body.name || '').trim();
    const restaurantName = String(body.restaurant || body.restaurant_name || '').trim();
    const phone = String(body.phone || '').trim();
    const email = String(body.email || '').trim();
    const planInterest = String(body.plan || body.plan_interest || 'Not sure yet').trim();
    const tablesCount = Math.max(1, parseInt(body.tables || body.tables_count || '1', 10) || 1);

    if (!name || !restaurantName || !phone) {
      return new Response(JSON.stringify({ error: 'Name, Restaurant name, and Phone number are required' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // 1. Insert directly into live Supabase demo_requests table
    const supaUrl = 'https://jmcsygpphwdubnanwjwz.supabase.co/rest/v1/demo_requests';
    const supaKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptY3N5Z3BwaHdkdWJuYW53and6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMjUyMTIsImV4cCI6MjA4NTgwMTIxMn0.uQyoWluprn9Gr-ypserxqF9WM_85MWUMAO7Uch1jN14';

    const supaRes = await fetch(supaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supaKey,
        'Authorization': `Bearer ${supaKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        name,
        restaurant_name: restaurantName,
        phone,
        email: email || null,
        plan_interest: planInterest,
        tables_count: tablesCount,
        status: 'new',
      }),
    });

    if (!supaRes.ok) {
      const errTxt = await supaRes.text();
      console.error('[Demo Request] Supabase insert failed:', errTxt);
      return new Response(JSON.stringify({ error: 'Failed to record demo request' }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Demo request received successfully',
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error('[Demo Request] Cloudflare function error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
