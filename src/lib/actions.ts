'use server';

import type { 
  MergedBook, 
  HybridSearchResponse, 
  SearchResultItem, 
  NewReleasesResponse,
  AuthorPageData 
} from '@/lib/types';

// --- CONFIGURATION ---
const API_BASE = (process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8000') + '/books';

// --- HELPER: Fetcher ---
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
  const limit = 20; 
  
  const data: NewReleasesResponse = await fetcher(
    `${API_BASE}/new-releases?subject=${encodeURIComponent(subject)}&limit=${limit}&start_index=${startIndex}`
  );
  
  return { 
    books: data?.results || [], 
    genre: subject 
  };
}

export async function searchBooks(
    query: string, 
    subject?: string, 
    startIndex: number = 0,
    sort: 'relevance' | 'new' = 'relevance' 
): Promise<SearchResultItem[]> {
  
  if (!query && !subject) return [];

  // STRATEGY SWITCH: "New Releases" (Smart Backend Endpoint)
  if (sort === 'new') {
      const limit = 40;
      const subjectParam = subject || 'Fiction';
      
      const data: NewReleasesResponse = await fetcher(
        `${API_BASE}/new-releases?subject=${encodeURIComponent(subjectParam)}&limit=${limit}&start_index=${startIndex}`
      );
      
      return data?.results || [];
  } 

  // STANDARD BEHAVIOR: General Search
  const subjectQuery = subject ? `&subject=${encodeURIComponent(subject)}` : '';
  const textQuery = query ? encodeURIComponent(query) : '';
  
  const data: HybridSearchResponse = await fetcher(
    `${API_BASE}/search?q=${textQuery}${subjectQuery}&limit=40&startIndex=${startIndex}`
  );
  
  return (data?.results || []).filter(book => book.isbn_13 || book.isbn_10);
}

// --- NEW: Fetch Author Profile (Dual-Mode) ---
export async function getAuthorProfile(id: string): Promise<AuthorPageData | null> {
  if (!id) return null;
  // This endpoint handles both OL keys (OL26320A) and Names (Megan Bledsoe)
  // Backend v4.0 handles the sanitization and mining.
  const data = await fetcher(`${API_BASE}/author/${encodeURIComponent(id)}`);
  return data;
}

export async function getFictionGenres(): Promise<{ name: string; umbrella: string }[]> {
  const baseUrl = API_BASE.replace('/books', '');
  const data = await fetcher(`${baseUrl}/genres/fiction`);
  return data || [];
}

export async function getAllNewReleases(subject?: string, startIndex: number = 0): Promise<SearchResultItem[]> {
  const { books } = await getNewReleases(subject, startIndex);
  return books;
}

export async function getBookByIsbn(isbn: string): Promise<MergedBook | null> {
  const book = await fetcher(`${API_BASE}/book/isbn/${isbn}`);
  return book;
}