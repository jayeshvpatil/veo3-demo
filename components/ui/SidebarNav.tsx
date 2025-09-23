"use client";

import React from "react";
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as Separator from '@radix-ui/react-separator';
import { 
  ShoppingCart, 
  Video, 
  PlayCircle, 
  ImageIcon,
  Menu,
  X,
  Home,
  Settings,
  FileText
} from "lucide-react";

interface SidebarNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const navigationItems = [
  {
    value: "products",
    label: "Product & Visual Selection",
    icon: ShoppingCart,
    shortLabel: "Assets"
  },
  {
    value: "brand-guidelines",
    label: "Brand Guidelines Management",
    icon: FileText,
    shortLabel: "Brand Guidelines"
  },
  {
    value: "prompt",
    label: "Video Creation Studio", 
    icon: Video,
    shortLabel: "Video"
  },
  {
    value: "review",
    label: "Generated Videos & Review",
    icon: PlayCircle,
    shortLabel: "Video Review"
  },
  {
    value: "library",
    label: "Visual Library",
    icon: ImageIcon,
    shortLabel: "Library"
  }
];export function SidebarNav({ activeTab, setActiveTab, isOpen, setIsOpen, isCollapsed, setIsCollapsed }: SidebarNavProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  
  // Determine if sidebar should show expanded content
  const showExpanded = !isCollapsed || isHovered || isOpen;
  
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed top-0 left-0 h-full bg-slate-900 border-r border-slate-800 z-50 transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
          ${showExpanded ? 'w-64' : 'w-16'}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Home className="h-5 w-5 text-white" />
              </div>
              {showExpanded && (
                <h2 className="text-lg font-semibold text-white whitespace-nowrap">Further X MK AI Demo</h2>
              )}
            </div>
            {showExpanded && (
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 lg:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className={`${showExpanded ? 'p-4' : 'p-2'} flex-1 flex flex-col`}>
          <NavigationMenu.Root orientation="vertical" className="flex-1">
            <NavigationMenu.List className={`space-y-2 ${!showExpanded ? 'flex flex-col justify-center h-full' : ''}`}>
              {/* Home Item */}
              <NavigationMenu.Item>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-3 text-left rounded-lg transition-all duration-200 text-slate-300 hover:bg-slate-800 hover:text-white ${!showExpanded ? 'justify-center' : ''}`}
                  title={!showExpanded ? "Home" : undefined}
                >
                  <Home className="h-5 w-5 flex-shrink-0" />
                  {showExpanded && <span className="font-medium whitespace-nowrap">Home</span>}
                </button>
              </NavigationMenu.Item>

              {showExpanded && <Separator.Root className="my-4 h-px bg-slate-800" />}

              {/* Main Navigation Items */}
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.value;
                
                return (
                  <NavigationMenu.Item key={item.value}>
                    <button
                      onClick={() => {
                        setActiveTab(item.value);
                        setIsOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-3 px-3 py-3 text-left rounded-lg transition-all duration-200 font-medium
                        ${!showExpanded ? 'justify-center' : ''}
                        ${isActive 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }
                      `}
                      title={!showExpanded ? item.shortLabel : undefined}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {showExpanded && <span className="whitespace-nowrap">{item.shortLabel}</span>}
                    </button>
                  </NavigationMenu.Item>
                );
              })}

              {showExpanded && <Separator.Root className="my-4 h-px bg-slate-800" />}

              {/* Settings */}
              <NavigationMenu.Item>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-3 text-left rounded-lg transition-all duration-200 text-slate-300 hover:bg-slate-800 hover:text-white ${!showExpanded ? 'justify-center' : ''}`}
                  title={!showExpanded ? "Settings" : undefined}
                >
                  <Settings className="h-5 w-5 flex-shrink-0" />
                  {showExpanded && <span className="font-medium whitespace-nowrap">Settings</span>}
                </button>
              </NavigationMenu.Item>
            </NavigationMenu.List>
          </NavigationMenu.Root>
        </div>

        {/* Footer */}
        {showExpanded && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
            <div className="text-center text-sm text-slate-400">
              Further AI Demo
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Mobile menu button component
interface MobileMenuButtonProps {
  onClick: () => void;
}

export function MobileMenuButton({ onClick }: MobileMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 lg:hidden"
    >
      <Menu className="h-6 w-6" />
    </button>
  );
}