'use client';

import { useState, useEffect } from 'react';
import { Book } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookCoverProps {
  url?: string | null; // Legacy support for single URL
  urls?: (string | null | undefined)[]; // New support for multiple fallback URLs
  title: string;
  className?: string;
}

export default function BookCover({ url, urls, title, className }: BookCoverProps) {
  const cleanTitle = title.replace(/<[^>]*>?/gm, '').substring(0, 50);

  // 1. Build the Candidate List
  const rawCandidates = urls && urls.length > 0 ? urls : [url];
  const validCandidates = rawCandidates.filter((u): u is string => !!u);

  // State to track which index we are currently trying to load
  const [failedIndex, setFailedIndex] = useState(-1); 

  // Reset state when the book changes
  useEffect(() => {
    setFailedIndex(-1);
  }, [title, JSON.stringify(validCandidates)]);

  // 2. Determine current attempt
  const currentIndex = failedIndex + 1;
  const currentUrl = validCandidates[currentIndex];

  // 3. Fallback State
  const showPlaceholder = !currentUrl || currentIndex >= validCandidates.length;

  if (showPlaceholder) {
      return (
        <div className={cn("w-full h-full bg-secondary/30 flex items-center justify-center p-4 text-center flex-col text-muted-foreground animate-in fade-in duration-500", className)}>
            <Book className="h-12 w-12 mb-2 opacity-20" />
            <span className="text-xs font-semibold opacity-40">{cleanTitle}</span>
        </div>
      );
  }

  // 4. Proxy Logic (FIXED to handle minSize)
  let srcToRender = currentUrl;
  if (srcToRender.includes('books.google.com')) {
      // Check if there is a size requirement embedded in the URL
      let sizeParam = '';
      if (srcToRender.includes('minSize=')) {
          const match = srcToRender.match(/minSize=(\d+)/);
          if (match) {
              sizeParam = `&minSize=${match[1]}`;
              // Remove it from the target URL so Google doesn't see it (it ignores it anyway, but cleaner)
              srcToRender = srcToRender.replace(/&minSize=\d+/, '');
          }
      }
      // Construct the proxy URL with the extracted parameter
      srcToRender = `/api-proxy/image?url=${encodeURIComponent(srcToRender)}${sizeParam}`;
  }

  // 5. Image Load Handler
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    // Check natural dimensions (Ghost Success Check)
    if (img.naturalWidth < 5 || img.naturalHeight < 5) {
        console.warn(`[BookCover] Ghost success detected (tiny image: ${img.naturalWidth}x${img.naturalHeight}) for: ${currentUrl}. Retrying...`);
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
            console.warn(`[BookCover] Failed to load cover (Network Error or Proxy Block): ${currentUrl}. Trying next candidate.`);
            setFailedIndex(prev => prev + 1);
        }}
    />
  );
}