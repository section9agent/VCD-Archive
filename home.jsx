import React, { useState, useMemo, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Plus, Disc3, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReleaseGrid from '@/components/releases/ReleaseGrid';
import SearchFilters from '@/components/releases/SearchFilters';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    language: '',
    country: '',
    sortField: 'created_date',
    sortOrder: 'desc'
  });

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => base44.auth.redirectToLogin())
      .finally(() => setLoading(false));
  }, []);

  const { data: releases = [], isLoading } = useQuery({
    queryKey: ['releases'],
    queryFn: () => base44.entities.Release.list('-created_date', 100),
    enabled: !!user
  });

  const { data: publisherLogosData = [] } = useQuery({
    queryKey: ['publisherLogos'],
    queryFn: () => base44.entities.PublisherLogo.list(),
    enabled: !!user
  });

  const publisherLogos = useMemo(() => {
    const map = {};
    publisherLogosData.forEach(logo => {
      map[logo.publisher_name.toLowerCase()] = logo.logo_url;
    });
    return map;
  }, [publisherLogosData]);

  const filteredReleases = useMemo(() => {
    let filtered = releases.filter((release) => {
      const searchMatch = !filters.search || 
        release.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        release.publisher?.toLowerCase().includes(filters.search.toLowerCase());
      
      const languageMatch = !filters.language || 
        release.audio_language === filters.language ||
        release.subtitle_language === filters.language;
      
      const countryMatch = !filters.country || 
        release.country?.toLowerCase().includes(filters.country.toLowerCase());

      return searchMatch && languageMatch && countryMatch;
    });

    return filtered.sort((a, b) => {
      const field = filters.sortField || 'created_date';
      const order = filters.sortOrder || 'desc';
      
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <img 
              src="https://static.wikia.nocookie.net/logopedia/images/6/6c/VCD.svg" 
              alt="VCD Archive" 
              className="w-12 h-12 rounded-xl object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">VCD Catalog</h1>
              <p className="text-sm text-slate-500">{releases.length} VCDs in database</p>
            </div>
          </div>
          <Link to={createPageUrl('AddRelease')}>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
              <Plus className="w-4 h-4" />
              Add VCD
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <SearchFilters filters={filters} onFilterChange={setFilters} />
        </div>

        {/* Results count */}
        {filters.search || filters.language || filters.country ? (
          <p className="text-sm text-slate-500 mb-4">
            Showing {filteredReleases.length} of {releases.length} VCDs
          </p>
        ) : null}

        {/* Grid */}
        <ReleaseGrid releases={filteredReleases} isLoading={isLoading} publisherLogos={publisherLogos} />
      </div>
    </div>
  );
}
