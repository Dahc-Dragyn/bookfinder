import { Suspense } from 'react';
import { getNewReleases } from '@/lib/actions';
import BookCard from '@/components/book-card';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/page-header';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Flame } from 'lucide-react';

// --- CRITICAL FIX FOR DEPLOYMENT ---
// This prevents Next.js from trying to fetch data during 'npm run build'
// We want this page to be dynamic (fetched on request) anyway!
export const dynamic = 'force-dynamic';

// --- CONFIGURATION ---
const GENRE_POOL = [
  'Sci-Fi', 
  'Mystery', 
  'Fantasy', 
  'History', 
  'Thriller', 
  'Biography', 
  'Romance', 
  'Horror',
  'Science'
];

function getRandomGenres(count: number): string[] {
  // Simple Fisher-Yates shuffle to pick distinct random genres
  const shuffled = [...GENRE_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// ... Rest of the file remains exactly the same ...
// (Copy the BookStripe component, NewReleasesFeed, and default export from your original file)

async function BookStripe({ genre, title, icon }: { genre: string, title?: React.ReactNode, icon?: React.ReactNode }) {
  const { books } = await getNewReleases(genre);

  if (!books || books.length === 0) return null;

  return (
    <section className="space-y-4 py-6 border-t border-border/40 first:border-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
       <div className="flex items-center justify-between px-1">
          <h2 className="text-2xl md:text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
            {icon}
            {title || <>Fresh in <span className="text-primary">{genre}</span></>}
          </h2>
          <Button variant="ghost" size="sm" asChild className="group">
            {/* FIXED: Added &sort=new to preserve freshness context */}
            <Link href={`/search?q=&subject=${encodeURIComponent(genre)}&sort=new`}>
              See All <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
       </div>
       
       <Carousel
          opts={{
            align: "start",
            loop: true,
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4 pb-4">
            {books.map((book, i) => (
              <CarouselItem key={book.isbn_13 || `stripe-${genre}-${i}`} className="pl-4 basis-[45%] md:basis-[28%] lg:basis-[18%] xl:basis-[15%]">
                 <div className="h-full">
                    <BookCard book={book} />
                 </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious className="-left-4 h-12 w-12 border-2" />
            <CarouselNext className="-right-4 h-12 w-12 border-2" />
          </div>
       </Carousel>
    </section>
  );
}

async function NewReleasesFeed() {
  const hotPromise = getNewReleases('Fiction');
  const randomGenres = getRandomGenres(3);
  
  const [hotData, ...stripeData] = await Promise.all([
    hotPromise,
    ...randomGenres.map(g => getNewReleases(g))
  ]);

  return (
    <div className="space-y-2">
      <section className="space-y-4 py-6">
         <div className="flex items-center gap-2 mb-2">
            <h2 className="text-3xl md:text-4xl font-bold font-headline flex items-center gap-2">
              <Flame className="h-8 w-8 text-orange-500 fill-orange-500" />
              Hot This Week
            </h2>
         </div>
         <p className="text-lg text-muted-foreground max-w-2xl mb-6">
            The latest fiction hitting the shelves. Strictly new, no reprints.
         </p>
         
         <Carousel
            opts={{ align: "start", loop: true }}
            className="w-full"
          >
            <CarouselContent className="-ml-4 pb-4">
              {hotData.books.map((book, i) => (
                <CarouselItem key={book.isbn_13 || `hot-${i}`} className="pl-4 basis-[50%] md:basis-[30%] lg:basis-[20%] xl:basis-[16%]">
                   <BookCard book={book} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselPrevious className="-left-5 h-12 w-12 border-2 bg-background/80 backdrop-blur" />
              <CarouselNext className="-right-5 h-12 w-12 border-2 bg-background/80 backdrop-blur" />
            </div>
         </Carousel>
      </section>

      {randomGenres.map((genre) => (
        <BookStripe key={genre} genre={genre} />
      ))}
    </div>
  );
}

function NewReleasesSkeleton() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
         <Skeleton className="h-10 w-64 rounded-md" />
         <Skeleton className="h-6 w-96 rounded-md" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="flex justify-between items-center">
             <Skeleton className="h-8 w-48 rounded-md" />
             <Skeleton className="h-8 w-24 rounded-md" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((__, j) => (
              <div key={j} className="shrink-0 w-[160px] md:w-[200px] space-y-2">
                <Skeleton className="aspect-[2/3] w-full rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NewReleasesPage() {
  return (
    <main className="container mx-auto px-4 py-8 min-h-screen">
      <PageHeader
        title="Fresh Arrivals"
        description="A live feed of books published in 2024-2025. Curated by date, not marketing budget."
      />
      
      <Suspense fallback={<NewReleasesSkeleton />}>
        <NewReleasesFeed />
      </Suspense>
    </main>
  );
}