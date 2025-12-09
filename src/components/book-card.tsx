'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Book, Sparkles, Layers, Landmark, Database } from 'lucide-react'; 
import { cn } from '@/lib/utils';
import type { SearchResultItem } from '@/lib/types';

interface BookCardProps {
  book: SearchResultItem;
}

export default function BookCard({ book }: BookCardProps) {
  const cleanTitle = book.title.replace(/<[^>]*>?/gm, '').substring(0, 50);
  
  let coverSrc = book.cover_url;
  const isGoogle = coverSrc?.includes('books.google.com') ?? false;

  if (isGoogle && coverSrc) {
      coverSrc = `/api-proxy/image?url=${encodeURIComponent(coverSrc)}`;
  }

  // --- SOURCE DETECTION ---
  const isLocItem = book.data_sources?.includes('Library of Congress');
  const isPrimarySource = book.format_tag === 'Primary Source';

  // --- LINKING LOGIC ---
  let linkTarget = '#';
  let hasLink = false;

  if (book.isbn_13) {
      linkTarget = `/book/${book.isbn_13}`;
      hasLink = true;
  } else if (book.isbn_10) {
      linkTarget = `/book/${book.isbn_10}`;
      hasLink = true;
  } else if (book.lccn && book.lccn.length > 0) {
      // NEW: Link using LCCN if ISBN is missing!
      // This works because main.py v4.5.1 treats this ID as a "Universal ID"
      linkTarget = `/book/${book.lccn[0]}`;
      hasLink = true;
  }

  const authorNames = book.authors?.map(a => a.name).join(', ') || 'Unknown Author';

  const isJustIn = (() => {
    if (!book.published_date) return false;
    const pubDate = new Date(book.published_date);
    if (isNaN(pubDate.getTime())) return false;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - pubDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 45;
  })();

  const isPremiere = book.series?.order === 1;

  return (
    <Link 
      href={linkTarget} 
      className={`group ${!hasLink ? 'cursor-default' : ''}`}
      aria-disabled={!hasLink}
      onClick={(e) => !hasLink && e.preventDefault()}
    >
      <Card className={cn(
          "overflow-hidden h-full transition-all duration-300 flex flex-col border-border/40 bg-card/50 backdrop-blur-sm",
          hasLink ? "hover:shadow-lg hover:border-primary/50" : "opacity-80"
        )}>
        <CardContent className="p-0 flex-grow flex flex-col">
          <div className={cn(
              "aspect-[2/3] w-full relative flex items-center justify-center overflow-hidden",
              isLocItem ? "bg-purple-500/10" : "bg-secondary/30"
            )}>
            
            {/* Image Layer */}
            {coverSrc ? (
              <img
                src={coverSrc}
                alt={`Cover of ${cleanTitle}`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 relative z-10"
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    const placeholder = parent?.querySelector('.placeholder-fallback');
                    if (placeholder) {
                        placeholder.classList.remove('hidden');
                    }
                }}
              />
            ) : null}

            {/* Fallback Placeholder Layer */}
            <div className={cn(
                "placeholder-fallback absolute inset-0 flex flex-col items-center justify-center text-center p-4",
                coverSrc ? "hidden" : "",
                isLocItem ? "text-purple-400/50" : "text-muted-foreground/40"
            )}>
                {isLocItem ? (
                    <Landmark className="h-12 w-12 mb-2" />
                ) : (
                    <Book className="h-12 w-12 mb-2" />
                )}
                <span className="text-xs font-semibold opacity-60 line-clamp-3 px-2">
                    {cleanTitle}
                </span>
            </div>
            
            {/* --- BADGES LAYER --- */}
            <div className="absolute inset-0 z-20 pointer-events-none p-2 flex flex-col justify-between">
                
                {/* Top Row */}
                <div className="flex justify-between items-start gap-2">
                    {isJustIn ? (
                        <div className="bg-emerald-500/90 text-white text-[10px] px-2 py-0.5 rounded shadow-sm font-bold uppercase tracking-wider flex items-center gap-1 backdrop-blur-md">
                            <Sparkles className="h-2.5 w-2.5 fill-current" />
                            <span>New</span>
                        </div>
                    ) : <div></div>}

                    {isPrimarySource && (
                        <div className="bg-purple-600/90 text-white text-[10px] px-2 py-0.5 rounded shadow-sm font-bold uppercase tracking-wider flex items-center gap-1 backdrop-blur-md">
                            <Database className="h-2.5 w-2.5" />
                            <span>Archive</span>
                        </div>
                    )}
                    
                    {book.format_tag && !isPrimarySource && (
                        <div className="bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-md uppercase tracking-wider font-bold shadow-sm">
                            {book.format_tag}
                        </div>
                    )}
                </div>

                {/* Bottom Row */}
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
              <p className={cn(
                  "font-bold font-headline truncate text-sm md:text-base",
                  isLocItem ? "text-purple-900 dark:text-purple-100" : "text-foreground"
                )} title={book.title}>
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