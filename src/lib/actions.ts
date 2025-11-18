'use server';

import { allBooks } from '@/lib/data';
import type { MergedBook, SearchResultItem } from '@/lib/types';

// Simulate network latency
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getNewReleases(): Promise<MergedBook[]> {
  await sleep(500);
  // Sort by published date descending and take the first 6
  return [...allBooks]
    .sort(
      (a, b) =>
        new Date(b.published_date!).getTime() -
        new Date(a.published_date!).getTime()
    )
    .slice(0, 6);
}

export async function getBookByIsbn(
  isbn: string
): Promise<MergedBook | null> {
  await sleep(300);
  const book = allBooks.find((book) => book.isbn_13 === isbn);
  return book || null;
}

export async function searchBooks(
  query: string
): Promise<SearchResultItem[]> {
  await sleep(700);
  if (!query) return [];

  const lowercasedQuery = query.toLowerCase();
  const results = allBooks.filter(
    (book) =>
      book.title.toLowerCase().includes(lowercasedQuery) ||
      book.authors.some((author) =>
        author.toLowerCase().includes(lowercasedQuery)
      )
  );

  // Map to SearchResultItem
  return results.map((book) => ({
    title: book.title,
    authors: book.authors,
    isbn_13: book.isbn_13,
    cover_image_id: book.cover_image_id,
  }));
}
