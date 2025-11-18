import { Suspense } from 'react';
import { getAllNewReleases } from '@/lib/actions';
import BookCard from '@/components/book-card';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/page-header';

async function AllNewReleases() {
  const newReleases = await getAllNewReleases();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {newReleases.map((book) => (
        <BookCard key={book.isbn_13} book={book} />
      ))}
    </div>
  );
}

function NewReleasesSkeleton() {
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

export default function NewReleasesPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <PageHeader
        title="New Releases"
        description="Check out the latest books."
      />
      <Suspense fallback={<NewReleasesSkeleton />}>
        <AllNewReleases />
      </Suspense>
    </main>
  );
}
