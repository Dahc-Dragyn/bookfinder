import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import type { SearchResultItem } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface BookCardProps {
  book: SearchResultItem;
}

export default function BookCard({ book }: BookCardProps) {
  const placeholder = PlaceHolderImages.find(p => p.id === book.cover_image_id);
  
  return (
    <Link href={`/book/${book.isbn_13}`} className="group">
      <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50">
        <CardContent className="p-0">
          <div className="aspect-[2/3] w-full relative">
            <Image
              src={placeholder?.imageUrl || `https://picsum.photos/seed/${book.isbn_13}/400/600`}
              alt={`Cover of ${book.title}`}
              data-ai-hint={placeholder?.imageHint || 'book cover'}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="p-3">
            <p className="font-bold font-headline truncate" title={book.title}>
              {book.title}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {book.authors.join(', ')}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
