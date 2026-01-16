import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export default function TracklistEditor({ tracks = [], onChange }) {
  const addTrack = () => {
    onChange([...tracks, { position: `${tracks.length + 1}`, title: '', duration: '' }]);
  };

  const updateTrack = (index, field, value) => {
    const newTracks = [...tracks];
    newTracks[index] = { ...newTracks[index], [field]: value };
    onChange(newTracks);
  };

  const removeTrack = (index) => {
    onChange(tracks.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">Tracklist</label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addTrack}
          className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Track
        </Button>
      </div>
      
      {tracks.length === 0 && (
        <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          <p className="text-sm text-slate-400">No tracks added yet</p>
        </div>
      )}

      <div className="space-y-2">
        {tracks.map((track, index) => (
          <div key={index} className="flex items-center gap-2 group">
            <div className="text-slate-300 cursor-move">
              <GripVertical className="w-4 h-4" />
            </div>
            <Input
              value={track.position}
              onChange={(e) => updateTrack(index, 'position', e.target.value)}
              placeholder="#"
              className="w-14 text-center bg-white"
            />
            <Input
              value={track.title}
              onChange={(e) => updateTrack(index, 'title', e.target.value)}
              placeholder="Track title"
              className="flex-1 bg-white"
            />
            <Input
              value={track.duration}
              onChange={(e) => updateTrack(index, 'duration', e.target.value)}
              placeholder="0:00"
              className="w-20 text-center bg-white"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeTrack(index)}
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}