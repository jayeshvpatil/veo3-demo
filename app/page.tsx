"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SidebarNav, MobileMenuButton } from "@/components/ui/SidebarNav";
import ProductSelectionTab from "@/components/ui/ProductSelectionTab";
import PromptManagementTab from "@/components/ui/PromptManagementTab";
import ReviewTab from "@/components/ui/ReviewTab";
import VisualsLibraryTab from "@/components/ui/VisualsLibraryTab";

type VeoOperationName = string | null;

const POLL_INTERVAL_MS = 5000;

const VeoStudio: React.FC = () => {
  const [prompt, setPrompt] = useState(""); // Video prompt
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [selectedModel, setSelectedModel] = useState(
    "veo-2.0-generate-001" // More stable model with better quota availability
  );

  // Tab state management
  const [activeTab, setActiveTab] = useState("products");
  
  // Sidebar state management
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Saved visuals for library
  const [savedVisuals, setSavedVisuals] = useState<Array<{
    id: string;
    url: string;
    prompt: string;
    product?: {
      id: string;
      title: string;
      description: string;
    };
    timestamp: number;
  }>>([]);

  // New customization options
  const [visualStyle, setVisualStyle] = useState("");
  const [cameraAngle, setCameraAngle] = useState("");
  const [description, setDescription] = useState("");

  // Listen for product selection events
  useEffect(() => {
    const handleProductUpdate = (event: CustomEvent) => {
      setPrompt(event.detail.prompt || "");
      setDescription(event.detail.description || "");
      
      // If an image file is provided, set it and enable image tools
      if (event.detail.imageFile) {
        setImageFile(event.detail.imageFile);
        setShowImageTools(true);
      }

      // Navigate to specified tab (for visual generation workflow)
      if (event.detail.navigateToTab) {
        setActiveTab(event.detail.navigateToTab);
      }
    };

    const handleSaveVisual = (event: CustomEvent) => {
      const visual = event.detail;
      setSavedVisuals(prev => [...prev, visual]);
    };

    window.addEventListener('updateVideoPrompt', handleProductUpdate as EventListener);
    window.addEventListener('saveVisual', handleSaveVisual as EventListener);
    
    return () => {
      window.removeEventListener('updateVideoPrompt', handleProductUpdate as EventListener);
      window.removeEventListener('saveVisual', handleSaveVisual as EventListener);
    };
  }, []);

  // Imagen-specific prompt
  const [imagePrompt, setImagePrompt] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagenBusy, setImagenBusy] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null); // data URL

  const [operationName, setOperationName] = useState<VeoOperationName>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const videoBlobRef = useRef<Blob | null>(null);
  const trimmedBlobRef = useRef<Blob | null>(null);
  const trimmedUrlRef = useRef<string | null>(null);
  const originalVideoUrlRef = useRef<string | null>(null);

  const [showImageTools, setShowImageTools] = useState(false);

  // Image input ref
  const imageInputRef = useRef<HTMLInputElement>(null);

  const canStart = useMemo(() => {
    if (!prompt || !prompt.trim()) return false;
    if (showImageTools && !(imageFile || generatedImage)) return false;
    return true;
  }, [prompt, showImageTools, imageFile, generatedImage]);

  const resetAll = () => {
    setPrompt("");
    setNegativePrompt("");
    setAspectRatio("16:9");
    setVisualStyle("");
    setCameraAngle("");
    setDescription("");
    setImagePrompt("");
    setImageFile(null);
    setGeneratedImage(null);
    setOperationName(null);
    setIsGenerating(false);
    setVideoUrl(null);
    if (videoBlobRef.current) {
      URL.revokeObjectURL(URL.createObjectURL(videoBlobRef.current));
      videoBlobRef.current = null;
    }
    if (trimmedUrlRef.current) {
      URL.revokeObjectURL(trimmedUrlRef.current);
      trimmedUrlRef.current = null;
    }
    trimmedBlobRef.current = null;
  };

  // Imagen helper
  const generateWithImagen = useCallback(async () => {
    setImagenBusy(true);
    setGeneratedImage(null);
    try {
      const resp = await fetch("/api/imagen/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt }),
      });
      const json = await resp.json();
      if (json?.image?.imageBytes) {
        const dataUrl = `data:${json.image.mimeType};base64,${json.image.imageBytes}`;
        setGeneratedImage(dataUrl);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setImagenBusy(false);
    }
  }, [imagePrompt]);

  // Build complete prompt with customizations
  const buildCompletePrompt = useCallback(() => {
    let completePrompt = prompt;
    
    // Add visual style
    if (visualStyle) {
      completePrompt = `${visualStyle} style: ${completePrompt}`;
    }
    
    // Add camera angle
    if (cameraAngle) {
      completePrompt = `${completePrompt}. Shot with ${cameraAngle} camera angle`;
    }
    
    // DO NOT add product description to video prompts - videos should be based on the image content
    // Product descriptions are static and don't add value to video generation
    
    return completePrompt;
  }, [prompt, visualStyle, cameraAngle]);

  // Start Veo job
  const startGeneration = useCallback(async () => {
    if (!canStart) return;
    setIsGenerating(true);
    setVideoUrl(null);

    // Switch to review tab immediately when generation starts
    setActiveTab("review");

    const completePrompt = buildCompletePrompt();
    
    const form = new FormData();
    form.append("prompt", completePrompt);
    form.append("model", selectedModel);
    if (negativePrompt) form.append("negativePrompt", negativePrompt);
    if (aspectRatio) form.append("aspectRatio", aspectRatio);

    if (showImageTools) {
      if (imageFile) {
        form.append("imageFile", imageFile);
      } else if (generatedImage) {
        const [meta, b64] = generatedImage.split(",");
        const mime = meta?.split(";")?.[0]?.replace("data:", "") || "image/png";
        form.append("imageBase64", b64);
        form.append("imageMimeType", mime);
      }
    }

    try {
      const resp = await fetch("/api/veo/generate", {
        method: "POST",
        body: form,
      });
      const json = await resp.json();
      
      if (!resp.ok) {
        // Handle specific error types from the API
        let errorMessage = json.error || "Failed to start video generation";
        
        if (json.type === "quota_exceeded") {
          errorMessage = `API quota exceeded. This usually means:
• Daily/hourly API limits reached
• Billing account needs to be set up  
• Try again in a few hours

Check your Google Cloud Console for quota details.`;
        } else if (json.type === "permission_denied") {
          errorMessage = "Permission denied. Please check your API key and project settings.";
        } else if (json.type === "invalid_argument") {
          errorMessage = "Invalid request. Please check your inputs and try again.";
        }
        
        alert(errorMessage);
        setIsGenerating(false);
        return;
      }
      
      setOperationName(json?.name || null);
    } catch (e) {
      console.error(e);
      alert("Network error occurred. Please check your connection and try again.");
      setIsGenerating(false);
    }
  }, [
    canStart,
    buildCompletePrompt,
    selectedModel,
    negativePrompt,
    aspectRatio,
    showImageTools,
    imageFile,
    generatedImage,
    setActiveTab,
  ]);

  // Poll operation until done then download
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    async function poll() {
      if (!operationName || videoUrl) return;
      try {
        const resp = await fetch("/api/veo/operation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: operationName }),
        });
        const fresh = await resp.json();
        if (fresh?.done) {
          const fileUri = fresh?.response?.generatedVideos?.[0]?.video?.uri;
          if (fileUri) {
            const dl = await fetch("/api/veo/download", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ uri: fileUri }),
            });
            const blob = await dl.blob();
            videoBlobRef.current = blob;
            const url = URL.createObjectURL(blob);
            setVideoUrl(url);
            originalVideoUrlRef.current = url;
          }
          setIsGenerating(false);
          return;
        }
      } catch (e) {
        console.error(e);
        setIsGenerating(false);
      } finally {
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    }
    if (operationName && !videoUrl) {
      timer = setTimeout(poll, POLL_INTERVAL_MS);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [operationName, videoUrl]);

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setImageFile(f);
      setGeneratedImage(null);
    }
  };

  const handleTrimmedOutput = (blob: Blob) => {
    trimmedBlobRef.current = blob; // likely webm
    if (trimmedUrlRef.current) {
      URL.revokeObjectURL(trimmedUrlRef.current);
    }
    trimmedUrlRef.current = URL.createObjectURL(blob);
    setVideoUrl(trimmedUrlRef.current);
  };

  const handleResetTrimState = () => {
    if (trimmedUrlRef.current) {
      URL.revokeObjectURL(trimmedUrlRef.current);
      trimmedUrlRef.current = null;
    }
    trimmedBlobRef.current = null;
    if (originalVideoUrlRef.current) {
      setVideoUrl(originalVideoUrlRef.current);
    }
  };

  const downloadVideo = async () => {
    const blob = trimmedBlobRef.current || videoBlobRef.current;
    if (!blob) return;
    const isTrimmed = !!trimmedBlobRef.current;
    const filename = isTrimmed ? "veo3_video_trimmed.webm" : "veo3_video.mp4";
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.style.display = "none";
    link.href = url;
    link.setAttribute("download", filename);
    link.setAttribute("rel", "noopener");
    link.target = "_self";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 0);
  };

  return (
    <div className="h-screen bg-slate-900 flex">
      {/* Sidebar Navigation */}
      <SidebarNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <header className="bg-slate-900 border-b border-slate-800">
          <div className="px-4 lg:px-8 py-4 lg:py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <MobileMenuButton onClick={() => setSidebarOpen(true)} />
                <div>
                  <h1 className="text-xl lg:text-2xl font-semibold text-white">
                    Product Feeds
                  </h1>
                  <p className="text-sm text-slate-400 mt-1">
                    Manage your product feeds and generate creative content
                  </p>
                </div>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                New Feed
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden bg-slate-900">
          {activeTab === "products" && (
            <div className="h-full overflow-y-auto">
              <ProductSelectionTab />
            </div>
          )}
          
          {activeTab === "prompt" && (
            <div className="h-full overflow-hidden">
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
            </div>
          )}
          
          {activeTab === "review" && (
            <div className="h-full">
              <ReviewTab
                videoUrl={videoUrl}
                isGenerating={isGenerating}
                onOutputChanged={handleTrimmedOutput}
                onDownload={downloadVideo}
                onResetTrim={handleResetTrimState}
                prompt={buildCompletePrompt()}
              />
            </div>
          )}
          
          {activeTab === "library" && (
            <div className="h-full">
              <VisualsLibraryTab
                savedVisuals={savedVisuals}
                onDeleteVisual={(visualId) => {
                  setSavedVisuals(prev => prev.filter(v => v.id !== visualId));
                }}
                onReuseVisual={(visual) => {
                  // Switch to prompt tab and set the prompt
                  setPrompt(visual.prompt);
                  setActiveTab("prompt");
                }}
              />
            </div>
          )}
        </main>
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

export default VeoStudio;
