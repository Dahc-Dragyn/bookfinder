import { NextResponse } from "next/server";

const GOOGLE_PLACEHOLDER_PATTERNS = [
  "no_cover_thumb.gif",
];

// 🛑 Known aggressive bots & AI scrapers
const BANNED_BOT_STRINGS = [
  "Amazonbot",
  "Bytespider",
  "ClaudeBot",
  "GPTBot",
  "CCBot",
  "ImagesiftBot",
  "PerplexityBot",
  "Applebot-Extended",
  "cohere-ai",
  "Diffbot",
  "Omgili",
  "FacebookBot", 
];

// Absolute safety limits
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB hard cap
const FETCH_TIMEOUT_MS = 4000; // 4 seconds max

export async function GET(req: Request) {
  /* ────────────────────────────────
     1. CHEAP SHIELDS (NO CPU WORK)
     ──────────────────────────────── */
  
  // A. Block known bad bots by name
  const ua = req.headers.get("user-agent") || "";
  if (BANNED_BOT_STRINGS.some(bot => ua.includes(bot))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // B. "Browser-Only" Check (The Pro Move)
  // Bots (like curl or python scripts) usually fail to send these headers.
  const secFetch = req.headers.get("sec-fetch-site");
  const accept = req.headers.get("accept");

  if (!secFetch || !accept?.includes("image")) {
    // Note: If you test this in a browser tab manually, it might fail. 
    // It is designed to work for <img> tags on your site.
    return new NextResponse("Forbidden", { status: 403 });
  }

  /* ────────────────────────────────
     2. INPUT VALIDATION
     ──────────────────────────────── */

  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get("url");
  const minSizeBytes = parseInt(searchParams.get("minSize") || "500");

  if (!rawUrl) {
    return new NextResponse("Missing image URL", { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(decodeURIComponent(rawUrl));
  } catch {
    return new NextResponse("Invalid URL", { status: 400 });
  }

  // Security: Only allow HTTPS
  if (targetUrl.protocol !== "https:") {
    return new NextResponse("Only HTTPS allowed", { status: 400 });
  }

  // Google Specific Cleanup
  if (
    targetUrl.hostname.includes("books.google.com") ||
    targetUrl.hostname.includes("googleusercontent.com")
  ) {
    // Block known "No Cover" placeholders to save bandwidth
    if (GOOGLE_PLACEHOLDER_PATTERNS.some(p => targetUrl.href.includes(p))) {
      return new NextResponse(null, { status: 404 });
    }
    // Remove the 'edge=curl' param which causes issues
    targetUrl.searchParams.delete("edge");
  }

  /* ────────────────────────────────
     3. SINGLE FETCH (OPTIMIZED)
     ──────────────────────────────── */

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(targetUrl.href, {
      headers: {
        // We pretend to be a standard browser to avoid upstream blocking
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return new NextResponse(null, { status: response.status });
    }

    // A. Check Headers BEFORE downloading the body (Saves Bandwidth)
    const type = response.headers.get("content-type") || "";
    if (!type.startsWith("image/")) {
      return new NextResponse(null, { status: 404 });
    }

    const contentLength = parseInt(response.headers.get("content-length") || "0");
    if (contentLength > MAX_IMAGE_BYTES) {
      return new NextResponse(null, { status: 404 });
    }

    // B. Download the Buffer
    const buffer = Buffer.from(await response.arrayBuffer());

    // C. Final Size Check (In case Content-Length was fake)
    if (buffer.byteLength < minSizeBytes || buffer.byteLength > MAX_IMAGE_BYTES) {
      return new NextResponse(null, { status: 404 });
    }

    // Success!
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });

  } catch (err) {
    console.error(`[Proxy] Error fetching ${targetUrl.href}:`, err);
    return new NextResponse(null, { status: 500 });
  } finally {
    clearTimeout(timeout);
  }
}