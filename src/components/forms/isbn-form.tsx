'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function IsbnForm() {
  const [isbn, setIsbn] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanedIsbn = isbn.replace(/[-\s]/g, '');
    if (cleanedIsbn) {
      router.push(`/book/${cleanedIsbn}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
      <Input
        type="text"
        placeholder="Enter 10 or 13-digit ISBN"
        value={isbn}
        onChange={(e) => setIsbn(e.target.value)}
        aria-label="Search for a book by ISBN"
      />
      <Button type="submit" size="icon" aria-label="Submit ISBN search">
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
}
