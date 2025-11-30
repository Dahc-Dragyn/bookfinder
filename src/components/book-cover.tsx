'use client';

import Image from 'next/image';
import { Book } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookCoverProps {
  url?: string | null;
  title: string;
  className?: string;
}

export default function BookCover({ url, title, className }: BookCoverProps) {
  const cleanTitle = title.replace(/<[^>]*>?/gm, '').substring(0, 50);
  
  let coverSrc = url;
  const isGoogleImage = coverSrc && coverSrc.includes('books.google.com');

  // LOGIC: Only proxy Google Books URLs because they often have HTTP/CORS issues.
  // OpenLibrary supports HTTPS natively, so we load them directly for speed.
  if (isGoogleImage) {
      coverSrc = `/api-proxy/image?url=${encodeURIComponent(url!)}`;
  } 
  
  // If no URL provided at all, set to null so we render fallback
  if (!url) {
      coverSrc = null;
  }

  const fallbackSrc = `https://placehold.co/400x600/e2e8f0/1e293b?text=${encodeURIComponent(cleanTitle || 'No Title')}`;

  if (!coverSrc) {
      return (
        <div className={cn("w-full h-full bg-secondary/30 flex items-center justify-center p-4 text-center flex-col text-muted-foreground", className)}>
            <Book className="h-12 w-12 mb-2 opacity-20" />
            <span className="text-xs font-semibold opacity-40">{cleanTitle}</span>
        </div>
      );
  }

  return (
    <img
        src={coverSrc}
        alt={`Cover of ${cleanTitle}`}
        className={cn("w-full h-full object-cover transition-transform duration-500 group-hover:scale-105", className)}
        loading="lazy"
        onError={(e) => {
            // If the proxy or direct link fails, fallback to placeholder
            e.currentTarget.onerror = null; // Prevent loop
            e.currentTarget.src = fallbackSrc;
        }}
    />
  );
}