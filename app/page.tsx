"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SidebarNav } from "@/components/ui/SidebarNav";
import ProductSelectionTab from "@/components/ui/ProductSelectionTab";
import PromptManagementTab from "@/components/ui/PromptManagementTab";
import ReviewTab from "@/components/ui/ReviewTab";
import VisualsLibraryTab from "@/components/ui/VisualsLibraryTab";
import BrandGuidelines from "@/components/ui/BrandGuidelines";
import HomeTab from "@/components/ui/HomeTab";
import ProjectsListTab from "@/components/ui/ProjectsListTab";
import CollectionsListTab from "@/components/ui/CollectionsListTab";
import CreateProjectModal from "@/components/ui/CreateProjectModal";
import CreateCollectionModal from "@/components/ui/CreateCollectionModal";
type SavedVisual = {
  id: string;
  url: string;
  prompt: string;
  type?: 'image' | 'video';
  product?: {
    id: string;
    title: string;
    description: string;
  };
  timestamp: number;
  metadata?: any;
};

const VeoStudio: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // State for sidebar
  const [activeTab, setActiveTab] = useState("home");
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Project and collection modal states
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
  const [selectedProjectForCollection, setSelectedProjectForCollection] = useState<{ id: string; name: string } | null>(null);
  const [currentProject, setCurrentProject] = useState<string | null>(null);

  // Video generation state
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("veo-2.0-generate-001");
  const [canStart, setCanStart] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showImageTools, setShowImageTools] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  // Image generation state
  const [imagePrompt, setImagePrompt] = useState("");
  const [imagenBusy, setImagenBusy] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [visualStyle, setVisualStyle] = useState("");
  const [cameraAngle, setCameraAngle] = useState("");
  
  // Saved visuals for library
  const [savedVisuals, setSavedVisuals] = useState<SavedVisual[]>([]);

  // Load saved visuals from database
  const loadSavedVisuals = useCallback(async () => {
    try {
      const response = await fetch('/api/visuals/list');
      if (response.ok) {
        const data = await response.json();
        setSavedVisuals(data.visuals || []);
      }
    } catch (error) {
      console.error('Error loading visuals:', error);
    }
  }, []);

  // Save visual to database
  const saveVisual = useCallback(async (visualData: {
    prompt: string;
    imageUrl?: string;
    videoUrl?: string;
    type: 'image' | 'video';
    metadata?: any;
    projectId?: string;
  }) => {
    try {
      const response = await fetch('/api/visuals/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...visualData,
          projectId: visualData.projectId || currentProject
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSavedVisuals(prev => [data.visual, ...prev]);
        console.log('Visual saved to library:', data.visual);
        return data.visual;
      }
    } catch (error) {
      console.error('Error saving visual:', error);
    }
  }, [currentProject]);

  // Load visuals when component mounts and user is authenticated
  useEffect(() => {
    if (session?.user) {
      loadSavedVisuals();
    }
  }, [session, loadSavedVisuals]);

  // Listen for saveVisual events from ProductContext
  useEffect(() => {
    const handleSaveVisual = (event: CustomEvent) => {
      const visualDetail = event.detail;
      console.log('Received saveVisual event:', visualDetail);
      
      // Convert to the format expected by our saveVisual function
      saveVisual({
        prompt: visualDetail.prompt,
        imageUrl: visualDetail.url,
        type: 'image',
        metadata: {
          model: 'visual-generation',
          productId: visualDetail.product?.id,
          generatedAt: new Date(visualDetail.timestamp).toISOString()
        }
      });
    };

    window.addEventListener('saveVisual', handleSaveVisual as EventListener);
    
    return () => {
      window.removeEventListener('saveVisual', handleSaveVisual as EventListener);
    };
  }, [saveVisual]);

  // Update canStart based on prompt
  useEffect(() => {
    setCanStart(prompt.trim().length > 0);
  }, [prompt]);

  const startGeneration = useCallback(async () => {
    if (!canStart || isGenerating) return;
    
    setIsGenerating(true);
    try {
      console.log("Starting video generation with prompt:", prompt);
      
      // Create form data for the VEO API
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('model', selectedModel);
      formData.append('aspectRatio', '16:9');
      
      if (imageFile) {
        formData.append('imageFile', imageFile);
      }
      
      // Call the actual VEO generation API
      const response = await fetch('/api/veo/generate', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('VEO generation response:', data);
        
        // Check if we got an operation name for polling
        if (data.operationName) {
          // Poll for the operation result
          const pollForResult = async (operationName: string) => {
            try {
              const pollResponse = await fetch('/api/veo/operation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ operationName })
              });
              
              if (pollResponse.ok) {
                const pollData = await pollResponse.json();
                
                if (pollData.done && pollData.downloadUrl) {
                  // Generation complete! Save to library
                  setVideoUrl(pollData.downloadUrl);
                  setIsGenerating(false);
                  
                  await saveVisual({
                    prompt,
                    videoUrl: pollData.downloadUrl,
                    type: 'video',
                    metadata: {
                      model: selectedModel,
                      visualStyle,
                      cameraAngle,
                      operationName,
                      generatedAt: new Date().toISOString()
                    }
                  });
                  
                  console.log("Video generated and saved to library");
                } else if (!pollData.done) {
                  // Still processing, poll again in 5 seconds
                  setTimeout(() => pollForResult(operationName), 5000);
                } else if (pollData.error) {
                  console.error('Generation failed:', pollData.error);
                  setIsGenerating(false);
                }
              }
            } catch (pollError) {
              console.error('Error polling for result:', pollError);
              setIsGenerating(false);
            }
          };
          
          // Start polling
          setTimeout(() => pollForResult(data.operationName), 5000);
          
        } else if (data.error) {
          console.error('Generation error:', data.error);
          setIsGenerating(false);
        }
      } else {
        console.error('Failed to start generation');
        setIsGenerating(false);
      }
      
    } catch (error) {
      console.error("Error generating video:", error);
      setIsGenerating(false);
    }
  }, [canStart, isGenerating, prompt, selectedModel, visualStyle, cameraAngle, imageFile, saveVisual]);

  const onPickImage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  }, []);

  const generateWithImagen = useCallback(async () => {
    if (!imagePrompt.trim() || imagenBusy) return;
    
    setImagenBusy(true);
    try {
      console.log("Generating image with prompt:", imagePrompt);
      
      // Call the real Imagen generation API
      const response = await fetch('/api/imagen/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          count: 1
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Imagen generation response:', data);
        
        if (data.image && data.image.imageBytes) {
          // Convert base64 to data URL
          const imageBase64 = data.image.imageBytes;
          const mimeType = data.image.mimeType || 'image/png';
          const dataUrl = `data:${mimeType};base64,${imageBase64}`;
          setGeneratedImage(dataUrl);
          
          // Save to the visuals API to get a proper URL
          const saveResponse = await fetch('/api/visuals/serve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageData: imageBase64,
              mimeType: mimeType
            })
          });
          
          if (saveResponse.ok) {
            const saveData = await saveResponse.json();
            const imageUrl = `/api/visuals/serve?id=${saveData.imageId}`;
            
            // Save to library
            await saveVisual({
              prompt: imagePrompt,
              imageUrl: imageUrl,
              type: 'image',
              metadata: {
                model: 'imagen-3.0',
                visualStyle,
                generatedAt: new Date().toISOString()
              }
            });
            
            console.log("Image generated and saved to library");
          }
        }
        
        setImagenBusy(false);
      } else {
        console.error('Failed to generate image');
        setImagenBusy(false);
      }
    } catch (error) {
      console.error("Error generating image:", error);
      setImagenBusy(false);
    }
  }, [imagePrompt, imagenBusy, visualStyle, saveVisual]);

  const resetAll = useCallback(() => {
    setPrompt("");
    setImagePrompt("");
    setImageFile(null);
    setGeneratedImage(null);
    setVisualStyle("");
    setCameraAngle("");
    setVideoUrl(null);
    setShowImageTools(false);
  }, []);

  const handleDeleteVisual = useCallback(async (visualId: string) => {
    try {
      const response = await fetch(`/api/visuals/save?id=${visualId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setSavedVisuals(prev => prev.filter(visual => visual.id !== visualId));
      }
    } catch (error) {
      console.error('Error deleting visual:', error);
    }
  }, []);

  const handleClearAll = useCallback(async () => {
    if (!confirm('Are you sure you want to delete all visuals? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch('/api/visuals/clear', {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setSavedVisuals([]);
      }
    } catch (error) {
      console.error('Error clearing all visuals:', error);
    }
  }, []);

  const handleReuseVisual = useCallback((visual: SavedVisual) => {
    setPrompt(visual.prompt);
    setActiveTab("prompt"); // Switch to prompt tab
  }, []);

  const handleOutputChanged = useCallback((blob: Blob) => {
    // Handle video output changes
    const url = URL.createObjectURL(blob);
    setVideoUrl(url);
  }, []);

  const handleDownload = useCallback(() => {
    if (videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = 'generated-video.mp4';
      a.click();
    }
  }, [videoUrl]);

  const handleResetTrim = useCallback(() => {
    // Reset trim functionality
    console.log("Reset trim");
  }, []);

  // Project and collection handlers
  const handleCreateProject = useCallback(async (data: { name: string; description: string; color: string }) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Project created:', result.project);
        // Navigate to the new project
        setActiveTab(`project-${result.project.id}`);
        setCurrentProject(result.project.id);
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  }, []);

  const handleCreateCollection = useCallback(async (data: { name: string; description: string; color: string; projectId: string }) => {
    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Collection created:', result.collection);
        // Navigate to the new collection
        setActiveTab(`collection-${result.collection.id}`);
      }
    } catch (error) {
      console.error('Error creating collection:', error);
    }
  }, []);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!session) {
    return null;
  }

  // Render the appropriate tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomeTab
            onNavigateToTab={setActiveTab}
            onCreateProject={() => setShowCreateProjectModal(true)}
            onCreateCollection={(projectId: string, projectName: string) => {
              setSelectedProjectForCollection({ id: projectId, name: projectName });
              setShowCreateCollectionModal(true);
            }}
          />
        );
      case "projects":
        return (
          <ProjectsListTab
            onNavigateToTab={setActiveTab}
            onCreateProject={() => setShowCreateProjectModal(true)}
          />
        );
      case "collections":
        return (
          <CollectionsListTab
            onNavigateToTab={setActiveTab}
          />
        );
      case "products":
        return <ProductSelectionTab />;
      case "brand-guidelines":
        return <BrandGuidelines />;
      case "prompt":
        return (
          <PromptManagementTab
            prompt={prompt}
            setPrompt={setPrompt}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            canStart={canStart}
            isGenerating={isGenerating}
            startGeneration={startGeneration}
            showImageTools={showImageTools}
            setShowImageTools={setShowImageTools}
            imagePrompt={imagePrompt}
            setImagePrompt={setImagePrompt}
            imagenBusy={imagenBusy}
            onPickImage={onPickImage}
            generateWithImagen={generateWithImagen}
            imageFile={imageFile}
            generatedImage={generatedImage}
            resetAll={resetAll}
            visualStyle={visualStyle}
            setVisualStyle={setVisualStyle}
            cameraAngle={cameraAngle}
            setCameraAngle={setCameraAngle}
          />
        );
      case "review":
        return (
          <ReviewTab
            videoUrl={videoUrl}
            isGenerating={isGenerating}
            onOutputChanged={handleOutputChanged}
            onDownload={handleDownload}
            onResetTrim={handleResetTrim}
            prompt={prompt}
          />
        );
      case "library":
        return (
          <VisualsLibraryTab
            savedVisuals={savedVisuals}
            onDeleteVisual={handleDeleteVisual}
            onReuseVisual={handleReuseVisual}
            onClearAll={handleClearAll}
          />
        );
      default:
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-4">Welcome to VEO Studio</h1>
              <p className="text-xl text-gray-300">
                Hello, {session.user?.name || session.user?.email}!
              </p>
              <p className="text-lg text-gray-400 mt-2">
                Select a tab from the sidebar to get started.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800">
      <SidebarNav 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <main className="flex-1 overflow-hidden">
        {renderTabContent()}
      </main>
      
      {/* Modals */}
      <CreateProjectModal
        isOpen={showCreateProjectModal}
        onClose={() => setShowCreateProjectModal(false)}
        onCreateProject={handleCreateProject}
      />
      {selectedProjectForCollection && (
        <CreateCollectionModal
          isOpen={showCreateCollectionModal}
          onClose={() => {
            setShowCreateCollectionModal(false);
            setSelectedProjectForCollection(null);
          }}
          onCreateCollection={handleCreateCollection}
          projectId={selectedProjectForCollection.id}
          projectName={selectedProjectForCollection.name}
        />
      )}
    </div>
  );
};

export default VeoStudio;
