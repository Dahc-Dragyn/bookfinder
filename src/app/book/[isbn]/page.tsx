import { getBookByIsbn, searchBooks } from '@/lib/actions';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  ShoppingCart,
  Star,
  Calendar,
  BookOpen,
  Layers,
  Sparkles,
  BookType,
  Ruler,
  Globe,
  Library,
  ExternalLink,
} from 'lucide-react';
import BookCard from '@/components/book-card';
import ExpandableText from '@/components/expandable-text';
import BookCover from '@/components/book-cover';
import Recommendations from '@/components/ai/recommendations';

// --- Helper Component: More By Author ---
async function MoreByAuthor({ authorName, currentIsbn }: { authorName: string; currentIsbn: string }) {
  const books = await searchBooks(`inauthor:"${authorName}"`);
  const otherBooks = books
    .filter((b) => b.isbn_13 !== currentIsbn)
    .slice(0, 5);

  if (otherBooks.length === 0) return null;

  return (
    <section className="mt-16 pt-8 border-t border-border/40 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
      <h3 className="text-2xl font-headline font-bold mb-6 flex items-center gap-2">
        More by <span className="text-primary">{authorName}</span>
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
  const { isbn } = await params;

  console.log(`[BookDetail] Fetching ISBN: ${isbn}`);
  const book = await getBookByIsbn(isbn);

  if (!book) {
    return (
      <main className="container mx-auto px-4 py-16 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold font-headline mb-4">Book Not Found</h1>
        <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
          We couldn&apos;t find detailed information for ISBN{' '}
          <span className="font-mono text-foreground">{isbn}</span>.
        </p>
        <Button asChild variant="outline" size="lg">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Browse
          </Link>
        </Button>
      </main>
    );
  }

  // --- Data Prep ---
  const primaryAuthor = book.authors?.[0];
  const authorName = primaryAuthor?.name || 'Unknown Author';
  const allAuthors = book.authors?.map((a) => a.name).join(', ') || 'Unknown Author';
  const authorBio = primaryAuthor?.bio;

  const rating = book.average_rating || 0;
  const ratingCount = book.ratings_count || 0;

  // --- IMAGE LOGIC (High-Res Priority Restoration) ---
  // CORRECTED LOGIC: Prioritize the best *available* links from the API response.
  // 1. Open Library Large: Most reliable high-res source.
  // 2. Google Extra Large / Large: Best quality, but often missing.
  // 3. Open Library Medium / Google Medium: Good fallbacks.
  // 4. Google Thumbnail: Safest fallback.
  const coverUrls = [
    book.open_library_cover_links?.large,       // #1 High-Res Reliable
    book.google_cover_links?.extraLarge,        // #2 Best Quality (if present)
    book.google_cover_links?.large,             // #3 Great Quality (if present)
    book.open_library_cover_links?.medium,      // #4 Good Fallback
    book.google_cover_links?.medium,            // #5 Good Fallback
    book.google_cover_links?.thumbnail,         // #6 Safe Fallback
    book.google_cover_links?.smallThumbnail,
    book.open_library_cover_links?.small,
  ].filter(Boolean) as string[];

  // Debug logs
  console.log('[BookDetail] Raw Google Links:', book.google_cover_links);
  console.log(`[BookDetail] Final cover URLs (${coverUrls.length}):`, coverUrls);

  const price = book.sale_info?.listPrice?.amount
    ? `$${book.sale_info.listPrice.amount} ${book.sale_info.listPrice.currencyCode}`
    : null;

  // Clean up generic subjects
  let displaySubjects = book.subjects || [];
  if (displaySubjects.length > 1) {
    displaySubjects = displaySubjects.filter(
      (s) =>
        ![
          'Fiction',
          'General',
          'Juvenile Fiction',
          'Young Adult Fiction',
          'Literature',
          'Books',
        ].includes(s)
    );
  }
  if (displaySubjects.length === 0 && book.subjects?.length > 0) {
    displaySubjects = book.subjects;
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl min-h-screen">
      {/* Back */}
      <nav className="mb-8">
        <Button variant="ghost" size="sm" asChild className="pl-0">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Browse
          </Link>
        </Button>
      </nav>

      <div className="grid md:grid-cols-12 gap-8 lg:gap-16">
        {/* LEFT: Cover + Actions */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden shadow-2xl bg-secondary/20 border border-border/50">
            <BookCover urls={coverUrls} title={book.title} />
          </div>

          <div className="space-y-3">
            {book.sale_info?.buyLink ? (
              <Button asChild className="w-full text-lg h-12" size="lg">
                <a href={book.sale_info.buyLink} target="_blank" rel="noopener noreferrer">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Buy eBook {price && `• ${price}`}
                </a>
              </Button>
            ) : (
              <Button disabled variant="secondary" className="w-full h-12">
                eBook Not Available
              </Button>
            )}

            <Button variant="outline" asChild className="w-full h-12">
              <a href={`https://www.worldcat.org/search?q=${book.isbn_13}`} target="_blank" rel="noopener noreferrer">
                <Library className="mr-2 h-5 w-5 text-primary" />
                Find in Library
              </a>
            </Button>

            <Button variant="ghost" size="sm" asChild className="w-full">
              <a href={`https://books.google.com/books?isbn=${book.isbn_13}`} target="_blank" rel="noopener noreferrer">
                Preview on Google Books <ExternalLink className="ml-1.5 h-3 w-3" />
              </a>
            </Button>
          </div>

          <div className="flex justify-center pt-2">
            <Badge variant="outline" className="font-mono text-[10px] border-dashed">
              ISBN: {book.isbn_13}
            </Badge>
          </div>
        </div>

        {/* RIGHT: Content */}
        <div className="md:col-span-8 space-y-8">
          <header className="space-y-4">
            <div className="space-y-1">
              <h1 className="text-4xl md:text-5xl font-bold font-headline text-balance leading-tight">
                {book.title}
              </h1>
              {book.subtitle && (
                <p className="text-2xl text-muted-foreground font-headline italic font-light">
                  {book.subtitle}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="font-medium text-lg">
                by <span className="text-primary">{allAuthors}</span>
              </span>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border border-yellow-500/20">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span className="font-bold">{rating > 0 ? rating.toFixed(1) : 'N/A'}</span>
                <span className="text-xs opacity-80 ml-1">({ratingCount})</span>
              </div>
            </div>
          </header>

          {/* Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-4 py-6 border-y border-border/60">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <BookType className="h-3 w-3" /> Length
              </span>
              <span className="text-sm font-medium font-mono">
                {book.page_count ? `${book.page_count} pages` : '—'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Layers className="h-3 w-3" /> Publisher
              </span>
              <span className="text-sm font-medium truncate" title={book.publisher || ''}>
                {book.publisher || 'Unknown'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3 w-3" /> Released
              </span>
              <span className="text-sm font-medium">{book.published_date || 'Unknown'}</span>
            </div>
            {book.sale_info?.country && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Globe className="h-3 w-3" /> Region
                </span>
                <span className="text-sm font-medium">{book.sale_info.country}</span>
              </div>
            )}
            {book.dimensions && (
              <div className="sm:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Ruler className="h-3 w-3" /> Dimensions
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  {book.dimensions.height || '?'} × {book.dimensions.width || '?'} ×{' '}
                  {book.dimensions.thickness || '?'}
                </span>
              </div>
            )}
          </div>

          {/* Genres */}
          {displaySubjects.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" /> Genres & Themes
              </h3>
              <div className="flex flex-wrap gap-2">
                {displaySubjects.map((subject) => (
                  <Link key={subject} href={`/search?q=&subject=${encodeURIComponent(subject)}`} className="no-underline">
                    <Badge variant="secondary" className="px-3 py-1 text-sm hover:bg-primary/10 hover:text-primary transition-all">
                      {subject}
                    </Badge>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Synopsis */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5" /> Synopsis
            </h3>
            {book.description ? (
              <ExpandableText text={book.description} />
            ) : (
              <p className="text-muted-foreground italic">No synopsis available.</p>
            )}
          </section>

          {/* Author Bio */}
          {authorBio && (
            <section className="mt-8 pt-8 border-t border-border/40">
              <div className="bg-card/50 rounded-xl border border-border/60 p-6 flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center text-primary font-headline text-2xl font-bold border-2 border-background shadow-sm">
                    {authorName[0]}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold font-headline">About {authorName}</h3>
                  <div className="text-sm text-muted-foreground leading-relaxed prose dark:prose-invert max-w-none">
                    <ExpandableText text={authorBio} limit={250} />
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

       <section className="mt-16 pt-8 border-t border-border/40 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
        <h3 className="text-2xl font-headline font-bold mb-6 flex items-center gap-2">
          <Sparkles className="text-accent" /> AI Recommendations
        </h3>
        <Recommendations title={book.title} author={authorName} />
      </section>

      <MoreByAuthor authorName={authorName} currentIsbn={book.isbn_13} />
    </main>
  );
}
