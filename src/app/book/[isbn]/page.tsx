import { getBookByIsbn } from '@/lib/actions';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import PageHeader from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ isbn: string }>;
}) {
  const resolvedParams = await params;
  const book = await getBookByIsbn(resolvedParams.isbn);

  if (!book) {
    // Custom 404 UI within the page structure instead of full redirect
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold font-headline mb-4">Book Not Found</h1>
        <p className="text-muted-foreground mb-8">
          We couldn't find detailed information for ISBN: {resolvedParams.isbn}.
        </p>
        <Button asChild variant="outline">
            <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>
        </Button>
      </main>
    );
  }

  // Logic: Try Open Library Large -> Medium -> Small -> Google Thumbnail -> Placeholder
  const coverUrl = 
    book.open_library_cover_links?.large || 
    book.open_library_cover_links?.medium || 
    book.open_library_cover_links?.small ||
    book.google_cover_links?.thumbnail || 
    book.google_cover_links?.smallThumbnail ||
    `https://placehold.co/400x600/e2e8f0/1e293b?text=${encodeURIComponent(book.title.substring(0, 20))}`;

  return (
    <main className="container mx-auto px-4 py-8">
      <PageHeader title={book.title} description={`by ${book.authors.join(', ')}`} />

      <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
        {/* --- Cover Image Column --- */}
        <div className="md:col-span-1">
          <div className="aspect-[2/3] w-full max-w-sm mx-auto relative rounded-lg overflow-hidden shadow-xl bg-secondary/30 border">
            <Image
              src={coverUrl}
              alt={`Cover of ${book.title}`}
              fill
              className="object-cover"
              unoptimized={true}
              priority
            />
          </div>
        </div>

        {/* --- Details Column --- */}
        <div className="md:col-span-2 space-y-8">
          
          <div>
            <h2 className="text-2xl font-bold font-headline mb-3">Description</h2>
            <div className="text-muted-foreground prose dark:prose-invert max-w-none leading-relaxed">
              {book.description ? (
                 // Basic cleanup of description text
                 <p>{book.description.replace(/<\/?[^>]+(>|$)/g, "")}</p>
              ) : (
                <p className="italic opacity-70">No description available for this edition.</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 border-y py-6">
            <div>
              <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider opacity-70 mb-1">Publisher</h3>
              <p className="text-sm">{book.publisher || 'Unknown'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider opacity-70 mb-1">Published</h3>
              <p className="text-sm">{book.published_date || 'Unknown'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider opacity-70 mb-1">Pages</h3>
              <p className="text-sm">{book.page_count || '-'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider opacity-70 mb-1">ISBN-13</h3>
              <p className="text-sm font-mono">{book.isbn_13}</p>
            </div>
          </div>
          
          {book.subjects && book.subjects.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wider opacity-70">Subjects</h3>
              <div className="flex flex-wrap gap-2">
                {book.subjects.slice(0, 15).map((subject) => (
                  <Badge key={subject} variant="secondary" className="hover:bg-secondary/80">
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}