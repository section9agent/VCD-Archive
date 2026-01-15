import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Shield, Download, Upload, Trash2, Loader2, Image as ImageIcon, Code, Database, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import VCDTable from '@/components/admin/VCDTable';
import CSVImport from '@/components/admin/CSVImport';

export default function Admin() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('manage');
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: releases = [], isLoading } = useQuery({
    queryKey: ['releases'],
    queryFn: () => base44.entities.Release.list('-created_date', 1000)
  });

  const deleteMutation = useMutation({
    mutationFn: async (ids) => {
      for (const id of ids) {
        await base44.entities.Release.delete(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
    }
  });

  const handleExport = () => {
    const csv = [
      ['Title', 'Publisher', 'Number of Discs', 'Audio Language', 'Subtitle Language', 'Country', 'Download Link', 'Notes', 'Cover Art', 'Back Art', 'Disc Images', 'Additional Images'].join(','),
      ...releases.map(r => [
        `"${(r.title || '').replace(/"/g, '""')}"`,
        `"${(r.publisher || '').replace(/"/g, '""')}"`,
        r.number_of_discs || 1,
        `"${(r.audio_language || '').replace(/"/g, '""')}"`,
        `"${(r.subtitle_language || '').replace(/"/g, '""')}"`,
        `"${(r.country || '').replace(/"/g, '""')}"`,
        `"${(r.download_link || '').replace(/"/g, '""')}"`,
        `"${(r.notes || '').replace(/"/g, '""')}"`,
        `"${(r.cover_art || '').replace(/"/g, '""')}"`,
        `"${(r.back_art || '').replace(/"/g, '""')}"`,
        `"${((r.disc_images || []).join('|')).replace(/"/g, '""')}"`,
        `"${((r.additional_images || []).join('|')).replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vcd-database-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(releases, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vcd-database-full-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleSourceBackup = () => {
    toast.info("Source code backup is managed via the Base44 Dashboard settings.");
  };

  const handleBackupImages = () => {
    const urls = new Set();
    releases.forEach(r => {
      if (r.cover_art) urls.add(r.cover_art);
      if (r.back_art) urls.add(r.back_art);
      if (Array.isArray(r.disc_images)) r.disc_images.forEach(u => u && urls.add(u));
      if (Array.isArray(r.additional_images)) r.additional_images.forEach(u => u && urls.add(u));
    });

    if (urls.size === 0) {
      toast.info("No images found to backup.");
      return;
    }

    const content = Array.from(urls).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vcd-image-urls-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    toast.success(`Exported list of ${urls.size} image URLs`);
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
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
              <p className="text-sm text-slate-500">{releases.length} VCDs in database</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to={createPageUrl('ImageManager')}>
              <Button variant="outline" className="gap-2">
                <ImageIcon className="w-4 h-4" />
                Images
              </Button>
            </Link>
            <Link to={createPageUrl('PublisherLogos')}>
              <Button variant="outline" className="gap-2">
                <Building2 className="w-4 h-4" />
                Logos
              </Button>
            </Link>
            <Button onClick={handleExport} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              CSV
            </Button>
            <Button onClick={handleExportJSON} variant="outline" className="gap-2">
              <Database className="w-4 h-4" />
              JSON
            </Button>
            <Button onClick={handleSourceBackup} variant="outline" className="gap-2">
              <Code className="w-4 h-4" />
              Source
            </Button>
            <Button onClick={handleBackupImages} variant="outline" className="gap-2">
              <ImageIcon className="w-4 h-4" />
              Img URLs
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="manage">Manage VCDs</TabsTrigger>
            <TabsTrigger value="import">Import CSV</TabsTrigger>
          </TabsList>

          <TabsContent value="manage">
            <VCDTable 
              releases={releases} 
              isLoading={isLoading}
              onDelete={deleteMutation.mutate}
            />
          </TabsContent>

          <TabsContent value="import">
            <CSVImport />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}