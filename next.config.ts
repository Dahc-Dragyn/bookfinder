import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      // Placeholder domains (optional, but keep for now)
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      // --- CRITICAL BOOKFINDER API DOMAINS ---
      {
        protocol: 'https',
        hostname: 'covers.openlibrary.org', // Used by your API for cover_url
        port: '',
        pathname: '/b/isbn/**'
      },
      {
        protocol: 'https',
        hostname: 'books.google.com', // Used by Google Books thumbnail links
        port: '',
        pathname: '/**'
      },
      {
        // Added this one as a catch-all since your deployment URL is custom
        protocol: 'https',
        hostname: 'db4f-24-22-90-227.ngrok-free.app',
        port: '',
        pathname: '/**'
      }
    ],
  },
};

export default nextConfig;