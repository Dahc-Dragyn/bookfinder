import { Suspense } from 'react';
import { getAllNewReleases, getFictionGenres } from '@/lib/actions';
import BookCard from '@/components/book-card';
import { Skeleton } from '@/components/ui/skeleton';
import SearchTabs from '@/components/search-tabs';
import Logo from '@/components/logo';
import GenreChips from '@/components/genre-chips';

// Async wrapper for the grid to handle the subject prop
async function BookGrid({ subject }: { subject?: string }) {
  const newReleases = await getAllNewReleases(subject);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {newReleases.map((book, i) => (
        <BookCard key={book.isbn_13 || `home-book-${i}`} book={book} />
      ))}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-[2/3] w-full rounded-md" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const resolvedParams = await searchParams;
  const subject = resolvedParams.subject || 'Fiction';
  
  // Fetch genres on the server
  const genres = await getFictionGenres();

  return (
    <main className="container mx-auto px-4 py-8 md:py-12 min-h-screen flex flex-col">
      <header className="text-center mb-10 space-y-4">
        <div className="inline-block transform hover:scale-105 transition-transform duration-300">
          <Logo />
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
          "Tired of being 'personalized'? We're just a search engine. The smarter you are, the better it works."
        </p>
      </header>

      {/* Search Section */}
      <section className="max-w-2xl mx-auto w-full mb-12">
        <SearchTabs />
      </section>

      {/* Discovery Section */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
          <h2 className="text-3xl font-headline font-bold">
            New in <span className="text-primary">{subject}</span>
          </h2>
        </div>

        {/* Genre Filter Bar */}
        <GenreChips genres={genres} />

        <Suspense key={subject} fallback={<GridSkeleton />}>
          <BookGrid subject={subject} />
        </Suspense>
      </section>
    </main>
  );
}