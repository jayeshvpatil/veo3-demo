"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Filter, Star, Grid3X3, List, Sparkles, MessageCircle } from 'lucide-react';
import { useProduct } from '../../contexts/ProductContext';
import { VisualGeneration } from './VisualGeneration';
import { AgenticVisualChat } from './AgenticVisualChat';

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
  category: string;
  generatedVisual?: {
    data: string;
    mimeType: string;
  };
}

interface Filters {
  gender: string[];
  availability: string[];
  age_group: string[];
  brand: string[];
  category: string[];
}

interface ProductSelectionTabProps {
  className?: string;
}

export default function ProductSelectionTab({ className = "" }: ProductSelectionTabProps) {
  const { addProductToPrompt } = useProduct();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showVisualGeneration, setShowVisualGeneration] = useState(false);
  const [showAgenticChat, setShowAgenticChat] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [filters, setFilters] = useState<Filters>({
    gender: [],
    availability: [],
    age_group: [],
    brand: [],
    category: [],
  });

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        // Ensure data is an array
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load products:', err);
        setProducts([]); // Set empty array on error
        setLoading(false);
      });
  }, []);

  const filterOptions = useMemo(() => {
    // Ensure products is always an array before mapping
    const safeProducts = Array.isArray(products) ? products : [];
    return {
      gender: [...new Set(safeProducts.map(p => p.gender).filter(Boolean))],
      availability: [...new Set(safeProducts.map(p => p.availability).filter(Boolean))],
      age_group: [...new Set(safeProducts.map(p => p.age_group).filter(Boolean))],
      brand: [...new Set(safeProducts.map(p => p.brand).filter(Boolean))],
      category: [...new Set(safeProducts.map(p => p.category).filter(Boolean))],
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    // Ensure products is always an array before filtering
    const safeProducts = Array.isArray(products) ? products : [];
    return safeProducts.filter(product => {
      if (filters.gender.length > 0 && !filters.gender.includes(product.gender)) return false;
      if (filters.availability.length > 0 && !filters.availability.includes(product.availability)) return false;
      if (filters.age_group.length > 0 && !filters.age_group.includes(product.age_group)) return false;
      if (filters.brand.length > 0 && !filters.brand.includes(product.brand)) return false;
      if (filters.category.length > 0 && !filters.category.includes(product.category)) return false;
      return true;
    });
  }, [products, filters]);

  const toggleFilter = (filterType: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }));
  };

  const handleSelectForVideo = (product: Product) => {
    setSelectedId(product.id);
    setSelectedProduct(product);
    setShowVisualGeneration(true);
  };

  const handleVisualSelected = (imageData: string, mimeType: string) => {
    if (selectedProduct) {
      // Create product with generated visual
      const productWithVisual = {
        ...selectedProduct,
        generatedVisual: { data: imageData, mimeType }
      };
      
      // Add the product with the generated visual to context
      addProductToPrompt(productWithVisual);
      
      // Create a File object from the generated visual for the video workflow
      const byteCharacters = atob(imageData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const visualFile = new File([byteArray], `${selectedProduct.id}-visual.${mimeType.split('/')[1]}`, { type: mimeType });
      
      // Dispatch additional event with the visual file for immediate use
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('updateVideoPrompt', { 
          detail: { 
            imageFile: visualFile,
            navigateToTab: 'prompt'
          } 
        }));
      }, 100);
    }
    setShowVisualGeneration(false);
  };

  const handleBackToProducts = () => {
    setShowVisualGeneration(false);
    setShowAgenticChat(false);
    setSelectedProduct(null);
  };

  const handleChatWithAgent = (product: Product) => {
    setSelectedId(product.id);
    setSelectedProduct(product);
    setShowAgenticChat(true);
  };

  const clearAllFilters = () => {
    setFilters({
      gender: [],
      availability: [],
      age_group: [],
      brand: [],
      category: [],
    });
  };

  if (loading) {
    return (
      <div className={`h-full flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-4">📦</div>
          <div className="text-lg text-gray-600">Loading products...</div>
        </div>
      </div>
    );
  }

  // Show visual generation step
  if (showVisualGeneration && selectedProduct) {
    return (
      <div className="h-full overflow-y-auto">
        <VisualGeneration
          productName={selectedProduct.title}
          productDescription={selectedProduct.description}
          productImage={selectedProduct.image}
          onVisualSelected={handleVisualSelected}
          onBack={handleBackToProducts}
        />
      </div>
    );
  }

  // Show agentic chat interface
  if (showAgenticChat && selectedProduct) {
    return (
      <div className="h-full overflow-hidden">
        <AgenticVisualChat
          productName={selectedProduct.title}
          productDescription={selectedProduct.description}
          productImage={selectedProduct.image}
          onVisualSelected={handleVisualSelected}
          onBack={handleBackToProducts}
        />
      </div>
    );
  }

  return (
    <div className={`h-full flex ${className}`}>
      {/* Filters Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        showFilters ? 'w-80' : 'w-0 overflow-hidden'
      }`}>
        <div className="p-6 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <button
              onClick={clearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear All
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Category Filter */}
            {filterOptions.category.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Category</h4>
                <div className="space-y-2">
                  {filterOptions.category.map(category => (
                    <label key={category} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.category.includes(category)}
                        onChange={() => toggleFilter('category', category)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 capitalize">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Gender Filter */}
            {filterOptions.gender.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Gender</h4>
                <div className="space-y-2">
                  {filterOptions.gender.map(gender => (
                    <label key={gender} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.gender.includes(gender)}
                        onChange={() => toggleFilter('gender', gender)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 capitalize">{gender}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Availability Filter */}
            {filterOptions.availability.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Availability</h4>
                <div className="space-y-2">
                  {filterOptions.availability.map(availability => (
                    <label key={availability} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.availability.includes(availability)}
                        onChange={() => toggleFilter('availability', availability)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 capitalize">{availability}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Brand Filter */}
            {filterOptions.brand.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Brand</h4>
                <div className="space-y-2">
                  {filterOptions.brand.slice(0, 8).map(brand => (
                    <label key={brand} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.brand.includes(brand)}
                        onChange={() => toggleFilter('brand', brand)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Product Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Michael Kors Products</h2>
              <p className="text-gray-600 mt-1">
                {filteredProducts.length} of {products.length} products
                {selectedId && " • 1 selected for video generation"}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  showFilters 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter size={16} />
                Filters
              </button>
              
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="text-6xl mb-4">📦</div>
              <div className="text-xl mb-2">No products found</div>
              <div className="text-sm">Try adjusting your filters</div>
              {(filters.gender.length > 0 || filters.category.length > 0 || filters.availability.length > 0 || filters.brand.length > 0) && (
                <button
                  onClick={clearAllFilters}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                : 'space-y-4'
            }>
              {filteredProducts.map(product => (
                <div 
                  key={product.id} 
                  className={`relative group border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg ${
                    selectedId === product.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:border-gray-300'
                  } ${viewMode === 'list' ? 'flex' : ''}`}
                >
                  <div className={`relative ${viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'aspect-square'}`}>
                    <Image 
                      src={product.image} 
                      alt={product.title} 
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.svg';
                      }}
                    />
                    {product.best_seller && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Star size={12} className="fill-current" />
                        Best Seller
                      </div>
                    )}
                    {selectedId === product.id && (
                      <div className="absolute inset-0 bg-blue-600 bg-opacity-20 flex items-center justify-center">
                        <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Selected
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {product.title}
                    </h3>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.gender && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          {product.gender}
                        </span>
                      )}
                      {product.category && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                          {product.category}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => handleSelectForVideo(product)}
                        className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${
                          selectedId === product.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-purple-600 hover:text-white'
                        }`}
                      >
                        <Sparkles size={16} />
                        {selectedId === product.id ? 'Generating Visuals...' : 'Create Stunning Visuals'}
                      </button>
                      
                      <button
                        onClick={() => handleChatWithAgent(product)}
                        className="w-full flex items-center justify-center gap-2 py-1.5 px-4 rounded-lg font-medium transition-colors bg-white border border-purple-200 text-purple-600 hover:bg-purple-50"
                      >
                        <MessageCircle size={14} />
                        Chat with AI Agent
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
