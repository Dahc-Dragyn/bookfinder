import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="h-[60vh] w-full flex flex-col items-center justify-center space-y-4 text-center px-4">
      <div className="bg-muted p-6 rounded-full">
        <FileQuestion className="h-12 w-12 text-muted-foreground" />
      </div>
      <h2 className="text-3xl font-bold tracking-tight">Page Not Found</h2>
      <p className="text-muted-foreground max-w-md">
        We searched our entire library, but we couldn't find the page you were looking for.
      </p>
      <Button asChild className="mt-4">
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}