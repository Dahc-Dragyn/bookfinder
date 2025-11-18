import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const Logo = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-2xl font-bold font-headline text-primary',
        className
      )}
    >
      <BookOpen className="h-7 w-7" />
      <h1>LibrarianAI</h1>
    </div>
  );
};

export default Logo;
