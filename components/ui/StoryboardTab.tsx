import React, { useState, useRef } from 'react';
import { Plus, Play, Trash2, ArrowUp, ArrowDown, Download, Upload } from 'lucide-react';

// Types for storyboard management
interface VideoScene {
  id: string;
  name: string;
  prompt: string;
  startFrame?: string; // Base64 image or URI
  endFrame?: string;   // Base64 image or URI
  duration: number;    // Duration in seconds
  generatedVideo?: string; // Generated video URI/blob
  status: 'draft' | 'generating' | 'completed' | 'error';
  aspectRatio: string;
  model: string;
}

interface SocialMediaTemplate {
  id: string;
  name: string;
  aspectRatio: string;
  duration: number;
  description: string;
  scenes: number; // Recommended number of scenes
}

interface StoryboardTabProps {
  generatedImages: string[]; // Available generated images to use as frames
  onGenerateStoryboard: (scenes: VideoScene[], template: SocialMediaTemplate) => void;
}

const StoryboardTab: React.FC<StoryboardTabProps> = ({
  generatedImages,
  onGenerateStoryboard,
}) => {
  const [scenes, setScenes] = useState<VideoScene[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<SocialMediaTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFrameSelector, setShowFrameSelector] = useState<{sceneId: string, frameType: 'start' | 'end'} | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const socialMediaTemplates: SocialMediaTemplate[] = [
    {
      id: 'instagram-story',
      name: 'Instagram Story',
      aspectRatio: '9:16',
      duration: 15,
      description: 'Vertical format perfect for Instagram Stories',
      scenes: 3
    },
    {
      id: 'tiktok-short',
      name: 'TikTok Short',
      aspectRatio: '9:16',
      duration: 30,
      description: 'Engaging vertical videos for TikTok',
      scenes: 4
    },
    {
      id: 'youtube-short',
      name: 'YouTube Short',
      aspectRatio: '9:16',
      duration: 60,
      description: 'Short-form content for YouTube',
      scenes: 5
    },
    {
      id: 'instagram-reel',
      name: 'Instagram Reel',
      aspectRatio: '9:16',
      duration: 30,
      description: 'Dynamic reels for Instagram feed',
      scenes: 4
    },
    {
      id: 'facebook-ad',
      name: 'Facebook Ad',
      aspectRatio: '16:9',
      duration: 15,
      description: 'Horizontal format for Facebook advertising',
      scenes: 3
    }
  ];

  const createNewScene = () => {
    const newScene: VideoScene = {
      id: `scene-${Date.now()}`,
      name: `Scene ${scenes.length + 1}`,
      prompt: '',
      duration: selectedTemplate ? selectedTemplate.duration / selectedTemplate.scenes : 5,
      status: 'draft',
      aspectRatio: selectedTemplate?.aspectRatio || '16:9',
      model: 'veo-2.0-generate-001'
    };
    setScenes([...scenes, newScene]);
  };

  const updateScene = (sceneId: string, updates: Partial<VideoScene>) => {
    setScenes(scenes.map(scene => 
      scene.id === sceneId ? { ...scene, ...updates } : scene
    ));
  };

  const deleteScene = (sceneId: string) => {
    setScenes(scenes.filter(scene => scene.id !== sceneId));
  };

  const moveScene = (sceneId: string, direction: 'up' | 'down') => {
    const currentIndex = scenes.findIndex(scene => scene.id === sceneId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= scenes.length) return;

    const newScenes = [...scenes];
    [newScenes[currentIndex], newScenes[newIndex]] = [newScenes[newIndex], newScenes[currentIndex]];
    setScenes(newScenes);
  };

  const selectFrame = (sceneId: string, frameType: 'start' | 'end', imageData: string) => {
    updateScene(sceneId, { [frameType === 'start' ? 'startFrame' : 'endFrame']: imageData });
    setShowFrameSelector(null);
  };

  const handleImageUpload = (sceneId: string, frameType: 'start' | 'end', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        selectFrame(sceneId, frameType, imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateStoryboard = async () => {
    if (!selectedTemplate || scenes.length === 0) return;
    
    setIsGenerating(true);
    try {
      await onGenerateStoryboard(scenes, selectedTemplate);
    } catch (error) {
      console.error('Error generating storyboard:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Social Media Storyboard</h2>
        <p className="text-gray-600">Create engaging video ads by combining multiple scenes with custom start and end frames</p>
      </div>

      {/* Template Selection */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-lg font-semibold mb-3">Choose Template</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {socialMediaTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                selectedTemplate?.id === template.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-sm">{template.name}</div>
              <div className="text-xs text-gray-500 mt-1">{template.aspectRatio} • {template.duration}s</div>
              <div className="text-xs text-gray-400 mt-1">{template.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scenes Management */}
      {selectedTemplate && (
        <div className="bg-white rounded-lg border p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Scenes ({scenes.length})</h3>
            <button
              onClick={createNewScene}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <Plus className="h-4 w-4" />
              Add Scene
            </button>
          </div>

          {scenes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="mb-2">No scenes created yet</div>
              <div className="text-sm">Click "Add Scene" to start building your storyboard</div>
            </div>
          ) : (
            <div className="space-y-4">
              {scenes.map((scene, index) => (
                <div key={scene.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={scene.name}
                        onChange={(e) => updateScene(scene.id, { name: e.target.value })}
                        className="font-medium text-sm bg-transparent border-none outline-none"
                        placeholder="Scene name"
                      />
                      <div className="text-xs text-gray-500">Duration: {scene.duration}s</div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => moveScene(scene.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => moveScene(scene.id, 'down')}
                        disabled={index === scenes.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteScene(scene.id)}
                        className="p-1 text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Prompt Input */}
                  <textarea
                    value={scene.prompt}
                    onChange={(e) => updateScene(scene.id, { prompt: e.target.value })}
                    placeholder="Describe what happens in this scene..."
                    className="w-full p-2 border rounded text-sm mb-3 resize-none"
                    rows={2}
                  />

                  {/* Frame Selection */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Start Frame */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700">Start Frame</label>
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:border-gray-400 transition-colors"
                        onClick={() => setShowFrameSelector({sceneId: scene.id, frameType: 'start'})}
                      >
                        {scene.startFrame ? (
                          <img src={scene.startFrame} alt="Start frame" className="w-full h-20 object-cover rounded" />
                        ) : (
                          <div className="text-xs text-gray-500">
                            <Upload className="h-6 w-6 mx-auto mb-1" />
                            Select start frame
                          </div>
                        )}
                      </div>
                    </div>

                    {/* End Frame */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700">End Frame</label>
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:border-gray-400 transition-colors"
                        onClick={() => setShowFrameSelector({sceneId: scene.id, frameType: 'end'})}
                      >
                        {scene.endFrame ? (
                          <img src={scene.endFrame} alt="End frame" className="w-full h-20 object-cover rounded" />
                        ) : (
                          <div className="text-xs text-gray-500">
                            <Upload className="h-6 w-6 mx-auto mb-1" />
                            Select end frame
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Scene Status */}
                  <div className="mt-3 text-xs">
                    <span className={`px-2 py-1 rounded-full ${
                      scene.status === 'completed' ? 'bg-green-100 text-green-800' :
                      scene.status === 'generating' ? 'bg-yellow-100 text-yellow-800' :
                      scene.status === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {scene.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Generate Button */}
          {scenes.length > 0 && (
            <div className="mt-6 text-center">
              <button
                onClick={generateStoryboard}
                disabled={isGenerating || scenes.some(scene => !scene.prompt.trim())}
                className="flex items-center gap-2 mx-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="h-4 w-4" />
                {isGenerating ? 'Generating Storyboard...' : 'Generate Video Ad'}
              </button>
              <div className="text-xs text-gray-500 mt-2">
                Total duration: {scenes.reduce((total, scene) => total + scene.duration, 0)}s
              </div>
            </div>
          )}
        </div>
      )}

      {/* Frame Selector Modal */}
      {showFrameSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowFrameSelector(null)}>
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">
              Select {showFrameSelector.frameType === 'start' ? 'Start' : 'End'} Frame
            </h3>
            
            {/* Upload Option */}
            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(showFrameSelector.sceneId, showFrameSelector.frameType, e)}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Upload className="h-4 w-4" />
                Upload Image
              </button>
            </div>

            {/* Generated Images Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {generatedImages.map((image, index) => (
                <div
                  key={index}
                  onClick={() => selectFrame(showFrameSelector.sceneId, showFrameSelector.frameType, image)}
                  className="border rounded-lg overflow-hidden cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <img src={image} alt={`Generated ${index + 1}`} className="w-full h-24 object-cover" />
                </div>
              ))}
            </div>

            {generatedImages.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="mb-2">No generated images available</div>
                <div className="text-sm">Generate some images first or upload your own</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryboardTab;