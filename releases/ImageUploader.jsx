import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';

export default function ImageUploader({ value, onChange }) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange(file_url);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative group w-full aspect-square max-w-xs rounded-xl overflow-hidden border border-slate-200">
          <img 
            src={value} 
            alt="Cover art" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
              <div className="px-3 py-2 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                Replace
              </div>
            </label>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onChange('')}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <label className="cursor-pointer block">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            disabled={isUploading}
          />
          <div className="w-full aspect-square max-w-xs rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-300 transition-colors flex flex-col items-center justify-center gap-3 bg-slate-50 hover:bg-indigo-50/30">
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                <span className="text-sm text-slate-500">Uploading...</span>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-600">Click to upload</p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 10MB</p>
                </div>
              </>
            )}
          </div>
        </label>
      )}
      {!value && (
        <div className="flex gap-2">
          <Input 
            placeholder="Or paste image URL..." 
            onChange={(e) => onChange(e.target.value)}
            className="text-sm"
          />
        </div>
      )}
    </div>
  );
}