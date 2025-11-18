'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SearchForm from './forms/search-form';
import IsbnForm from './forms/isbn-form';

export default function SearchTabs() {
  return (
    <Tabs defaultValue="search" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="search">Search Title / Author</TabsTrigger>
        <TabsTrigger value="isbn">Search by ISBN</TabsTrigger>
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
