// src/lib/types.ts

export interface GoogleCoverLinks {
  thumbnail?: string;
  smallThumbnail?: string;
}

export interface OpenLibraryCoverLinks {
  small: string;
  medium: string;
  large: string;
}

export interface MergedBook {
  title: string;
  authors: string[];
  isbn_13: string;
  isbn_10?: string;
  google_book_id?: string;
  description?: string;
  publisher?: string;
  published_date?: string;
  page_count?: number;
  open_library_id?: string;
  subjects: string[];
  // Added Google covers
  google_cover_links?: GoogleCoverLinks;
  open_library_cover_links?: OpenLibraryCoverLinks;
}

export interface SearchResultItem {
  title: string;
  authors: string[];
  isbn_13?: string;
  isbn_10?: string;
  google_book_id?: string;
  open_library_work_id?: string;
  cover_url?: string;
}

export interface HybridSearchResponse {
  query?: string;
  subject?: string;
  num_found: number;
  results: SearchResultItem[];
}