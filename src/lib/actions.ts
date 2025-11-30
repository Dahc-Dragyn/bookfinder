'use server';

import type { MergedBook, HybridSearchResponse, SearchResultItem } from '@/lib/types';
import { notFound } from 'next/navigation';

// --- CONFIGURATION ---
const API_BASE = (process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8000') + '/books';

// --- HELPER: The Quality Gate ---
function isValidBook(book: SearchResultItem): boolean {
  // 1. Must have an ISBN
  if (!book.isbn_13 && !book.isbn_10) return false;

  // 2. Must have an Author
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

// --- HELPER: Date Recency Filter ---
// Google API "newest" often returns old books that were just reprinted.
// We strictly filter for books published in the current year or the previous 2 years.
function isRecentBook(book: SearchResultItem): boolean {
  if (!book.published_date) return false;

  // Handle various date formats (YYYY, YYYY-MM, YYYY-MM-DD)
  const pubYear = parseInt(book.published_date.substring(0, 4), 10);
  
  // If parsing failed, assume it's old/invalid
  if (isNaN(pubYear)) return false;

  const currentYear = new Date().getFullYear();
  // Allow books from this year and the last 2 years
  return pubYear >= (currentYear - 2);
}

// --- HELPER: Popularity Sorting ---
// Prioritizes books that have buzz (ratings) over just being "new"
function sortPopularity(a: SearchResultItem, b: SearchResultItem): number {
  const ratingsA = a.ratings_count || 0;
  const ratingsB = b.ratings_count || 0;
  
  // 1. Primary Sort: Social Proof (Number of Ratings)
  if (ratingsA > ratingsB) return -1;
  if (ratingsA < ratingsB) return 1;
  
  // 2. Secondary Sort: Quality (Average Rating)
  const avgA = a.average_rating || 0;
  const avgB = b.average_rating || 0;
  if (avgA > avgB) return -1;
  if (avgA < avgB) return 1;

  return 0;
}

// --- HELPER: Quality Sorting (For Search Results) ---
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

// Used for the dedicated "New Releases" page
export async function getNewReleases(startIndex: number = 0): Promise<SearchResultItem[]> {
  const limit = 40; // Fetch wide to allow for aggressive date filtering
  const data: HybridSearchResponse = await fetcher(
    `${API_BASE}/new-releases?subject=fiction&limit=${limit}&startIndex=${startIndex}`
  );
  
  const rawResults = data?.results || [];
  
  return rawResults
    .filter(book => isValidBook(book) && isRecentBook(book))
    .filter(book => book.cover_url) // Strict visual requirement
    .sort(sortPopularity) // Sort by buzz
    .slice(0, 15); 
}

// Used for the Home Page Grid
export async function getAllNewReleases(subject?: string, startIndex: number = 0): Promise<SearchResultItem[]> {
  const effectiveSubject = subject || 'fiction';
  const subjectQuery = `&subject=${encodeURIComponent(effectiveSubject)}`;
  
  // Fetch 40 items to allow for aggressive filtering
  const data: HybridSearchResponse = await fetcher(
    `${API_BASE}/new-releases?limit=40&startIndex=${startIndex}${subjectQuery}`
  );

  const rawResults = data?.results || [];

  return rawResults
    .filter(book => {
        if (!isValidBook(book)) return false;
        if (!isRecentBook(book)) return false; // Enforce "New" means New
        if (!book.cover_url) return false; // Must have cover
        return true;
    })
    .sort(sortPopularity) // Show highly rated new books first
    .slice(0, 12);
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
    .sort(sortQualityBooks); // Search keeps the standard sort (Relevance/Cover)
}

export async function getFictionGenres(): Promise<{ name: string; umbrella: string }[]> {
  // We strip '/books' because the genres endpoint is at the root /genres/fiction
  const baseUrl = API_BASE.replace('/books', '');
  const data = await fetcher(`${baseUrl}/genres/fiction`);
  return data || [];
}