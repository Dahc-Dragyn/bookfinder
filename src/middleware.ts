import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Expanded list based on your recent logs (Amazonbot is the priority here)
const AGGRESSIVE_BOTS = /Amazonbot|Bytespider|GPTBot|ClaudeBot|CCBot|PerplexityBot|FacebookBot/i;

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const { pathname } = request.nextUrl;

  // 1. Permanent Ban Check (Cookie-based)
  // If they hit the trap once, they are flagged for the duration of the session/cookie.
  if (request.cookies.has('X-Bot-Trap')) {
    return new NextResponse(null, { status: 410 }); // 410 Gone (More discouraging than 403)
  }

  // 2. Identify and Block Known AI Bots
  if (AGGRESSIVE_BOTS.test(userAgent)) {
    // Kill requests for high-compute routes (Search/Book Details)
    // We allow the homepage so they can verify the site exists, but block expensive paths.
    if (pathname.startsWith('/search') || pathname.startsWith('/book')) {
      return new NextResponse(
        JSON.stringify({ error: 'Automated access restricted. Use Sitemap.xml' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // 3. THE TRAP: Catch behavioral anomalies
  // If ANY user-agent (even a masked one) hits this path, flag them.
  if (pathname === '/wp-admin-trap') {
    const response = new NextResponse(null, { status: 500 });
    // Set a long-lived cookie to ban them on future requests (1 week)
    response.cookies.set('X-Bot-Trap', 'true', { 
      maxAge: 60 * 60 * 24 * 7, 
      path: '/' 
    });
    return response;
  }

  return NextResponse.next();
}

// Only run this on the routes that matter + the trap
export const config = {
  matcher: ['/search/:path*', '/book/:path*', '/wp-admin-trap'],
};