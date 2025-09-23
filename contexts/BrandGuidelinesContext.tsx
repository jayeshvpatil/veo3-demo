'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface BrandGuideline {
  id: string;
  name: string;
  file: File;
  uploadDate: Date;
  extractedGuidelines: {
    colors: string[];
    fonts: string[];
    tone: string;
    style: string;
    lighting: string;
    composition: string;
    rules: string[];
  };
}

interface BrandGuidelinesContextType {
  guidelines: BrandGuideline[];
  activeBrandGuideline: BrandGuideline | null;
  addGuideline: (guideline: BrandGuideline) => void;
  removeGuideline: (id: string) => void;
  setActiveBrandGuideline: (guideline: BrandGuideline | null) => void;
  getBrandPromptAdditions: () => string;
}

const BrandGuidelinesContext = createContext<BrandGuidelinesContextType | undefined>(undefined);

export function BrandGuidelinesProvider({ children }: { children: ReactNode }) {
  const [guidelines, setGuidelines] = useState<BrandGuideline[]>([]);
  const [activeBrandGuideline, setActiveBrandGuideline] = useState<BrandGuideline | null>(null);

  const addGuideline = (guideline: BrandGuideline) => {
    setGuidelines(prev => [...prev, guideline]);
    // Automatically set as active if it's the first one
    if (guidelines.length === 0) {
      setActiveBrandGuideline(guideline);
    }
  };

  const removeGuideline = (id: string) => {
    setGuidelines(prev => prev.filter(g => g.id !== id));
    if (activeBrandGuideline?.id === id) {
      setActiveBrandGuideline(null);
    }
  };

  const getBrandPromptAdditions = (): string => {
    if (!activeBrandGuideline) return '';

    const { extractedGuidelines } = activeBrandGuideline;
    
    return `
Brand Guidelines to follow:
- Colors: Use brand colors ${extractedGuidelines.colors.join(', ')}
- Typography: Prefer fonts like ${extractedGuidelines.fonts.join(', ')}
- Tone: ${extractedGuidelines.tone}
- Visual Style: ${extractedGuidelines.style}
- Lighting: ${extractedGuidelines.lighting}
- Composition: ${extractedGuidelines.composition}

STRICT BRAND RULES - MUST FOLLOW:
${extractedGuidelines.rules.map(rule => `- ${rule}`).join('\n')}

Ensure the generated content aligns with these brand guidelines while maintaining visual appeal and professional quality. Pay special attention to the strict brand rules listed above.
    `.trim();
  };

  const value: BrandGuidelinesContextType = {
    guidelines,
    activeBrandGuideline,
    addGuideline,
    removeGuideline,
    setActiveBrandGuideline,
    getBrandPromptAdditions,
  };

  return (
    <BrandGuidelinesContext.Provider value={value}>
      {children}
    </BrandGuidelinesContext.Provider>
  );
}

export function useBrandGuidelines() {
  const context = useContext(BrandGuidelinesContext);
  if (context === undefined) {
    throw new Error('useBrandGuidelines must be used within a BrandGuidelinesProvider');
  }
  return context;
}