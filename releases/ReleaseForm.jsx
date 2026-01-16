import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import ImageUploader from './ImageUploader';
import DiscImagesUploader from './DiscImagesUploader';
import AdditionalImagesManager from './AdditionalImagesManager';

const commonLanguages = ["English", "Chinese", "Spanish", "Japanese", "Korean", "French", "German", "Italian", "Thai", "Portuguese", "Russian", "Arabic", "Hindi", "Other"];

export default function ReleaseForm({ initialData, onSubmit, isLoading }) {
  const [formData, setFormData] = useState(initialData || {
    title: '',
    cover_art: '',
    back_art: '',
    disc_images: [],
    additional_images: [],
    number_of_discs: 1,
    audio_language: '',
    audio_language_2: '',
    subtitle_language: '',
    subtitle_language_2: '',
    subtitle_language_3: '',
    country: '',
    publisher: '',
    download_link: '',
    notes: ''
  });

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Cover Arts Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">Cover Art *</label>
          <ImageUploader 
            value={formData.cover_art} 
            onChange={(url) => updateField('cover_art', url)} 
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">Back Art</label>
          <ImageUploader 
            value={formData.back_art} 
            onChange={(url) => updateField('back_art', url)} 
          />
        </div>
      </div>

      {/* Disc Images */}
      <DiscImagesUploader 
        images={formData.disc_images || []} 
        onChange={(images) => updateField('disc_images', images)} 
      />

      {/* Basic Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">Title *</label>
          <Input
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="VCD title"
            required
            className="bg-white"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">Number of Discs</label>
          <Input
            type="number"
            value={formData.number_of_discs}
            onChange={(e) => updateField('number_of_discs', parseInt(e.target.value) || 1)}
            placeholder="1"
            min="1"
            className="bg-white"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">Publisher</label>
          <Input
            value={formData.publisher}
            onChange={(e) => updateField('publisher', e.target.value)}
            placeholder="Publisher name"
            className="bg-white"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">Audio Language</label>
          <div className="space-y-2">
            <Input
              value={formData.audio_language}
              onChange={(e) => updateField('audio_language', e.target.value)}
              placeholder="Primary Audio"
              className="bg-white"
              list="audio-languages"
            />
            <Input
              value={formData.audio_language_2}
              onChange={(e) => updateField('audio_language_2', e.target.value)}
              placeholder="Secondary Audio (Optional)"
              className="bg-white"
              list="audio-languages"
            />
          </div>
          <datalist id="audio-languages">
            {commonLanguages.map(lang => <option key={lang} value={lang} />)}
          </datalist>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">Subtitle Language</label>
          <div className="space-y-2">
            <Input
              value={formData.subtitle_language}
              onChange={(e) => updateField('subtitle_language', e.target.value)}
              placeholder="Primary Subtitle"
              className="bg-white"
              list="subtitle-languages"
            />
            <Input
              value={formData.subtitle_language_2}
              onChange={(e) => updateField('subtitle_language_2', e.target.value)}
              placeholder="2nd Subtitle (Optional)"
              className="bg-white"
              list="subtitle-languages"
            />
            <Input
              value={formData.subtitle_language_3}
              onChange={(e) => updateField('subtitle_language_3', e.target.value)}
              placeholder="3rd Subtitle (Optional)"
              className="bg-white"
              list="subtitle-languages"
            />
          </div>
          <datalist id="subtitle-languages">
            {commonLanguages.map(lang => <option key={lang} value={lang} />)}
          </datalist>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">Country</label>
          <Input
            value={formData.country}
            onChange={(e) => updateField('country', e.target.value)}
            placeholder="Hong Kong, Japan, USA..."
            className="bg-white"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">Download Link</label>
          <Input
            type="url"
            value={formData.download_link}
            onChange={(e) => updateField('download_link', e.target.value)}
            placeholder="https://..."
            className="bg-white"
          />
        </div>
      </div>

      {/* Additional Images */}
      <AdditionalImagesManager 
        images={formData.additional_images || []} 
        onChange={(images) => updateField('additional_images', images)} 
      />

      {/* Notes */}
      <div>
        <label className="text-sm font-medium text-slate-700 mb-1.5 block">Notes</label>
        <Textarea
          value={formData.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="Additional information about this VCD..."
          rows={4}
          className="bg-white"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6">
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {initialData ? 'Update VCD' : 'Add VCD'}
        </Button>
      </div>
    </form>
  );
}