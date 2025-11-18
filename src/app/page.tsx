import { Suspense } from 'react';
import { getNewReleases } from '@/lib/actions';
import BookCard from '@/components/book-card';
import { Skeleton } from '@/components/ui/skeleton';
import SearchTabs from '@/components/search-tabs';
import Logo from '@/components/logo';

async function NewReleases() {
  const newReleases = await getNewReleases();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
      {newReleases.map((book, i) => (
        // *** FIX: Use index as fallback key if ISBN is missing ***
        <BookCard key={book.isbn_13 || `home-book-${i}`} book={book} />
      ))}
    </div>
  );
}

function NewReleasesSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-[2/3] w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <header className="text-center mb-12">
        <div className="inline-block">
          <Logo />
        </div>
        <p className="text-lg text-muted-foreground mt-2">
          Your AI-powered guide to the world of books.
        </p>
      </header>

      <section className="max-w-2xl mx-auto mb-16">
        <SearchTabs />
      </section>

      <section>
        <h2 className="text-3xl font-headline font-bold mb-6 border-b pb-2">
          New Releases
        </h2>
        <Suspense fallback={<NewReleasesSkeleton />}>
          <NewReleases />
        </Suspense>
      </section>
    </main>
  );
}