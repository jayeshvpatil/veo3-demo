import React, { useState } from 'react';
import { Button } from './Button';
import { Download, Loader2, Sparkles, Check } from 'lucide-react';
import { useProduct } from '../../contexts/ProductContext';
import { useBrandGuidelines } from '../../contexts/BrandGuidelinesContext';

interface VisualGenerationProps {
  productName: string;
  productDescription?: string;
  productImage?: string;
  onVisualSelected: (imageData: string, mimeType: string) => void;
  onBack: () => void;
}

interface GeneratedVisual {
  data: string;
  mimeType: string;
  description?: string;
  imageUrl?: string; // Server URL or data URL
  dataUrl?: string; // Fallback data URL
}

const visualStyles = [
  { id: 'professional', name: 'Professional Photography', description: 'Clean, studio-style product shots' },
  { id: 'lifestyle', name: 'Lifestyle Context', description: 'Product in real-world settings' },
  { id: 'artistic', name: 'Artistic & Creative', description: 'Unique angles and creative composition' },
  { id: 'minimalist', name: 'Minimalist', description: 'Clean backgrounds with focus on product' },
  { id: 'luxury', name: 'Luxury Premium', description: 'High-end, premium brand aesthetic' },
  { id: 'social', name: 'Social Media Ready', description: 'Optimized for Instagram and social platforms' }
];

// Professional style templates with hyper-specific, best-practice descriptions
const styleTemplates = {
  professional: {
    backgroundSurface: 'seamless white infinity backdrop with graduated lighting transition',
    lightingSetup: 'three-point studio lighting system with 1000W key light at 45°, 500W fill light at -30°, and rim light for edge definition',
    lightingPurpose: 'achieve even illumination with 2:1 lighting ratio, eliminating harsh shadows while maintaining dimensional modeling',
    cameraAngle: '45-degree elevated perspective using 85mm lens equivalent for natural perspective compression',
    showcaseFeature: 'product architecture with clinical precision, revealing every design detail and material characteristic',
    focusDetail: 'razor-sharp edge definition, surface micro-textures, and material authenticity with macro-level clarity',
    aspectRatio: '16:9 aspect ratio'
  },
  lifestyle: {
    backgroundSurface: 'warm reclaimed oak wooden surface with subtle natural grain patterns and soft ambient props suggesting daily use',
    lightingSetup: 'golden hour window lighting from camera left, supplemented by warm LED panel for shadow fill',
    lightingPurpose: 'create authentic lived-in atmosphere with soft directional shadows and warm color temperature (3200K)',
    cameraAngle: 'eye-level perspective at 50mm equivalent focal length for natural human viewpoint',
    showcaseFeature: 'product integration within realistic lifestyle context, showing natural usage scenarios and environmental harmony',
    focusDetail: 'environmental storytelling elements, contextual props, and authentic interaction suggestions',
    aspectRatio: '4:3 aspect ratio'
  },
  artistic: {
    backgroundSurface: 'textured concrete wall with dramatic directional lighting creating geometric shadow patterns',
    lightingSetup: 'single dramatic side light with barn doors, creating 70% shadow falloff and colored gel accent lighting',
    lightingPurpose: 'establish artistic mood through chiaroscuro lighting technique with bold contrast ratios and creative shadow play',
    cameraAngle: 'low-angle heroic perspective using wide-angle lens (24mm equivalent) for dynamic compositional impact',
    showcaseFeature: 'sculptural product qualities through dramatic lighting interaction and bold compositional positioning',
    focusDetail: 'artistic shadow patterns, surface light interaction, and creative reflection elements',
    aspectRatio: '1:1 aspect ratio'
  },
  minimalist: {
    backgroundSurface: 'pure white seamless infinity background with absolutely no visible horizon line or surface texture',
    lightingSetup: 'soft box array providing completely even, shadowless illumination from multiple angles (360° coverage)',
    lightingPurpose: 'eliminate all shadows and surface reflections to achieve pure isolation with clinical clarity',
    cameraAngle: 'perfectly centered frontal composition with 85mm lens for minimal perspective distortion',
    showcaseFeature: 'absolute product isolation with geometric precision, removing all visual distractions',
    focusDetail: 'pure form definition, clean geometric lines, and essential product silhouette',
    aspectRatio: '1:1 aspect ratio'
  },
  luxury: {
    backgroundSurface: 'polished Carrara marble surface with subtle veining, complemented by brushed gold accent elements',
    lightingSetup: 'sophisticated rim lighting setup with warm accent spots (2700K) and cool key light (5600K) for dimensional luxury feel',
    lightingPurpose: 'create premium aesthetic through careful highlight placement, rich material rendering, and elegant contrast control',
    cameraAngle: 'slightly elevated luxury perspective (15° above product plane) using 100mm lens for elegant compression',
    showcaseFeature: 'premium material qualities, sophisticated craftsmanship details, and luxury brand positioning elements',
    focusDetail: 'rich surface textures, premium finish quality, metallic accents, and luxury material authenticity',
    aspectRatio: '16:9 aspect ratio'
  },
  social: {
    backgroundSurface: 'vibrant gradient backdrop transitioning from coral to peach, with trending social media aesthetic elements',
    lightingSetup: 'bright ring light setup with color temperature optimized for mobile display (4000K) and catchlight enhancement',
    lightingPurpose: 'maximize visual impact for social media engagement with punchy colors and scroll-stopping brightness',
    cameraAngle: 'dynamic overhead flat lay angle optimized for mobile viewing and social media cropping',
    showcaseFeature: 'social media shareability with trending aesthetic appeal and mobile-first composition',
    focusDetail: 'vibrant color saturation, engaging visual elements, and social media optimization',
    aspectRatio: '9:16 aspect ratio'
  }
};

