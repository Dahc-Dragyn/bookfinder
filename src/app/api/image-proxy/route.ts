import { NextResponse } from "next/server";

// 🛑 KNOWN OFFENDERS
const BANNED_BOT_STRINGS = ["Amazonbot", "Bytespider", "GPTBot", "ClaudeBot", "CCBot"];
const GOOGLE_PLACEHOLDER_PATTERNS = ["no_cover_thumb.gif"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 4000;

export async function GET(req: Request) {
  // 1. CHEAP SHIELDS
  const ua = req.headers.get("user-agent") || "";
  if (BANNED_BOT_STRINGS.some(bot => ua.includes(bot))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 2. INPUT VALIDATION
  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get("url");
  const minSizeBytes = parseInt(searchParams.get("minSize") || "500");

  if (!rawUrl) return new NextResponse("Missing URL", { status: 400 });

  let targetUrl: URL;
  try {
    targetUrl = new URL(decodeURIComponent(rawUrl));
  } catch {
    return new NextResponse("Invalid URL", { status: 400 });
  }

  // Google Specific Cleanup
  if (targetUrl.hostname.includes("books.google.com")) {
    if (GOOGLE_PLACEHOLDER_PATTERNS.some(p => targetUrl.href.includes(p))) {
      return new NextResponse(null, { status: 404 });
    }
    targetUrl.searchParams.delete("edge");
  }

  // 3. FETCH
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    
    const response = await fetch(targetUrl.href, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) return new NextResponse(null, { status: response.status });

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength < minSizeBytes || buffer.byteLength > MAX_IMAGE_BYTES) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    return new NextResponse(null, { status: 500 });
  }
}