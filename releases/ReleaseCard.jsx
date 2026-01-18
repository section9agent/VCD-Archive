import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Disc3, Globe } from 'lucide-react';

export default function ReleaseCard({ release }) {
  if (!release) return null;

  const {
    id,
    title,
    publisher,
    country,
    number_of_discs,
    coverImage,
  } = release;

  return (
    <Link
      to={createPageUrl(`ReleaseDetail?id=${id}`)}
      className="group block"
    >
      <div className="bg-white rounded-xl overflow-hidden border border-slate-100 hover:border-slate-200 transition-all duration-300 hover:shadow-lg hover:shadow-slate-100/50">
        {/* Cover */}
        <div className="aspect-square relative overflow-hidden bg-slate-50">
          {coverImage ? (
            <img
              src={coverImage}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Disc3 className="w-16 h-16 text-slate-200" />
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
            {title || 'Untitled'}
          </h3>

          {publisher && (
            <p className="text-sm text-slate-500 truncate">
              {publisher}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-slate-400">
            {country && (
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {country}
              </span>
            )}

            {number_of_discs > 1 && (
              <span>{number_of_discs} Discs</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
