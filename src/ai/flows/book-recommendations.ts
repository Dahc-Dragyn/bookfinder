// Book recommendation flow to suggest related books based on a given book title and author.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BookRecommendationsInputSchema = z.object({
  title: z.string().describe('The title of the book.'),
  author: z.string().describe('The author of the book.'),
});
export type BookRecommendationsInput = z.infer<typeof BookRecommendationsInputSchema>;

const BookRecommendationsOutputSchema = z.object({
  recommendations: z.array(
    z.object({
      title: z.string().describe('The title of the recommended book.'),
      author: z.string().describe('The author of the recommended book.'),
      reason: z.string().describe('The reason for the recommendation.'),
    })
  ).describe('A list of recommended books with reasons.'),
});
export type BookRecommendationsOutput = z.infer<typeof BookRecommendationsOutputSchema>;

export async function getBookRecommendations(input: BookRecommendationsInput): Promise<BookRecommendationsOutput> {
  return bookRecommendationsFlow(input);
}

const bookRecommendationsPrompt = ai.definePrompt({
  name: 'bookRecommendationsPrompt',
  input: {schema: BookRecommendationsInputSchema},
  output: {schema: BookRecommendationsOutputSchema},
  prompt: `You are a book recommendation expert. Given a book title and author, you will provide a list of related book recommendations with reasons for each recommendation.

Book Title: {{{title}}}
Book Author: {{{author}}}

Recommend 3 books that readers who enjoyed the above book might also like. For each book, explain why it is a good recommendation.`, 
});

const bookRecommendationsFlow = ai.defineFlow(
  {
    name: 'bookRecommendationsFlow',
    inputSchema: BookRecommendationsInputSchema,
    outputSchema: BookRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await bookRecommendationsPrompt(input);
    return output!;
  }
);
