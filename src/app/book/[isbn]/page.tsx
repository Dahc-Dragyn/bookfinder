import { getBookByIsbn } from '@/lib/actions';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import PageHeader from '@/components/page-header';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import SmartSummary from '@/components/ai/smart-summary';
import Recommendations from '@/components/ai/recommendations';

export default async function BookDetailPage({
  params,
}: {
  params: { isbn: string };
}) {
  const book = await getBookByIsbn(params.isbn);

  if (!book) {
    notFound();
  }

  const placeholder = PlaceHolderImages.find((p) => p.id === book.cover_image_id);

  return (
    <main className="container mx-auto px-4 py-8">
      <PageHeader title={book.title} description={`by ${book.authors.join(', ')}`} />

      <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
        <div className="md:col-span-1">
          <div className="aspect-[2/3] w-full max-w-sm mx-auto relative rounded-lg overflow-hidden shadow-xl">
            <Image
              src={placeholder?.imageUrl || `https://picsum.photos/seed/${book.isbn_13}/400/600`}
              alt={`Cover of ${book.title}`}
              data-ai-hint={placeholder?.imageHint || 'book cover'}
              fill
              className="object-cover"
            />
          </div>
        </div>
        <div className="md:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-bold font-headline mb-2 text-primary">
              AI Summary
            </h2>
            <SmartSummary description={book.description || ''} />
          </div>

          <div>
            <h2 className="text-xl font-bold font-headline mb-2">
              Description
            </h2>
            <p className="text-muted-foreground prose dark:prose-invert">
              {book.description || 'No description available.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-muted-foreground">Publisher</h3>
              <p>{book.publisher}</p>
            </div>
            <div>
              <h3 className="font-semibold text-muted-foreground">Published</h3>
              <p>{book.published_date}</p>
            </div>
            <div>
              <h3 className="font-semibold text-muted-foreground">Pages</h3>
              <p>{book.page_count}</p>
            </div>
            <div>
              <h3 className="font-semibold text-muted-foreground">ISBN-13</h3>
              <p>{book.isbn_13}</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-muted-foreground mb-2">Genres</h3>
            <div className="flex flex-wrap gap-2">
              {book.subjects.map((subject) => (
                <Badge key={subject} variant="secondary">{subject}</Badge>
              ))}
            </div>
          </div>

        </div>
      </div>
      <section className="mt-16">
        <h2 className="text-3xl font-bold font-headline mb-6 border-b pb-2">
          You Might Also Like
        </h2>
        <Recommendations title={book.title} author={book.authors[0]} />
      </section>
    </main>
  );
}
