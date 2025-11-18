import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Book, ImageOff } from 'lucide-react';
import type { SearchResultItem } from '@/lib/types';

interface BookCardProps {
  book: SearchResultItem;
}

export default function BookCard({ book }: BookCardProps) {
  // 1. Safety Check: If title looks like HTML/Garbage, sanitize it for the placeholder
  const cleanTitle = book.title.replace(/<[^>]*>?/gm, '').substring(0, 50);
  
  // 2. Construct Placeholder: Use a clean, encoded title
  const placeholderSrc = `https://placehold.co/400x600/e2e8f0/1e293b?text=${encodeURIComponent(cleanTitle || 'No Title')}`;
  
  // 3. Decide Cover Source: API URL -> Placeholder
  const coverSrc = book.cover_url || placeholderSrc;

  const hasLink = !!book.isbn_13;

  return (
    <Link 
      href={hasLink ? `/book/${book.isbn_13}` : '#'} 
      className={`group ${!hasLink ? 'pointer-events-none cursor-default opacity-60' : ''}`}
      aria-disabled={!hasLink}
    >
      <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50 flex flex-col">
        <CardContent className="p-0 flex-grow flex flex-col">
          <div className="aspect-[2/3] w-full relative bg-secondary/30 flex items-center justify-center overflow-hidden">
            {book.cover_url ? (
              <Image
                src={coverSrc}
                alt={`Cover of ${cleanTitle}`}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                unoptimized={true} 
              />
            ) : (
              // Fallback icon if API explicitly returned no URL
              <div className="text-muted-foreground flex flex-col items-center text-center p-4">
                <Book className="h-12 w-12 mb-2 opacity-20" />
                <span className="text-xs font-semibold opacity-40">{cleanTitle}</span>
              </div>
            )}
          </div>
          
          <div className="p-3">
            <p className="font-bold font-headline truncate text-sm md:text-base" title={book.title}>
              {cleanTitle}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {book.authors && book.authors.length > 0 ? book.authors.join(', ') : 'Unknown Author'}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}