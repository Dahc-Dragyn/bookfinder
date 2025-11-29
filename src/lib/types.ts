// src/lib/types.ts

export interface AuthorItem {
  name: string;
  key?: string | null;
  bio?: string | null; // NEW: Added for v1.8 Author Bio feature
}

export interface GoogleCoverLinks {
  thumbnail?: string;
  smallThumbnail?: string;
  small?: string;
  medium?: string;
  large?: string;
  extraLarge?: string;
}

export interface OpenLibraryCoverLinks {
  small: string;
  medium: string;
  large: string;
}

export interface Dimensions {
  height?: string;
  width?: string;
  thickness?: string;
}

export interface Price {
  amount?: number;
  currencyCode?: string;
}

export interface SaleInfo {
  country?: string;
  saleability?: string;
  isEbook?: boolean;
  buyLink?: string;
  listPrice?: Price;
  retailPrice?: Price;
}

export interface AccessInfo {
  country?: string;
  viewability?: string;
  webReaderLink?: string;
  pdf?: { isAvailable: boolean; acsTokenLink?: string };
  epub?: { isAvailable: boolean; acsTokenLink?: string };
}

export interface MergedBook {
  title: string;
  subtitle?: string;
  authors: AuthorItem[]; 
  isbn_13: string;
  isbn_10?: string;
  google_book_id?: string;
  description?: string;
  publisher?: string;
  published_date?: string;
  page_count?: number;
  average_rating?: number;
  ratings_count?: number;
  
  // Rich Metadata
  dimensions?: Dimensions;
  sale_info?: SaleInfo;
  access_info?: AccessInfo;

  google_cover_links?: GoogleCoverLinks;
  open_library_id?: string;
  subjects: string[];
  open_library_cover_links?: OpenLibraryCoverLinks;
}

export interface SearchResultItem {
  title: string;
  subtitle?: string;
  authors: AuthorItem[];
  isbn_13?: string;
  isbn_10?: string;
  publisher?: string;
  average_rating?: number;
  ratings_count?: number;
  categories?: string[];
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