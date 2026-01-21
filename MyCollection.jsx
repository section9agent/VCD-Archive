import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Disc3, Heart, Library, Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ReleaseCard from '@/components/releases/ReleaseCard';

export default function MyCollection() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('have');

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: collection = [], isLoading: collectionLoading } = useQuery({
    queryKey: ['userCollection', user?.email],
    queryFn: () => base44.entities.UserCollection.filter({ created_by: user.email }),
    enabled: !!user?.email
  });

  const { data: allReleases = [], isLoading: releasesLoading } = useQuery({
    queryKey: ['releases'],
    queryFn: () => base44.entities.Release.list('-created_date', 500)
  });

  const releaseMap = useMemo(() => {
    const map = {};
    allReleases.forEach(r => { map[r.id] = r; });
    return map;
  }, [allReleases]);

  const haveReleases = useMemo(() => {
    return collection
      .filter(c => c.status === 'have')
      .map(c => releaseMap[c.release_id])
      .filter(Boolean);
  }, [collection, releaseMap]);

  const wantReleases = useMemo(() => {
    return collection
      .filter(c => c.status === 'want')
      .map(c => releaseMap[c.release_id])
      .filter(Boolean);
  }, [collection, releaseMap]);

  const isLoading = collectionLoading || releasesLoading;

  if (!user) {
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
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Library className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Collection</h1>
            <p className="text-sm text-slate-500">
              {haveReleases.length} owned • {wantReleases.length} wanted
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8 bg-white border border-slate-200">
            <TabsTrigger value="have" className="gap-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
              <Disc3 className="w-4 h-4" />
              Collection ({haveReleases.length})
            </TabsTrigger>
            <TabsTrigger value="want" className="gap-2 data-[state=active]:bg-rose-50 data-[state=active]:text-rose-700">
              <Heart className="w-4 h-4" />
              Wantlist ({wantReleases.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="have">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
              </div>
            ) : haveReleases.length === 0 ? (
              <div className="text-center py-20">
                <Disc3 className="w-16 h-16 mx-auto text-slate-200 mb-4" />
                <p className="text-slate-500 mb-4">Your collection is empty</p>
                <Link to={createPageUrl('Home')} className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Browse releases to add to your collection
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {haveReleases.map((release) => (
                  <ReleaseCard key={release.id} release={release} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="want">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
              </div>
            ) : wantReleases.length === 0 ? (
              <div className="text-center py-20">
                <Heart className="w-16 h-16 mx-auto text-slate-200 mb-4" />
                <p className="text-slate-500 mb-4">Your wantlist is empty</p>
                <Link to={createPageUrl('Home')} className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Browse releases to add to your wantlist
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {wantReleases.map((release) => (
                  <ReleaseCard key={release.id} release={release} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}