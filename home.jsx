import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReleaseGrid from '@/components/releases/ReleaseGrid';
import SearchFilters from '@/components/releases/SearchFilters';
import { base44 } from '@/api/apiClient';

export default function Home() {
  const [filters, setFilters] = useState({
    search: '',
    language: '',
    country: '',
    sortField: 'created_date',
    sortOrder: 'desc'
  });

  const { data: releases = [], isLoading } = useQuery({
    queryKey: ['releases'],
    queryFn: () => base44.entities.Release.list('-created_date', 500)
  });

  const { data: publisherLogosData = [] } = useQuery({
    queryKey: ['publisherLogos'],
    queryFn: () => base44.entities.PublisherLogo.list()
  });

  const publisherLogos = useMemo(() => {
    const map = {};
    publisherLogosData.forEach(l => {
      map[l.publisher_name.toLowerCase()] = l.logo_url;
    });
    return map;
  }, [publisherLogosData]);

  const filteredReleases = useMemo(() => {
    let filtered = releases.filter((release) => {
      const searchMatch =
        !filters.search ||
        release.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        release.publisher?.toLowerCase().includes(filters.search.toLowerCase());

      const languageMatch =
        !filters.language ||
        release.audio_language === filters.language ||
        release.subtitle_language === filters.language;

      const countryMatch =
        !filters.country ||
        release.country?.toLowerCase().includes(filters.country.toLowerCase());

      return searchMatch && languageMatch && countryMatch;
    });

    return filtered.sort((a, b) => {
      const field = filters.sortField;
      const order = filters.sortOrder;

      let valA = a[field];
      let valB = b[field];

      if (field === 'title' || field === 'country') {
        valA = (valA || '').toLowerCase();
        valB = (valB || '').toLowerCase();
      }

      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }, [releases, filters]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">VCD Catalog</h1>
          <Link to={createPageUrl('AddRelease')}>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add VCD
            </Button>
          </Link>
        </div>

        <SearchFilters filters={filters} onFilterChange={setFilters} />

        <ReleaseGrid
          releases={filteredReleases}
          isLoading={isLoading}
          publisherLogos={publisherLogos}
        />
      </div>
    </div>
  );
}
