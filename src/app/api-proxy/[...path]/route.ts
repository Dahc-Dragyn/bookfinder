import { NextResponse } from "next/server";

// Patterns to identify known placeholder images from Google.
const GOOGLE_PLACEHOLDER_PATTERNS = [
  "no_cover_thumb.gif",
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get("url");
  
  // Allow the frontend to specify a minimum size limit.
  // Default to 2000 bytes (2KB) if not specified to block 1x1 pixels.
  const minSizeParam = searchParams.get("minSize");
  const minSizeBytes = minSizeParam ? parseInt(minSizeParam) : 2000;

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

    // Dynamic Size Filter
    if (buffer.byteLength < minSizeBytes) {
      console.warn(`[Proxy] Image too small (${buffer.byteLength}b < ${minSizeBytes}b) for: ${targetUrl}`);
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