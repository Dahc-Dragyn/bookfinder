'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface Genre {
  name: string;
  umbrella: string;
}

interface GenreChipsProps {
  genres: Genre[];
}

export default function GenreChips({ genres }: GenreChipsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSubject = searchParams.get('subject') || 'Fiction';

  const handleSelect = (genreName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (genreName === currentSubject) {
      params.delete('subject'); // Toggle off if clicking the active one
    } else {
      params.set('subject', genreName);
    }
    // Scroll: false keeps the user's position when switching genres
    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border bg-card/50 p-2">
      <div className="flex w-max space-x-2 p-1">
        {genres.map((g) => {
          const isActive = g.name === currentSubject || (g.name === 'Fiction' && !searchParams.get('subject'));
          return (
            <Badge
              key={g.name}
              variant={isActive ? "default" : "outline"}
              className={cn(
                "cursor-pointer text-sm py-1.5 px-4 hover:bg-primary/80 transition-all",
                isActive ? "border-primary" : "border-muted-foreground/30 text-muted-foreground hover:text-foreground"
              )}
              onClick={() => handleSelect(g.name)}
            >
              {g.name}
            </Badge>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}