'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SearchForm from './forms/search-form';
import IsbnForm from './forms/isbn-form';
import Link from 'next/link';

export default function SearchTabs() {
  return (
    <Tabs defaultValue="search" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="search">Search Title / Author</TabsTrigger>
        <TabsTrigger value="isbn">Search by ISBN</TabsTrigger>
        <TabsTrigger value="new" asChild><Link href="/new-releases">New Releases</Link></TabsTrigger>
      </TabsList>
      <TabsContent value="search" className="mt-4">
        <SearchForm />
      </TabsContent>
      <TabsContent value="isbn" className="mt-4">
        <IsbnForm />
      </TabsContent>
    </Tabs>
  );
}
