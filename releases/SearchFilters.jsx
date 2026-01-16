import React from 'react';
import { Input } from '@/components/ui/input';
import { Search, ArrowUpDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SearchFilters({ filters, onFilterChange }) {
  const updateFilter = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search VCDs..."
          value={filters.search || ''}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-10 h-11 bg-white border-slate-200 focus:border-indigo-300 focus:ring-indigo-200"
        />
      </div>
      <div className="flex gap-2">
        <Select 
          value={filters.sortField || 'created_date'} 
          onValueChange={(val) => updateFilter('sortField', val)}
        >
          <SelectTrigger className="w-[140px] h-11 bg-white">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_date">Date Added</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="country">Country</SelectItem>
            <SelectItem value="year">Year</SelectItem>
          </SelectContent>
        </Select>
        <Select 
          value={filters.sortOrder || 'desc'} 
          onValueChange={(val) => updateFilter('sortOrder', val)}
        >
          <SelectTrigger className="w-[130px] h-11 bg-white">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}