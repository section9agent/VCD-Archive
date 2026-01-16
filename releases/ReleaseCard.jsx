import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Disc3, Globe } from 'lucide-react';

export default function ReleaseCard({ release, publisherLogos = {} }) {
  const publisherLogo = release.publisher ? publisherLogos[release.publisher.toLowerCase()] : null;

  return (
    <Link 
      to={createPageUrl(`ReleaseDetail?id=${release.id}`)}
      className="group block"
    >
      <div className="bg-white rounded-xl overflow-hidden border border-slate-100 hover:border-slate-200 transition-all duration-300 hover:shadow-lg hover:shadow-slate-100/50">
        <div className="aspect-square relative overflow-hidden bg-slate-50">
          {release.cover_art ? (
            <img 
              src={release.cover_art} 
              alt={release.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Disc3 className="w-16 h-16 text-slate-200" />
            </div>
          )}
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
            {release.title}
          </h3>
          {release.publisher && (
            publisherLogo ? (
              <img 
                src={publisherLogo} 
                alt={release.publisher} 
                className="h-5 object-contain"
                title={release.publisher}
              />
            ) : (
              <p className="text-sm text-slate-500 truncate">{release.publisher}</p>
            )
          )}
          <div className="flex items-center gap-3 text-xs text-slate-400">
            {release.country && (
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {release.country}
              </span>
            )}
            {release.number_of_discs > 1 && (
              <span>{release.number_of_discs} Discs</span>
            )}
          </div>
          {release.average_rating > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-3.5 h-3.5 ${star <= Math.round(release.average_rating) ? 'text-amber-400' : 'text-slate-200'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-slate-400">
                ({release.rating_count || 0})
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}