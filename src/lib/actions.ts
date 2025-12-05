'use server';

import type { MergedBook, HybridSearchResponse, SearchResultItem } from '@/lib/types';
import { notFound } from 'next/navigation';

// --- CONFIGURATION ---
const API_BASE = (process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8000') + '/books';

// --- DATA HYGIENE: The Blacklist ---
// Immediate ban for books that persistently spoof "New Release" filters due to bad metadata.
const TITLE_BLACKLIST = [
  'cloud mountain',
  'the great gatsby',
  '1984',
  'animal farm',
  'pride and prejudice',
  'the hobbit',
  'little women',
  'me before you', // Added based on recent feedback
  'the dead zone'
];

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
  const lowerSubtitle = (book.subtitle || '').toLowerCase();
  
  if (lowerTitle === 'history' || lowerTitle.includes('report') || lowerTitle.includes('document')) return false;

  // 5. MANUAL BLACKLIST (The "Cloud Mountain" Fix)
  if (TITLE_BLACKLIST.some(banned => lowerTitle.includes(banned))) {
      return false;
  }

  // 6. Reprint Detection (Metadata Forensics)
  if (
      lowerTitle.includes('anniversary edition') || 
      lowerSubtitle.includes('anniversary edition') ||
      lowerTitle.includes('classic') ||
      lowerTitle.includes('reissue') ||
      lowerTitle.includes('reprint')
  ) {
      return false;
  }

  // 7. Deep Date Check
  const item = book as any; 
  const potentialYears = [
      item.original_publication_year,
      item.first_publish_year,
      item.first_published_year 
  ].map(val => parseInt(String(val), 10)).filter(y => !isNaN(y));

  if (potentialYears.some(year => year < 2023)) {
      return false;
  }

  return true;
}

// --- HELPER: Date Recency Filter ---
function isRecentBook(book: SearchResultItem): boolean {
  if (!book.published_date) return false;
  const pubYear = parseInt(book.published_date.substring(0, 4), 10);
  if (isNaN(pubYear)) return false;
  const currentYear = new Date().getFullYear();
  return pubYear >= (currentYear - 1);
}

// --- HELPER: Sorts ---
function sortRecency(a: SearchResultItem, b: SearchResultItem): number {
  const dateA = new Date(a.published_date || 0).getTime();
  const dateB = new Date(b.published_date || 0).getTime();
  return dateB - dateA;
}

function sortQualityBooks(a: SearchResultItem, b: SearchResultItem): number {
  if (a.cover_url && !b.cover_url) return -1;
  if (!a.cover_url && b.cover_url) return 1;
  if ((a.average_rating || 0) > (b.average_rating || 0)) return -1;
  if ((a.average_rating || 0) < (b.average_rating || 0)) return 1;
  return 0;
}

function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
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

export async function getNewReleases(subject: string = 'Fiction', startIndex: number = 0): Promise<{ books: SearchResultItem[], genre: string }> {
  const limit = 40; 
  const data: HybridSearchResponse = await fetcher(
    `${API_BASE}/new-releases?subject=${encodeURIComponent(subject)}&limit=${limit}&startIndex=${startIndex}`
  );
  
  let books = (data?.results || [])
    .filter(book => isValidBook(book) && isRecentBook(book)) // Aggressive filters
    .filter(book => book.cover_url);

  books.sort(sortRecency);

  const topTier = books.slice(0, 30);
  const shuffledTop = shuffleArray(topTier);
  
  return { books: shuffledTop.slice(0, 15), genre: subject };
}

// Updated to intelligently route traffic based on 'sort'
export async function searchBooks(
    query: string, 
    subject?: string, 
    startIndex: number = 0,
    sort: 'relevance' | 'new' = 'relevance' 
): Promise<SearchResultItem[]> {
  
  if (!query && !subject) return [];

  // STRATEGY SWITCH: If "See All New" is requested, switch to the New Releases endpoint
  if (sort === 'new') {
      const limit = 40;
      const subjectParam = subject || 'Fiction'; // Fallback if no subject provided
      
      // We ignore 'query' here because new releases endpoint is subject-based.
      // If you want to support "New books matching 'Star Wars'", backend needs a specific endpoint.
      // For now, we assume "See All" is primarily genre-driven.
      const data: HybridSearchResponse = await fetcher(
        `${API_BASE}/new-releases?subject=${encodeURIComponent(subjectParam)}&limit=${limit}&startIndex=${startIndex}`
      );
      
      const rawResults = data?.results || [];

      // Apply the strict Freshness Architecture filters
      return rawResults
        .filter(book => isValidBook(book) && isRecentBook(book)) 
        .filter(book => book.cover_url)
        .sort(sortRecency);
  } 

  // STANDARD BEHAVIOR: Hit the Search endpoint
  const subjectQuery = subject ? `&subject=${encodeURIComponent(subject)}` : '';
  const textQuery = query ? encodeURIComponent(query) : '';
  
  const data: HybridSearchResponse = await fetcher(
    `${API_BASE}/search?q=${textQuery}${subjectQuery}&limit=40&startIndex=${startIndex}`
  );
  
  const rawResults = data?.results || [];

  // Standard Search mode uses relaxed filtering (allows classics)
  return rawResults
    .filter(book => book.isbn_13 || book.isbn_10)
    .sort(sortQualityBooks);
}

export async function getFictionGenres(): Promise<{ name: string; umbrella: string }[]> {
  const baseUrl = API_BASE.replace('/books', '');
  const data = await fetcher(`${baseUrl}/genres/fiction`);
  return data || [];
}

export async function getAllNewReleases(subject?: string, startIndex: number = 0): Promise<SearchResultItem[]> {
  return (await getNewReleases(subject, startIndex)).books;
}

export async function getBookByIsbn(isbn: string): Promise<MergedBook | null> {
  const book = await fetcher(`${API_BASE}/book/isbn/${isbn}`);
  return book;
}