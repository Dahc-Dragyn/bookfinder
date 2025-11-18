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
  cover_image_id: string;
}

export interface SearchResultItem {
  title: string;
  authors: string[];
  isbn_13?: string;
  google_book_id?: string;
  open_library_work_id?: string;
  cover_image_id?: string;
}

export interface HybridSearchResponse {
  query: string;
  subject?: string;
  num_found: number;
  results: SearchResultItem[];
}
