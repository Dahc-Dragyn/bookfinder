import { getBookByIsbn, searchBooks } from '@/lib/actions';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import PageHeader from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Ruler } from 'lucide-react';
import BookCard from '@/components/book-card';

// --- COMPONENT: More By Author ---
async function MoreByAuthor({ authorName, currentIsbn }: { authorName: string, currentIsbn: string }) {
  const books = await searchBooks(`inauthor:"${authorName}"`);
  
  const otherBooks = books
    .filter(b => b.isbn_13 !== currentIsbn)
    .slice(0, 5);

  if (otherBooks.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border/40 pt-10">
      <h2 className="text-2xl font-bold font-headline mb-6">
        More by {authorName}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {otherBooks.map((book) => (
          <BookCard key={book.isbn_13 || book.title} book={book} />
        ))}
      </div>
    </section>
  );
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ isbn: string }>;
}) {
  const resolvedParams = await params;
  const book = await getBookByIsbn(resolvedParams.isbn);

  if (!book) {
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold font-headline mb-4">Book Not Found</h1>
        <p className="text-muted-foreground mb-8">
          We couldn't find detailed information for ISBN: {resolvedParams.isbn}.
        </p>
        <Button asChild variant="outline">
            <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>
        </Button>
      </main>
    );
  }

  // Extract Author Name
  const authorName = book.authors?.[0]?.name || 'Unknown Author';
  const authorNames = book.authors?.map(a => a.name).join(', ');

  // --- LOGIC: Select Best URL ---
  let rawCoverUrl = 
    book.google_cover_links?.extraLarge ||
    book.google_cover_links?.large ||
    book.google_cover_links?.medium ||
    book.open_library_cover_links?.large ||
    book.open_library_cover_links?.medium ||
    book.google_cover_links?.small ||
    book.google_cover_links?.thumbnail ||
    book.open_library_cover_links?.small;

  // --- SECURITY FIX: Force HTTPS ---
  if (rawCoverUrl) {
    if (rawCoverUrl.startsWith('http://')) {
      rawCoverUrl = rawCoverUrl.replace('http://', 'https://');
    }
    // Google specific cleanup for cleaner images
    if (rawCoverUrl.includes('books.google.com')) {
       rawCoverUrl = rawCoverUrl.replace('&edge=curl', '');
    }
  }

  const coverUrl = rawCoverUrl || `https://placehold.co/400x600/e2e8f0/1e293b?text=${encodeURIComponent(book.title.substring(0, 20))}`;

  // Price logic
  const price = book.sale_info?.listPrice?.amount 
    ? `$${book.sale_info.listPrice.amount} ${book.sale_info.listPrice.currencyCode}`
    : null;

  return (
    <main className="container mx-auto px-4 py-8">
      <PageHeader title={book.title} description={`by ${authorNames}`} />

      <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
        {/* --- LEFT: Cover Image --- */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <div className="aspect-[2/3] w-full max-w-sm mx-auto relative rounded-lg overflow-hidden shadow-2xl border border-border/50 bg-secondary/30">
            <Image
              src={coverUrl}
              alt={`Cover of ${book.title}`}
              fill
              className="object-cover"
              unoptimized={true}
              priority
            />
          </div>

          {/* Buy Button */}
          {book.sale_info?.buyLink && (
            <Button asChild className="w-full max-w-sm mx-auto text-lg h-12" size="lg">
              <a href={book.sale_info.buyLink} target="_blank" rel="noopener noreferrer">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Buy eBook {price ? `(${price})` : ''}
              </a>
            </Button>
          )}
        </div>

        {/* --- RIGHT: Details --- */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Subtitle */}
          {book.subtitle && (
            <p className="text-2xl text-muted-foreground font-headline italic -mt-6 border-b pb-4">
              {book.subtitle}
            </p>
          )}

          {/* Description */}
          <div>
            <h2 className="text-xl font-bold font-headline mb-3">Description</h2>
            <div className="text-muted-foreground prose dark:prose-invert max-w-none leading-relaxed text-lg">
              {book.description ? (
                 <div dangerouslySetInnerHTML={{ __html: book.description }} />
              ) : (
                <p className="italic opacity-70">No description available for this edition.</p>
              )}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-4 border-y py-6 bg-secondary/10 rounded-lg p-4">
            <div>
              <h3 className="font-semibold text-foreground text-xs uppercase tracking-wider opacity-70 mb-1">Publisher</h3>
              <p className="text-sm font-medium">{book.publisher || 'Unknown'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-xs uppercase tracking-wider opacity-70 mb-1">Published</h3>
              <p className="text-sm font-medium">{book.published_date || 'Unknown'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-xs uppercase tracking-wider opacity-70 mb-1">Pages</h3>
              <p className="text-sm font-medium">{book.page_count || '-'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-xs uppercase tracking-wider opacity-70 mb-1">ISBN-13</h3>
              <p className="text-sm font-mono select-all">{book.isbn_13}</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-xs uppercase tracking-wider opacity-70 mb-1">Rating</h3>
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <p className="text-sm font-medium">
                  {book.average_rating ? `${book.average_rating}/5` : 'N/A'}
                </p>
                {book.ratings_count && (
                  <span className="text-xs text-muted-foreground">({book.ratings_count})</span>
                )}
              </div>
            </div>
            
            {/* Dimensions */}
            {book.dimensions && (
               <div>
                <h3 className="font-semibold text-foreground text-xs uppercase tracking-wider opacity-70 mb-1 flex items-center gap-1">
                  <Ruler className="h-3 w-3" /> Dimensions
                </h3>
                <p className="text-sm font-medium">
                  {[book.dimensions.height, book.dimensions.width, book.dimensions.thickness].filter(Boolean).join(' x ') || '-'}
                </p>
              </div>
            )}
          </div>
          
          {/* Subjects */}
          {book.subjects && book.subjects.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wider opacity-70">Subjects</h3>
              <div className="flex flex-wrap gap-2">
                {book.subjects.slice(0, 20).map((subject) => (
                  <Badge key={subject} variant="secondary" className="hover:bg-secondary/80 px-3 py-1">
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- More by Author --- */}
      <MoreByAuthor authorName={authorName} currentIsbn={book.isbn_13} />

    </main>
  );
}