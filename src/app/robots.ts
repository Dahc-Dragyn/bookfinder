import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  // The list of bots that should NOT trigger expensive page renders
  const EXPENSIVE_BOTS = [
    'Amazonbot',
    'Bytespider',        // TikTok
    'ClaudeBot',         // Anthropic
    'GPTBot',            // OpenAI
    'CCBot',             // Common Crawl
    'ImagesiftBot',      // Hive AI
    'PerplexityBot',     // Perplexity AI
    'Applebot-Extended', // Apple AI
    'cohere-ai',         // Cohere
    'Diffbot',           // Diffbot
    'Omgili',            // Webz.io
    'FacebookBot'        // Meta
  ]

  return {
    rules: [
      {
        // TARGET: Block all aggressive AI/Scrapers from expensive paths
        userAgent: EXPENSIVE_BOTS,
        disallow: ['/api-proxy/', '/book/', '/search/'],
      },
      {
        // TARGET: General bots (Google, Bing, etc.)
        // Allow them to index pages, but NEVER touch the proxy
        userAgent: '*',
        allow: '/',
        disallow: ['/api-proxy/'], 
      },
    ],
    sitemap: 'https://bookfinder.aiyoda.app/sitemap.xml',
  }
}