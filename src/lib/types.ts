// src/lib/types.ts

export interface AuthorItem {
  name: string;
  key?: string | null;
  bio?: string | null;
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

export interface SeriesInfo {
  name: string;
  order?: number;
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
  
  // v2.0 New Fields
  series?: SeriesInfo;
  format_tag?: string;
  related_isbns?: string[];
  content_flag?: string;

  // v4.2 Source Attribution (NEW)
  data_sources?: string[]; 
}

export interface SearchResultItem {
  title: string;
  subtitle?: string;
  authors: AuthorItem[];
  isbn_13?: string;
  isbn_10?: string;
  publisher?: string;
  published_date?: string;
  average_rating?: number;
  ratings_count?: number;
  categories?: string[];
  google_book_id?: string;
  open_library_work_id?: string;
  cover_url?: string;
  
  // v2.0 New Fields
  series?: SeriesInfo;
  format_tag?: string;
  description?: string; 
  
  // v4.0 New Fields (Attribution & Linking)
  data_sources?: string[];
  lccn?: string[]; // NEW: Critical for linking to LOC items
}

export interface HybridSearchResponse {
  query?: string;
  subject?: string;
  num_found: number;
  results: SearchResultItem[];
}

export interface NewReleasesResponse {
  subject?: string;
  num_found: number;
  results: SearchResultItem[];
}

export interface AuthorPageData {
  key: string;
  name: string;
  bio?: string | null;
  birth_date?: string | null;
  death_date?: string | null;
  photo_url?: string | null;
  books: SearchResultItem[];
  source: 'open_library' | 'google_books';
}