import { Suspense } from 'react';
import { searchBooks } from '@/lib/actions';
import BookCard from '@/components/book-card';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/page-header';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

async function SearchResults({ query }: { query: string }) {
  const results = await searchBooks(query);

  if (results.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-muted-foreground mb-4">
          No books found for &quot;{query}&quot;.
        </p>
        <Button asChild>
            <Link href="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {results.map((book, i) => (
        // *** FIX: Use index as fallback key ***
        <BookCard key={book.isbn_13 || `search-book-${i}`} book={book} />
      ))}
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-[2/3] w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || '';

  return (
    <main className="container mx-auto px-4 py-8">
      <PageHeader
        title={
          <>
            Search Results for <span className="text-primary">&quot;{query}&quot;</span>
          </>
        }
        description={`Showing books matching your query.`}
      />
      <Suspense fallback={<SearchSkeleton />}>
        <SearchResults query={query} />
      </Suspense>
    </main>
  );
}