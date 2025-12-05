import SearchTabs from '@/components/search-tabs';
import Logo from '@/components/logo';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Info } from 'lucide-react';

export default function Home() {
  return (
    <main className="container mx-auto px-4 min-h-screen flex flex-col items-center justify-center -mt-16">
      <div className="w-full max-w-3xl space-y-12 animate-in fade-in zoom-in duration-700">
        
        {/* Header / Manifesto */}
        <header className="text-center space-y-6">
          <div className="inline-block transform hover:scale-105 transition-transform duration-300">
            <Logo className="text-5xl md:text-6xl mb-2" />
          </div>
          
          <blockquote className="text-xl md:text-2xl font-medium text-foreground/80 max-w-2xl mx-auto text-balance leading-relaxed font-headline italic">
            &ldquo;Tired of being &apos;personalized&apos;? We&apos;re just a search engine. The smarter you are, the better it works.&rdquo;
          </blockquote>
        </header>

        {/* The Tool */}
        <section className="w-full space-y-4">
            <div className="bg-card/50 p-6 rounded-xl border border-border/40 shadow-sm backdrop-blur-sm">
                <SearchTabs />
            </div>

            {/* Search Syntax Cheat Sheet */}
            <div className="max-w-lg mx-auto">
                 <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="tips" className="border-none">
                        <AccordionTrigger className="justify-center text-xs text-muted-foreground hover:text-primary py-2 hover:no-underline gap-2">
                            <Info className="h-3 w-3" />
                            <span>Power User Search Tips</span>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="bg-muted/30 p-4 rounded-lg text-sm space-y-2 text-muted-foreground border border-border/50 text-left">
                                <div className="grid grid-cols-[80px_1fr] gap-2">
                                    <span className="font-mono text-primary text-xs bg-primary/10 px-1 rounded w-fit h-fit">inauthor:</span>
                                    <span>Find books by author (e.g. <em>inauthor:&quot;Frank Herbert&quot;</em>)</span>

                                    <span className="font-mono text-primary text-xs bg-primary/10 px-1 rounded w-fit h-fit">intitle:</span>
                                    <span>Find books with title words (e.g. <em>intitle:Dune</em>)</span>

                                    <span className="font-mono text-primary text-xs bg-primary/10 px-1 rounded w-fit h-fit">subject:</span>
                                    <span>Search categories (e.g. <em>subject:history</em>)</span>
                                    
                                    <span className="font-mono text-primary text-xs bg-primary/10 px-1 rounded w-fit h-fit">isbn:</span>
                                    <span>Direct lookup (e.g. <em>isbn:9780441172719</em>)</span>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </section>

        {/* Footer / Trust Signals */}
        <footer className="text-center text-sm text-muted-foreground/60">
          <p>Powered by Google Books, Open Library and Library of Congress • 100% Algorithm Free</p>
        </footer>

      </div>
    </main>
  );
}