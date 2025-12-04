import { Suspense } from 'react';
import { getNewReleases } from '@/lib/actions';
import BookCard from '@/components/book-card';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/page-header';

async function AllNewReleases() {
  // Fetch both the list of books and the specific genre that was randomly selected
  const { books, genre } = await getNewReleases();

  return (
    <>
      <PageHeader
        title={
          <>
            New <span className="text-primary">{genre}</span> Releases
          </>
        }
        description={`Check out the latest and greatest ${genre.toLowerCase()} books.`}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {books.map((book, i) => (
          <BookCard key={book.isbn_13 || `new-book-${i}`} book={book} />
        ))}
      </div>
    </>
  );
}

function NewReleasesSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton to match PageHeader layout and prevent shift */}
      <div className="mb-8">
         <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-10 w-10 rounded-md" /> {/* Back Button Placeholder */}
            <Skeleton className="h-10 w-64 rounded-md" /> {/* Title Placeholder */}
         </div>
         <Skeleton className="h-6 w-48 ml-14 rounded-md" /> {/* Description Placeholder */}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[2/3] w-full rounded-md" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NewReleasesPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      {/* We wrapped the PageHeader inside the Suspense boundary 
        so we can display the dynamic Genre name once data loads. 
      */}
      <Suspense fallback={<NewReleasesSkeleton />}>
        <AllNewReleases />
      </Suspense>
    </main>
  );
}