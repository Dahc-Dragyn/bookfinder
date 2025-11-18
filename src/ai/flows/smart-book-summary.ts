'use server';

/**
 * @fileOverview An AI agent for summarizing book descriptions.
 *
 * - summarizeBookDescription - A function that generates a concise summary of a book description.
 * - SummarizeBookDescriptionInput - The input type for the summarizeBookDescription function.
 * - SummarizeBookDescriptionOutput - The return type for the summarizeBookDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeBookDescriptionInputSchema = z.object({
  description: z.string().describe('The description of the book to summarize.'),
});
export type SummarizeBookDescriptionInput = z.infer<typeof SummarizeBookDescriptionInputSchema>;

const SummarizeBookDescriptionOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the book description.'),
});
export type SummarizeBookDescriptionOutput = z.infer<typeof SummarizeBookDescriptionOutputSchema>;

export async function summarizeBookDescription(input: SummarizeBookDescriptionInput): Promise<SummarizeBookDescriptionOutput> {
  return summarizeBookDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeBookDescriptionPrompt',
  input: {schema: SummarizeBookDescriptionInputSchema},
  output: {schema: SummarizeBookDescriptionOutputSchema},
  prompt: `You are an expert book summarizer.  You will generate a concise summary of the book description, highlighting the key points so that the user can quickly understand what the book is about.  The summary should be no more than 5 sentences long.

Description: {{{description}}}`,
});

const summarizeBookDescriptionFlow = ai.defineFlow(
  {
    name: 'summarizeBookDescriptionFlow',
    inputSchema: SummarizeBookDescriptionInputSchema,
    outputSchema: SummarizeBookDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
