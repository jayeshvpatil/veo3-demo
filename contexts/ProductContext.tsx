"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Product {
  id: string;
  image: string;
  title: string;
  description: string;
  gender: string;
  availability: string;
  age_group: string;
  brand: string;
  best_seller: boolean;
  category?: string;
  generatedVisual?: {
    data: string;
    mimeType: string;
  };
}

interface ProductContextType {
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  addProductToPrompt: (product: Product) => void;
  productPromptText: string;
  saveVisualToLibrary: (visual: {
    id: string;
    url: string;
    prompt: string;
    product?: Product;
    timestamp: number;
  }) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productPromptText, setProductPromptText] = useState('');

  const addProductToPrompt = (product: Product) => {
    // Enhanced prompt that preserves exact product integrity for video generation
    const promptText = `Create a stunning video advertisement featuring the ${product.title}.

🔒 CRITICAL PRODUCT INTEGRITY FOR VIDEO:
- The product MUST remain 100% identical to the source image throughout the video
- Preserve ALL colors, patterns, textures, logos, text, and branding exactly as shown
- Do NOT modify, alter, or change ANY aspect of the actual product
- Maintain the product's exact shape, proportions, and visual characteristics
- Keep all product details identical to the reference image

📋 EXACT PRODUCT DETAILS TO PRESERVE:
${product.description}

🎬 VIDEO CREATIVE VISION:
- Show the product in dynamic, engaging scenes
- Use professional cinematography and smooth camera movements  
- Create compelling visual storytelling around the product
- Add atmospheric lighting and premium environments
- Focus on the product's benefits and appeal
- Generate marketing-ready video content

✅ GOAL: Create a professional video advertisement that showcases the EXACT same product from the reference image while adding dynamic motion, storytelling, and cinematic appeal.`;
    
    setProductPromptText(promptText);
    setSelectedProduct(product);
    
    // If we have a generated visual, use it directly
    if (product.generatedVisual) {
      try {
        // Convert base64 to File object for the generated visual
        const byteCharacters = atob(product.generatedVisual.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const visualFile = new File([byteArray], `${product.id}-visual.${product.generatedVisual.mimeType.split('/')[1]}`, { 
          type: product.generatedVisual.mimeType 
        });
        
        // Dispatch custom event with generated visual
        window.dispatchEvent(new CustomEvent('updateVideoPrompt', { 
          detail: { 
            prompt: promptText,
            product: product,
            description: product.description,
            imageFile: visualFile,
            navigateToTab: 'prompt' // Navigate to prompt management tab
          } 
        }));
        return;
      } catch (error) {
        console.error('Failed to process generated visual:', error);
      }
    }
    
    // Fallback: Fetch the original product image and convert to file
    fetch(product.image, { 
      mode: 'cors',
      credentials: 'omit'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        const file = new File([blob], `${product.id}.jpg`, { type: blob.type || 'image/jpeg' });
        
        // Dispatch custom event to update the main app's prompt and navigate to prompt management
        window.dispatchEvent(new CustomEvent('updateVideoPrompt', { 
          detail: { 
            prompt: promptText,
            product: product,
            description: product.description,
            imageFile: file,
            navigateToTab: 'prompt' // Navigate to prompt management tab
          } 
        }));
      })
      .catch(error => {
        console.error('Failed to fetch product image:', error);
        // Still send the prompt without image but navigate to prompts
        window.dispatchEvent(new CustomEvent('updateVideoPrompt', { 
          detail: { 
            prompt: promptText,
            product: product,
            description: product.description,
            navigateToTab: 'prompt' // Navigate to prompt management tab
          } 
        }));
      });
  };

  const saveVisualToLibrary = (visual: {
    id: string;
    url: string;
    prompt: string;
    product?: Product;
    timestamp: number;
  }) => {
    // Dispatch event to save visual to library
    window.dispatchEvent(new CustomEvent('saveVisual', { detail: visual }));
  };

  return (
    <ProductContext.Provider value={{
      selectedProduct,
      setSelectedProduct,
      addProductToPrompt,
      productPromptText,
      saveVisualToLibrary,
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProduct() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
}
