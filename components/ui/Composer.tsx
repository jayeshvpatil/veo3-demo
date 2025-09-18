"use client";

import React from "react";
import {
  Upload,
  Wand2,
  Plus,
  ArrowRight,
  Loader2,
  RotateCcw,
} from "lucide-react";
import NextImage from "next/image";
import ModelSelector from "@/components/ui/ModelSelector";

interface ComposerProps {
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

  // New customization props
  visualStyle: string;
  setVisualStyle: (value: string) => void;
  cameraAngle: string;
  setCameraAngle: (value: string) => void;
}

const Composer: React.FC<ComposerProps> = ({
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
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Visual style options
  const visualStyles = [
    { value: "", label: "Default" },
    { value: "cinematic", label: "Cinematic" },
    { value: "commercial", label: "Commercial" },
    { value: "fashion", label: "Fashion" },
    { value: "lifestyle", label: "Lifestyle" },
    { value: "minimalist", label: "Minimalist" },
    { value: "luxury", label: "Luxury" },
    { value: "vintage", label: "Vintage" },
    { value: "modern", label: "Modern" },
  ];

  // Camera angle options
  const cameraAngles = [
    { value: "", label: "Default" },
    { value: "close-up", label: "Close-up" },
    { value: "medium shot", label: "Medium Shot" },
    { value: "wide shot", label: "Wide Shot" },
    { value: "overhead", label: "Overhead" },
    { value: "low angle", label: "Low Angle" },
    { value: "high angle", label: "High Angle" },
    { value: "profile", label: "Profile" },
    { value: "360 degree", label: "360 Degree" },
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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 w-[min(100%,48rem)] px-4">
      {showImageTools && (
        <div className="mb-3 rounded-xl backdrop-blur-sm bg-white/30 p-3">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <div
                className={`rounded-lg border-2 border-dashed p-4 cursor-pointer transition-colors ${
                  isDragging
                    ? "bg-white/30 border-indigo-400"
                    : "bg-white/10 border-gray-300/70 hover:bg-white/30"
                }`}
                onClick={handleOpenFileDialog}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex items-center gap-3 text-slate-800/80">
                  <Upload className="w-5 h-5" />
                  <div>
                    <div className="font-medium">
                      Drag & drop an image, or click to upload
                    </div>
                    <div className="text-xs opacity-80">
                      PNG, JPG, WEBP up to 10MB
                    </div>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onPickImage}
                />
              </div>

              <div className="flex items-center gap-2 mt-3">
                <input
                  type="text"
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Describe the starting photo to generate..."
                  className="flex-1 rounded-md bg-white/10 border border-white/20 px-3 py-2 placeholder-slate-800/60 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={generateWithImagen}
                  disabled={!imagePrompt.trim() || imagenBusy}
                  aria-busy={imagenBusy}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-md transition ${
                    !imagePrompt.trim() || imagenBusy
                      ? "opacity-60 cursor-not-allowed"
                      : "bg-black/80 hover:bg-black text-white cursor-pointer"
                  }`}
                >
                  {imagenBusy ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4" />
                  )}
                  {imagenBusy ? "Generating" : "Generate"}
                </button>
              </div>
            </div>
            <div className="flex items-start justify-start">
              <div className="mt-1">
                {imageFile && (
                  <div className="text-sm text-stone-700">
                    Selected: {imageFile.name}
                  </div>
                )}
                {!imageFile && generatedImage && (
                  <NextImage
                    src={generatedImage}
                    alt="Generated"
                    width={640}
                    height={360}
                    className="max-h-48 rounded-md border w-auto h-auto"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="text-lg font-semibold text-slate-900/80 backdrop-blur-sm bg-white/30 px-3 py-1 rounded-lg border ">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            aria-pressed={showImageTools}
            onClick={() => setShowImageTools((s) => !s)}
            className={`inline-flex items-center gap-2 pl-3 pr-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 transition ${
              showImageTools
                ? "bg-white/70  text-slate-900"
                : "bg-white/50  text-slate-900 hover:bg-white/50"
            }`}
            title="Image to Video"
          >
            <Plus className="w-4 h-4" />
            Image
          </button>

          <ModelSelector
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
        </div>

        {/* Customization Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          {/* Visual Style Dropdown */}
          <div>
            <label className="block text-xs font-medium text-slate-900/70 mb-1">
              Visual Style
            </label>
            <select
              value={visualStyle}
              onChange={(e) => setVisualStyle(e.target.value)}
              className="w-full bg-white/50 border border-white/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {visualStyles.map((style) => (
                <option key={style.value} value={style.value}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>

          {/* Camera Angle Dropdown */}
          <div>
            <label className="block text-xs font-medium text-slate-900/70 mb-1">
              Camera Angle
            </label>
            <select
              value={cameraAngle}
              onChange={(e) => setCameraAngle(e.target.value)}
              className="w-full bg-white/50 border border-white/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {cameraAngles.map((angle) => (
                <option key={angle.value} value={angle.value}>
                  {angle.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Create a dynamic video showcasing the product. E.g., 'Smooth 360-degree rotation revealing all details with cinematic lighting and dynamic camera movement'"
          className="w-full bg-transparent focus:outline-none resize-none text-base font-normal placeholder-slate-800/60"
          rows={3}
        />
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="h-10 w-10 flex items-center justify-center bg-white/50 rounded-full hover:bg-white/70 cursor-pointer"
              title="Reset"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            
            {/* Complete Prompt Preview - Tooltip only */}
            {(visualStyle || cameraAngle) && (
              <div className="relative group">
                <div className="h-10 w-10 flex items-center justify-center bg-white/50 rounded-full hover:bg-white/70 cursor-help">
                  <span className="text-xs font-semibold text-slate-700">i</span>
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 max-w-sm whitespace-normal">
                  <div className="font-medium mb-1">Complete Prompt:</div>
                  <div className="italic">&ldquo;{buildPromptPreview()}&rdquo;</div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-800"></div>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={startGeneration}
            disabled={!canStart || isGenerating}
            aria-busy={isGenerating}
            className={`h-10 w-10 flex items-center justify-center rounded-full text-white transition ${
              !canStart || isGenerating
                ? "bg-white/50 cursor-not-allowed"
                : "bg-white/50 hover:bg-white/70 cursor-pointer"
            }`}
            title="Generate"
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-t-transparent border-black rounded-full animate-spin" />
            ) : (
              <ArrowRight className="w-5 h-5 text-black" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Composer;
