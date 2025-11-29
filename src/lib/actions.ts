// src/lib/actions.ts
'use server';

import type { MergedBook, HybridSearchResponse, SearchResultItem } from '@/lib/types';
import { notFound } from 'next/navigation';

// --- CONFIGURATION ---
const API_BASE = (process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8000') + '/books';

// --- HELPER: The Quality Gate ---
function isValidBook(book: SearchResultItem): boolean {
  // 1. Must have an ISBN
  if (!book.isbn_13 && !book.isbn_10) return false;

  // 2. Must have an Author (Check the new array structure)
  if (!book.authors || book.authors.length === 0) return false;
  const firstAuthorName = book.authors[0].name;
  if (firstAuthorName === 'Unknown Author') return false;

  // 3. Title Sanity Check
  if (book.title.includes('<') || book.title.includes('{') || book.title.length > 150) return false;
  
  // 4. Specific Noise Filters
  const lowerTitle = book.title.toLowerCase();
  if (lowerTitle === 'history' || lowerTitle.includes('report') || lowerTitle.includes('document')) return false;

  return true;
}

// --- HELPER: Sorting Strategy ---
function sortQualityBooks(a: SearchResultItem, b: SearchResultItem): number {
  // Prioritize books with covers
  if (a.cover_url && !b.cover_url) return -1;
  if (!a.cover_url && b.cover_url) return 1;
  
  // Secondary sort: Rating
  if ((a.average_rating || 0) > (b.average_rating || 0)) return -1;
  if ((a.average_rating || 0) < (b.average_rating || 0)) return 1;
  
  return 0;
}

async function fetcher(url: string): Promise<any> {
  const response = await fetch(url, { 
    cache: 'no-store', 
    headers: { 'ngrok-skip-browser-warning': 'true' }
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

export async function getNewReleases(startIndex: number = 0): Promise<SearchResultItem[]> {
  // Fetch more than we need to account for filtering
  const limit = 20; 
  const data: HybridSearchResponse = await fetcher(
    `${API_BASE}/new-releases?subject=fiction&limit=${limit}&startIndex=${startIndex}`
  );
  
  const rawResults = data?.results || [];
  
  return rawResults
    .filter(isValidBook)
    .sort(sortQualityBooks)
    .slice(0, 10); // Return clean list
}

export async function getAllNewReleases(subject?: string, startIndex: number = 0): Promise<SearchResultItem[]> {
  const effectiveSubject = subject || 'fiction';
  const subjectQuery = `&subject=${encodeURIComponent(effectiveSubject)}`;
  
  const data: HybridSearchResponse = await fetcher(
    `${API_BASE}/new-releases?limit=20&startIndex=${startIndex}${subjectQuery}`
  );

  return (data?.results || [])
    .filter(isValidBook)
    .sort(sortQualityBooks);
}

export async function getBookByIsbn(isbn: string): Promise<MergedBook | null> {
  const book = await fetcher(`${API_BASE}/book/isbn/${isbn}`);
  return book;
}

export async function searchBooks(query: string, subject?: string, startIndex: number = 0): Promise<SearchResultItem[]> {
  if (!query) return [];
  
  const subjectQuery = subject ? `&subject=${encodeURIComponent(subject)}` : '';

  const data: HybridSearchResponse = await fetcher(
    `${API_BASE}/search?q=${encodeURIComponent(query)}${subjectQuery}&limit=20&startIndex=${startIndex}`
  );
  
  const rawResults = data?.results || [];

  return rawResults
    .filter(book => book.isbn_13 || book.isbn_10)
    .sort(sortQualityBooks);
}

export async function getFictionGenres(): Promise<{ name: string; umbrella: string }[]> {
  // We strip '/books' because the genres endpoint is at the root /genres/fiction
  const baseUrl = API_BASE.replace('/books', '');
  const data = await fetcher(`${baseUrl}/genres/fiction`);
  return data || [];
}