import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bookfinder.aiyoda.app';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/new-releases`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    // We explicitly DO NOT list /search here to keep bots away.
  ];
}
