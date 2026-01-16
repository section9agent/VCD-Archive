import React from 'react';
import ReleaseCard from './ReleaseCard';
import { Loader2 } from 'lucide-react';

export default function ReleaseGrid({ releases, isLoading, publisherLogos = {} }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
      </div>
    );
  }

  if (!releases || releases.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-slate-100" />
        </div>
        <p className="text-slate-400">No releases found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {releases.map((release) => (
        <ReleaseCard key={release.id} release={release} publisherLogos={publisherLogos} />
      ))}
    </div>
  );
}