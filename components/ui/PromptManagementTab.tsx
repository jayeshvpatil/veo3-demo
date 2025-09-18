"use client";

import React from "react";
import {
  Upload,
  Wand2,
  Plus,
  ArrowRight,
  Loader2,
  RotateCcw,
  Clock,
} from "lucide-react";
import NextImage from "next/image";
import ModelSelector from "./ModelSelector";

interface PromptManagementTabProps {
  prompt: string;
  setPrompt: (value: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  canStart: boolean;
  isGenerating: boolean;
  startGeneration: () => void;
  showImageTools: boolean;
  setShowImageTools: React.Dispatch<React.SetStateAction<boolean>>;
  imagePrompt: string;
  setImagePrompt: (value: string) => void;
  imagenBusy: boolean;
  onPickImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  generateWithImagen: () => Promise<void> | void;
  imageFile: File | null;
  generatedImage: string | null;
  resetAll: () => void;
  visualStyle: string;
  setVisualStyle: (value: string) => void;
  cameraAngle: string;
  setCameraAngle: (value: string) => void;
  className?: string;
}

export default function PromptManagementTab({
  prompt,
  setPrompt,
  selectedModel,
  setSelectedModel,
  canStart,
  isGenerating,
  startGeneration,
  showImageTools,
  setShowImageTools,
  imagePrompt,
  setImagePrompt,
  imagenBusy,
  onPickImage,
  generateWithImagen,
  imageFile,
  generatedImage,
  resetAll,
  visualStyle,
  setVisualStyle,
  cameraAngle,
  setCameraAngle,
  className = "",
}: PromptManagementTabProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Visual style options - simplified for Michael Kors brand
  const visualStyles = [
    { value: "", label: "Classic" },
    { value: "luxury boutique", label: "Luxury Boutique" },
    { value: "premium studio", label: "Premium Studio" },
    { value: "elegant showcase", label: "Elegant Showcase" },
  ];

  // Camera movement options - simplified
  const cameraAngles = [
    { value: "", label: "Standard" },
    { value: "360 degree orbit", label: "360° Orbit" },
    { value: "close-up reveal", label: "Close-up Reveal" },
    { value: "smooth glide", label: "Smooth Glide" },
  ];

  // Quick template options - focused on product display cinematography
  const quickTemplates = [
    {
      name: "Luxury Atelier",
      prompt: "In an intimate atelier bathed in golden hour light, the product rests on polished Italian marble. Soft shadows dance across the surface as the camera gracefully orbits, revealing the exquisite craftsmanship and sophisticated details. Every stitch, every curve speaks to timeless elegance. The Michael Kors heritage shines through in the interplay of light and luxury, creating a moment of pure sophistication.",
      visualStyle: "luxury",
      cameraAngle: "360 degree",
    },
    {
      name: "Metropolitan Elegance",
      prompt: "Against the backdrop of a sleek metropolitan setting, refined lighting illuminates the product with understated sophistication. The camera moves with purpose and grace, capturing the essence of modern luxury. Clean lines and premium materials come together in perfect harmony, embodying the confident style that defines contemporary elegance.",
      visualStyle: "commercial", 
      cameraAngle: "medium shot",
    },
    {
      name: "Celestial Grace",
      prompt: "Suspended in an ethereal realm of soft pearl light, the product appears to float with graceful poise. Delicate light rays create an aura of sophistication as the camera performs a ballet-like movement around the piece. This dreamlike sequence captures the aspirational beauty and refined luxury that transforms everyday moments into extraordinary experiences.",
      visualStyle: "cinematic",
      cameraAngle: "overhead",
    },
    {
      name: "Artisan Reveal",
      prompt: "Beginning with an intimate exploration of luxurious textures and masterful details, the camera slowly unveils the complete vision. Each movement celebrates the artisanal quality and sophisticated design philosophy. Premium materials and impeccable craftsmanship are revealed with reverence, showcasing the dedication to excellence that defines true luxury.",
      visualStyle: "modern",
      cameraAngle: "close-up",
    },
  ];

  const handleOpenFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onPickImage({
        target: { files },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleReset = () => {
    resetAll();
    setShowImageTools(false);
  };

  const applyTemplate = (template: {
    name: string;
    prompt: string;
    visualStyle: string;
    cameraAngle: string;
  }) => {
    setPrompt(template.prompt);
    setVisualStyle(template.visualStyle);
    setCameraAngle(template.cameraAngle);
  };

  // Build preview of complete prompt
  const buildPromptPreview = () => {
    let completePrompt = prompt;
    
    if (visualStyle) {
      completePrompt = `${visualStyle} style: ${completePrompt}`;
    }
    
    if (cameraAngle) {
      completePrompt = `${completePrompt}. Shot with ${cameraAngle} camera angle`;
    }
    
    // Product description removed from video generation
    
    return completePrompt;
  };

  return (
    <div className={`h-full overflow-y-auto ${className}`}>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Video Studio</h2>
          <p className="text-gray-600">Transform your product images into dynamic showcase videos</p>
        </div>

        {/* Quick Templates */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">🎬 Cinematic Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickTemplates.map((template) => (
              <button
                key={template.name}
                onClick={() => applyTemplate(template)}
                className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
              >
                <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-700">{template.name}</h4>
                <p className="text-sm text-gray-600 line-clamp-3 mb-3">{template.prompt.substring(0, 120)}...</p>
                <div className="flex gap-2">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                    {template.visualStyle}
                  </span>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                    {template.cameraAngle}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column - Prompt & Settings */}
          <div className="space-y-6">
            
            {/* Custom Prompt */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">✨ Video Description</h3>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Create a dynamic video showcasing the product. E.g., 'Smooth 360-degree rotation revealing all details with cinematic lighting and elegant camera movement' or 'Dynamic zoom-in from wide shot to close-up highlighting texture and craftsmanship'"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={6}
              />
            </div>

            {/* Visual Style & Camera Movement */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🎥 Cinematography</h3>
              <div className="grid grid-cols-1 gap-4">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visual Style
                  </label>
                  <select
                    value={visualStyle}
                    onChange={(e) => setVisualStyle(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {visualStyles.map((style) => (
                      <option key={style.value} value={style.value}>
                        {style.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Camera Movement
                  </label>
                  <select
                    value={cameraAngle}
                    onChange={(e) => setCameraAngle(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {cameraAngles.map((angle) => (
                      <option key={angle.value} value={angle.value}>
                        {angle.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Image & Controls */}
          <div className="space-y-6">

            {/* Image Tools */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">🖼️ Image Reference</h3>
                <button
                  type="button"
                  onClick={() => setShowImageTools((s) => !s)}
                  className={`flex items-center gap-2 px-3 py-1 text-sm rounded-lg transition-colors ${
                    showImageTools
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  {showImageTools ? "Hide" : "Add"} Image
                </button>
              </div>

              {showImageTools && (
                <div className="space-y-3">
                  <div
                    className={`rounded-lg border-2 border-dashed p-4 cursor-pointer transition-colors ${
                      isDragging
                        ? "bg-blue-50 border-blue-400"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={handleOpenFileDialog}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="flex items-center gap-2 text-gray-700 text-sm">
                      <Upload className="w-4 h-4" />
                      <span>Drop image or click to upload</span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onPickImage}
                    />
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      placeholder="Generate reference image..."
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={generateWithImagen}
                      disabled={!imagePrompt.trim() || imagenBusy}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-white text-sm transition ${
                        !imagePrompt.trim() || imagenBusy
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {imagenBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                      {imagenBusy ? "..." : "Generate"}
                    </button>
                  </div>

                  {imageFile && (
                    <div className="text-sm text-gray-600">📎 {imageFile.name}</div>
                  )}

                  {!imageFile && generatedImage && (
                    <NextImage
                      src={generatedImage}
                      alt="Generated"
                      width={200}
                      height={120}
                      className="rounded-lg border border-gray-200"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Action Controls */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <ModelSelector
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
                />
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>

              <button
                onClick={startGeneration}
                disabled={!canStart || isGenerating}
                className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg text-white font-semibold text-lg transition ${
                  !canStart || isGenerating
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                }`}
              >
                {isGenerating ? (
                  <>
                    <Clock className="w-5 h-5 animate-spin" />
                    Creating Video...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-5 h-5" />
                    Create Product Video
                  </>
                )}
              </button>
              
              {!isGenerating && canStart && (
                <div className="text-center text-sm text-gray-500 mt-3">
                  ✨ Will automatically switch to Review tab to show your video
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Complete Prompt Preview */}
        {(visualStyle || cameraAngle) && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">🎯 Complete Prompt Preview</h3>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <p className="text-blue-800 italic text-sm leading-relaxed">&ldquo;{buildPromptPreview()}&rdquo;</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
