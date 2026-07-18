import { createClient } from '@/lib/supabase/server';
import { CategoryGrid } from './category-grid-client';

export async function BrowseByCategory() {
  const supabase = await createClient();

  // Query live event counts grouped by category
  const { data, error } = await supabase
    .from('events')
    .select('category') as any;

  if (error || !data) {
    return null;
  }

  // Count events per category
  const counts: Record<string, number> = {};
  for (const row of data) {
    const cat = row.category as string;
    counts[cat] = (counts[cat] || 0) + 1;
  }

  // Only pass categories that have at least 1 event
  const categoriesWithCounts = Object.entries(counts)
    .filter(([_, count]) => count > 0)
    .map(([category, count]) => ({ category, count }));

  if (categoriesWithCounts.length === 0) {
    return null;
  }

  return <CategoryGrid categories={categoriesWithCounts} />;
}
