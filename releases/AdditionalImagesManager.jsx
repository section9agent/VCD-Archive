import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Loader2, Image as ImageIcon, Plus } from 'lucide-react';

export default function AdditionalImagesManager({ images = [], onChange }) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    onChange([...images, urlInput.trim()]);
    setUrlInput('');
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange([...images, file_url]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (index) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-slate-700 block">Additional Images</label>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50 group">
            <img src={url} alt={`Additional ${index + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        
        <label className="aspect-square rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
          {uploading ? (
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          ) : (
            <>
              <ImageIcon className="w-8 h-8 text-slate-300" />
              <span className="text-xs text-slate-400">Add Image</span>
            </>
          )}
        </label>
      </div>
      
      <div className="flex gap-2 items-center max-w-sm">
        <Input 
          placeholder="Or paste image URL..." 
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          className="text-sm bg-white"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddUrl();
            }
          }}
        />
        <Button 
          type="button" 
          variant="secondary"
          onClick={handleAddUrl}
          disabled={!urlInput.trim()}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}