"use client";
import React, { useState, useEffect, ReactNode } from 'react';

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

interface VisualLibraryWrapperProps {
  children: ReactNode;
  onVisualsUpdate: (visuals: SavedVisual[]) => void;
}

export function VisualLibraryWrapper({ children, onVisualsUpdate }: VisualLibraryWrapperProps) {
  const [, setSavedVisuals] = useState<SavedVisual[]>([]);

  useEffect(() => {
    // Listen for saveVisual events
    const handleSaveVisual = (event: CustomEvent) => {
      const visual = event.detail as SavedVisual;
      setSavedVisuals(prev => {
        const updated = [...prev, visual];
        onVisualsUpdate(updated);
        return updated;
      });
    };

    // Listen for deleteVisual events
    const handleDeleteVisual = (event: CustomEvent) => {
      const visualId = event.detail.id;
      setSavedVisuals(prev => {
        const updated = prev.filter(v => v.id !== visualId);
        onVisualsUpdate(updated);
        return updated;
      });
    };

    window.addEventListener('saveVisual', handleSaveVisual as EventListener);
    window.addEventListener('deleteVisual', handleDeleteVisual as EventListener);

    return () => {
      window.removeEventListener('saveVisual', handleSaveVisual as EventListener);
      window.removeEventListener('deleteVisual', handleDeleteVisual as EventListener);
    };
  }, [onVisualsUpdate]);

  return <>{children}</>;
}
