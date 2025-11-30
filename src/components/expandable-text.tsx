'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpandableTextProps {
  text: string;
  limit?: number;
  className?: string;
}

export default function ExpandableText({ text, limit = 300, className }: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!text) {
    return <p className="text-muted-foreground italic">No description available.</p>;
  }

  const shouldTruncate = text.length > limit;

  if (!shouldTruncate) {
    return (
      <div 
        className={cn("prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed", className)} 
        dangerouslySetInnerHTML={{ __html: text }} 
      />
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div 
        className={cn(
          "prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed relative transition-all duration-300",
          !isExpanded ? "max-h-[100px] overflow-hidden" : "max-h-full"
        )}
      >
        <div dangerouslySetInnerHTML={{ __html: text }} />
        
        {!isExpanded && (
           <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent pointer-events-none" />
        )}
      </div>
      
      <Button 
        variant="link" 
        size="sm" 
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-primary h-auto p-0 flex items-center gap-1"
      >
        {isExpanded ? (
          <>Show Less <ChevronUp className="h-3 w-3" /></>
        ) : (
          <>Read More <ChevronDown className="h-3 w-3" /></>
        )}
      </Button>
    </div>
  );
}
