'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="h-[60vh] w-full flex flex-col items-center justify-center space-y-4 text-center px-4">
      <div className="bg-destructive/10 p-6 rounded-full">
        <AlertTriangle className="h-12 w-12 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
      <p className="text-muted-foreground">
        We encountered an error loading this page.
      </p>
      <Button onClick={() => reset()} variant="outline">
        Try again
      </Button>
    </div>
  );
}