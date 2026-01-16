import React from 'react';
import ImageUploader from './ImageUploader';

export default function DiscImagesUploader({ images = [], onChange }) {
  const updateImage = (index, url) => {
    const newImages = [...images];
    newImages[index] = url;
    onChange(newImages.filter(img => img)); // Remove empty strings
  };

  const discSlots = [0, 1, 2, 3];

  return (
    <div>
      <label className="text-sm font-medium text-slate-700 mb-2 block">Disc Images (up to 4)</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {discSlots.map((index) => (
          <div key={index}>
            <label className="text-xs text-slate-500 mb-1.5 block">Disc {index + 1}</label>
            <ImageUploader 
              value={images[index] || ''} 
              onChange={(url) => updateImage(index, url)} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}