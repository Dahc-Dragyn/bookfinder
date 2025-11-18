'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function SearchForm() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
      <Input
        type="text"
        placeholder="e.g., 'Dune' or 'Frank Herbert'"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search for a book by title or author"
      />
      <Button type="submit" size="icon" aria-label="Submit search">
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
}
