import React, { useState } from 'react';
import { Button } from './Button';
import { Download, Loader2, Sparkles, Check } from 'lucide-react';
import { useProduct } from '../../contexts/ProductContext';

interface VisualGenerationProps {
  productName: string;
  productDescription?: string;
  onVisualSelected: (imageData: string, mimeType: string) => void;
  onBack: () => void;
}

interface GeneratedVisual {
  data: string;
  mimeType: string;
  description?: string;
  imageUrl?: string; // Add URL field for server-served images
}

const visualStyles = [
  { id: 'professional', name: 'Professional Photography', description: 'Clean, studio-style product shots' },
  { id: 'lifestyle', name: 'Lifestyle Context', description: 'Product in real-world settings' },
  { id: 'artistic', name: 'Artistic & Creative', description: 'Unique angles and creative composition' },
  { id: 'minimalist', name: 'Minimalist', description: 'Clean backgrounds with focus on product' },
  { id: 'luxury', name: 'Luxury Premium', description: 'High-end, premium brand aesthetic' },
  { id: 'social', name: 'Social Media Ready', description: 'Optimized for Instagram and social platforms' }
];

export function VisualGeneration({ productName, productDescription, onVisualSelected, onBack }: VisualGenerationProps) {
  const { saveVisualToLibrary } = useProduct();
  const [prompt, setPrompt] = useState('Create a stunning, professional product photo with perfect lighting and premium background');
  const [selectedStyle, setSelectedStyle] = useState('professional');
  const [numberOfVisuals, setNumberOfVisuals] = useState(2);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVisuals, setGeneratedVisuals] = useState<GeneratedVisual[]>([]);
  const [selectedVisual, setSelectedVisual] = useState<number | null>(null);
  const [description, setDescription] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt for visual generation');
      return;
    }

    console.log('Starting visual generation with:', {
      prompt: prompt.trim(),
      productName,
      productDescription,
      selectedStyle
    });

    setIsGenerating(true);
    try {
      const response = await fetch('/api/visuals/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          productName,
          productDescription: productDescription || '',
          style: visualStyles.find(s => s.id === selectedStyle)?.description || 'professional product photography',
          count: numberOfVisuals
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate visuals');
      }

      const data = await response.json();
      console.log('Received visual generation response:', data);
      console.log('Images count:', data.images?.length || 0);
      
      // Debug each image
      if (data.images) {
        data.images.forEach((img: { data: string; mimeType: string }, i: number) => {
          console.log(`Image ${i}:`, {
            mimeType: img.mimeType,
            dataLength: img.data?.length,
            hasData: !!img.data,
            dataSample: img.data?.substring(0, 50) + '...'
          });
        });
      }
      
      if (data.images && data.images.length > 0) {
        // Store images on server and get URLs
        const imagesWithUrls = await Promise.all(
          data.images.map(async (img: { data: string; mimeType: string }) => {
            try {
              const storeResponse = await fetch('/api/visuals/serve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  imageData: img.data,
                  mimeType: img.mimeType
                })
              });
              
              if (storeResponse.ok) {
                const { imageId } = await storeResponse.json();
                const imageUrl = `/api/visuals/serve?id=${imageId}`;
                console.log('✅ Image stored with URL:', imageUrl);
                return { ...img, imageUrl };
              } else {
                console.error('Failed to store image on server');
                return img;
              }
            } catch (error) {
              console.error('Error storing image:', error);
              return img;
            }
          })
        );
        
        setGeneratedVisuals(imagesWithUrls);
        setDescription(data.description || '');
        
        // Save visuals to library
        imagesWithUrls.forEach((visual, index) => {
          const visualId = `visual-${Date.now()}-${index}`;
          saveVisualToLibrary({
            id: visualId,
            url: visual.imageUrl || '', // Use server URL if available
            prompt: prompt.trim(),
            timestamp: Date.now()
          });
        });
        
        // Auto-scroll to the generated visuals after a short delay
        setTimeout(() => {
          const visualsSection = document.querySelector('[data-visuals-section]');
          if (visualsSection) {
            visualsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 500);
      } else {
        console.error('No images in response:', data);
        alert('No visuals were generated. Please try again with a different prompt.');
      }
    } catch (error) {
      console.error('Error generating visuals:', error);
      alert('Failed to generate visuals. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (visual: GeneratedVisual, index: number) => {
    const link = document.createElement('a');
    link.href = `data:${visual.mimeType};base64,${visual.data}`;
    link.download = `${productName}-visual-${index + 1}.${visual.mimeType.split('/')[1]}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectVisual = (visual: GeneratedVisual) => {
    onVisualSelected(visual.data, visual.mimeType);
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="text-purple-600" />
              Generate Stunning Visuals
            </h2>
            <p className="text-gray-600 text-sm mt-1">Create professional product visuals for {productName}</p>
          </div>
          <Button onClick={onBack} variant="outline" size="sm">
            Back to Products
          </Button>
        </div>

      {/* Compact Controls Row */}
      <div className="bg-white rounded-lg border p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Style Selection */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Visual Style</h3>
            <select 
              value={selectedStyle} 
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {visualStyles.map((style) => (
                <option key={style.id} value={style.id}>{style.name}</option>
              ))}
            </select>
          </div>

          {/* Number of Visuals */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Number of Visuals</h3>
            <select 
              value={numberOfVisuals} 
              onChange={(e) => setNumberOfVisuals(parseInt(e.target.value))}
              className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value={1}>1 Visual</option>
              <option value={2}>2 Visuals</option>
              <option value={3}>3 Visuals</option>
              <option value={4}>4 Visuals</option>
            </select>
          </div>

          {/* Generate Button */}
          <div className="flex flex-col justify-end">
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="bg-purple-600 hover:bg-purple-700 text-white w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate {numberOfVisuals} Visual{numberOfVisuals > 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Prompt Input */}
        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-2">Describe Your Vision</h3>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the visual you want to create. E.g., 'Show the product on a marble surface with soft natural lighting, elegant shadows, and a premium feel suitable for luxury brand marketing.'"
            className="w-full h-20 p-3 border rounded-md resize-none text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Generated Visuals */}
      {isGenerating && (
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
            <span className="text-md font-medium text-gray-700">Generating {numberOfVisuals} stunning visual{numberOfVisuals > 1 ? 's' : ''}...</span>
          </div>
          <p className="text-gray-500 mt-1 text-sm">This may take a few moments</p>
        </div>
      )}
      
      {generatedVisuals.length > 0 && (
        <div className="bg-white rounded-lg border p-4 shadow-sm" data-visuals-section>
          <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="text-purple-600" />
            Generated Visuals ({generatedVisuals.length})
          </h3>
          
          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-center">
            <p className="text-blue-800 font-medium text-sm">✅ {generatedVisuals.length} visual{generatedVisuals.length > 1 ? 's' : ''} generated successfully!</p>
          </div>
          
          {description && (
            <div className="mb-4 p-3 bg-gray-50 rounded border-l-4 border-purple-500">
              <p className="text-gray-700 italic text-sm">{description}</p>
            </div>
          )}

          <div className={`grid gap-4 mb-6 ${
            generatedVisuals.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
            generatedVisuals.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {generatedVisuals.map((visual, index) => {
              // Log the visual data for debugging
              console.log(`Processing visual ${index}:`, {
                hasData: !!visual.data,
                dataLength: visual.data?.length,
                mimeType: visual.mimeType
              });
              
              return (
                <div
                  key={index}
                  className={`relative group border-2 rounded-lg overflow-hidden transition-all shadow-md hover:shadow-lg ${
                    selectedVisual === index
                      ? 'border-purple-500 ring-2 ring-purple-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {visual.data && visual.data.length > 0 ? (
                    visual.imageUrl ? (
                      // Use server-served image URL
                      <img
                        src={visual.imageUrl}
                        alt={`Generated visual ${index + 1} for ${productName}`}
                        className="w-full h-48 object-cover bg-gray-200"
                        onError={(e) => {
                          console.error('❌ Server image failed to load, trying data URI:', {
                            index,
                            imageUrl: visual.imageUrl,
                            mimeType: visual.mimeType
                          });
                          
                          // Fallback to data URI
                          const dataUri = `data:${visual.mimeType};base64,${visual.data}`;
                          e.currentTarget.src = dataUri;
                        }}
                        onLoad={() => {
                          console.log('✅ Server image loaded successfully:', {
                            index,
                            imageUrl: visual.imageUrl,
                            mimeType: visual.mimeType
                          });
                        }}
                      />
                    ) : (
                      // Fallback to data URI
                      (() => {
                        const dataUri = `data:${visual.mimeType};base64,${visual.data}`;
                        
                        return (
                          <img
                            src={dataUri}
                            alt={`Generated visual ${index + 1} for ${productName}`}
                            className="w-full h-48 object-cover bg-gray-200"
                            onError={(e) => {
                              console.error('❌ Data URI image failed to load:', {
                                index,
                                mimeType: visual.mimeType,
                                dataLength: visual.data?.length,
                                dataUriLength: dataUri.length
                              });
                              
                              // Show error state
                              e.currentTarget.style.display = 'none';
                              const errorDiv = document.createElement('div');
                              errorDiv.className = 'w-full h-48 bg-red-100 border-2 border-dashed border-red-300 flex flex-col items-center justify-center text-red-600 text-xs p-2';
                              errorDiv.innerHTML = `
                                <div class="font-bold">All Display Methods Failed</div>
                                <div>MIME: ${visual.mimeType}</div>
                                <div>Size: ${(visual.data?.length || 0)} bytes</div>
                                <div>Try downloading to view</div>
                              `;
                              e.currentTarget.parentNode?.appendChild(errorDiv);
                            }}
                            onLoad={() => {
                              console.log('✅ Data URI image loaded successfully:', {
                                index,
                                mimeType: visual.mimeType,
                                dataLength: visual.data?.length
                              });
                            }}
                          />
                        );
                      })()
                    )
                  ) : (
                    <div className="w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 text-xs">
                      <div>No image data available</div>
                      <div>Data length: {visual.data?.length || 0}</div>
                      <div>MIME: {visual.mimeType || 'unknown'}</div>
                    </div>
                  )}
                  
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                      <Button
                        onClick={() => handleDownload(visual, index)}
                        size="sm"
                        className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg text-xs px-2 py-1"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedVisual(index);
                          handleSelectVisual(visual);
                        }}
                        size="sm"
                        className="bg-purple-600 text-white hover:bg-purple-700 shadow-lg text-xs px-2 py-1"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Use for Video
                      </Button>
                    </div>
                  </div>

                  {/* Selection indicator */}
                  {selectedVisual === index && (
                    <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full p-1 shadow-lg">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                  
                  {/* Visual number badge */}
                  <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    #{index + 1}
                  </div>
                </div>
              );
            })}
          </div>

          {selectedVisual !== null && (
            <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 mb-1">
                <Check className="w-5 h-5" />
                <span className="font-semibold">Visual selected for video generation!</span>
              </div>
              <p className="text-green-700 text-sm">You can now proceed to create your video ad using this stunning visual, or go back to select a different product.</p>
            </div>
          )}
        </div>
      )}
    </div>
    </div>
  );
}
