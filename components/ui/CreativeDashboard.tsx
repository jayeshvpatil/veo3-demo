import React, { useState, useEffect } from 'react';
import ModernSidebar from './ModernSidebar';
import ModernHeader from './ModernHeader';
import ProjectTemplates from './ProjectTemplates';
import ExportHub from './ExportHub';

// Import existing components
import ProductSelectionTab from './ProductSelectionTab';
import PromptManagementTab from './PromptManagementTab';
import ReviewTab from './ReviewTab';
import VisualsLibraryTab from './VisualsLibraryTab';
import StoryboardTab from './StoryboardTab';
import Composer from './Composer';
import VideoPlayer from './VideoPlayer';
import { ImageSourceSelection } from './ImageSourceSelection';
import { ImagePreview } from './ImagePreview';
import { ImageComposer } from './ImageComposer';

interface Project {
  id: string;
  name: string;
  lastModified: string;
  status: 'active' | 'draft' | 'completed';
}

interface CreativeDashboardProps {
  // Existing props from VeoStudio
  prompt: string;
  setPrompt: (prompt: string) => void;
  negativePrompt: string;
  setNegativePrompt: (prompt: string) => void;
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  savedVisuals: Array<{
    id: string;
    url: string;
    prompt: string;
    product?: {
      id: string;
      title: string;
      description: string;
    };
    timestamp: number;
  }>;
  setSavedVisuals: (visuals: any) => void;
  visualStyle: string;
  setVisualStyle: (style: string) => void;
  cameraAngle: string;
  setCameraAngle: (angle: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  videoUrl: string;
  isGenerating: boolean;
  onOutputChanged: (output: any) => void;
  onDownload: () => void;
  onResetTrim: () => void;
  buildCompletePrompt: () => string;
  imageInputRef: React.RefObject<HTMLInputElement>;
  onPickImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const CreativeDashboard: React.FC<CreativeDashboardProps> = ({
  prompt,
  setPrompt,
  negativePrompt,
  setNegativePrompt,
  aspectRatio,
  setAspectRatio,
  selectedModel,
  setSelectedModel,
  savedVisuals,
  setSavedVisuals,
  visualStyle,
  setVisualStyle,
  cameraAngle,
  setCameraAngle,
  description,
  setDescription,
  videoUrl,
  isGenerating,
  onOutputChanged,
  onDownload,
  onResetTrim,
  buildCompletePrompt,
  imageInputRef,
  onPickImage
}) => {
  const [activeSection, setActiveSection] = useState('home');
  const [creativeMode, setCreativeMode] = useState<'video' | 'image'>('video');
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [selectedBaseImage, setSelectedBaseImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [currentProject, setCurrentProject] = useState<Project>({
    id: '1',
    name: 'Summer Collection Video',
    lastModified: '2 hours ago',
    status: 'active'
  });

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        console.log('Fetching products from API...');
        const response = await fetch('/api/products');
        console.log('API response status:', response.status);
        const data = await response.json();
        console.log('API response data:', data);
        console.log('Data is array:', Array.isArray(data));
        console.log('Products array length:', data.length || 0);
        // The API returns products directly as an array, not as {products: [...]}
        setProducts(Array.isArray(data) ? data : []);
        console.log('Products state updated, length:', Array.isArray(data) ? data.length : 0);
      } catch (error) {
        console.error('Failed to load products:', error);
      }
    };
    loadProducts();
  }, []);

  // Mock products data (fallback)
  const mockProducts = [
    {
      id: '1',
      title: 'Premium Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      image: 'https://picsum.photos/200/200?random=1',
      price: 299,
      category: 'Electronics'
    },
    {
      id: '2',
      title: 'Organic Cotton T-Shirt',
      description: 'Sustainable and comfortable cotton t-shirt',
      image: 'https://picsum.photos/200/200?random=2',
      price: 45,
      category: 'Clothing'
    }
  ];

  const handleVideoGenerated = (videoUrl: string) => {
    // Handle video generation - you might want to set this in state
    console.log('Video generated:', videoUrl);
  };

  const startVideoGeneration = () => {
    // This should trigger the video generation process
    if (onOutputChanged) {
      onOutputChanged(null); // or whatever format is expected
    }
  };

  const handleImageGenerated = (imageUrl: string) => {
    setGeneratedImage(imageUrl);
    setIsImageGenerating(false);
  };

  const handleSaveImage = (imageUrl: string) => {
    // Add to saved visuals
    const newVisual = {
      id: Date.now().toString(),
      url: imageUrl,
      prompt: prompt,
      timestamp: Date.now(),
      product: selectedProducts.length > 0
    };
    setSavedVisuals([...savedVisuals, newVisual]);
  };

  const handleReuseImage = (imageUrl: string) => {
    setSelectedBaseImage(imageUrl);
  };

  const handleNewProject = () => {
    setActiveSection('templates');
  };

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project);
    setActiveSection('creatives');
  };

  const handleTemplateSelect = (template: any) => {
    // Set up project based on template
    setPrompt(template.description);
    setCurrentProject({
      id: Date.now().toString(),
      name: `New ${template.name}`,
      lastModified: 'Just now',
      status: 'draft'
    });
    setActiveSection('creatives');
  };

  const handleCustomProject = () => {
    setActiveSection('creatives');
  };

  const handleExport = (config: any) => {
    setActiveSection('export');
  };

  const handleShare = (platform: string) => {
    console.log('Sharing to:', platform);
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case 'home':
      case 'templates':
        return (
          <ProjectTemplates
            onTemplateSelect={handleTemplateSelect}
            onCustomProject={handleCustomProject}
          />
        );

      case 'campaigns':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Campaigns</h2>
            <p className="text-gray-600">Manage your marketing campaigns and track performance.</p>
            {/* Campaign management interface */}
          </div>
        );

      case 'creatives':
        return (
          <div className="flex-1 bg-gray-50/30 overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Creative Studio</h1>
                  <p className="text-gray-600 mt-1">Create compelling videos with AI-powered tools</p>
                </div>
                <div className="flex items-center gap-6">
                  {/* Navigation Tabs */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setCreativeMode('video')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        creativeMode === 'video'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Video Generation
                    </button>
                    <button
                      onClick={() => setCreativeMode('image')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        creativeMode === 'image'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Image Generation
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">Project:</span>
                    <span className="text-sm font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">New Social Media Ad</span>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex overflow-hidden">
                {creativeMode === 'video' ? (
                  <>
                    {/* Left Panel - Product Selection */}
                    <div className="w-2/5 bg-white border-r border-gray-200 overflow-hidden">
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Products</h3>
                        <div className="space-y-3">
                          {(products.length > 0 ? products : mockProducts).slice(0, 10).map((product) => {
                            const isSelected = selectedProducts.some(p => p.id === product.id);
                            return (
                              <div
                                key={product.id}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
                                  } else {
                                    setSelectedProducts([...selectedProducts, product]);
                                  }
                                }}
                                className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                  isSelected
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-gray-200 hover:border-purple-300 bg-white'
                                }`}
                              >
                                <div className="flex gap-3">
                                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                                    <img
                                      src={product.image}
                                      alt={product.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 text-sm">{product.title}</h4>
                                    <p className="text-xs text-gray-600 mt-1">${product.price}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right Panel - Video Generation */}
                    <div className="flex-1 bg-white overflow-hidden">
                      <div className="h-full p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-lg font-semibold text-gray-900">Video Generation</h2>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            Ready to generate
                          </div>
                        </div>
                        
                        <div className="h-full flex flex-col">
                          {/* Video Preview */}
                          <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 p-4 mb-6">
                            <VideoPlayer 
                              src={videoUrl || ''}
                              onOutputChanged={onOutputChanged}
                              onDownload={onDownload}
                              onResetTrim={onResetTrim}
                            />
                          </div>

                          {/* Content Creation Tools */}
                          <div className="flex-1">
                            <Composer
                              prompt={prompt}
                              setPrompt={setPrompt}
                              selectedModel={selectedModel}
                              setSelectedModel={setSelectedModel}
                              canStart={!isGenerating}
                              isGenerating={isGenerating}
                              startGeneration={startVideoGeneration}
                              showImageTools={false}
                              setShowImageTools={() => {}}
                              imagePrompt=""
                              setImagePrompt={() => {}}
                              imagenBusy={false}
                              onPickImage={onPickImage}
                              generateWithImagen={() => {}}
                              imageFile={null}
                              generatedImage={null}
                              resetAll={onResetTrim}
                              visualStyle={visualStyle}
                              setVisualStyle={setVisualStyle}
                              cameraAngle={cameraAngle}
                              setCameraAngle={setCameraAngle}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Left Panel - Image Source Selection */}
                    <div className="w-2/5 bg-white border-r border-gray-200 overflow-hidden">
                      <ImageSourceSelection 
                        products={products.length > 0 ? products : mockProducts}
                        savedVisuals={savedVisuals}
                        selectedProducts={selectedProducts}
                        onProductSelect={setSelectedProducts}
                        onImageSelect={setSelectedBaseImage}
                      />
                    </div>

                    {/* Right Panel - Image Generation */}
                    <div className="flex-1 bg-white overflow-hidden">
                      <div className="h-full p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-lg font-semibold text-gray-900">Image Generation</h2>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            Ready to generate
                          </div>
                        </div>
                        
                        {/* Full Width Image Generation Tools */}
                        <div className="flex-1 flex flex-col">
                          <ImageComposer
                            selectedProducts={selectedProducts}
                            selectedBaseImage={selectedBaseImage}
                            onImageGenerated={handleImageGenerated}
                            onGeneratingChange={setIsImageGenerating}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case 'storyboard':
        return (
          <div className="h-full bg-gray-50">
            <div className="p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Storyboard Creator</h2>
                <p className="text-gray-600 text-lg">Create visual sequences for your video campaigns using AI-generated scenes</p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <StoryboardTab 
                  generatedImages={savedVisuals.map(v => v.url)}
                  onGenerateStoryboard={(scenes, template) => {
                    console.log('Generating storyboard:', scenes, template);
                    // Here you could add logic to create a new video project
                    // or navigate to the creatives section with the storyboard data
                  }}
                />
              </div>
            </div>
          </div>
        );

      case 'product-feeds':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Feeds</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Product Feeds</h3>
                <p className="text-gray-600 mb-4">Import products from Shopify, WooCommerce, or CSV files</p>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Add Feed
                </button>
              </div>
            </div>
          </div>
        );

      case 'assets':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Assets</h2>
            <VisualsLibraryTab
              savedVisuals={savedVisuals}
              onDeleteVisual={(visualId) => {
                setSavedVisuals((prev: any) => prev.filter((v: any) => v.id !== visualId));
              }}
              onReuseVisual={(visual) => {
                setPrompt(visual.prompt);
                setActiveSection('creatives');
              }}
            />
          </div>
        );

      case 'export':
        return (
          <ExportHub
            projectName={currentProject.name}
            onExport={handleExport}
            onShare={handleShare}
            isExporting={isGenerating}
          />
        );

      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">API Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gemini API Key
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your Gemini API key"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="veo-2.0-generate-001">Veo 2.0</option>
                    <option value="imagen-3.0-generate-001">Imagen 3.0</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <ProjectTemplates
            onTemplateSelect={handleTemplateSelect}
            onCustomProject={handleCustomProject}
          />
        );
    }
  };

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <ModernSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <ModernHeader
          currentProject={currentProject}
          onNewProject={handleNewProject}
          onProjectSelect={handleProjectSelect}
          onExport={() => setActiveSection('export')}
          onShare={() => handleShare('link')}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {renderMainContent()}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        style={{ display: "none" }}
        onChange={onPickImage}
      />
    </div>
  );
};

export default CreativeDashboard;