import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Image as ImageIcon, Search, Shield, Loader2, ExternalLink, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ImageViewer from '@/components/releases/ImageViewer';

export default function ImageManager() {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [viewerImages, setViewerImages] = useState([]);
  const [viewerIndex, setViewerIndex] = useState(null);
  const [deleteImage, setDeleteImage] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: releases = [], isLoading } = useQuery({
    queryKey: ['releases'],
    queryFn: () => base44.entities.Release.list('-created_date', 1000)
  });

  const deleteMutation = useMutation({
    mutationFn: async (imageToDelete) => {
      const release = releases.find(r => r.id === imageToDelete.releaseId);
      if (!release) return;

      const updateData = {};
      
      if (imageToDelete.field === 'cover_art') {
        updateData.cover_art = '';
      } else if (imageToDelete.field === 'back_art') {
        updateData.back_art = '';
      } else if (imageToDelete.field === 'disc_images') {
        updateData.disc_images = release.disc_images.filter((_, i) => i !== imageToDelete.index);
      } else if (imageToDelete.field === 'additional_images') {
        updateData.additional_images = release.additional_images.filter((_, i) => i !== imageToDelete.index);
      }

      await base44.entities.Release.update(imageToDelete.releaseId, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      setDeleteImage(null);
    }
  });

  const allImages = useMemo(() => {
    const images = [];
    releases.forEach((release) => {
      if (release.cover_art) {
        images.push({
          url: release.cover_art,
          type: 'Cover Art',
          field: 'cover_art',
          release: release.title,
          releaseId: release.id
        });
      }
      if (release.back_art) {
        images.push({
          url: release.back_art,
          type: 'Back Art',
          field: 'back_art',
          release: release.title,
          releaseId: release.id
        });
      }
      if (release.disc_images) {
        release.disc_images.forEach((img, idx) => {
          images.push({
            url: img,
            type: `Disc ${idx + 1}`,
            field: 'disc_images',
            index: idx,
            release: release.title,
            releaseId: release.id
          });
        });
      }
      if (release.additional_images) {
        release.additional_images.forEach((img, idx) => {
          images.push({
            url: img,
            type: `Additional ${idx + 1}`,
            field: 'additional_images',
            index: idx,
            release: release.title,
            releaseId: release.id
          });
        });
      }
    });
    return images;
  }, [releases]);

  // Find orphaned images (images with broken URLs or duplicates)
  const orphanedImages = useMemo(() => {
    const urlCount = {};
    allImages.forEach(img => {
      urlCount[img.url] = (urlCount[img.url] || 0) + 1;
    });
    
    // Find duplicate images used across multiple VCDs
    return allImages.filter(img => urlCount[img.url] > 1);
  }, [allImages]);

  const filteredImages = useMemo(() => {
    const imagesToFilter = activeTab === 'orphaned' ? orphanedImages : allImages;
    if (!search) return imagesToFilter;
    return imagesToFilter.filter(img => 
      img.release.toLowerCase().includes(search.toLowerCase()) ||
      img.type.toLowerCase().includes(search.toLowerCase())
    );
  }, [allImages, orphanedImages, search, activeTab]);

  const openImageViewer = (index) => {
    setViewerImages(filteredImages.map(img => img.url));
    setViewerIndex(index);
  };

  const closeImageViewer = () => {
    setViewerIndex(null);
    setViewerImages([]);
  };

  const handleDeleteClick = (e, image) => {
    e.stopPropagation();
    setDeleteImage(image);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center gap-4">
        <Shield className="w-16 h-16 text-slate-300" />
        <p className="text-slate-500">Admin access required</p>
        <Link to={createPageUrl('Home')}>
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Admin')}>
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Image Manager</h1>
                <p className="text-sm text-slate-500">{allImages.length} images across {releases.length} VCDs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Images ({allImages.length})</TabsTrigger>
            <TabsTrigger value="orphaned" className="gap-2">
              {orphanedImages.length > 0 && <AlertTriangle className="w-4 h-4 text-amber-500" />}
              Duplicates ({orphanedImages.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by VCD title or image type..."
              className="pl-10 bg-white"
            />
          </div>
        </div>

        {/* Info banner for orphaned tab */}
        {activeTab === 'orphaned' && orphanedImages.length > 0 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">Duplicate Images Detected</p>
              <p className="text-sm text-amber-700">These images are used in multiple VCDs. You can delete individual references.</p>
            </div>
          </div>
        )}

        {/* Images Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-20">
            <ImageIcon className="w-16 h-16 mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500">{activeTab === 'orphaned' ? 'No duplicate images found' : 'No images found'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredImages.map((image, index) => (
              <div key={`${image.releaseId}-${image.field}-${image.index || 0}`} className="group relative">
                <button
                  onClick={() => openImageViewer(index)}
                  className="aspect-square w-full rounded-lg overflow-hidden bg-slate-100 border border-slate-200 hover:border-indigo-300 transition-all hover:shadow-lg relative"
                >
                  <img 
                    src={image.url} 
                    alt={`${image.release} - ${image.type}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Delete button overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => handleDeleteClick(e, image)}
                      className="p-2 bg-red-500 hover:bg-red-600 rounded-full text-white shadow-lg transform scale-90 hover:scale-100 transition-transform"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </button>
                <div className="mt-2">
                  <Link 
                    to={createPageUrl(`ReleaseDetail?id=${image.releaseId}`)}
                    className="text-xs font-medium text-slate-900 hover:text-indigo-600 line-clamp-1 flex items-center gap-1"
                  >
                    {image.release}
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </Link>
                  <p className="text-xs text-slate-500">{image.type}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ImageViewer 
        images={viewerImages}
        currentIndex={viewerIndex}
        onClose={closeImageViewer}
        onNavigate={setViewerIndex}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteImage} onOpenChange={() => setDeleteImage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the {deleteImage?.type} from "{deleteImage?.release}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteMutation.mutate(deleteImage)}
              className="bg-red-500 hover:bg-red-600"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}