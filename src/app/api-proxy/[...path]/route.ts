import { NextResponse } from "next/server";

// FIX: Lowered the minimum size threshold. The previous value (12KB) was too high
// and was incorrectly blocking valid, but well-optimized, cover images.
// A 3KB threshold is safer, catching tiny error pixels without blocking real covers.
const MIN_SIZE_BYTES = 3000;

// Patterns to identify known placeholder images from Google, which should always be blocked.
const GOOGLE_PLACEHOLDER_PATTERNS = [
  "&img=1&",
  "&img=1",        
  "img=1&",
  "img=1",
  "no_cover_thumb.gif",
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get("url");

  if (!rawUrl) {
    return new NextResponse("Missing image URL", { status: 400 });
  }

  const decodedUrl = decodeURIComponent(rawUrl);

  // Block known Google placeholder URLs immediately.
  if (decodedUrl.includes("books.google.com") || decodedUrl.includes("googleusercontent.com")) {
    if (GOOGLE_PLACEHOLDER_PATTERNS.some(p => decodedUrl.includes(p))) {
       console.warn(`[Proxy] Blocking known Google placeholder: ${decodedUrl}`);
       return new NextResponse(null, { status: 404 });
    }
  }
  
  // Clean up URL: ensure HTTPS and remove problematic Google Books parameters.
  let targetUrl = rawUrl.replace("http://", "https://");
  if (targetUrl.includes("books.google.com")) {
    targetUrl = targetUrl.replace("&edge=curl", "");
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      console.warn(`[Proxy] Upstream fetch failed with status ${response.status} for: ${targetUrl}`);
      return new NextResponse(null, { status: response.status });
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      console.warn(`[Proxy] Invalid content-type "${contentType}" for: ${targetUrl}`);
      return new NextResponse(null, { status: 404 });
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    // Block images that are too small (likely placeholders or error pixels).
    if (buffer.byteLength < MIN_SIZE_BYTES) {
      console.warn(`[Proxy] Image too small (${buffer.byteLength}b < ${MIN_SIZE_BYTES}b) for: ${targetUrl}`);
      return new NextResponse(null, { status: 404 });
    }

    // Success: Return the valid image with long-cache headers.
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error(`[Proxy] Fatal fetch error for ${targetUrl}:`, err);
    return new NextResponse(null, { status: 500 });
  }
}
