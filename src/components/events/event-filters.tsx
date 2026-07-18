'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EVENT_CATEGORIES } from '@/types/database';

export function EventFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    // Reset to page 1 when filtering
    params.delete('page');
    return params.toString();
  };

  const handleSearch = useDebouncedCallback((term: string) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString('search', term)}`);
    });
  }, 300);

  const handleCategoryChange = (val: string) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString('category', val)}`);
    });
  };

  const handleSortChange = (val: string) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString('sort', val)}`);
    });
  };

  const sortOptions = [
    { value: 'date_asc', label: 'Date (Upcoming)' },
    { value: 'date_desc', label: 'Date (Past First)' },
    { value: 'seats_desc', label: 'Most Available' },
    { value: 'seats_asc', label: 'Almost Full' },
  ];

  const currentSort = searchParams.get('sort') || 'date_asc';
  const sortLabel = sortOptions.find(opt => opt.value === currentSort)?.label || 'Sort by';

  const currentCategory = searchParams.get('category') || 'all';
  const categoryLabel = currentCategory === 'all' 
    ? 'All Categories' 
    : EVENT_CATEGORIES.find(c => c.value === currentCategory)?.label || 'All Categories';

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search events..."
          className="pl-9 w-full bg-background"
          defaultValue={searchParams.get('search')?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      
      <div className="flex gap-4 w-full sm:w-auto">
        <Select 
          value={currentCategory} 
          onValueChange={(val) => val && handleCategoryChange(val)}
        >
          <SelectTrigger className="w-full sm:w-[160px] bg-background">
            <span className="flex-1 text-left">{categoryLabel}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {EVENT_CATEGORIES.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={currentSort} 
          onValueChange={(val) => val && handleSortChange(val)}
        >
          <SelectTrigger className="w-full sm:w-[180px] bg-background">
            <span className="flex-1 text-left">{sortLabel}</span>
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
