import { getBookByIsbn, searchBooks } from '@/lib/actions';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, ShoppingCart, Star, Calendar, BookOpen, 
  Layers, Hash, User 
} from 'lucide-react';
import BookCard from '@/components/book-card';
import ExpandableText from '@/components/expandable-text';

// --- Helper Component: More By Author ---
async function MoreByAuthor({ authorName, currentIsbn }: { authorName: string, currentIsbn: string }) {
  // Fetch books by this author
  const books = await searchBooks(`inauthor:"${authorName}"`);
  
  // Filter out the current book
  const otherBooks = books
    .filter(b => b.isbn_13 !== currentIsbn)
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
  const book = await getBookByIsbn(isbn);

  if (!book) {
    return (
      <main className="container mx-auto px-4 py-16 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold font-headline mb-4">Book Not Found</h1>
        <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
          We couldn't find detailed information for ISBN <span className="font-mono text-foreground">{isbn}</span>.
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
  const allAuthors = book.authors?.map(a => a.name).join(', ');
  const authorBio = primaryAuthor?.bio; // This is the new field from Backend v1.8!
  
  // Rating Logic
  const rating = book.average_rating || 0;
  const ratingCount = book.ratings_count || 0;

  // Image Logic: Smart Selection
  let rawCoverUrl = 
    book.google_cover_links?.extraLarge ||
    book.google_cover_links?.large ||
    book.google_cover_links?.medium ||
    book.open_library_cover_links?.large ||
    book.open_library_cover_links?.medium ||
    book.google_cover_links?.small ||
    book.google_cover_links?.thumbnail ||
    book.open_library_cover_links?.small;

  // Image Cleanup
  if (rawCoverUrl) {
    if (rawCoverUrl.startsWith('http://')) rawCoverUrl = rawCoverUrl.replace('http://', 'https://');
    if (rawCoverUrl.includes('books.google.com')) rawCoverUrl = rawCoverUrl.replace('&edge=curl', '');
  }
  const coverUrl = rawCoverUrl || `https://placehold.co/400x600/e2e8f0/1e293b?text=${encodeURIComponent(book.title.substring(0, 20))}`;

  // Price Logic
  const price = book.sale_info?.listPrice?.amount 
    ? `$${book.sale_info.listPrice.amount} ${book.sale_info.listPrice.currencyCode}`
    : null;

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl min-h-screen">
      
      {/* --- Top Navigation --- */}
      <nav className="mb-8">
        <Button variant="ghost" size="sm" asChild className="pl-0 text-muted-foreground hover:text-foreground transition-colors">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Browse
          </Link>
        </Button>
      </nav>

      <div className="grid md:grid-cols-12 gap-8 lg:gap-16">
        
        {/* --- LEFT COLUMN: Visuals & Actions (4/12) --- */}
        <div className="md:col-span-4 lg:col-span-4 flex flex-col gap-6">
          {/* Cover Image with Shadow */}
          <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden shadow-2xl bg-secondary/20 border border-border/50 group">
            <Image
              src={coverUrl}
              alt={`Cover of ${book.title}`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>

          {/* Primary Action */}
          {book.sale_info?.buyLink ? (
            <Button asChild className="w-full text-lg h-14 shadow-lg shadow-primary/20 font-bold tracking-wide" size="lg">
              <a href={book.sale_info.buyLink} target="_blank" rel="noopener noreferrer">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Buy eBook {price ? `• ${price}` : ''}
              </a>
            </Button>
          ) : (
             <Button disabled variant="secondary" className="w-full h-12">
                eBook Not Available
             </Button>
          )}
          
           {/* ISBN Badge */}
           <div className="flex justify-center">
             <Badge variant="outline" className="font-mono text-xs text-muted-foreground font-normal">
                ISBN: {book.isbn_13}
             </Badge>
           </div>
        </div>

        {/* --- RIGHT COLUMN: Content (8/12) --- */}
        <div className="md:col-span-8 lg:col-span-8 space-y-10">
          
          {/* 1. Header Section */}
          <header className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold font-headline text-balance leading-tight">
                {book.title}
              </h1>
              {book.subtitle && (
                <p className="text-2xl text-muted-foreground font-headline italic font-light text-balance">
                  {book.subtitle}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
               <span className="font-medium text-lg text-foreground">by {allAuthors}</span>
               
               {/* Rating Pill */}
               <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border border-yellow-500/20">
                 <Star className="h-3.5 w-3.5 fill-current" />
                 <span className="font-bold">{rating > 0 ? rating : 'N/A'}</span>
                 <span className="text-xs opacity-80 ml-1">({ratingCount} reviews)</span>
               </div>
            </div>
          </header>

          <Separator />

          {/* 2. Description Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Synopsis
            </h3>
            {book.description ? (
               <ExpandableText text={book.description} />
            ) : (
               <p className="text-muted-foreground italic">No synopsis available for this edition.</p>
            )}
          </section>

          {/* 3. Metadata Bar (Publisher, Date, Pages) */}
          <div className="grid grid-cols-3 gap-4 p-5 bg-secondary/30 rounded-xl border border-border/50 backdrop-blur-sm">
            <div className="flex flex-col gap-1">
               <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                 <Layers className="h-3 w-3" /> Publisher
               </span>
               <span className="text-sm font-semibold truncate" title={book.publisher || ''}>
                 {book.publisher || 'Unknown'}
               </span>
            </div>
            <div className="flex flex-col gap-1 border-l border-border/50 pl-4">
               <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                 <Calendar className="h-3 w-3" /> Released
               </span>
               <span className="text-sm font-semibold">
                 {book.published_date || 'Unknown'}
               </span>
            </div>
            <div className="flex flex-col gap-1 border-l border-border/50 pl-4">
               <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                 <Hash className="h-3 w-3" /> Length
               </span>
               <span className="text-sm font-semibold">
                 {book.page_count ? `${book.page_count} Pages` : '-'}
               </span>
            </div>
          </div>

          {/* 4. Genres & Themes Cloud */}
          {book.subjects && book.subjects.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-lg font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Hash className="h-4 w-4" /> Genres & Themes
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {book.subjects.map(subject => (
                  <Badge 
                    key={subject} 
                    variant="secondary" 
                    className="px-3 py-1.5 text-sm font-normal hover:bg-primary hover:text-primary-foreground transition-colors cursor-default border border-border/60"
                  >
                    {subject}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* 5. Author Bio (New Feature) */}
          {authorBio && (
            <section className="space-y-4 pt-4">
               <div className="flex items-center gap-3 mb-2">
                 <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="h-4 w-4" />
                 </div>
                 <h3 className="text-xl font-bold font-headline">About {authorName}</h3>
               </div>
               <div className="bg-card p-6 rounded-xl border shadow-sm text-sm leading-relaxed text-muted-foreground">
                 <ExpandableText text={authorBio} limit={250} />
               </div>
            </section>
          )}

        </div>
      </div>

      {/* --- Footer Section: More Books --- */}
      <MoreByAuthor authorName={authorName} currentIsbn={book.isbn_13} />

    </main>
  );
}