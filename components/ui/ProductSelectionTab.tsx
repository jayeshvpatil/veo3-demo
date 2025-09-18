"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Filter, Star, Grid3X3, List, Sparkles, MessageCircle, ChevronRight, ChevronLeft, Package, Tag, Users, Shirt } from 'lucide-react';
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
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
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
      {/* Collapsible Filters Sidebar */}
      <div 
        className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out relative ${
          sidebarExpanded ? 'w-80' : 'w-16'
        }`}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className="absolute -right-3 top-6 z-10 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200"
        >
          {sidebarExpanded ? (
            <ChevronLeft size={12} className="text-gray-600" />
          ) : (
            <ChevronRight size={12} className="text-gray-600" />
          )}
        </button>

        <div className="h-full overflow-hidden">
          {/* Collapsed State - Icons Only */}
          {!sidebarExpanded && (
            <div className="p-4 space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Filter size={16} className="text-purple-600" />
                </div>
                <div className="text-xs text-gray-500 text-center">Filters</div>
              </div>
              
              <div className="space-y-4">
                {filterOptions.category.length > 0 && (
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package size={16} className="text-blue-600" />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Categories</div>
                  </div>
                )}
                
                {filterOptions.gender.length > 0 && (
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users size={16} className="text-green-600" />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Gender</div>
                  </div>
                )}
                
                {filterOptions.brand.length > 0 && (
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Tag size={16} className="text-orange-600" />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Brands</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Expanded State - Full Filters */}
          {sidebarExpanded && (
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Filter size={20} className="text-purple-600" />
                  Filters
                </h3>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                >
                  Clear All
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Category Filter */}
                {filterOptions.category.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Package size={16} className="text-blue-600" />
                      Category
                    </h4>
                    <div className="space-y-2">
                      {filterOptions.category.map(category => (
                        <label key={category} className="flex items-center gap-3 text-sm cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.category.includes(category)}
                            onChange={() => toggleFilter('category', category)}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2"
                          />
                          <span className="text-gray-700 capitalize group-hover:text-gray-900 transition-colors">
                            {category}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gender Filter */}
                {filterOptions.gender.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Users size={16} className="text-green-600" />
                      Gender
                    </h4>
                    <div className="space-y-2">
                      {filterOptions.gender.map(gender => (
                        <label key={gender} className="flex items-center gap-3 text-sm cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.gender.includes(gender)}
                            onChange={() => toggleFilter('gender', gender)}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2"
                          />
                          <span className="text-gray-700 capitalize group-hover:text-gray-900 transition-colors">
                            {gender}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Availability Filter */}
                {filterOptions.availability.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Shirt size={16} className="text-emerald-600" />
                      Availability
                    </h4>
                    <div className="space-y-2">
                      {filterOptions.availability.map(availability => (
                        <label key={availability} className="flex items-center gap-3 text-sm cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.availability.includes(availability)}
                            onChange={() => toggleFilter('availability', availability)}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2"
                          />
                          <span className="text-gray-700 capitalize group-hover:text-gray-900 transition-colors">
                            {availability}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brand Filter */}
                {filterOptions.brand.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Tag size={16} className="text-orange-600" />
                      Brand
                    </h4>
                    <div className="space-y-2">
                      {filterOptions.brand.slice(0, 8).map(brand => (
                        <label key={brand} className="flex items-center gap-3 text-sm cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.brand.includes(brand)}
                            onChange={() => toggleFilter('brand', brand)}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2"
                          />
                          <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                            {brand}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Product Area */}
      <div className="flex-1 bg-gray-50/30">
        {/* Top Controls */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 p-6 z-10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                Michael Kors Products
                <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {filteredProducts.length} of {products.length}
                </span>
              </h2>
              <p className="text-gray-600 mt-2">Select a product to create stunning visuals</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    viewMode === 'grid' 
                      ? 'bg-purple-100 text-purple-700 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Grid3X3 size={16} />
                  <span className="text-sm font-medium">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    viewMode === 'list' 
                      ? 'bg-purple-100 text-purple-700 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <List size={16} />
                  <span className="text-sm font-medium">List</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="w-24 h-24 mb-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl flex items-center justify-center transform rotate-3">
                <div className="text-4xl">📦</div>
              </div>
              <div className="text-xl mb-2 font-medium text-gray-700">No products found</div>
              <div className="text-sm text-gray-600 mb-6">Try adjusting your filters in the sidebar</div>
              {(filters.gender.length > 0 || filters.category.length > 0 || filters.availability.length > 0 || filters.brand.length > 0) && (
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-sm font-medium"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6' 
                : 'space-y-4'
            }>
              {filteredProducts.map(product => (
                <div 
                  key={product.id} 
                  className={`group relative bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-purple-100/50 hover:border-purple-200 ${
                    selectedId === product.id 
                      ? 'ring-2 ring-purple-500 shadow-xl shadow-purple-100/50 bg-purple-50/30' 
                      : ''
                  } ${viewMode === 'list' ? 'flex' : ''}`}
                >
                  {/* Product Image */}
                  <div className={`relative ${viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'aspect-[4/3]'}`}>
                    <Image 
                      src={product.image} 
                      alt={product.title} 
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.svg';
                      }}
                    />
                    
                    {/* Best Seller Badge */}
                    {product.best_seller && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                        <Star size={12} className="fill-current" />
                        Best Seller
                      </div>
                    )}
                    
                    {/* Selection Overlay */}
                    {selectedId === product.id && (
                      <div className="absolute inset-0 bg-purple-600/20 flex items-center justify-center backdrop-blur-sm">
                        <div className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg">
                          ✓ Selected
                        </div>
                      </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-black/0 group-hover:from-black/10 transition-all duration-300" />
                  </div>
                  
                  {/* Product Info */}
                  <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <h3 className="font-semibold text-gray-900 text-base mb-3 line-clamp-2 leading-tight group-hover:text-purple-700 transition-colors">
                      {product.title}
                    </h3>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {product.category && (
                        <span className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium border border-blue-100">
                          {product.category}
                        </span>
                      )}
                      {product.gender && (
                        <span className="text-xs px-3 py-1 bg-green-50 text-green-700 rounded-full font-medium border border-green-100">
                          {product.gender}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={() => handleSelectForVideo(product)}
                        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                          selectedId === product.id
                            ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-200'
                            : 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 hover:from-purple-600 hover:to-purple-700 hover:text-white hover:shadow-lg hover:shadow-purple-200'
                        }`}
                      >
                        <Sparkles size={16} />
                        {selectedId === product.id ? 'Creating Visual...' : 'Create Visual'}
                      </button>
                      
                      <button
                        onClick={() => handleChatWithAgent(product)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium transition-all duration-200 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm"
                      >
                        <MessageCircle size={14} />
                        AI Chat
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
