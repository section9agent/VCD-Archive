import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, 
  Disc3, 
  MapPin, 
  Building2, 
  Heart,
  Check,
  Pencil,
  Loader2,
  Globe,
  Languages,
  Download,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StarRating from '@/components/releases/StarRating';
import ImageViewer from '@/components/releases/ImageViewer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const conditions = ["Mint", "Near Mint", "Very Good Plus", "Very Good", "Good Plus", "Good", "Fair", "Poor"];

export default function ReleaseDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const releaseId = urlParams.get('id');
  const queryClient = useQueryClient();
  
  const [user, setUser] = useState(null);
  const [showCollectionDialog, setShowCollectionDialog] = useState(false);
  const [collectionType, setCollectionType] = useState('have');
  const [userRating, setUserRating] = useState(0);
  const [condition, setCondition] = useState('');
  const [notes, setNotes] = useState('');
  const [viewerImages, setViewerImages] = useState([]);
  const [viewerIndex, setViewerIndex] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: release, isLoading } = useQuery({
    queryKey: ['release', releaseId],
    queryFn: () => base44.entities.Release.filter({ id: releaseId }).then(r => r[0]),
    enabled: !!releaseId
  });

  const { data: publisherLogosData = [] } = useQuery({
    queryKey: ['publisherLogos'],
    queryFn: () => base44.entities.PublisherLogo.list()
  });

  const publisherLogo = release?.publisher 
    ? publisherLogosData.find(l => l.publisher_name.toLowerCase() === release.publisher.toLowerCase())?.logo_url 
    : null;

  const { data: userCollection = [] } = useQuery({
    queryKey: ['userCollection', user?.email, releaseId],
    queryFn: () => base44.entities.UserCollection.filter({ 
      created_by: user.email,
      release_id: releaseId 
    }),
    enabled: !!user?.email && !!releaseId
  });

  const collectionMutation = useMutation({
    mutationFn: async (data) => {
      // Remove existing entries for this release
      for (const entry of userCollection) {
        await base44.entities.UserCollection.delete(entry.id);
      }
      
      // Create new entry
      await base44.entities.UserCollection.create(data);
      
      // Update release rating
      const allRatings = await base44.entities.UserCollection.filter({ 
        release_id: releaseId 
      });
      const ratingsWithValue = allRatings.filter(r => r.user_rating > 0);
      if (ratingsWithValue.length > 0) {
        const avgRating = ratingsWithValue.reduce((sum, r) => sum + r.user_rating, 0) / ratingsWithValue.length;
        await base44.entities.Release.update(releaseId, {
          average_rating: avgRating,
          rating_count: ratingsWithValue.length
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userCollection'] });
      queryClient.invalidateQueries({ queryKey: ['release', releaseId] });
      setShowCollectionDialog(false);
    }
  });

  const handleAddToCollection = (type) => {
    setCollectionType(type);
    const existing = userCollection.find(c => c.status === type);
    if (existing) {
      setUserRating(existing.user_rating || 0);
      setCondition(existing.condition || '');
      setNotes(existing.notes || '');
    } else {
      setUserRating(0);
      setCondition('');
      setNotes('');
    }
    setShowCollectionDialog(true);
  };

  const handleSaveToCollection = () => {
    collectionMutation.mutate({
      release_id: releaseId,
      status: collectionType,
      user_rating: userRating,
      condition: condition,
      notes: notes
    });
  };

  const userHas = userCollection.some(c => c.status === 'have');
  const userWants = userCollection.some(c => c.status === 'want');

  const openImageViewer = (images, index = 0) => {
    setViewerImages(images);
    setViewerIndex(index);
  };

  const closeImageViewer = () => {
    setViewerIndex(null);
    setViewerImages([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
      </div>
    );
  }

  if (!release) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center gap-4">
        <p className="text-slate-500">VCD not found</p>
        <Link to={createPageUrl('Home')}>
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Back button */}
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to catalog</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Cover art */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              <button 
                onClick={() => release.cover_art && openImageViewer([release.cover_art], 0)}
                className="w-full aspect-square rounded-2xl overflow-hidden bg-slate-100 shadow-xl shadow-slate-200/50 hover:opacity-90 transition-opacity cursor-pointer"
              >
                {release.cover_art ? (
                  <img 
                    src={release.cover_art} 
                    alt={release.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Disc3 className="w-24 h-24 text-slate-200" />
                  </div>
                )}
              </button>

              {/* Back Art and Disc Images */}
              {(release.back_art || (release.disc_images && release.disc_images.length > 0)) && (
                <div className="grid grid-cols-2 gap-4">
                  {release.back_art && (
                    <button
                      onClick={() => openImageViewer([release.back_art], 0)}
                      className="aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer"
                    >
                      <img src={release.back_art} alt="Back cover" className="w-full h-full object-cover" />
                    </button>
                  )}
                  {release.disc_images && release.disc_images.map((discImg, idx) => (
                    <button
                      key={idx}
                      onClick={() => openImageViewer(release.disc_images, idx)}
                      className="aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer"
                    >
                      <img src={discImg} alt={`Disc ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Collection actions */}
              {user && (
                <div className="flex gap-3">
                  <Button
                    variant={userHas ? "default" : "outline"}
                    className={`flex-1 gap-2 ${userHas ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    onClick={() => handleAddToCollection('have')}
                  >
                    {userHas ? <Check className="w-4 h-4" /> : <Disc3 className="w-4 h-4" />}
                    {userHas ? 'Owned' : 'I Own This'}
                  </Button>
                  <Button
                    variant={userWants ? "default" : "outline"}
                    className={`flex-1 gap-2 ${userWants ? 'bg-rose-500 hover:bg-rose-600' : ''}`}
                    onClick={() => handleAddToCollection('want')}
                  >
                    <Heart className={`w-4 h-4 ${userWants ? 'fill-current' : ''}`} />
                    {userWants ? 'Wanted' : 'Want'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              {release.number_of_discs > 1 && (
                <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 border mb-3">
                  {release.number_of_discs} Discs
                </Badge>
              )}
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{release.title}</h1>
              {release.publisher && (
                <p className="text-xl text-slate-600">{release.publisher}</p>
              )}
              
              {release.average_rating > 0 && (
                <div className="flex items-center gap-3 mt-4">
                  <StarRating value={Math.round(release.average_rating)} readonly size="md" />
                  <span className="text-slate-500">
                    {release.average_rating.toFixed(1)} ({release.rating_count} {release.rating_count === 1 ? 'rating' : 'ratings'})
                  </span>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {release.audio_language && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-100">
                  <Languages className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Audio</p>
                    <p className="font-semibold text-slate-900">{release.audio_language}</p>
                  </div>
                </div>
              )}
              {release.subtitle_language && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-100">
                  <Languages className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Subtitles</p>
                    <p className="font-semibold text-slate-900">{release.subtitle_language}</p>
                  </div>
                </div>
              )}
              {release.country && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-100">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Country</p>
                    <p className="font-semibold text-slate-900">{release.country}</p>
                  </div>
                </div>
              )}
              {release.publisher && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-100">
                  <Building2 className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Publisher</p>
                    {publisherLogo ? (
                      <div>
                        <img src={publisherLogo} alt={release.publisher} className="h-9 object-contain mt-1" />
                        <p className="text-sm text-slate-600 mt-1">{release.publisher}</p>
                      </div>
                    ) : (
                      <p className="font-semibold text-slate-900">{release.publisher}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Download Link */}
            {release.download_link && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-indigo-600" />
                    <div>
                      <h3 className="font-semibold text-slate-900">Download Available</h3>
                      <p className="text-sm text-slate-500">Access the digital copy</p>
                    </div>
                  </div>
                  <a 
                    href={release.download_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Download
                  </a>
                </div>
              </div>
            )}

            {/* Additional Images */}
            {release.additional_images && release.additional_images.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-slate-400" />
                  Additional Images
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {release.additional_images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => openImageViewer(release.additional_images, index)}
                      className="aspect-square rounded-lg overflow-hidden bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer"
                    >
                      <img src={img} alt={`Additional ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {release.notes && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-3">Notes</h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{release.notes}</p>
              </div>
            )}

            {/* Edit button */}
            <div className="pt-4">
              <Link to={createPageUrl(`EditRelease?id=${release.id}`)}>
                <Button variant="outline" className="gap-2">
                  <Pencil className="w-4 h-4" />
                  Edit VCD
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Image Viewer */}
      <ImageViewer 
        images={viewerImages}
        currentIndex={viewerIndex}
        onClose={closeImageViewer}
        onNavigate={setViewerIndex}
      />

      {/* Collection Dialog */}
      <Dialog open={showCollectionDialog} onOpenChange={setShowCollectionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {collectionType === 'have' ? 'Add to Collection' : 'Add to Wantlist'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Your Rating</label>
              <StarRating value={userRating} onChange={setUserRating} size="lg" />
            </div>
            
            {collectionType === 'have' && (
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Condition</label>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Personal Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about your copy..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCollectionDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveToCollection}
                disabled={collectionMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {collectionMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}