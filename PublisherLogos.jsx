import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Plus, Trash2, Loader2, Shield, Building2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

export default function PublisherLogos() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newPublisher, setNewPublisher] = useState('');
  const [newLogoUrl, setNewLogoUrl] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const { data: logos = [], isLoading } = useQuery({
    queryKey: ['publisherLogos'],
    queryFn: () => base44.entities.PublisherLogo.list(),
    enabled: !!user
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PublisherLogo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publisherLogos'] });
      setNewPublisher('');
      setNewLogoUrl('');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PublisherLogo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publisherLogos'] });
      setDeleteId(null);
    }
  });

  const handleAdd = () => {
    if (!newPublisher.trim() || !newLogoUrl.trim()) return;
    createMutation.mutate({
      publisher_name: newPublisher.trim(),
      logo_url: newLogoUrl.trim()
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setNewLogoUrl(file_url);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to={createPageUrl('Admin')} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Admin</span>
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <Building2 className="w-8 h-8 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Publisher Logos</h1>
            <p className="text-sm text-slate-500">{logos.length} logos in database</p>
          </div>
        </div>

        {/* Add new logo */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <h2 className="font-semibold text-slate-900 mb-4">Add Publisher Logo</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Publisher name"
              value={newPublisher}
              onChange={(e) => setNewPublisher(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Logo URL"
              value={newLogoUrl}
              onChange={(e) => setNewLogoUrl(e.target.value)}
              className="flex-1"
            />
            <label className="cursor-pointer">
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              <Button type="button" variant="outline" disabled={uploading} asChild>
                <span>
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                </span>
              </Button>
            </label>
            <Button 
              onClick={handleAdd} 
              disabled={createMutation.isPending || !newPublisher.trim() || !newLogoUrl.trim()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add
            </Button>
          </div>
          {newLogoUrl && (
            <div className="mt-4">
              <p className="text-xs text-slate-500 mb-2">Preview:</p>
              <img src={newLogoUrl} alt="Preview" className="h-8 object-contain" onError={(e) => e.target.style.display = 'none'} />
            </div>
          )}
        </div>

        {/* Logos table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Publisher</TableHead>
                <TableHead>Logo</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logos.map((logo) => (
                <TableRow key={logo.id}>
                  <TableCell className="font-medium">{logo.publisher_name}</TableCell>
                  <TableCell>
                    <img src={logo.logo_url} alt={logo.publisher_name} className="h-6 object-contain" />
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setDeleteId(logo.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {logos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-slate-400 py-8">
                    No publisher logos yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Logo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this publisher logo?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}