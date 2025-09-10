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
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <ImageIcon size={64} className="mb-4 opacity-50" />
        <h3 className="text-xl font-semibold mb-2">No visuals saved yet</h3>
        <p className="text-center max-w-md">
          Generated visuals will appear here automatically. Use the &quot;Product &amp; Visual Selection&quot; tab to create stunning product visuals.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full p-6 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Visual Library</h2>
        <p className="text-gray-600">
          {savedVisuals.length} saved visual{savedVisuals.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedVisuals.map((visual) => (
          <div key={visual.id} className="bg-white rounded-lg border shadow-sm overflow-hidden">
            {/* Visual Image */}
            <div className="aspect-square bg-gray-100 relative overflow-hidden">
              <img
                src={visual.url}
                alt="Generated visual"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center text-gray-400">
                        <div class="text-center">
                          <div class="text-4xl mb-2">🖼️</div>
                          <div class="text-sm">Image not available</div>
                        </div>
                      </div>
                    `;
                  }
                }}
              />
            </div>

            {/* Visual Info */}
            <div className="p-4">
              <div className="text-sm text-gray-500 mb-2">
                {formatTimestamp(visual.timestamp)}
              </div>
              <div className="text-sm text-gray-700 mb-4 line-clamp-3">
                {visual.prompt}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadVisual(visual)}
                  className="flex-1"
                >
                  <Download size={14} className="mr-1" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReuseVisual(visual)}
                  className="flex-1"
                >
                  <RotateCcw size={14} className="mr-1" />
                  Reuse
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteVisual(visual.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}