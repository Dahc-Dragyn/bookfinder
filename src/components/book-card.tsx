'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Book, Sparkles, Layers } from 'lucide-react'; 
import { cn } from '@/lib/utils';
import type { SearchResultItem } from '@/lib/types';

interface BookCardProps {
  book: SearchResultItem;
}

export default function BookCard({ book }: BookCardProps) {
  const cleanTitle = book.title.replace(/<[^>]*>?/gm, '').substring(0, 50);
  
  let coverSrc = book.cover_url;
  const isGoogle = coverSrc?.includes('books.google.com') ?? false;

  // LOGIC: Only proxy Google Books to fix HTTP/CORS issues.
  if (isGoogle && coverSrc) {
      coverSrc = `/api-proxy/image?url=${encodeURIComponent(coverSrc)}`;
  }

  const hasLink = !!book.isbn_13;
  const authorNames = book.authors?.map(a => a.name).join(', ') || 'Unknown Author';

  // --- FRESHNESS SIGNALS (Layer 3) ---
  
  // 1. "Just In" Logic (Last 45 Days)
  const isJustIn = (() => {
    if (!book.published_date) return false;
    const pubDate = new Date(book.published_date);
    if (isNaN(pubDate.getTime())) return false;
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - pubDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 45;
  })();

  // 2. "Series Premiere" Logic
  const isPremiere = book.series?.order === 1;

  return (
    <Link 
      href={hasLink ? `/book/${book.isbn_13}` : '#'} 
      className={`group ${!hasLink ? 'pointer-events-none cursor-default opacity-60' : ''}`}
      aria-disabled={!hasLink}
    >
      <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50 flex flex-col border-border/40 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-0 flex-grow flex flex-col">
          <div className="aspect-[2/3] w-full relative bg-secondary/30 flex items-center justify-center overflow-hidden">
            
            {/* Image Layer */}
            {coverSrc && (
              <img
                src={coverSrc}
                alt={`Cover of ${cleanTitle}`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 relative z-10"
                onError={(e) => {
                    // Hide the broken image tag so the background placeholder shows
                    e.currentTarget.style.display = 'none';
                    // Find the placeholder sibling and show it
                    const parent = e.currentTarget.parentElement;
                    const placeholder = parent?.querySelector('.placeholder-fallback');
                    if (placeholder) {
                        placeholder.classList.remove('hidden');
                    }
                }}
              />
            )}

            {/* Fallback Placeholder Layer */}
            <div className={cn(
                "placeholder-fallback absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-secondary/30",
                coverSrc ? "hidden" : "" 
            )}>
                <Book className="h-12 w-12 mb-2 opacity-20" />
                <span className="text-xs font-semibold opacity-40">{cleanTitle}</span>
            </div>
            
            {/* --- BADGES LAYER --- */}
            <div className="absolute inset-0 z-20 pointer-events-none p-2 flex flex-col justify-between">
                
                {/* Top Row: Just In (Left) & Format (Right) */}
                <div className="flex justify-between items-start gap-2">
                    {isJustIn ? (
                        <div className="bg-emerald-500/90 text-white text-[10px] px-2 py-0.5 rounded shadow-sm font-bold uppercase tracking-wider flex items-center gap-1 backdrop-blur-md animate-in fade-in zoom-in duration-300">
                            <Sparkles className="h-2.5 w-2.5 fill-current" />
                            <span>New</span>
                        </div>
                    ) : <div></div> /* Spacer */}

                    {book.format_tag && (
                        <div className="bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-md uppercase tracking-wider font-bold shadow-sm">
                            {book.format_tag}
                        </div>
                    )}
                </div>

                {/* Bottom Row: Series Premiere (Left) */}
                <div className="flex justify-start">
                    {isPremiere && (
                        <div className="bg-primary/90 text-white text-[10px] px-2 py-0.5 rounded shadow-sm font-bold uppercase tracking-wider flex items-center gap-1 backdrop-blur-md">
                            <Layers className="h-2.5 w-2.5" />
                            <span>Series #1</span>
                        </div>
                    )}
                </div>
            </div>

          </div>
          
          <div className="p-3 flex flex-col justify-between flex-grow">
            <div>
              <p className="font-bold font-headline truncate text-sm md:text-base text-foreground" title={book.title}>
                {cleanTitle}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5" title={authorNames}>
                {authorNames}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}