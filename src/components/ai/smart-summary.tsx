'use client';

import { useEffect, useState } from 'react';
import { summarizeBookDescription } from '@/ai/flows/smart-book-summary';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles, Terminal } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

export default function SmartSummary({ description }: { description: string }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!description) {
      setIsLoading(false);
      setSummary('No description available to summarize.');
      return;
    }

    async function getSummary() {
      try {
        setIsLoading(true);
        setError(null);
        const result = await summarizeBookDescription({ description });
        setSummary(result.summary);
      } catch (e) {
        console.error(e);
        setError('Could not generate AI summary. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    getSummary();
  }, [description]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
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
    <Card className="bg-secondary/50 border-accent/50 border-dashed">
      <CardContent className="p-4">
        <p className="text-secondary-foreground italic">{summary}</p>
      </CardContent>
    </Card>
  );
}
