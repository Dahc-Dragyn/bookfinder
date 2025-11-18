import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: React.ReactNode;
  description: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Home</span>
          </Link>
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold font-headline">{title}</h1>
      </div>
      <p className="text-lg text-muted-foreground ml-14">{description}</p>
    </header>
  );
}
