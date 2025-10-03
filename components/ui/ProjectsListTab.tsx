"use client";
import React, { useState, useEffect } from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Plus, Folder, Image, Clock, Trash2, Eye } from 'lucide-react';

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
    collections: number;
  };
}

interface ProjectsListTabProps {
  onNavigateToTab: (tab: string) => void;
  onCreateProject: () => void;
}

export default function ProjectsListTab({ 
  onNavigateToTab, 
  onCreateProject 
}: ProjectsListTabProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'visuals'>('recent');
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToDelete(projectId);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;

    try {
      const response = await fetch(`/api/projects/${projectToDelete}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setProjects(prev => prev.filter(p => p.id !== projectToDelete));
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setProjectToDelete(null);
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

  const sortedProjects = [...projects].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'visuals':
        return b._count.visuals - a._count.visuals;
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
            <Folder className="w-8 h-8" />
            Projects
          </h1>
          <p className="text-gray-400 mt-2">
            Organize your visual content into projects
          </p>
        </div>
        <button
          onClick={onCreateProject}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </div>

      {/* Sort Options */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">Sort by:</span>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('recent')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              sortBy === 'recent'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Most Recent
          </button>
          <button
            onClick={() => setSortBy('name')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              sortBy === 'name'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Name
          </button>
          <button
            onClick={() => setSortBy('visuals')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              sortBy === 'visuals'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Most Visuals
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-gray-800/50 rounded-lg p-12 text-center">
          <Folder className="w-20 h-20 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">No projects yet</h3>
          <p className="text-gray-500 mb-6">Create your first project to organize your visual content</p>
          <button
            onClick={onCreateProject}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProjects.map((project) => (
            <div
              key={project.id}
              className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 cursor-pointer transition-colors group relative"
              onClick={() => onNavigateToTab(`project-${project.id}`)}
            >
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: project.color || '#8B5CF6' }}
                    />
                    <h3 className="text-lg font-medium text-white group-hover:text-purple-300 transition-colors">
                      {project.name}
                    </h3>
                  </div>
                  {project.description && (
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      onClick={(e) => handleDeleteProject(project.id, e)}
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
                      Delete project
                      <Tooltip.Arrow className="fill-gray-900" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </div>

              {/* Project Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                <span className="flex items-center gap-1">
                  <Image className="w-4 h-4" />
                  {project._count.visuals} visuals
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {project._count.collections} collections
                </span>
              </div>

              {/* Visual Previews */}
              {project.visuals.length > 0 ? (
                <div className="flex gap-2">
                  {project.visuals.slice(0, 3).map((visual) => (
                    <div
                      key={visual.id}
                      className="w-16 h-16 rounded bg-gray-700 overflow-hidden flex-shrink-0"
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
                    <div className="w-16 h-16 rounded bg-gray-700 flex items-center justify-center text-xs text-gray-400">
                      +{project.visuals.length - 3}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-16 rounded bg-gray-700/50 flex items-center justify-center text-xs text-gray-500">
                  No visuals yet
                </div>
              )}

              {/* Updated Date */}
              <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Updated {formatDate(project.updatedAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <AlertDialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-gray-800 rounded-lg p-6 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
            <AlertDialog.Title className="text-xl font-semibold text-white mb-2">
              Delete Project
            </AlertDialog.Title>
            <AlertDialog.Description className="text-gray-400 mb-6">
              Are you sure you want to delete this project? This will also delete all collections and visuals in this project. This action cannot be undone.
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
                  Delete Project
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
