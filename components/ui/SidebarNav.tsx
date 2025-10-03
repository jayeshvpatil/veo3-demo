"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as Separator from '@radix-ui/react-separator';
import * as Tooltip from '@radix-ui/react-tooltip';
import { 
  ShoppingCart, 
  Sparkles, 
  ImageIcon,
  Menu,
  X,
  Home,
  Settings,
  FileText,
  LogOut,
  User,
  Folder,
  Eye
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
    value: "home",
    label: "Home Dashboard",
    icon: Home,
    shortLabel: "Home"
  },
  {
    value: "projects",
    label: "Projects",
    icon: Folder,
    shortLabel: "Projects"
  },
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
    value: "create",
    label: "Create Content", 
    icon: Sparkles,
    shortLabel: "Create"
  },
  {
    value: "library",
    label: "Visual Library",
    icon: ImageIcon,
    shortLabel: "Library"
  },
  {
    value: "collections",
    label: "Collections",
    icon: Eye,
    shortLabel: "Collections"
  }
];export function SidebarNav({ activeTab, setActiveTab, isOpen, setIsOpen, isCollapsed, setIsCollapsed }: SidebarNavProps) {
  const { data: session } = useSession();
  const [isHovered, setIsHovered] = React.useState(false);
  
  // Determine if sidebar should show expanded content
  const showExpanded = !isCollapsed || isHovered || isOpen;

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };
  
  return (
    <Tooltip.Provider delayDuration={300}>
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
                <h2 className="text-lg font-semibold text-white whitespace-nowrap">Creative Studio</h2>
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
              {/* Main Navigation Items */}
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.value;
                
                const buttonContent = (
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
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {showExpanded && <span className="whitespace-nowrap">{item.shortLabel}</span>}
                  </button>
                );
                
                return (
                  <NavigationMenu.Item key={item.value}>
                    {!showExpanded ? (
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          {buttonContent}
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content
                            side="right"
                            sideOffset={5}
                            className="px-3 py-2 bg-slate-800 text-white text-sm rounded-md shadow-lg z-50"
                          >
                            {item.shortLabel}
                            <Tooltip.Arrow className="fill-slate-800" />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    ) : (
                      buttonContent
                    )}
                  </NavigationMenu.Item>
                );
              })}

              {showExpanded && <Separator.Root className="my-4 h-px bg-slate-800" />}

              {/* Settings */}
              <NavigationMenu.Item>
                {!showExpanded ? (
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <button
                        className="w-full flex items-center gap-3 px-3 py-3 text-left rounded-lg transition-all duration-200 text-slate-300 hover:bg-slate-800 hover:text-white justify-center"
                      >
                        <Settings className="h-5 w-5 flex-shrink-0" />
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        side="right"
                        sideOffset={5}
                        className="px-3 py-2 bg-slate-800 text-white text-sm rounded-md shadow-lg z-50"
                      >
                        Settings
                        <Tooltip.Arrow className="fill-slate-800" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                ) : (
                  <button className="w-full flex items-center gap-3 px-3 py-3 text-left rounded-lg transition-all duration-200 text-slate-300 hover:bg-slate-800 hover:text-white">
                    <Settings className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium whitespace-nowrap">Settings</span>
                  </button>
                )}
              </NavigationMenu.Item>

              {/* Logout */}
              <NavigationMenu.Item>
                {!showExpanded ? (
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-3 py-3 text-left rounded-lg transition-all duration-200 text-red-400 hover:bg-red-900/20 hover:text-red-300 justify-center"
                      >
                        <LogOut className="h-5 w-5 flex-shrink-0" />
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        side="right"
                        sideOffset={5}
                        className="px-3 py-2 bg-slate-800 text-white text-sm rounded-md shadow-lg z-50"
                      >
                        Sign Out
                        <Tooltip.Arrow className="fill-slate-800" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                ) : (
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-3 text-left rounded-lg transition-all duration-200 text-red-400 hover:bg-red-900/20 hover:text-red-300"
                  >
                    <LogOut className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium whitespace-nowrap">Sign Out</span>
                  </button>
                )}
              </NavigationMenu.Item>
            </NavigationMenu.List>
          </NavigationMenu.Root>
        </div>

        {/* Footer */}
        {showExpanded && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
            {session?.user && (
              <div className="mb-3 flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  {session.user.image ? (
                    <img 
                      src={session.user.image} 
                      alt="Profile" 
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <User className="h-3 w-3 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">
                    {session.user.name || session.user.email}
                  </p>
                  {session.user.name && session.user.email && (
                    <p className="text-xs text-slate-400 truncate">
                      {session.user.email}
                    </p>
                  )}
                </div>
              </div>
            )}
            <div className="text-center text-sm text-slate-400">
              Further AI Demo
            </div>
          </div>
        )}
      </div>
    </Tooltip.Provider>
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