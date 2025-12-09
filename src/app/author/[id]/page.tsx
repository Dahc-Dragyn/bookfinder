import { getAuthorProfile } from '@/lib/actions';
import BookCard from '@/components/book-card';
import ExpandableText from '@/components/expandable-text';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Book, Info, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // 1. Decode the URL (e.g. "Megan%20Bledsoe" -> "Megan Bledsoe")
  const decodedId = decodeURIComponent(id);

  console.log(`[AuthorPage] Fetching profile for: ${decodedId}`);
  const author = await getAuthorProfile(decodedId);

  // 2. Handle 404 / Not Found
  if (!author) {
    return (
      <main className="container mx-auto px-4 py-16 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold font-headline mb-4">Author Not Found</h1>
        <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
          We couldn&apos;t find information for &quot;{decodedId}&quot;.
        </p>
        <Button asChild variant="outline" size="lg">
            <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Browse
            </Link>
        </Button>
      </main>
    );
  }

  // 3. Safe Initials Generator
  // Fix: Uses regex to split by whitespace, preventing empty strings from crashing the logic
  const initials = author.name
    .trim()
    .split(/\s+/) 
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  // 4. Source Detection
  const isVerified = author.source === 'open_library';
  // Matches the exact fallback string from main.py v3.4.1
  const isPlaceholderBio = author.bio === "Author profile generated from Google Books data.";

  return (
    <main className="container mx-auto px-4 py-8 min-h-screen">
       {/* Nav */}
       <nav className="mb-8">
        <Button variant="ghost" size="sm" asChild className="pl-0 text-muted-foreground hover:text-foreground transition-colors">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Browse
          </Link>
        </Button>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row gap-8 items-start mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Avatar */}
        <div className="flex-shrink-0 mx-auto md:mx-0 relative group">
          <Avatar className="h-32 w-32 md:h-48 md:w-48 border-4 border-background shadow-xl bg-secondary/30">
            <AvatarImage src={author.photo_url || ''} alt={author.name} className="object-cover" />
            <AvatarFallback className="text-4xl font-headline font-bold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          {/* Status Indicator on Avatar */}
          <div className={`absolute bottom-2 right-2 p-1.5 rounded-full border-2 border-background shadow-sm ${isVerified ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white'}`}>
             {isVerified ? <CheckCircle2 className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
          </div>
        </div>

        {/* Info */}
        <div className="flex-grow space-y-4 text-center md:text-left">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold font-headline">{author.name}</h1>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm">
              {author.birth_date && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {author.birth_date} {author.death_date && `– ${author.death_date}`}
                  </span>
                </div>
              )}
              
              {/* Source Badge */}
              <Badge variant={isVerified ? "default" : "secondary"} className={`font-normal ${isVerified ? 'bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-200 hover:bg-amber-500/20'}`}>
                {isVerified ? 'Verified Profile (Open Library)' : 'Automated Listing (Google Books)'}
              </Badge>
            </div>
          </div>

          {author.bio && (
            <div className={`max-w-3xl text-base leading-relaxed ${isPlaceholderBio ? 'text-muted-foreground italic' : 'text-foreground/80'}`}>
              {isPlaceholderBio ? (
                  <span>{author.bio}</span>
              ) : (
                  <ExpandableText text={author.bio} limit={300} />
              )}
            </div>
          )}
        </div>
      </section>

      <Separator className="my-8" />

      {/* Bibliography Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Book className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold font-headline">Bibliography</h2>
          <Badge variant="outline" className="ml-2 rounded-full">
            {author.books.length} works found
          </Badge>
        </div>

        {author.books.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {author.books.map((book, i) => (
              <BookCard key={book.isbn_13 || `auth-book-${i}`} book={book} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card/30 rounded-xl border border-dashed border-border">
            <Info className="h-8 w-8 mx-auto text-muted-foreground mb-3 opacity-50" />
            <p className="text-muted-foreground">
              No books found for this author in our database.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}