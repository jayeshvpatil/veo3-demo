import React, { useState } from 'react';
import { Image, Package, Search, Filter, Grid3X3 } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  description: string;
  image: string;
  gender: string;
  availability: string;
  age_group: string;
  brand: string;
  best_seller: boolean;
  category: string;
}

interface SavedVisual {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  product?: boolean;
}

interface ImageSourceSelectionProps {
  products: Product[];
  savedVisuals: SavedVisual[];
  selectedProducts: Product[];
  onProductSelect: (products: Product[]) => void;
  onImageSelect: (imageUrl: string) => void;
}

const ImageSourceSelection: React.FC<ImageSourceSelectionProps> = ({
  products,
  savedVisuals,
  selectedProducts,
  onProductSelect,
  onImageSelect
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'visuals'>('products');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVisuals = savedVisuals.filter(visual =>
    visual.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProductToggle = (product: Product) => {
    const isSelected = selectedProducts.some(p => p.id === product.id);
    if (isSelected) {
      onProductSelect(selectedProducts.filter(p => p.id !== product.id));
    } else {
      onProductSelect([...selectedProducts, product]);
    }
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header with Tabs */}
      <div className="border-b border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Image Sources</h3>
        
        {/* Tab Navigation */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1 mb-4">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'products'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Package size={16} />
            Products
          </button>
          <button
            onClick={() => setActiveTab('visuals')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'visuals'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Image size={16} />
            Visual Library
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder={activeTab === 'products' ? 'Search products...' : 'Search visuals...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'products' ? (
          <div className="space-y-3">
            {filteredProducts.map((product) => {
              const isSelected = selectedProducts.some(p => p.id === product.id);
              return (
                <div
                  key={product.id}
                  onClick={() => handleProductToggle(product)}
                  className={`group relative rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 bg-white'
                  }`}
                >
                  <div className="p-3">
                    <div className="flex gap-3">
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23f3f4f6"/><text x="32" y="36" text-anchor="middle" fill="%236b7280" font-size="12">No Image</text></svg>';
                          }}
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                          {product.title}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-semibold text-purple-600">
                            {product.brand}
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {product.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Use as Base Image Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onImageSelect(product.image);
                      }}
                      className="w-full mt-3 py-2 px-3 bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-700 rounded-lg text-xs font-medium transition-all duration-200"
                    >
                      Use as base image
                    </button>
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No products found</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredVisuals.map((visual) => (
              <div
                key={visual.id}
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
              >
                {/* Visual Image */}
                <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                  <img
                    src={visual.url}
                    alt="Visual"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-full h-full flex items-center justify-center text-gray-400">
                            <div class="text-center">
                              <div class="text-2xl mb-1">🖼️</div>
                              <div class="text-xs">Image unavailable</div>
                            </div>
                          </div>
                        `;
                      }
                    }}
                  />
                </div>

                {/* Visual Info */}
                <div className="p-3">
                  <p className="text-xs text-gray-700 line-clamp-2 mb-3">
                    {visual.prompt}
                  </p>
                  
                  <button
                    onClick={() => onImageSelect(visual.url)}
                    className="w-full py-2 px-3 bg-purple-100 hover:bg-purple-600 text-purple-700 hover:text-white rounded-lg text-xs font-medium transition-all duration-200"
                  >
                    Use as base image
                  </button>
                </div>
              </div>
            ))}

            {filteredVisuals.length === 0 && (
              <div className="text-center py-8">
                <Image className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No visuals found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export { ImageSourceSelection };