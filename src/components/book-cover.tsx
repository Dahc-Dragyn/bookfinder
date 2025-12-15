'use client';

import { useState, useEffect, useMemo } from 'react';
import { Book } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookCoverProps {
  url?: string | null; 
  urls?: (string | null | undefined)[]; 
  title: string;
  className?: string;
}

export default function BookCover({ url, urls, title, className }: BookCoverProps) {
  const cleanTitle = title.replace(/<[^>]*>?/gm, '').substring(0, 50);

  // 1. Build the Unique Candidate List (Deduplicated)
  // We use useMemo to prevent this from recalculating on every render
  const validCandidates = useMemo(() => {
    const raw = urls && urls.length > 0 ? urls : [url];
    const filtered = raw.filter((u): u is string => !!u && u.length > 0);
    return Array.from(new Set(filtered)); // Deduplicate to prevent retrying same URL
  }, [url, urls]);

  // State to track which index we are currently trying to load
  const [failedIndex, setFailedIndex] = useState(-1); 

  // Reset state ONLY when the list of candidates actually changes
  useEffect(() => {
    setFailedIndex(-1);
  }, [JSON.stringify(validCandidates)]);

  // 2. Determine current attempt
  const currentIndex = failedIndex + 1;
  const currentUrl = validCandidates[currentIndex];

  // 3. Fallback State (Show placeholder if we ran out of URLs)
  const showPlaceholder = !currentUrl || currentIndex >= validCandidates.length;

  if (showPlaceholder) {
      return (
        <div className={cn("w-full h-full bg-secondary/30 flex items-center justify-center p-4 text-center flex-col text-muted-foreground animate-in fade-in duration-500", className)}>
            <Book className="h-12 w-12 mb-2 opacity-20" />
            <span className="text-xs font-semibold opacity-40">{cleanTitle}</span>
        </div>
      );
  }

  // 4. Proxy Logic
  let srcToRender = currentUrl;
  if (srcToRender.includes('books.google.com')) {
      let sizeParam = '';
      if (srcToRender.includes('minSize=')) {
          const match = srcToRender.match(/minSize=(\d+)/);
          if (match) {
              sizeParam = `&minSize=${match[1]}`;
              srcToRender = srcToRender.replace(/&minSize=\d+/, '');
          }
      }
      srcToRender = `/api-proxy/image?url=${encodeURIComponent(srcToRender)}${sizeParam}`;
  }

  // 5. Image Load Handler
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    // Ghost Check: If image loads but is a 1x1 pixel (Google tracking pixel), treat as fail
    if (img.naturalWidth < 5 || img.naturalHeight < 5) {
        // console.warn(`[BookCover] Ghost success (1x1 pixel) for: ${currentUrl}. Retrying next...`);
        setFailedIndex(prev => prev + 1);
    }
  };

  return (
    <img
        key={srcToRender} // Force re-mount on src change
        src={srcToRender}
        alt={`Cover of ${cleanTitle}`}
        className={cn("w-full h-full object-cover transition-transform duration-500 group-hover:scale-105", className)}
        loading="lazy"
        onLoad={handleImageLoad} 
        onError={() => {
            // console.warn(`[BookCover] Failed to load: ${currentUrl}. Retrying next...`);
            setFailedIndex(prev => prev + 1);
        }}
    />
  );
}