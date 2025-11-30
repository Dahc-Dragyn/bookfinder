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
  // Combine 'urls' array and legacy 'url' prop, filtering out empty values.
  const rawCandidates = urls && urls.length > 0 ? urls : [url];
  const validCandidates = rawCandidates.filter((u): u is string => !!u);

  // State to track which index we are currently trying to load
  const [failedIndex, setFailedIndex] = useState(-1); 

  // Reset state when the book changes (title/candidates change)
  useEffect(() => {
    setFailedIndex(-1);
  }, [title, JSON.stringify(validCandidates)]);

  // 2. Determine current attempt
  // We try validCandidates[0], then [1], etc.
  const currentIndex = failedIndex + 1;
  const currentUrl = validCandidates[currentIndex];

  // 3. Fallback State
  // If we've exhausted all candidates, show placeholder
  const showPlaceholder = !currentUrl || currentIndex >= validCandidates.length;

  if (showPlaceholder) {
      return (
        <div className={cn("w-full h-full bg-secondary/30 flex items-center justify-center p-4 text-center flex-col text-muted-foreground animate-in fade-in duration-500", className)}>
            <Book className="h-12 w-12 mb-2 opacity-20" />
            <span className="text-xs font-semibold opacity-40">{cleanTitle}</span>
        </div>
      );
  }

  // 4. Proxy Logic for current URL
  // Only proxy Google Books URLs to fix mixed content/CORS issues
  let srcToRender = currentUrl;
  if (srcToRender.includes('books.google.com')) {
      srcToRender = `/api-proxy/image?url=${encodeURIComponent(currentUrl)}`;
  }

  // 5. Image Load Handler (The "Ghost Success" Fix)
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    // Check natural dimensions. A 1x1 pixel image is a "ghost success".
    // We use 5px as a safe threshold.
    if (img.naturalWidth < 5 || img.naturalHeight < 5) {
        console.warn(`[BookCover] Ghost success detected (tiny image: ${img.naturalWidth}x${img.naturalHeight}) for: ${currentUrl}. Retrying...`);
        // Trigger the failure logic manually
        setFailedIndex(prev => prev + 1);
    } else {
        console.log(`[BookCover] Successfully loaded image: ${currentUrl} (${img.naturalWidth}x${img.naturalHeight})`);
    }
  };

  return (
    <img
        key={srcToRender} // Force re-mount on src change to ensure onError fires correctly for new URL
        src={srcToRender}
        alt={`Cover of ${cleanTitle}`}
        className={cn("w-full h-full object-cover transition-transform duration-500 group-hover:scale-105", className)}
        loading="lazy"
        onLoad={handleImageLoad} // NEW: Check dimensions on load
        onError={() => {
            // Standard network error (404, 500, etc.)
            console.warn(`[BookCover] Failed to load cover (Network Error): ${currentUrl}. Trying next candidate.`);
            setFailedIndex(prev => prev + 1);
        }}
    />
  );
}