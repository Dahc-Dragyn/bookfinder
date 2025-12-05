'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScanBarcode } from 'lucide-react';

// --- VALIDATION HELPERS ---

function isValidIsbn10(isbn: string): boolean {
  // Check format: 9 digits followed by digit or X
  if (!/^\d{9}[\d|X]$/.test(isbn)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(isbn[i]) * (10 - i);
  }
  const lastChar = isbn[9];
  sum += lastChar === 'X' ? 10 : parseInt(lastChar);
  
  return sum % 11 === 0;
}

function isValidIsbn13(isbn: string): boolean {
  // Check format: 13 digits
  if (!/^\d{13}$/.test(isbn)) return false;
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(isbn[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(isbn[12]);
}

export default function IsbnForm() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Clean input: remove dashes, spaces, etc. and uppercase for 'X'
    const cleanQuery = query.replace(/[-\s]/g, '').toUpperCase();
    
    if (!cleanQuery) return;

    // LOGIC: 
    // 1. Check length (first line of defense)
    // 2. Check math (checksum)
    // If BOTH pass -> It is a verified ISBN -> Route to Direct Lookup (/book/...)
    // Otherwise -> It might be an LCCN or Title -> Route to Search (/search?q=...) to handle safely
    
    let isVerifiedIsbn = false;

    if (cleanQuery.length === 10) {
        isVerifiedIsbn = isValidIsbn10(cleanQuery);
    } else if (cleanQuery.length === 13) {
        isVerifiedIsbn = isValidIsbn13(cleanQuery);
    }

    if (isVerifiedIsbn) {
       // It is a verifiable ISBN, safe to hit the strict endpoint
       router.push(`/book/${cleanQuery}`);
    } else {
       // It is likely an LCCN (e.g. 2020719612), a Title, or a typo. 
       // Send to general search to prevent 400 Bad Request crashes on the backend.
       router.push(`/search?q=${encodeURIComponent(cleanQuery)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
      <Input
        type="text"
        placeholder="ISBN (978...) or LCCN (2021...)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search by Book Identifier"
      />
      <Button type="submit" size="icon" aria-label="Submit identifier search">
        <ScanBarcode className="h-4 w-4" />
      </Button>
    </form>
  );
}