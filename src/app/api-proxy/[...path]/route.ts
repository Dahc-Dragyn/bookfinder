import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const img = searchParams.get("url");

  if (!img) {
    return new NextResponse("Missing image URL", { status: 400 });
  }

  try {
    // 1. Force HTTPS (Google often redirects HTTP -> HTTPS anyway, but let's be explicit)
    let targetUrl = img.replace("http://", "https://");
    
    // 2. Google Books Specific: Remove the "curled page" effect for a cleaner image
    if (targetUrl.includes('books.google.com')) {
       targetUrl = targetUrl.replace('&edge=curl', '');
    }

    // 3. Fetch the image from the external source
    // We use 'fetch' here so the SERVER talks to Google (Server-to-Server is secure)
    const response = await fetch(targetUrl);
    
    if (!response.ok) {
        return new NextResponse("Failed to fetch image", { status: response.status });
    }

    // 4. Get the content type (e.g., image/jpeg)
    const contentType = response.headers.get("content-type") || "image/jpeg";
    
    // 5. Get the image data as a buffer
    const buffer = await response.arrayBuffer();

    // 6. Return the image directly to the browser
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // Cache it aggressively (1 day) so we don't hammer Google's servers
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
      }
    });

  } catch (err) {
    console.error("Proxy error:", err);
    return new NextResponse("Failed to load image", { status: 500 });
  }
}