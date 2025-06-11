import React, { useState, useEffect } from 'react';
import { X, Calendar, Grid3X3, ChevronLeft, ChevronRight, Trash2, Check } from 'lucide-react';

interface PhotosAppProps {
  onClose: () => void;
}

interface Photo {
  id: string;
  data: string;
  timestamp: number;
}

const PhotosApp: React.FC<PhotosAppProps> = ({ onClose }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'years' | 'months' | 'days' | 'all'>('all');
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = () => {
    const stored = localStorage.getItem('camera_photos');
    if (stored) {
      const photoData = JSON.parse(stored);
      setPhotos(photoData.reverse()); // Show newest first
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const groupPhotosByDate = () => {
    const grouped: { [key: string]: Photo[] } = {};
    photos.forEach(photo => {
      const date = formatDate(photo.timestamp);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(photo);
    });
    return grouped;
  };

  const handlePhotoSelect = (photo: Photo, index: number) => {
    if (isSelecting) {
      togglePhotoSelection(photo.id);
    } else {
      setSelectedPhoto(photo);
      setSelectedIndex(index);
    }
  };

  const togglePhotoSelection = (photoId: string) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId);
    } else {
      newSelected.add(photoId);
    }
    setSelectedPhotos(newSelected);
  };

  const deleteSelectedPhotos = () => {
    const remainingPhotos = photos.filter(photo => !selectedPhotos.has(photo.id));
    setPhotos(remainingPhotos);
    localStorage.setItem('camera_photos', JSON.stringify(remainingPhotos.reverse()));
    setSelectedPhotos(new Set());
    setIsSelecting(false);
  };

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && selectedIndex > 0) {
      const newIndex = selectedIndex - 1;
      setSelectedIndex(newIndex);
      setSelectedPhoto(photos[newIndex]);
    } else if (direction === 'next' && selectedIndex < photos.length - 1) {
      const newIndex = selectedIndex + 1;
      setSelectedIndex(newIndex);
      setSelectedPhoto(photos[newIndex]);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (selectedPhoto) {
      if (e.key === 'ArrowLeft') {
        navigatePhoto('prev');
      } else if (e.key === 'ArrowRight') {
        navigatePhoto('next');
      } else if (e.key === 'Escape') {
        setSelectedPhoto(null);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [selectedPhoto, selectedIndex]);

  if (selectedPhoto) {
    return (
      <div 
        className="absolute inset-0 bg-black z-50 flex flex-col overflow-hidden"
        style={{ borderRadius: '40px' }}
      >
        <div className="flex-1 flex items-center justify-center relative">
          <img
            src={selectedPhoto.data}
            alt="Selected"
            className="max-w-full max-h-full object-contain"
          />
          
          {/* Navigation Arrows */}
          {selectedIndex > 0 && (
            <button
              onClick={() => navigatePhoto('prev')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
          )}
          
          {selectedIndex < photos.length - 1 && (
            <button
              onClick={() => navigatePhoto('next')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center"
            >
              <ChevronRight size={24} className="text-white" />
            </button>
          )}
        </div>
        
        <div className="absolute top-6 left-6">
          <button
            onClick={() => setSelectedPhoto(null)}
            className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center"
          >
            <X size={20} className="text-white" />
          </button>
        </div>
        
        <div className="absolute top-6 right-6 text-white text-sm">
          {formatDate(selectedPhoto.timestamp)}
        </div>
        
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white text-sm">
          {selectedIndex + 1} of {photos.length}
        </div>
      </div>
    );
  }

  const groupedPhotos = groupPhotosByDate();

  const renderGridView = () => {
    if (viewMode === 'days') {
      // Days view - larger tiles, single column
      return (
        <div className="p-4 space-y-6">
          {Object.entries(groupedPhotos).map(([date, datePhotos]) => (
            <div key={date}>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">{date}</h3>
              <div className="space-y-2">
                {datePhotos.map((photo, photoIndex) => {
                  const globalIndex = photos.findIndex(p => p.id === photo.id);
                  const isSelected = selectedPhotos.has(photo.id);
                  return (
                    <div
                      key={photo.id}
                      className="relative cursor-pointer"
                      onClick={() => handlePhotoSelect(photo, globalIndex)}
                    >
                      <div className="w-full h-48 rounded-lg overflow-hidden">
                        <img
                          src={photo.data}
                          alt="Photo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {isSelecting && (
                        <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected 
                            ? 'bg-blue-500 border-blue-500' 
                            : 'bg-white/80 border-white'
                        }`}>
                          {isSelected && <Check size={16} className="text-white" />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      // Grid view for years, months, all photos
      return (
        <div className="p-4">
          {Object.entries(groupedPhotos).map(([date, datePhotos]) => (
            <div key={date} className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">{date}</h3>
              <div className="grid grid-cols-3 gap-1">
                {datePhotos.map((photo, photoIndex) => {
                  const globalIndex = photos.findIndex(p => p.id === photo.id);
                  const isSelected = selectedPhotos.has(photo.id);
                  return (
                    <div
                      key={photo.id}
                      className="aspect-square cursor-pointer relative"
                      onClick={() => handlePhotoSelect(photo, globalIndex)}
                    >
                      <img
                        src={photo.data}
                        alt="Photo"
                        className="w-full h-full object-cover rounded-sm"
                      />
                      {isSelecting && (
                        <div className={`absolute top-1 right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected 
                            ? 'bg-blue-500 border-blue-500' 
                            : 'bg-white/80 border-white'
                        }`}>
                          {isSelected && <Check size={12} className="text-white" />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div 
      className="absolute inset-0 bg-white z-50 flex flex-col overflow-hidden"
      style={{ borderRadius: '40px' }}
    >
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              if (isSelecting) {
                setIsSelecting(false);
                setSelectedPhotos(new Set());
              } else {
                onClose();
              }
            }}
            className="text-blue-500 text-lg font-normal"
          >
            {isSelecting ? 'Cancel' : 'Done'}
          </button>
          <h1 className="text-lg font-semibold">Photos</h1>
          <button 
            onClick={() => setIsSelecting(!isSelecting)}
            className="text-blue-500 text-lg font-normal"
          >
            {isSelecting ? 'Done' : 'Select'}
          </button>
        </div>
        
        {/* Selection Actions */}
        {isSelecting && selectedPhotos.size > 0 && (
          <div className="mt-3 flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {selectedPhotos.size} selected
            </span>
            <button
              onClick={deleteSelectedPhotos}
              className="flex items-center space-x-1 text-red-500"
            >
              <Trash2 size={16} />
              <span className="text-sm">Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {photos.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📷</div>
              <h2 className="text-xl font-semibold mb-2">No Photos</h2>
              <p className="text-gray-500">Take some photos with the Camera app</p>
            </div>
          </div>
        ) : (
          renderGridView()
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <button
            onClick={() => setViewMode('years')}
            className={`flex flex-col items-center py-2 ${
              viewMode === 'years' ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            <Calendar size={24} />
            <span className="text-xs mt-1">Years</span>
          </button>
          <button
            onClick={() => setViewMode('months')}
            className={`flex flex-col items-center py-2 ${
              viewMode === 'months' ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            <Calendar size={24} />
            <span className="text-xs mt-1">Months</span>
          </button>
          <button
            onClick={() => setViewMode('days')}
            className={`flex flex-col items-center py-2 ${
              viewMode === 'days' ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            <Calendar size={24} />
            <span className="text-xs mt-1">Days</span>
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`flex flex-col items-center py-2 ${
              viewMode === 'all' ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            <Grid3X3 size={24} />
            <span className="text-xs mt-1">All Photos</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotosApp;