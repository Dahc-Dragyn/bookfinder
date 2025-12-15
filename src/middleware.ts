import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  
  // 1. Identify AI Bots & Scrapers
  // We explicitly block GPTBot (OpenAI) because logs showed it spamming search.
  if (userAgent.includes('GPTBot') || userAgent.includes('Bytespider') || userAgent.includes('ClaudeBot')) {
    
    // 2. The "Polite" Rejection
    // If they try to hit /search or /book, we stop them here.
    // This prevents the request from ever reaching your Home Server.
    if (request.nextUrl.pathname.startsWith('/search') || request.nextUrl.pathname.startsWith('/book')) {
      return new NextResponse(
        JSON.stringify({ message: 'Bot access to Search/Book details is rate limited. Please use the Sitemap.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return NextResponse.next();
}

// Only run this on the routes that matter
export const config = {
  matcher: ['/search/:path*', '/book/:path*'],
};