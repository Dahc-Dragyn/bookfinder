'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import SmartSummary from '@/components/ai/smart-summary';

interface ExpandableTextProps {
  text: string;
  limit?: number;
  className?: string;
  useAi?: boolean;
}

export default function ExpandableText({ text, limit = 450, className, useAi = true }: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!text) {
    return <p className="text-muted-foreground italic">No description available.</p>;
  }

  // Sanitize HTML from description
  const sanitizedText = text.replace(/<[^>]*>?/gm, '');
  const shouldTruncate = sanitizedText.length > limit;

  return (
    <div className={cn("space-y-4", className)}>
        
        {/* AI Summary Section - Conditionally Rendered */}
        {shouldTruncate && useAi && (
            <div className="ai-summary-section">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-2">
                    <Sparkles className="h-3.5 w-3.5 text-accent" /> AI-Powered Summary
                </h3>
                <SmartSummary description={sanitizedText} />
            </div>
        )}

        {/* Full Description Section */}
        <div 
          className={cn(
            "prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed relative transition-all duration-300",
            shouldTruncate && !isExpanded ? "max-h-[120px] overflow-hidden" : "max-h-full"
          )}
        >
            {/* The actual text */}
            <div dangerouslySetInnerHTML={{ __html: text }} />
            
            {/* The fade-out gradient */}
            {shouldTruncate && !isExpanded && (
               <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent pointer-events-none" />
            )}
        </div>
      
      {/* The "Read More" button */}
      {shouldTruncate && (
          <Button 
            variant="link" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary h-auto p-0 flex items-center gap-1"
          >
            {isExpanded ? (
              <>Show Less <ChevronUp className="h-3 w-3" /></>
            ) : (
              <>Show Full Synopsis <ChevronDown className="h-3 w-3" /></>
            )}
          </Button>
      )}
    </div>
  );
}
