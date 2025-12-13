'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScanBarcode, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

function isValidLccn(input: string): boolean {
    // LCCNs are purely numeric and typically 8-12 digits long after cleaning
    // Example: 2013657690 (10 digits)
    return /^\d{8,12}$/.test(input);
}

export default function IsbnForm() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Clean input: remove dashes, spaces, etc. and uppercase for 'X'
    const cleanQuery = query.replace(/[-\s]/g, '').toUpperCase();
    
    if (!cleanQuery) return;

    // LOGIC: 
    // 1. Check length & Checksum for ISBNs
    // 2. Check numeric format for LCCNs
    // If EITHER pass -> Route to Direct Lookup (/book/...)
    // Otherwise -> Route to General Search (/search?q=...)
    
    let isDirectLookup = false;

    if (cleanQuery.length === 10) {
        isDirectLookup = isValidIsbn10(cleanQuery);
    } else if (cleanQuery.length === 13) {
        isDirectLookup = isValidIsbn13(cleanQuery);
    } else if (isValidLccn(cleanQuery)) {
        isDirectLookup = true; // LCCN detected!
    }

    setLoading(true);

    if (isDirectLookup) {
       // It is a verifiable ID (ISBN or LCCN), hit the direct endpoint
       router.push(`/book/${cleanQuery}`);
    } else {
       // Fallback for Titles, Authors, or Typos
       router.push(`/search?q=${encodeURIComponent(cleanQuery)}`);
    }
    
    // Reset loading state after a delay in case navigation fails or takes time
    // (Optional UX polish)
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
      <Input
        type="text"
        placeholder="ISBN (978...) or LCCN (2013...)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search by Book Identifier"
        disabled={loading}
        className="font-mono"
      />
      <Button type="submit" size="icon" aria-label="Submit identifier search" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanBarcode className="h-4 w-4" />}
      </Button>
    </form>
  );
}