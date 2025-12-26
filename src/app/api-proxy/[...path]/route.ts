import { NextResponse } from "next/server";

// 1. CONFIGURATION
// The URL of your Python Backend (e.g., your ngrok URL)
const BACKEND_URL = process.env.BACKEND_API_URL;

// The Secret Key (Must match what is in your Caddyfile)
const PROXY_SECRET = process.env.PROXY_SECRET || "dev-secret-123";

// 2. SUPPORTED METHODS
// We export these individually to let Next.js know which methods are allowed
export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, await params);
}

export async function POST(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, await params);
}

export async function PUT(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, await params);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, await params);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, await params);
}

// 3. THE PROXY LOGIC
async function handleProxy(req: Request, params: { path: string[] }) {
  if (!BACKEND_URL) {
    console.error("❌ BACKEND_API_URL is not set in environment variables");
    return new NextResponse(
      JSON.stringify({ error: "Configuration Error: Backend URL missing" }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Reconstruct the path (e.g., /api-proxy/books/123 -> /books/123)
  const pathString = params.path.join("/");
  const { search } = new URL(req.url);
  const targetUrl = `${BACKEND_URL}/${pathString}${search}`;

  try {
    // Forward the request to the Python Backend
    const backendResponse = await fetch(targetUrl, {
      method: req.method,
      headers: {
        // Pass original headers (Content-Type, Auth, etc.)
        ...Object.fromEntries(req.headers),
        
        // 🔒 THE SECRET HANDSHAKE: This key allows entry into your Caddy tunnel
        "X-Proxy-Secret": PROXY_SECRET,
        
        // Vital for ngrok: Host header must match the ngrok domain
        "host": new URL(BACKEND_URL).host,
      },
      // Pass body if it exists (for POST/PUT) and isn't a GET/HEAD
      body: (req.method !== "GET" && req.method !== "HEAD") ? await req.blob() : undefined,
    });

    // Return the response from Python back to the Frontend
    return new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: backendResponse.headers,
    });

  } catch (error) {
    console.error(`[Proxy Error] Failed to fetch ${targetUrl}:`, error);
    return new NextResponse(
      JSON.stringify({ error: "Backend Service Unavailable" }), 
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}