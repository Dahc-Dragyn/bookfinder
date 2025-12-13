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
  Landmark, 
  Database,
  Building2 // Icon for LOC
} from 'lucide-react';
import BookCard from '@/components/book-card';
import ExpandableText from '@/components/expandable-text';
import BookCover from '@/components/book-cover';

// --- Helper Component: More By Author ---
async function MoreByAuthor({ authorName, currentIsbn }: { authorName: string; currentIsbn: string }) {
  const books = await searchBooks(`inauthor:"${authorName}"`);
  
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
  
  console.log(`[BookDetail] Fetching ID: ${isbn}`);
  const book = await getBookByIsbn(isbn);

  if (!book) {
    return (
      <main className="container mx-auto px-4 py-16 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold font-headline mb-4">Item Not Found</h1>
        <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
          We couldn&apos;t find detailed information for ID <span className="font-mono text-foreground">{isbn}</span>.
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
  const authorName = primaryAuthor?.name || 'Unknown Contributor';
  const authorBio = primaryAuthor?.bio;
  
  const rating = book.average_rating || 0;
  const ratingCount = book.ratings_count || 0;

  // --- LOC DETECTION ---
  const isLocItem = book.data_sources?.includes('Library of Congress');
  const locUrl = book.loc_url; // Assuming backend provides this, or we construct it via LCCN

  // --- INTELLIGENT COVER LOGIC ---
  let isModern = true; 
  if (book.published_date && book.published_date.length >= 4) {
      const year = parseInt(book.published_date.substring(0, 4));
      if (!isNaN(year) && year < 2005) {
          isModern = false;
      }
  }

  const rawUrls: string[] = [
    book.google_cover_links?.extraLarge,
    book.google_cover_links?.large,
    book.open_library_cover_links?.large,   
    book.open_library_cover_links?.medium,  
    book.google_cover_links?.medium,
    book.google_cover_links?.thumbnail,
    book.google_cover_links?.smallThumbnail,
    book.open_library_cover_links?.small
  ].filter((url): url is string => url !== null && url !== undefined && url !== '');

  let finalUrls: string[] = [];
  
  if (isModern) {
      const googleThumb = rawUrls.find(u => u?.includes('books.google.com'));
      if (googleThumb) {
        const highRes = googleThumb
            .replace(/zoom=[0-9]/, 'zoom=0')
            .replace('&edge=curl', '') 
            + '&minSize=15000'; 
        finalUrls.push(highRes);
      }
      const safeFallbacks = rawUrls.filter(u => !u?.includes('zoom=0'));
      finalUrls = [...finalUrls, ...safeFallbacks];
  } else {
      finalUrls = rawUrls.filter(u => !u?.includes('zoom=0'));
  }

  const price = book.sale_info?.listPrice?.amount 
    ? `$${book.sale_info.listPrice.amount} ${book.sale_info.listPrice.currencyCode}`
    : null;

  let displaySubjects = book.subjects || [];
  if (displaySubjects.length > 1) {
    displaySubjects = displaySubjects.filter(s => 
      !['Fiction', 'General', 'Juvenile Fiction', 'Young Adult Fiction', 'Literature', 'Books'].includes(s)
    );
  }
  if (displaySubjects.length === 0 && book.subjects?.length > 0) {
    displaySubjects = book.subjects;
  }

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
        <div className="md:col-span-4 lg:col-span-4 flex flex-col gap-4">
          
          {/* Cover Image or LOC Placeholder */}
          <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden shadow-2xl bg-secondary/20 border border-border/50 group flex items-center justify-center">
            {finalUrls.length > 0 ? (
                <BookCover urls={finalUrls} title={book.title} />
            ) : (
                // LOC Fallback Display
                <div className={`flex flex-col items-center justify-center p-6 text-center h-full w-full ${isLocItem ? 'bg-purple-500/10 text-purple-700' : 'bg-muted text-muted-foreground'}`}>
                    {isLocItem ? <Landmark className="h-20 w-20 mb-4 opacity-50" /> : <BookOpen className="h-20 w-20 mb-4 opacity-20" />}
                    <span className="font-headline font-bold text-sm leading-tight opacity-70 px-4">
                        {isLocItem ? "Archival Material" : "No Cover Available"}
                    </span>
                </div>
            )}
          </div>

          {/* Actions Grid */}
          <div className="space-y-3">
            
            {/* PRIMARY ACTION BUTTON */}
            {isLocItem ? (
                // LOC Action
                <Button asChild className="w-full text-lg h-12 shadow-md font-bold tracking-wide bg-purple-700 hover:bg-purple-800 text-white" size="lg">
                    {/* Construct LOC link if missing from API */}
                    <a href={book.loc_url || `https://lccn.loc.gov/${book.lccn?.[0] || isbn}`} target="_blank" rel="noopener noreferrer">
                        <Building2 className="mr-2 h-5 w-5" />
                        View at LOC.gov
                    </a>
                </Button>
            ) : (
                // Commercial Action
                book.sale_info?.buyLink ? (
                    <Button asChild className="w-full text-lg h-12 shadow-md font-bold tracking-wide" size="lg">
                        <a href={book.sale_info.buyLink} target="_blank" rel="noopener noreferrer">
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            Buy eBook {price ? `• ${price}` : ''}
                        </a>
                    </Button>
                ) : (
                    <Button disabled variant="secondary" className="w-full h-12">
                        eBook Not Available
                    </Button>
                )
            )}

            {/* Find in Library (WorldCat) */}
            <Button variant="outline" asChild className="w-full h-12 border-primary/30 hover:bg-primary/5 text-foreground">
                <a href={`https://www.worldcat.org/search?q=${book.isbn_13 || isbn}`} target="_blank" rel="noopener noreferrer">
                    <Library className="mr-2 h-5 w-5 text-primary" /> 
                    Find in Library
                </a>
            </Button>

            {/* Preview Link (Only show if Google) */}
            {!isLocItem && (
                <Button variant="ghost" size="sm" asChild className="w-full text-muted-foreground hover:text-foreground">
                    <a href={`https://books.google.com/books?isbn=${book.isbn_13 || isbn}`} target="_blank" rel="noopener noreferrer">
                        Preview on Google Books <ExternalLink className="ml-1.5 h-3 w-3" />
                    </a>
                </Button>
            )}
          </div>

           {/* ID Badge (ISBN or LCCN) */}
           <div className="flex justify-center pt-2">
             <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground/70 font-normal border-dashed">
               {isLocItem && book.lccn && book.lccn.length > 0 
                  ? `LCCN: ${book.lccn[0]}` 
                  : `ISBN: ${book.isbn_13 || isbn}`}
             </Badge>
           </div>

           {/* Data Sources Badges */}
           {book.data_sources && book.data_sources.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 pt-1 border-t border-border/40 mt-2 animate-in fade-in zoom-in duration-500 delay-200">
              {book.data_sources.map((source) => {
                let icon = <Database className="h-3 w-3" />;
                let styles = "bg-muted text-muted-foreground border-border";

                if (source === "Library of Congress") {
                  icon = <Landmark className="h-3 w-3" />;
                  styles = "bg-purple-500/10 text-purple-600 border-purple-200";
                } else if (source === "Open Library") {
                  icon = <Library className="h-3 w-3" />;
                  styles = "bg-blue-500/10 text-blue-600 border-blue-200";
                } else if (source === "Google Books") {
                   icon = <Globe className="h-3 w-3" />;
                   styles = "bg-amber-500/10 text-amber-600 border-amber-200";
                }

                return (
                  <Badge key={source} variant="outline" className={`font-normal text-[10px] h-5 gap-1.5 ${styles}`}>
                    {icon} {source}
                  </Badge>
                )
              })}
            </div>
          )}
        </div>

        {/* --- RIGHT COLUMN: Content (8/12) --- */}
        <div className="md:col-span-8 lg:col-span-8 space-y-8">
          
          {/* Header */}
          <header className="space-y-4">
            <div className="space-y-1">
              <h1 className="text-4xl md:text-5xl font-bold font-headline text-balance leading-tight">
                {book.title}
              </h1>
              {book.subtitle && (
                <p className="text-2xl text-muted-foreground font-headline italic font-light text-balance leading-snug">
                  {book.subtitle}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <span className="font-medium text-lg text-foreground flex items-center gap-1">
                  by{' '}
                  {book.authors && book.authors.length > 0 ? (
                    book.authors.map((author, i) => (
                        <span key={i}>
                            {i > 0 && ", "}
                            <Link 
                                href={`/author/${encodeURIComponent(author.key || author.name)}`}
                                className="text-primary hover:underline hover:text-primary/80 transition-colors font-bold"
                            >
                                {author.name}
                            </Link>
                        </span>
                    ))
                  ) : (
                    <span className="text-primary">Unknown Author</span>
                  )}
                </span>
               
               {!isLocItem && (
                   <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border border-yellow-500/20">
                     <Star className="h-3.5 w-3.5 fill-current" />
                     <span className="font-bold">{rating > 0 ? rating.toFixed(1) : 'N/A'}</span>
                     <span className="text-xs opacity-80 ml-1">({ratingCount} reviews)</span>
                   </div>
               )}
            </div>
          </header>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-4 py-6 border-y border-border/60">
             <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <BookType className="h-3 w-3" /> Format
                </span>
                <span className="text-sm font-medium font-mono text-foreground">
                  {book.page_count ? `${book.page_count} pages` : (book.format_tag || 'Unknown')}
                </span>
             </div>
             <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="h-3 w-3" /> Publisher
                </span>
                <span className="text-sm font-medium truncate" title={book.publisher || ''}>
                  {book.publisher || 'Unknown'}
                </span>
             </div>
             <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" /> Released
                </span>
                <span className="text-sm font-medium">
                  {book.published_date || 'Unknown'}
                </span>
             </div>
             {book.sale_info?.country && (
               <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="h-3 w-3" /> Region
                  </span>
                  <span className="text-sm font-medium">
                    {book.sale_info.country}
                  </span>
               </div>
             )}
             {book.dimensions && (
                <div className="flex flex-col gap-1 sm:col-span-2">
                   <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                     <Ruler className="h-3 w-3" /> Dimensions
                   </span>
                   <span className="text-sm font-medium text-muted-foreground">
                     {book.dimensions.height || '?'} x {book.dimensions.width || '?'} x {book.dimensions.thickness || '?'}
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
                {displaySubjects.map(subject => (
                  <Link 
                    key={subject} 
                    href={`/search?q=&subject=${encodeURIComponent(subject)}`}
                    className="no-underline group"
                  >
                    <Badge 
                      variant="secondary" 
                      className="px-3 py-1 text-sm font-normal bg-secondary/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-200 border border-transparent cursor-pointer"
                    >
                      {subject}
                    </Badge>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Description */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5" /> {isLocItem ? "Archival Description" : "Synopsis"}
            </h3>
            {book.description ? (
               <ExpandableText text={book.description} />
            ) : (
               <p className="text-muted-foreground italic">No synopsis available for this edition.</p>
            )}
          </section>

          {/* Author Bio */}
          {authorBio && (
            <section className="mt-8 pt-8 border-t border-border/40">
               <div className="bg-card/50 rounded-xl border border-border/60 p-6 flex flex-col md:flex-row gap-6">
                 <div className="flex-shrink-0">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center text-primary font-headline text-2xl font-bold border-2 border-background shadow-sm">
                       {authorName.charAt(0)}
                    </div>
                 </div>
                 <div className="space-y-2 flex-grow">
                    <div className="flex items-center justify-between">
                       <h3 className="text-xl font-bold font-headline">About {authorName}</h3>
                    </div>
                    <div className="text-sm text-muted-foreground leading-relaxed prose dark:prose-invert max-w-none">
                       <ExpandableText text={authorBio} limit={250} />
                    </div>
                 </div>
               </div>
            </section>
          )}

        </div>
      </div>

      {/* Footer */}
      <MoreByAuthor authorName={authorName} currentIsbn={book.isbn_13 || isbn} />

    </main>
  );
}