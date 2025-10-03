"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Folder, Image, Video, Clock, Eye, ChevronRight, Sparkles } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  visuals: Array<{
    id: string;
    type: string;
    imageUrl?: string;
    videoUrl?: string;
    createdAt: string;
  }>;
  _count: {
    visuals: number;
  };
}

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

interface HomeTabProps {
  onNavigateToTab: (tab: string) => void;
  onCreateProject: () => void;
  onCreateCollection: (projectId: string, projectName: string) => void;
  onSelectProject?: (projectId: string) => void;
}

export default function HomeTab({ 
  onNavigateToTab, 
  onCreateProject, 
  onCreateCollection,
  onSelectProject
}: HomeTabProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projectsRes, collectionsRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/collections')
      ]);

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData.projects || []);
      }

      if (collectionsRes.ok) {
        const collectionsData = await collectionsRes.json();
        setCollections(collectionsData.collections || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-6 h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">Welcome to Creative Studio</h1>
        <p className="text-xl text-gray-300">
          Create, organize, and manage your visual content projects
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={onCreateProject}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
          <button
            onClick={() => onNavigateToTab('create')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            Start Creating
          </button>
        </div>
      </div>

      {/* Recent Projects */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
            <Folder className="w-6 h-6" />
            Recent Projects
          </h2>
          {projects.length > 3 && (
            <button
              onClick={() => onNavigateToTab('projects')}
              className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="bg-gray-800/50 rounded-lg p-8 text-center">
            <Folder className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No projects yet</h3>
            <p className="text-gray-500 mb-4">Create your first project to organize your visuals</p>
            <button
              onClick={onCreateProject}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.slice(0, 3).map((project) => (
              <div
                key={project.id}
                className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 cursor-pointer transition-colors group"
                onClick={() => {
                  if (onSelectProject) {
                    onSelectProject(project.id);
                  }
                  // Navigate to create tab instead of project detail page
                  onNavigateToTab('create');
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white group-hover:text-purple-300 transition-colors">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: project.color || '#8B5CF6' }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-gray-400">
                    <span className="flex items-center gap-1">
                      <Image className="w-4 h-4" />
                      {project._count.visuals}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(project.updatedAt)}
                    </span>
                  </div>
                </div>

                {project.visuals.length > 0 && (
                  <div className="flex gap-2 mt-4">
                    {project.visuals.slice(0, 3).map((visual, index) => (
                      <div
                        key={visual.id}
                        className="w-12 h-12 rounded bg-gray-700 overflow-hidden flex-shrink-0"
                      >
                        <img
                          src={getVisualThumbnail(visual)}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-image.svg';
                          }}
                        />
                      </div>
                    ))}
                    {project.visuals.length > 3 && (
                      <div className="w-12 h-12 rounded bg-gray-700 flex items-center justify-center text-xs text-gray-400">
                        +{project.visuals.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Collections */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
            <Eye className="w-6 h-6" />
            Recent Collections
          </h2>
          {collections.length > 3 && (
            <button
              onClick={() => onNavigateToTab('collections')}
              className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {collections.length === 0 ? (
          <div className="bg-gray-800/50 rounded-lg p-8 text-center">
            <Eye className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No collections yet</h3>
            <p className="text-gray-500">Create collections within your projects to organize visuals</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.slice(0, 3).map((collection) => (
              <div
                key={collection.id}
                className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 cursor-pointer transition-colors group"
                onClick={() => onNavigateToTab(`collection-${collection.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-medium text-white group-hover:text-blue-300 transition-colors">
                        {collection.name}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500">
                      in {collection.project.name}
                    </p>
                    {collection.description && (
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                        {collection.description}
                      </p>
                    )}
                  </div>
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: collection.color || '#3B82F6' }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-gray-400">
                    <span className="flex items-center gap-1">
                      <Image className="w-4 h-4" />
                      {collection._count.collectionVisuals}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(collection.updatedAt)}
                    </span>
                  </div>
                </div>

                {collection.collectionVisuals.length > 0 && (
                  <div className="flex gap-2 mt-4">
                    {collection.collectionVisuals.slice(0, 3).map((item, index) => (
                      <div
                        key={item.visual.id}
                        className="w-12 h-12 rounded bg-gray-700 overflow-hidden flex-shrink-0"
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
                      <div className="w-12 h-12 rounded bg-gray-700 flex items-center justify-center text-xs text-gray-400">
                        +{collection.collectionVisuals.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigateToTab('create')}
            className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-lg text-white hover:from-purple-700 hover:to-purple-800 transition-all"
          >
            <Video className="w-8 h-8 mb-2" />
            <div className="text-sm font-medium">Generate Video</div>
          </button>
          <button
            onClick={() => onNavigateToTab('create')}
            className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-lg text-white hover:from-blue-700 hover:to-blue-800 transition-all"
          >
            <Image className="w-8 h-8 mb-2" />
            <div className="text-sm font-medium">Generate Image</div>
          </button>
          <button
            onClick={() => onNavigateToTab('library')}
            className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-lg text-white hover:from-green-700 hover:to-green-800 transition-all"
          >
            <Eye className="w-8 h-8 mb-2" />
            <div className="text-sm font-medium">View Library</div>
          </button>
        </div>
      </section>
    </div>
  );
}