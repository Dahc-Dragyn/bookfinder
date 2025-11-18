import { NextRequest, NextResponse } from 'next/server';

async function handler(req: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!backendUrl) {
    return new NextResponse('Backend API URL is not configured.', { status: 500 });
  }

  // 1. Strip the proxy prefix (e.g., '/api-proxy/health' becomes '/health')
  const requestedPath = req.nextUrl.pathname.replace(/^\/api-proxy/, '');
  
  // 2. Map to the final target URL, including the /books prefix
  // Example: https://db4f.../books/health
  // The 'requestedPath' is now '/health'
  const targetUrl = `${backendUrl}/books${requestedPath}${req.nextUrl.search}`;
  
  const headers = new Headers(req.headers);
  headers.set('host', new URL(targetUrl).host);
  headers.set('ngrok-skip-browser-warning', 'true');
  headers.set('Connection', 'keep-alive');
  
  // Remove the Authorization header to prevent accidentally forwarding a user's sensitive token
  // to an untrusted external API, which could happen if we eventually add user auth.
  headers.delete('Authorization');

  const body = req.method !== 'GET' && req.method !== 'HEAD' ? await req.blob() : undefined;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: body,
      redirect: 'follow'
    });
    
    return response;

  } catch (error) {
    console.error('API proxy error:', error);
    return new NextResponse('Proxy request failed.', { status: 502 });
  }
}

// Export handler for all HTTP methods
export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };