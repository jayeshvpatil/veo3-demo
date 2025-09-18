import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  ChevronDown, 
  MoreVertical,
  Filter,
  Download,
  Share2
} from 'lucide-react';
import { Button } from './RadixButton';
import { Input } from './RadixInput';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './RadixDropdownMenu';
import { cn } from '@/lib/cn';

interface Project {
  id: string;
  name: string;
  lastModified: string;
  status: 'active' | 'draft' | 'completed';
}

interface ModernHeaderProps {
  currentProject?: Project;
  onNewProject: () => void;
  onProjectSelect: (project: Project) => void;
  onExport?: () => void;
  onShare?: () => void;
}

const ModernHeader: React.FC<ModernHeaderProps> = ({
  currentProject,
  onNewProject,
  onProjectSelect,
  onExport,
  onShare
}) => {
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const recentProjects: Project[] = [
    { id: '1', name: 'Summer Collection Video', lastModified: '2 hours ago', status: 'active' },
    { id: '2', name: 'Product Demo - Headphones', lastModified: '1 day ago', status: 'completed' },
    { id: '3', name: 'Brand Story Campaign', lastModified: '3 days ago', status: 'draft' },
  ];

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'draft': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left Section - Project Info */}
        <div className="flex items-center space-x-4">
          {/* Project Selector */}
          <DropdownMenu open={showProjectDropdown} onOpenChange={setShowProjectDropdown}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center space-x-2 min-w-[200px] justify-between"
              >
                <span className="font-medium text-gray-900 truncate">
                  {currentProject?.name || 'Select Project'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="start">
              {/* Search */}
              <div className="p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* New Project Button */}
              <DropdownMenuItem onClick={onNewProject} className="m-1">
                <Plus className="w-4 h-4 mr-3 text-blue-500" />
                <span className="font-medium text-blue-600">Create New Project</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Recent Projects */}
              <div className="px-3 py-2">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Recent Projects
                </h3>
                {recentProjects.map((project) => (
                  <DropdownMenuItem
                    key={project.id}
                    onClick={() => {
                      onProjectSelect(project);
                      setShowProjectDropdown(false);
                    }}
                    className="flex items-center space-x-3 p-2 mb-1"
                  >
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {project.name}
                      </p>
                      <p className="text-xs text-gray-500">{project.lastModified}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Project Status */}
          {currentProject && (
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(currentProject.status)}`} />
              <span className="text-sm text-gray-500 capitalize">{currentProject.status}</span>
            </div>
          )}
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search assets..."
              className="w-64 pl-10"
            />
          </div>

          {/* Filter */}
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>

          {/* Export */}
          {onExport && (
            <Button
              onClick={onExport}
              variant="primary"
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
          )}

          {/* Share */}
          {onShare && (
            <Button
              onClick={onShare}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
          )}

          {/* More Options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Settings</DropdownMenuItem>
              <DropdownMenuItem>Help & Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default ModernHeader;