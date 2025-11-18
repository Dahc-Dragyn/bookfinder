'use server';

import type { MergedBook, HybridSearchResponse, SearchResultItem } from '@/lib/types';
import { notFound } from 'next/navigation';

// --- CONFIGURATION ---
const API_BASE = (process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8000') + '/books';

// --- HELPER: The Quality Gate ---
function isValidBook(book: SearchResultItem): boolean {
  // 1. Must have an ISBN (13 is preferred, but we need at least one ID to link to)
  if (!book.isbn_13 && !book.isbn_10) return false;

  // 2. Must have an Author
  if (!book.authors || book.authors.length === 0 || book.authors.includes('Unknown Author')) return false;

  // 3. Title Sanity Check (Filter out HTML/CSS injections)
  if (book.title.includes('<') || book.title.includes('{') || book.title.length > 150) return false;
  
  // 4. Specific Noise Filters (Titles that are clearly not books we want)
  const lowerTitle = book.title.toLowerCase();
  if (lowerTitle === 'history' || lowerTitle.includes('report') || lowerTitle.includes('document')) return false;

  return true;
}

// --- HELPER: Sorting Strategy ---
function sortQualityBooks(a: SearchResultItem, b: SearchResultItem): number {
  // Prioritize books that have a cover URL
  if (a.cover_url && !b.cover_url) return -1;
  if (!a.cover_url && b.cover_url) return 1;
  return 0;
}

async function fetcher(url: string): Promise<any> {
  const response = await fetch(url, { 
    cache: 'no-store', 
    headers: {
      'ngrok-skip-browser-warning': 'true' 
    }
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`[API Error] ${response.status} ${response.statusText} fetching ${url}`);
  }
  
  return response.json();
}

// ---------------------------------------------
// ACTIONS
// ---------------------------------------------

export async function getNewReleases(): Promise<SearchResultItem[]> {
  // STRATEGY CHANGE: Ask for "fiction" by default to get higher quality "new" books
  const data: HybridSearchResponse = await fetcher(
    `${API_BASE}/new-releases?subject=fiction&limit=20`
  );
  
  const rawResults = data?.results || [];
  
  return rawResults
    .filter(isValidBook)
    .sort(sortQualityBooks)
    .slice(0, 6); // Return top 6 high-quality items
}

export async function getAllNewReleases(subject?: string): Promise<SearchResultItem[]> {
  // Default to "fiction" if no subject is provided, to avoid the "firehose of trash"
  const effectiveSubject = subject || 'fiction';
  const subjectQuery = `&subject=${encodeURIComponent(effectiveSubject)}`;
  
  const data: HybridSearchResponse = await fetcher(
    `${API_BASE}/new-releases?limit=20${subjectQuery}`
  );

  const rawResults = data?.results || [];

  return rawResults
    .filter(isValidBook)
    .sort(sortQualityBooks);
}

export async function getBookByIsbn(isbn: string): Promise<MergedBook | null> {
  const book = await fetcher(`${API_BASE}/book/isbn/${isbn}`);
  return book;
}

export async function searchBooks(query: string, subject?: string): Promise<SearchResultItem[]> {
  if (!query) return [];
  
  const subjectQuery = subject ? `&subject=${encodeURIComponent(subject)}` : '';

  const data: HybridSearchResponse = await fetcher(
    `${API_BASE}/search?q=${encodeURIComponent(query)}${subjectQuery}&limit=20`
  );
  
  const rawResults = data?.results || [];

  // We are slightly less strict on Search (user might be looking for obscure stuff)
  return rawResults
    .filter(book => book.isbn_13 || book.isbn_10) // Search results MUST be clickable
    .sort(sortQualityBooks);
}