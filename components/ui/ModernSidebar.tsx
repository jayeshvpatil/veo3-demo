import React, { useState } from 'react';
import { 
  Home, 
  Zap, 
  Palette, 
  Database, 
  Settings, 
  User,
  Play,
  Grid3X3,
  FolderOpen,
  Share2,
  ChevronLeft,
  ChevronRight,
  Film
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './RadixAvatar';
import { Button } from './RadixButton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './RadixTooltip';
import { cn } from '@/lib/cn';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: string;
}

interface ModernSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userAvatar?: string;
}

const ModernSidebar: React.FC<ModernSidebarProps> = ({
  activeSection,
  onSectionChange,
  userAvatar
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigationItems: NavigationItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'campaigns', label: 'Campaigns', icon: Zap },
    { id: 'creatives', label: 'Creatives', icon: Palette },
    { id: 'storyboard', label: 'Storyboard', icon: Film },
    { id: 'product-feeds', label: 'Product Feeds', icon: Database },
    { id: 'templates', label: 'Templates', icon: Grid3X3 },
    { id: 'assets', label: 'Assets', icon: FolderOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <TooltipProvider>
      <div 
        className={`bg-gray-900 text-white h-screen flex flex-col border-r border-gray-800 transition-all duration-300 ease-in-out relative ${
          isExpanded ? 'w-64' : 'w-16'
        }`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -right-3 top-6 z-10 w-6 h-6 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-700 transition-all duration-200"
        >
          {isExpanded ? (
            <ChevronLeft size={12} className="text-gray-300" />
          ) : (
            <ChevronRight size={12} className="text-gray-300" />
          )}
        </button>

        {/* Brand Header */}
        <div className={`p-4 border-b border-gray-800 transition-all duration-300 ${isExpanded ? 'px-6' : 'px-4'}`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
              <Play className="w-5 h-5 text-white" />
            </div>
            {isExpanded && (
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent transition-all duration-300">
                CreativeGen
              </h1>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <li key={item.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="default"
                        onClick={() => onSectionChange(item.id)}
                        className={cn(
                          "w-full transition-all duration-200 relative",
                          isExpanded 
                            ? "justify-start space-x-3 h-12 px-4" 
                            : "justify-center h-12 px-0",
                          isActive
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        )}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {isExpanded && (
                          <>
                            <span className="font-medium transition-all duration-300">{item.label}</span>
                            {item.badge && (
                              <span className="ml-auto bg-blue-500 text-xs px-2 py-1 rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className={isExpanded ? "hidden" : ""}>
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-800">
          <div className={`flex items-center rounded-lg hover:bg-gray-800 transition-all duration-200 cursor-pointer ${
            isExpanded ? 'space-x-3 p-3' : 'justify-center p-2'
          }`}>
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src={userAvatar} alt="User Avatar" />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            {isExpanded && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Creative User</p>
                  <p className="text-xs text-gray-400">Pro Plan</p>
                </div>
                <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:text-white">
                  <Share2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ModernSidebar;