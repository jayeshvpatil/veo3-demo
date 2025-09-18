"use client";
import React from 'react';
import { Button } from './Button';
import { Download, Trash2, RotateCcw, Image as ImageIcon } from 'lucide-react';

interface SavedVisual {
  id: string;
  url: string;
  prompt: string;
  product?: {
    id: string;
    title: string;
    description: string;
  };
  timestamp: number;
}

interface VisualsLibraryTabProps {
  savedVisuals: SavedVisual[];
  onDeleteVisual: (visualId: string) => void;
  onReuseVisual: (visual: SavedVisual) => void;
}

export default function VisualsLibraryTab({
  savedVisuals,
  onDeleteVisual,
  onReuseVisual
}: VisualsLibraryTabProps) {
  const downloadVisual = async (visual: SavedVisual) => {
    try {
      const response = await fetch(visual.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `visual-${visual.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download visual:', error);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (savedVisuals.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8">
        <div className="w-24 h-24 mb-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl flex items-center justify-center transform rotate-3">
          <ImageIcon size={32} className="text-purple-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-3">No saved visuals yet</h3>
        <p className="text-center max-w-sm text-gray-600 leading-relaxed">
          Your generated visuals will be automatically saved here for easy access and reuse.
        </p>
        <div className="mt-6 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>Create visuals from products to build your library</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          Visual Library
          <span className="text-xs font-normal bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
            {savedVisuals.length} saved
          </span>
        </h2>
        <p className="text-sm text-gray-600">Your generated visuals collection</p>
      </div>

      {/* Visual Grid - Horizontal Layout */}
      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex gap-4 h-full">
          {savedVisuals.map((visual) => (
            <div key={visual.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 w-48 flex-shrink-0">
              {/* Visual Image */}
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                <img
                  src={visual.url}
                  alt="Generated visual"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center text-gray-400">
                          <div class="text-center">
                            <div class="text-2xl mb-1">🖼️</div>
                            <div class="text-xs">Image unavailable</div>
                          </div>
                        </div>
                      `;
                    }
                  }}
                />
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex gap-1">
                    <button
                      onClick={() => downloadVisual(visual)}
                      className="p-1.5 bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white hover:text-purple-600 transition-all duration-200 shadow-sm"
                      title="Download"
                    >
                      <Download size={12} />
                    </button>
                    <button
                      onClick={() => onDeleteVisual(visual.id)}
                      className="p-1.5 bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white hover:text-red-600 transition-all duration-200 shadow-sm"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Visual Info */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-gray-500 font-medium">
                    {formatTimestamp(visual.timestamp)}
                  </div>
                  {visual.product && (
                    <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                      Product
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed mb-3">
                  {visual.prompt}
                </p>

                {/* Action Button */}
                <button
                  onClick={() => onReuseVisual(visual)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 rounded-lg hover:from-purple-600 hover:to-purple-700 hover:text-white transition-all duration-200 text-xs font-medium"
                >
                  <RotateCcw size={12} />
                  Use in video
                </button>
              </div>
            </div>
          ))}
          
          {/* Add Visual Card */}
          <div className="w-48 flex-shrink-0 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-purple-300 hover:bg-purple-50 transition-all duration-200">
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-3 bg-gray-200 rounded-xl flex items-center justify-center">
                <ImageIcon size={24} className="text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Create Visual</p>
              <p className="text-xs text-gray-500">Select products to generate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}