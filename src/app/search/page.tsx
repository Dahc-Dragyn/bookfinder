import { Suspense } from 'react';
import { searchBooks } from '@/lib/actions';
import BookCard from '@/components/book-card';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/page-header';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Updated Props to accept 'sort'
async function SearchResults({ 
  query, 
  subject, 
  sort 
}: { 
  query: string; 
  subject?: string; 
  sort?: string 
}) {
  // Pass the sort parameter to the backend action
  const results = await searchBooks(query, subject, 0, sort as 'relevance' | 'new');

  if (results.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-muted-foreground mb-4">
          No books found{query ? ` for "${query}"` : ''}{subject ? ` in ${subject}` : ''}.
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
        // FIX: Robust key fallback. LCCN items have no ISBN, so we check that array.
        // If all IDs fail, we fall back to title + index to ensure unique keys.
        <BookCard 
            key={book.isbn_13 || (book.lccn && book.lccn[0]) || `${book.title}-${i}`} 
            book={book} 
        />
      ))}
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-[2/3] w-full rounded-md" />
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
  searchParams: Promise<{ q?: string; subject?: string; sort?: string }>;
}) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || '';
  const subject = resolvedParams.subject || '';
  const sort = resolvedParams.sort || 'relevance';

  // Dynamic Title Logic
  let titleContent;
  
  if (sort === 'new' && subject) {
      // Special Header for "See All" from New Releases
      titleContent = <>New <span className="text-primary">{subject}</span> Releases</>;
  } else if (query && subject) {
    titleContent = <>Results for <span className="text-primary">&quot;{query}&quot;</span> in <span className="text-primary">{subject}</span></>;
  } else if (subject) {
    titleContent = <>Top Results in <span className="text-primary">{subject}</span></>;
  } else {
    titleContent = <>Search Results for <span className="text-primary">&quot;{query}&quot;</span></>;
  }

  const description = sort === 'new' 
    ? "Browsing the latest additions to our catalog." 
    : "Showing books matching your criteria.";

  return (
    <main className="container mx-auto px-4 py-8">
      <PageHeader
        title={titleContent}
        description={description}
      />
      <Suspense fallback={<SearchSkeleton />}>
        <SearchResults query={query} subject={subject} sort={sort} />
      </Suspense>
    </main>
  );
}