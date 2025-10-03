"use client";

import { useState, useEffect } from 'react';
import { Folder, Plus, ChevronDown } from 'lucide-react';
import * as Select from '@radix-ui/react-select';

interface Project {
  id: string;
  name: string;
  description?: string;
}

interface ProjectSelectorProps {
  currentProjectId: string | null;
  onProjectChange: (projectId: string) => void;
  onCreateProject: () => void;
}

export default function ProjectSelector({ 
  currentProjectId, 
  onProjectChange,
  onCreateProject 
}: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentProject = projects.find(p => p.id === currentProjectId);

  const handleProjectChange = (projectId: string) => {
    console.log('Project changed to:', projectId);
    onProjectChange(projectId);
  };

  return (
    <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 shadow-sm">
      <Folder className="w-5 h-5 text-blue-600" />
      <div className="flex-1">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Current Project</div>
        {loading ? (
          <div className="text-sm text-gray-400">Loading...</div>
        ) : currentProject ? (
          <Select.Root value={currentProjectId || undefined} onValueChange={handleProjectChange}>
            <Select.Trigger 
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors group cursor-pointer"
              aria-label="Select project"
            >
              <Select.Value>
                <span>{currentProject.name}</span>
              </Select.Value>
              <Select.Icon>
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content 
                className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden min-w-[240px]"
                style={{ zIndex: 9999 }}
                position="popper"
                sideOffset={5}
              >
                <Select.Viewport className="p-1">
                  {projects.map((project) => (
                    <Select.Item
                      key={project.id}
                      value={project.id}
                      className="relative flex items-center px-3 py-2.5 text-sm text-gray-900 rounded cursor-pointer hover:bg-blue-50 focus:bg-blue-50 outline-none data-[state=checked]:bg-blue-100 data-[state=checked]:font-medium transition-colors"
                    >
                      <Select.ItemText>
                        <div>
                          <div className="font-medium">{project.name}</div>
                          {project.description && (
                            <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{project.description}</div>
                          )}
                        </div>
                      </Select.ItemText>
                      <Select.ItemIndicator className="ml-auto">
                        <span className="text-blue-600">✓</span>
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        ) : (
          <button
            onClick={onCreateProject}
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            Create your first project
          </button>
        )}
      </div>
      {currentProject && (
        <button
          onClick={onCreateProject}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Plus className="w-3 h-3" />
          New Project
        </button>
      )}
    </div>
  );
}
