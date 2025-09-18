import React, { useState } from 'react';
import { Wand2, Palette, Camera, Lightbulb, Settings } from 'lucide-react';

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

interface ImageComposerProps {
  selectedProducts: Product[];
  selectedBaseImage?: string | null;
  onImageGenerated: (imageUrl: string) => void;
  onGeneratingChange?: (isGenerating: boolean) => void;
}

const ImageComposer: React.FC<ImageComposerProps> = ({
  selectedProducts,
  selectedBaseImage,
  onImageGenerated,
  onGeneratingChange
}) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('photorealistic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);

  // Debug logging
  console.log('ImageComposer rendered with:', { selectedProducts: selectedProducts.length, selectedBaseImage });

  const styles = [
    { id: 'photorealistic', name: 'Photorealistic', description: 'Studio-quality product photos' },
    { id: 'minimalist', name: 'Minimalist', description: 'Clean, simple backgrounds' },
    { id: 'lifestyle', name: 'Lifestyle', description: 'Real-world usage scenarios' },
    { id: 'artistic', name: 'Artistic', description: 'Creative and stylized imagery' }
  ];

  const aspectRatios = [
    { id: '1:1', name: 'Square (1:1)', description: 'Instagram posts' },
    { id: '16:9', name: 'Landscape (16:9)', description: 'YouTube thumbnails' },
    { id: '9:16', name: 'Portrait (9:16)', description: 'Instagram stories' },
    { id: '4:5', name: 'Portrait (4:5)', description: 'Instagram feed' }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    if (onGeneratingChange) {
      onGeneratingChange(true);
    }
    
    try {
      const enhancedPrompt = buildPrompt();
      
      const response = await fetch('/api/imagen/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          model: 'imagen-4.0-fast-generate-001',
          aspectRatio: aspectRatio
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      
      if (data.image && data.image.imageBytes) {
        // Convert base64 to blob URL for display
        const imageBlob = new Blob([
          Uint8Array.from(atob(data.image.imageBytes), c => c.charCodeAt(0))
        ], { type: data.image.mimeType || 'image/png' });
        
        const imageUrl = URL.createObjectURL(imageBlob);
        onImageGenerated(imageUrl);
      }
    } catch (error) {
      console.error('Image generation failed:', error);
      // You could add error state here to show user feedback
    } finally {
      setIsGenerating(false);
      if (onGeneratingChange) {
        onGeneratingChange(false);
      }
    }
  };

  const buildPrompt = () => {
    let basePrompt = prompt;
    
    if (selectedProducts.length > 0) {
      const productNames = selectedProducts.map(p => p.title).join(', ');
      basePrompt = `${basePrompt} featuring ${productNames}`;
    }
    
    if (selectedBaseImage) {
      basePrompt = `${basePrompt}, using the provided base image as reference`;
    }
    
    return basePrompt;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable Content */}
      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        {/* Prompt Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image Description
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            className="w-full h-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
        </div>

      {/* Style Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">
          <Palette className="inline w-4 h-4 mr-1" />
          Visual Style
        </label>
        <div className="grid grid-cols-2 gap-2">
          {styles.map((styleOption) => (
            <button
              key={styleOption.id}
              onClick={() => setStyle(styleOption.id)}
              className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                style === styleOption.id
                  ? 'border-purple-500 bg-purple-50 text-purple-900'
                  : 'border-gray-200 bg-white text-gray-900 hover:border-purple-300'
              }`}
            >
              <div className="font-medium text-sm">{styleOption.name}</div>
              <div className="text-xs text-gray-600 mt-1">{styleOption.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Aspect Ratio */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">
          <Camera className="inline w-4 h-4 mr-1" />
          Aspect Ratio
        </label>
        <div className="grid grid-cols-2 gap-2">
          {aspectRatios.map((ratio) => (
            <button
              key={ratio.id}
              onClick={() => setAspectRatio(ratio.id)}
              className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                aspectRatio === ratio.id
                  ? 'border-purple-500 bg-purple-50 text-purple-900'
                  : 'border-gray-200 bg-white text-gray-900 hover:border-purple-300'
              }`}
            >
              <div className="font-medium text-sm">{ratio.name}</div>
              <div className="text-xs text-gray-600 mt-1">{ratio.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Context */}
      {(selectedProducts.length > 0 || selectedBaseImage) && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Generation Context</h4>
          
          {selectedProducts.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-2">Selected Products:</p>
              <div className="flex flex-wrap gap-2">
                {selectedProducts.map((product) => (
                  <span
                    key={product.id}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                  >
                    {product.title}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {selectedBaseImage && (
            <div>
              <p className="text-xs text-gray-600 mb-2">Base Image:</p>
              <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={selectedBaseImage}
                  alt="Base"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      )}
      </div>

      {/* Generate Button - Fixed at bottom */}
      <div className="border-t-2 border-purple-300 p-4 bg-purple-50 mt-auto">
        <div className="mb-2 text-xs text-purple-600 font-medium">Generation Controls</div>
        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className={`w-full py-4 px-4 rounded-lg font-medium transition-all duration-200 text-lg ${
            !prompt.trim() || isGenerating
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-lg'
          }`}
        >
          {isGenerating ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              Generating...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Wand2 size={20} />
              Generate Image
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export { ImageComposer };