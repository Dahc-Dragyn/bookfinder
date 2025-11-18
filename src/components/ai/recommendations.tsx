'use client';

import { useEffect, useState } from 'react';
import {
  getBookRecommendations,
  type BookRecommendationsOutput,
} from '@/ai/flows/book-recommendations';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Terminal } from 'lucide-react';

interface RecommendationsProps {
  title: string;
  author: string;
}

export default function Recommendations({ title, author }: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<
    BookRecommendationsOutput['recommendations'] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setIsLoading(true);
        setError(null);
        const result = await getBookRecommendations({ title, author });
        setRecommendations(result.recommendations);
      } catch (e) {
        console.error(e);
        setError(
          'Could not generate AI recommendations. Please try again later.'
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecommendations();
  }, [title, author]);

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recommendations?.map((rec, index) => (
        <Card key={index} className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">{rec.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{rec.author}</p>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm">{rec.reason}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
