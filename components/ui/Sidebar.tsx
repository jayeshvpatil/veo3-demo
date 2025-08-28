"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { ArrowRight, Filter, Star } from 'lucide-react';
import { useProduct } from '../../contexts/ProductContext';

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
}

interface Filters {
  gender: string[];
  availability: string[];
  age_group: string[];
  brand: string[];
  category: string[];
}

export default function Sidebar() {
  const { addProductToPrompt } = useProduct();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
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
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load products:', err);
        setLoading(false);
      });
  }, []);

  const filterOptions = useMemo(() => {
    return {
      gender: [...new Set(products.map(p => p.gender).filter(Boolean))],
      availability: [...new Set(products.map(p => p.availability).filter(Boolean))],
      age_group: [...new Set(products.map(p => p.age_group).filter(Boolean))],
      brand: [...new Set(products.map(p => p.brand).filter(Boolean))],
      category: [...new Set(products.map(p => p.category).filter(Boolean))],
    };
  }, [products]);

    const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Gender filter
      if (filters.gender.length > 0 && !filters.gender.includes(product.gender)) return false;
      
      // Availability filter
      if (filters.availability.length > 0 && !filters.availability.includes(product.availability)) return false;
      
      // Age group filter
      if (filters.age_group.length > 0 && !filters.age_group.includes(product.age_group)) return false;
      
      // Brand filter
      if (filters.brand.length > 0 && !filters.brand.includes(product.brand)) return false;
      
      // Category filter
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
    addProductToPrompt(product);
  };

  if (loading) {
    return (
      <aside className="w-80 bg-sidebar border-r border-sidebar-border h-screen flex flex-col">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-sidebar-foreground">Michael Kors Products</h2>
          <div className="mt-4 text-sidebar-foreground/60">Loading...</div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 bg-white border-r border-gray-200 h-screen flex flex-col shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">Michael Kors Products</h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="mt-2 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Filter size={16} />
          Filters ({filteredProducts.length})
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 space-y-3 max-h-64 overflow-y-auto">
          {/* Category Filter */}
          {filterOptions.category.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Category</h4>
              {filterOptions.category.map(category => (
                <label key={category} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.category.includes(category)}
                    onChange={() => toggleFilter('category', category)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-gray-700 capitalize">{category}</span>
                </label>
              ))}
            </div>
          )}

          {/* Gender Filter */}
          {filterOptions.gender.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Gender</h4>
              {filterOptions.gender.map(gender => (
                <label key={gender} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.gender.includes(gender)}
                    onChange={() => toggleFilter('gender', gender)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-gray-700 capitalize">{gender}</span>
                </label>
              ))}
            </div>
          )}

          {/* Availability Filter */}
          {filterOptions.availability.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Availability</h4>
              {filterOptions.availability.map(availability => (
                <label key={availability} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.availability.includes(availability)}
                    onChange={() => toggleFilter('availability', availability)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-gray-700 capitalize">{availability}</span>
                </label>
              ))}
            </div>
          )}

          {/* Brand Filter */}
          {filterOptions.brand.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Brand</h4>
              {filterOptions.brand.slice(0, 5).map(brand => (
                <label key={brand} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.brand.includes(brand)}
                    onChange={() => toggleFilter('brand', brand)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-gray-700">{brand}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Products List */}
      <div className="flex-1 overflow-y-auto">
        {filteredProducts.length === 0 ? (
          <div className="p-4 text-gray-500 text-sm">No products match your filters.</div>
        ) : (
          <ul className="space-y-3 p-4">
            {filteredProducts.map(product => (
              <li 
                key={product.id} 
                className={`relative group rounded-lg border transition-all duration-200 ${
                  selectedId === product.id 
                    ? 'bg-blue-50 border-blue-200 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="p-4 flex items-start gap-3">
                  <div className="relative">
                    <Image 
                      src={product.image} 
                      alt={product.title} 
                      width={64} 
                      height={64} 
                      className="rounded-lg object-cover border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.svg';
                      }}
                    />
                    {product.best_seller && (
                      <Star size={12} className="absolute -top-1 -right-1 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 leading-snug mb-2" style={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {product.title}
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {product.gender && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          {product.gender}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add to Video Button */}
                  <button
                    onClick={() => handleSelectForVideo(product)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex-shrink-0"
                    title="Add to video prompt"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
