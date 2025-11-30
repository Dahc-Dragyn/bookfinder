import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const img = searchParams.get("url");

  if (!img) {
    return new NextResponse("Missing image URL", { status: 400 });
  }

  try {
    // 1. Force HTTPS
    let targetUrl = img.replace("http://", "https://");
    
    // 2. Google Books Specific Cleanup
    if (targetUrl.includes('books.google.com')) {
       targetUrl = targetUrl.replace('&edge=curl', '');
    }

    // 3. Fetch with User-Agent to avoid 403 Forbidden from Google
    const response = await fetch(targetUrl, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
    });
    
    if (!response.ok) {
        return new NextResponse("Failed to fetch image", { status: response.status });
    }

    // 4. Pass Content-Type
    const contentType = response.headers.get("content-type") || "image/jpeg";
    
    // 5. Get Buffer
    const buffer = await response.arrayBuffer();

    // 6. Return with aggressive caching
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      }
    });

  } catch (err) {
    console.error("Proxy error:", err);
    return new NextResponse("Failed to load image", { status: 500 });
  }
}