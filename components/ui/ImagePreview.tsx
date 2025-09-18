import React from 'react';
import { Image, Upload, Download, RotateCcw } from 'lucide-react';

interface ImagePreviewProps {
  selectedImage?: string | null;
  generatedImage?: string | null;
  isGenerating?: boolean;
  onSaveImage?: (imageUrl: string) => void;
  onReuseImage?: (imageUrl: string) => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  selectedImage,
  generatedImage,
  isGenerating = false,
  onSaveImage,
  onReuseImage
}) => {
  const displayImage = generatedImage || selectedImage;

  const handleDownload = () => {
    if (displayImage) {
      const link = document.createElement('a');
      link.href = displayImage;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleSave = () => {
    if (displayImage && onSaveImage) {
      onSaveImage(displayImage);
    }
  };

  const handleReuse = () => {
    if (displayImage && onReuseImage) {
      onReuseImage(displayImage);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">Preview</h3>
        {displayImage && (
          <div className="text-xs text-gray-500">
            {generatedImage ? 'Generated' : 'Base image'}
          </div>
        )}
      </div>

      {/* Image Display */}
      <div className="flex-1 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 relative overflow-hidden">
        {isGenerating ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-sm text-gray-600">Generating image...</p>
            </div>
          </div>
        ) : displayImage ? (
          <div className="w-full h-full relative">
            <img
              src={displayImage}
              alt="Preview"
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center text-gray-400">
                      <div class="text-center">
                        <div class="text-3xl mb-2">🖼️</div>
                        <div class="text-sm">Image unavailable</div>
                      </div>
                    </div>
                  `;
                }
              }}
            />
            
            {/* Image Overlay Info */}
            <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
              {generatedImage ? 'Generated Image' : 'Base Image'}
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <Image className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm font-medium text-gray-600 mb-2">No image selected</p>
              <p className="text-xs text-gray-500">
                Select a product or visual from the left panel
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Image Actions */}
      {displayImage && !isGenerating && (
        <div className="mt-4 flex gap-2">
          <button 
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-all duration-200"
          >
            <Download size={12} />
            Download
          </button>
          {generatedImage && onSaveImage && (
            <button 
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-xs font-medium transition-all duration-200"
            >
              <Upload size={12} />
              Save
            </button>
          )}
          {displayImage && onReuseImage && (
            <button 
              onClick={handleReuse}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-purple-100 hover:bg-purple-600 text-purple-700 hover:text-white rounded-lg text-xs font-medium transition-all duration-200"
            >
              <RotateCcw size={12} />
              Reuse
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export { ImagePreview };