"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
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
    "veo-3.0-generate-preview"
  );

  // Tab state management
  const [activeTab, setActiveTab] = useState("products");

  // Saved visuals for library
  const [savedVisuals, setSavedVisuals] = useState<Array<{
    id: string;
    url: string;
    prompt: string;
    product?: any;
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
    
    // Add product description context if available
    if (description && description !== prompt) {
      completePrompt = `${completePrompt}. Product details: ${description}`;
    }
    
    return completePrompt;
  }, [prompt, visualStyle, cameraAngle, description]);

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
      setOperationName(json?.name || null);
    } catch (e) {
      console.error(e);
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
    <div className="h-screen bg-gray-50">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        {/* Header with Tabs */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-8 py-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">
              Further AI : Product Display Demo
            </h1>
            <TabsList>
              <TabsTrigger value="products">
                �️ Product & Visual Selection
              </TabsTrigger>
              <TabsTrigger value="prompt">
                🎬 Video Creation Studio
              </TabsTrigger>
              <TabsTrigger value="review">
                📱 Generated Videos & Review
              </TabsTrigger>
              <TabsTrigger value="library">
                🖼️ Visual Library
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          <TabsContent value="products" className="h-full overflow-y-auto">
            <ProductSelectionTab />
          </TabsContent>
          
          <TabsContent value="prompt" className="h-full overflow-hidden">
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
              description={description}
              setDescription={setDescription}
            />
          </TabsContent>
          
          <TabsContent value="review" className="h-full">
            <ReviewTab
              videoUrl={videoUrl}
              isGenerating={isGenerating}
              onOutputChanged={handleTrimmedOutput}
              onDownload={downloadVideo}
              onResetTrim={handleResetTrimState}
              prompt={buildCompletePrompt()}
            />
          </TabsContent>
          
          <TabsContent value="library" className="h-full">
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
          </TabsContent>
        </div>
      </Tabs>

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
