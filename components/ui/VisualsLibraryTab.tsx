"use client";
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { 
  Download, 
  Trash2, 
  RotateCcw, 
  Image as ImageIcon, 
  Search,
  Upload,
  CheckSquare,
  Square,
  X
} from 'lucide-react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as Tooltip from '@radix-ui/react-tooltip';
import ImageDetailModal from './ImageDetailModal';

interface SavedVisual {
  id: string;
  url: string;
  prompt: string;
  type?: 'image' | 'video';
  product?: {
    id: string;
    title: string;
    description: string;
  };
  timestamp: number;
  metadata?: any;
  tags?: string | null;
  aiTags?: string | null;
  aiDescription?: string | null;
  project?: { name: string } | null;
  collection?: { name: string } | null;
}

interface Project {
  id: string;
  name: string;
  description?: string;
}

interface Collection {
  id: string;
  name: string;
  projectId: string;
  project?: { name: string };
}

interface VisualsLibraryTabProps {
  savedVisuals: SavedVisual[];
  onDeleteVisual: (visualId: string) => void;
  onReuseVisual: (visual: SavedVisual) => void;
  onClearAll?: () => void;
  onRefresh?: () => void;
}

export default function VisualsLibraryTab({
  savedVisuals,
  onDeleteVisual,
  onReuseVisual,
  onClearAll,
  onRefresh
}: VisualsLibraryTabProps) {
  const [selectedVisuals, setSelectedVisuals] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SavedVisual[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [detailModalVisual, setDetailModalVisual] = useState<SavedVisual | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const displayVisuals = searchQuery || referenceImage ? searchResults : savedVisuals;

  useEffect(() => {
    fetchProjects();
    fetchCollections();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        const allCollections: Collection[] = [];
        data.projects?.forEach((project: any) => {
          project.collections?.forEach((collection: any) => {
            allCollections.push({
              ...collection,
              project: { name: project.name }
            });
          });
        });
        setCollections(allCollections);
      }
    } catch (error) {
      console.error('Failed to fetch collections:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery && !referenceImage) return;

    setIsSearching(true);
    try {
      console.log('Searching for:', searchQuery);
      
      const response = await fetch('/api/visuals/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery || undefined,
          referenceImage: referenceImage || undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Search results:', data);
        setSearchResults(data.visuals || []);
      } else {
        const errorData = await response.json();
        console.error('Search failed:', errorData);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setReferenceImage(event.target?.result as string);
        setSearchQuery('');
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setReferenceImage(null);
    setSearchResults([]);
  };

  const toggleSelection = (visualId: string) => {
    const newSelection = new Set(selectedVisuals);
    if (newSelection.has(visualId)) {
      newSelection.delete(visualId);
    } else {
      newSelection.add(visualId);
    }
    setSelectedVisuals(newSelection);
  };

  const selectAll = () => {
    const allIds = new Set(displayVisuals.map(v => v.id));
    setSelectedVisuals(allIds);
  };

  const deselectAll = () => {
    setSelectedVisuals(new Set());
  };

  const handleAddToCollection = async (collectionId: string) => {
    if (selectedVisuals.size === 0) return;

    try {
      const response = await fetch('/api/visuals/add-to-collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visualIds: Array.from(selectedVisuals),
          collectionId
        })
      });

      if (response.ok) {
        alert(`Added ${selectedVisuals.size} visuals to collection`);
        deselectAll();
        setIsSelectionMode(false);
      } else {
        alert('Failed to add visuals to collection');
      }
    } catch (error) {
      console.error('Error adding to collection:', error);
      alert('Failed to add visuals to collection');
    }
  };

  const openDetailModal = (visual: SavedVisual) => {
    setDetailModalVisual(visual);
    setShowDetailModal(true);
  };

  const refreshData = async () => {
    // Close the modal first
    setShowDetailModal(false);
    setDetailModalVisual(null);
    
    // Refresh the data
    if (onRefresh) {
      await onRefresh();
    }
  };

  const downloadVisual = async (visual: SavedVisual) => {
    try {
      const response = await fetch(visual.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${visual.type === 'video' ? 'video' : 'visual'}-${visual.id}.${visual.type === 'video' ? 'mp4' : 'png'}`;
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
    <Tooltip.Provider>
      <div className="h-full flex flex-col">
        {/* Header with Search */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Visual Library</h2>
              <p className="text-gray-600">
                {savedVisuals.length} saved visual{savedVisuals.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-2">
              {!isSelectionMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSelectionMode(true)}
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Select Multiple
                </Button>
              )}
              {savedVisuals.length > 0 && onClearAll && !isSelectionMode && (
                <AlertDialog.Root>
                  <AlertDialog.Trigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  </AlertDialog.Trigger>
                  <AlertDialog.Portal>
                    <AlertDialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
                    <AlertDialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] max-w-md w-full bg-white rounded-lg shadow-lg p-6 z-50">
                      <AlertDialog.Title className="text-lg font-semibold mb-2">
                        Clear All Visuals?
                      </AlertDialog.Title>
                      <AlertDialog.Description className="text-sm text-gray-600 mb-6">
                        This will permanently delete all {savedVisuals.length} visuals from your library. This action cannot be undone.
                      </AlertDialog.Description>
                      <div className="flex justify-end gap-3">
                        <AlertDialog.Cancel asChild>
                          <Button variant="outline" size="sm">Cancel</Button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-red-600 text-white hover:bg-red-700 border-red-600"
                            onClick={onClearAll}
                          >
                            Delete All
                          </Button>
                        </AlertDialog.Action>
                      </div>
                    </AlertDialog.Content>
                  </AlertDialog.Portal>
                </AlertDialog.Root>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    console.log('Search query changed:', e.target.value);
                    setSearchQuery(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    console.log('Key pressed:', e.key);
                    if (e.key === 'Enter') {
                      console.log('Enter pressed, calling handleSearch');
                      handleSearch();
                    }
                  }}
                  placeholder="Describe what you're looking for..."
                  disabled={!!referenceImage}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="reference-image-upload"
                />
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <label
                      htmlFor="reference-image-upload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                    </label>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-gray-900 text-white text-xs rounded px-2 py-1 z-50"
                      sideOffset={5}
                    >
                      Upload reference image
                      <Tooltip.Arrow className="fill-gray-900" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </div>
              <Button 
                onClick={() => {
                  console.log('Search button clicked!');
                  handleSearch();
                }} 
                disabled={isSearching || (!searchQuery && !referenceImage)}
              >
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
              {(searchQuery || referenceImage) && (
                <Button variant="outline" onClick={clearSearch}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {referenceImage && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <img src={referenceImage} alt="Reference" className="w-12 h-12 object-cover rounded" />
                <span>Using reference image for search</span>
              </div>
            )}
          </div>

          {/* Selection Mode Controls */}
          {isSelectionMode && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">
                {selectedVisuals.size} selected
              </span>
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                Deselect All
              </Button>
              {selectedVisuals.size > 0 && collections.length > 0 && (
                <div className="relative">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddToCollection(e.target.value);
                      }
                    }}
                    className="px-3 py-1 border rounded text-sm"
                    defaultValue=""
                  >
                    <option value="">Add to Collection...</option>
                    {collections.map(col => (
                      <option key={col.id} value={col.id}>
                        {col.project?.name} / {col.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsSelectionMode(false);
                  deselectAll();
                }}
                className="ml-auto"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Visuals Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {displayVisuals.length === 0 && (searchQuery || referenceImage) ? (
            <div className="flex flex-col items-center justify-center text-gray-500 py-12">
              <Search size={48} className="mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No results found</h3>
              <p className="text-sm text-center">Try different search terms or clear the search</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayVisuals.map((visual) => (
                <div key={visual.id} className="bg-white rounded-lg border shadow-sm overflow-hidden relative group">
                  {/* Selection Checkbox */}
                  {isSelectionMode && (
                    <div className="absolute top-2 left-2 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelection(visual.id);
                        }}
                        className="bg-white rounded p-1 shadow-lg hover:bg-gray-50"
                      >
                        {selectedVisuals.has(visual.id) ? (
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Visual Media */}
                  <div 
                    className="aspect-square bg-gray-100 relative overflow-hidden cursor-pointer"
                    onClick={() => !isSelectionMode && openDetailModal(visual)}
                  >
                    {visual.type === 'video' ? (
                      <video
                        src={visual.url}
                        className="w-full h-full object-cover"
                        controls
                        preload="metadata"
                      />
                    ) : (
                      <img
                        src={visual.url}
                        alt="Generated visual"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          console.error('Image failed to load:', {
                            visualId: visual.id,
                            urlType: visual.url?.startsWith('data:') ? 'data URL' : visual.url?.startsWith('http') ? 'HTTP URL' : 'unknown',
                            urlLength: visual.url?.length,
                            urlPrefix: visual.url?.substring(0, 100)
                          });
                          target.onerror = null;
                          target.src = '/placeholder-image.svg';
                          target.alt = 'Image not available';
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', {
                            visualId: visual.id,
                            urlType: visual.url?.startsWith('data:') ? 'data URL' : 'HTTP URL'
                          });
                        }}
                      />
                    )}
                    
                    {/* Media type indicator */}
                    <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                      {visual.type === 'video' ? '🎬 Video' : '🖼️ Image'}
                    </div>
                  </div>

                  {/* Visual Info */}
                  <div className="p-4">
                    <div className="text-sm text-gray-500 mb-2">
                      {formatTimestamp(visual.timestamp)}
                    </div>
                    <div className="text-sm text-gray-700 mb-2 line-clamp-2">
                      {visual.prompt}
                    </div>

                    {/* Tags */}
                    {(visual.tags || visual.aiTags) && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {visual.tags?.split(',').slice(0, 3).map((tag, i) => (
                          <span key={`tag-${i}`} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            {tag.trim()}
                          </span>
                        ))}
                        {visual.aiTags?.split(',').slice(0, 2).map((tag, i) => (
                          <span key={`ai-${i}`} className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    {!isSelectionMode && (
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
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Image Detail Modal */}
        <ImageDetailModal
          visual={detailModalVisual}
          open={showDetailModal}
          onOpenChange={setShowDetailModal}
          onUpdate={refreshData}
        />
      </div>
    </Tooltip.Provider>
  );
}
