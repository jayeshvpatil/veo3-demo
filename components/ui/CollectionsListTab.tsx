"use client";
import React, { useState, useEffect } from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Eye, Image, Clock, Trash2, Folder } from 'lucide-react';

interface Collection {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    name: string;
    color?: string;
  };
  collectionVisuals: Array<{
    visual: {
      id: string;
      type: string;
      imageUrl?: string;
      videoUrl?: string;
      createdAt: string;
    };
  }>;
  _count: {
    collectionVisuals: number;
  };
}

interface CollectionsListTabProps {
  onNavigateToTab: (tab: string) => void;
}

export default function CollectionsListTab({ 
  onNavigateToTab
}: CollectionsListTabProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'items'>('recent');
  const [collectionToDelete, setCollectionToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const response = await fetch('/api/collections');
      if (response.ok) {
        const data = await response.json();
        setCollections(data.collections || []);
      }
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCollection = async (collectionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollectionToDelete(collectionId);
  };

  const confirmDelete = async () => {
    if (!collectionToDelete) return;

    try {
      const response = await fetch(`/api/collections/${collectionToDelete}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCollections(prev => prev.filter(c => c.id !== collectionToDelete));
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
    } finally {
      setCollectionToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getVisualThumbnail = (visual: { type: string; imageUrl?: string; videoUrl?: string }) => {
    return visual.imageUrl || visual.videoUrl || '/placeholder-image.svg';
  };

  const sortedCollections = [...collections].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'items':
        return b._count.collectionVisuals - a._count.collectionVisuals;
      case 'recent':
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-6 h-48"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Tooltip.Provider>
      <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Eye className="w-8 h-8" />
            Collections
          </h1>
          <p className="text-gray-400 mt-2">
            Browse all your collections across all projects
          </p>
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">Sort by:</span>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('recent')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              sortBy === 'recent'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Most Recent
          </button>
          <button
            onClick={() => setSortBy('name')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              sortBy === 'name'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Name
          </button>
          <button
            onClick={() => setSortBy('items')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              sortBy === 'items'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Most Items
          </button>
        </div>
      </div>

      {/* Collections Grid */}
      {collections.length === 0 ? (
        <div className="bg-gray-800/50 rounded-lg p-12 text-center">
          <Eye className="w-20 h-20 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">No collections yet</h3>
          <p className="text-gray-500 mb-6">
            Collections help you organize visuals within your projects.
            <br />
            Create a project first, then add collections to organize your content.
          </p>
          <button
            onClick={() => onNavigateToTab('projects')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors"
          >
            <Folder className="w-5 h-5" />
            Go to Projects
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCollections.map((collection) => (
            <div
              key={collection.id}
              className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 cursor-pointer transition-colors group relative"
              onClick={() => onNavigateToTab(`collection-${collection.id}`)}
            >
              {/* Collection Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: collection.color || '#3B82F6' }}
                    />
                    <h3 className="text-lg font-medium text-white group-hover:text-blue-300 transition-colors">
                      {collection.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: collection.project.color || '#8B5CF6' }}
                    />
                    <p className="text-xs text-gray-500">
                      in {collection.project.name}
                    </p>
                  </div>
                  {collection.description && (
                    <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                      {collection.description}
                    </p>
                  )}
                </div>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      onClick={(e) => handleDeleteCollection(collection.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-900/20 rounded-lg transition-all text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-xl z-50"
                      sideOffset={5}
                    >
                      Delete collection
                      <Tooltip.Arrow className="fill-gray-900" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </div>

              {/* Collection Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                <span className="flex items-center gap-1">
                  <Image className="w-4 h-4" />
                  {collection._count.collectionVisuals} items
                </span>
              </div>

              {/* Visual Previews */}
              {collection.collectionVisuals.length > 0 ? (
                <div className="flex gap-2">
                  {collection.collectionVisuals.slice(0, 3).map((item) => (
                    <div
                      key={item.visual.id}
                      className="w-16 h-16 rounded bg-gray-700 overflow-hidden flex-shrink-0"
                    >
                      <img
                        src={getVisualThumbnail(item.visual)}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-image.svg';
                        }}
                      />
                    </div>
                  ))}
                  {collection.collectionVisuals.length > 3 && (
                    <div className="w-16 h-16 rounded bg-gray-700 flex items-center justify-center text-xs text-gray-400">
                      +{collection.collectionVisuals.length - 3}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-16 rounded bg-gray-700/50 flex items-center justify-center text-xs text-gray-500">
                  No items yet
                </div>
              )}

              {/* Updated Date */}
              <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Updated {formatDate(collection.updatedAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root open={!!collectionToDelete} onOpenChange={(open) => !open && setCollectionToDelete(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <AlertDialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-gray-800 rounded-lg p-6 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
            <AlertDialog.Title className="text-xl font-semibold text-white mb-2">
              Delete Collection
            </AlertDialog.Title>
            <AlertDialog.Description className="text-gray-400 mb-6">
              Are you sure you want to delete this collection? The visuals will remain in the project. This action cannot be undone.
            </AlertDialog.Description>
            <div className="flex gap-3 justify-end">
              <AlertDialog.Cancel asChild>
                <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">
                  Cancel
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Delete Collection
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
    </Tooltip.Provider>
  );
}