export default function VisualGeneration({ productName, productDescription, productImage, onVisualSelected, onBack }: VisualGenerationProps) {
  const { saveVisualToLibrary } = useProduct();
  const { getBrandPromptAdditions } = useBrandGuidelines();
  const [prompt, setPrompt] = useState('Create a stunning, professional product photo with perfect lighting and premium background');
  const [selectedStyle, setSelectedStyle] = useState('professional');
  const [numberOfVisuals, setNumberOfVisuals] = useState(2);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVisuals, setGeneratedVisuals] = useState<GeneratedVisual[]>([]);
  const [selectedVisual, setSelectedVisual] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  
  // Template field defaults - all user customizable
  const [productSubject, setProductSubject] = useState(productDescription || productName || 'premium product');
  const [backgroundSurface, setBackgroundSurface] = useState('clean white seamless paper backdrop');
  const [lightingSetup, setLightingSetup] = useState('three-point softbox setup');
  const [lightingPurpose, setLightingPurpose] = useState('highlight authentic materials without color distortion');
  const [cameraAngle, setCameraAngle] = useState('45-degree elevated view');
  const [showcaseFeature, setShowcaseFeature] = useState("the product's authentic form and material details");
  const [focusDetail, setFocusDetail] = useState('material fidelity and exact color reproduction');
  const [aspectRatio, setAspectRatio] = useState('16:9 aspect ratio');

  const getBackgroundOptions = () => [
    'clean white seamless paper backdrop',
    'natural lifestyle setting',
    'premium marble surface',
    'clean minimal background',
    'creative artistic backdrop',
    'Instagram-optimized surface',
    'wooden surface with natural grain',
    'modern concrete platform',
    'soft fabric backdrop',
    'industrial metal surface'
  ];

  // Update all template fields when style changes
  const handleStyleChange = (newStyle: string) => {
    setSelectedStyle(newStyle);
    
    const template = styleTemplates[newStyle as keyof typeof styleTemplates];
    if (template) {
      setBackgroundSurface(template.backgroundSurface);
      setLightingSetup(template.lightingSetup);
      setLightingPurpose(template.lightingPurpose);
      setCameraAngle(template.cameraAngle);
      setShowcaseFeature(template.showcaseFeature);
      setFocusDetail(template.focusDetail);
      setAspectRatio(template.aspectRatio);
    }
  };

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
          style: visualStyles.find(s => s.id === selectedStyle)?.description || 'professional product photography',
          count: numberOfVisuals,
          productImage: productImage, // Include the product image
          brandGuidelines: getBrandPromptAdditions(), // Include brand guidelines
          templateFields: {
            productSubject,
            backgroundSurface,
            lightingSetup,
            lightingPurpose,
            cameraAngle,
            showcaseFeature,
            focusDetail,
            aspectRatio
          }
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
              // Convert base64 to data URL for immediate display
              const dataUrl = `data:${img.mimeType};base64,${img.data}`;
              
              // Also store on server for serving
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
                return { ...img, imageUrl, dataUrl };
              } else {
                console.warn('Failed to store image on server, using data URL');
                return { ...img, imageUrl: dataUrl, dataUrl };
              }
            } catch (error) {
              console.error('Error storing image:', error);
              const dataUrl = `data:${img.mimeType};base64,${img.data}`;
              return { ...img, imageUrl: dataUrl, dataUrl };
            }
          })
        );
        
        setGeneratedVisuals(imagesWithUrls);
        setDescription(data.description || '');
        
        // Save visuals to library - only save if we have a valid imageUrl
        imagesWithUrls.forEach((visual, index) => {
          if (visual.imageUrl) {
            const visualId = `visual-${Date.now()}-${index}`;
            console.log('Saving visual to library with URL:', visual.imageUrl);
            saveVisualToLibrary({
              id: visualId,
              url: visual.imageUrl,
              prompt: prompt.trim(),
              timestamp: Date.now()
            });
          } else {
            console.warn('Skipping visual save - no imageUrl available:', visual);
          }
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

        {/* Original Product Display */}
        {productImage && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Original Product</h3>
            <div className="flex items-center gap-4">
              <img
                src={productImage}
                alt={productName}
                className="w-20 h-20 object-cover rounded-lg border border-gray-200"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{productName}</p>
                {productDescription && (
                  <p className="text-xs text-gray-600 mt-2 line-clamp-3 max-w-md">{productDescription}</p>
                )}
              </div>
            </div>
          </div>
        )}

      {/* Compact Controls Row */}
      <div className="bg-white rounded-lg border p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Style Selection */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Visual Style</h3>
            <select 
              value={selectedStyle} 
              onChange={(e) => handleStyleChange(e.target.value)}
              className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {visualStyles.map((style) => (
                <option key={style.id} value={style.id}>{style.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">✨ Selecting a style auto-populates all template fields</p>
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

        {/* Advanced Template Controls */}
        <div className="mt-4">
          <details className="group" open>
            <summary className="cursor-pointer text-sm font-semibold mb-2 flex items-center gap-2 hover:text-purple-600">
              <span>🎛️ Photography Template Controls</span>
              <span className="text-xs text-gray-500 group-open:hidden">Professional presets applied automatically</span>
            </summary>
            <div className="mt-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg">
              <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-center">
                <p className="text-blue-800 font-medium text-xs">
                  📸 Current Style: <strong>{visualStyles.find(s => s.id === selectedStyle)?.name}</strong> - All fields auto-configured with professional defaults
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Product Subject</label>
                <input
                  type="text"
                  value={productSubject}
                  onChange={(e) => setProductSubject(e.target.value)}
                  placeholder="e.g., premium sneaker, luxury watch"
                  className="w-full p-2 border rounded-md text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Background Surface</label>
                <select
                  value={backgroundSurface}
                  onChange={(e) => setBackgroundSurface(e.target.value)}
                  className="w-full p-2 border rounded-md text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {getBackgroundOptions().map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Lighting Setup</label>
                <input
                  type="text"
                  value={lightingSetup}
                  onChange={(e) => setLightingSetup(e.target.value)}
                  placeholder="e.g., three-point softbox setup"
                  className="w-full p-2 border rounded-md text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Lighting Purpose</label>
                <input
                  type="text"
                  value={lightingPurpose}
                  onChange={(e) => setLightingPurpose(e.target.value)}
                  placeholder="e.g., highlight authentic materials"
                  className="w-full p-2 border rounded-md text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Camera Angle</label>
                <input
                  type="text"
                  value={cameraAngle}
                  onChange={(e) => setCameraAngle(e.target.value)}
                  placeholder="e.g., 45-degree elevated view"
                  className="w-full p-2 border rounded-md text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Showcase Feature</label>
                <input
                  type="text"
                  value={showcaseFeature}
                  onChange={(e) => setShowcaseFeature(e.target.value)}
                  placeholder="e.g., authentic form and material details"
                  className="w-full p-2 border rounded-md text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Focus Detail</label>
                <input
                  type="text"
                  value={focusDetail}
                  onChange={(e) => setFocusDetail(e.target.value)}
                  placeholder="e.g., material fidelity and color reproduction"
                  className="w-full p-2 border rounded-md text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Aspect Ratio</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full p-2 border rounded-md text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="16:9 aspect ratio">16:9 (Widescreen)</option>
                  <option value="4:3 aspect ratio">4:3 (Standard)</option>
                  <option value="1:1 aspect ratio">1:1 (Square)</option>
                  <option value="3:4 aspect ratio">3:4 (Portrait)</option>
                  <option value="9:16 aspect ratio">9:16 (Vertical)</option>
                </select>
              </div>
              </div>
            </div>
          </details>
        </div>

        {/* Preview Section */}
        {prompt.trim() && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-sm font-semibold mb-2 text-gray-800">Final Enhanced Prompt Preview</h3>
            <div className="text-xs text-gray-600 bg-white p-3 rounded border max-h-32 overflow-y-auto font-mono">
              A high-resolution, studio-lit product photograph of a <span className="font-semibold text-purple-600">{productSubject}</span> on a <span className="font-semibold text-purple-600">{backgroundSurface}</span>. The lighting is a <span className="font-semibold text-purple-600">{lightingSetup}</span> to <span className="font-semibold text-purple-600">{lightingPurpose}</span>. The camera angle is a <span className="font-semibold text-purple-600">{cameraAngle}</span> to showcase <span className="font-semibold text-purple-600">{showcaseFeature}</span>. Ultra-realistic, with sharp focus on <span className="font-semibold text-purple-600">{focusDetail}</span>. <span className="font-semibold text-purple-600">{aspectRatio}</span>.
              <br /><br />
              <strong>Creative Direction:</strong> {prompt}
            </div>
          </div>
        )}
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

          <div className="grid gap-4 mb-6 grid-cols-1 md:grid-cols-2">
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
                        className="w-full h-64 object-contain bg-gray-50"
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
                            className="w-full h-64 object-contain bg-gray-50"
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
                  <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
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
