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
}

interface ProductContextType {
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  addProductToPrompt: (product: Product) => void;
  productPromptText: string;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productPromptText, setProductPromptText] = useState('');

  const addProductToPrompt = (product: Product) => {
    const promptText = `Create a video featuring the ${product.title}. ${product.description}`;
    setProductPromptText(promptText);
    setSelectedProduct(product);
    
    // Fetch the product image and convert to file
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
        
        // Dispatch custom event to update the main app's prompt
        window.dispatchEvent(new CustomEvent('updateVideoPrompt', { 
          detail: { 
            prompt: promptText,
            product: product,
            description: product.description,
            imageFile: file
          } 
        }));
      })
      .catch(error => {
        console.error('Failed to fetch product image:', error);
        // Still send the prompt without image
        window.dispatchEvent(new CustomEvent('updateVideoPrompt', { 
          detail: { 
            prompt: promptText,
            product: product,
            description: product.description
          } 
        }));
      });
  };

  return (
    <ProductContext.Provider value={{
      selectedProduct,
      setSelectedProduct,
      addProductToPrompt,
      productPromptText,
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
