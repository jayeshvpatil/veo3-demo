"use client";

import React, { useState } from "react";
import {
  Wand2,
  MessageSquare,
  Settings2,
  Video,
  Image as ImageIcon,
  Sparkles,
  ShoppingCart,
  X,
} from "lucide-react";
import * as Dialog from '@radix-ui/react-dialog';
import PromptManagementTab from "./PromptManagementTab";
import { AgenticVisualChat } from "./AgenticVisualChat";
import VisualGeneration from "./VisualGeneration";
import { useProduct } from "../../contexts/ProductContext";

type CreateMode = "templates" | "agent" | "advanced";

interface CreateTabProps {
  // Props for advanced mode (existing PromptManagementTab)
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
  videoUrl: string | null;
  onOutputChanged: (blob: Blob) => void;
  onDownload: () => void;
  onResetTrim: () => void;
  currentProject: string | null;
  onNavigateToAssets?: () => void;
}

interface Template {
  id: string;
  name: string;
  description: string;
  type: "video" | "image";
  thumbnail: string;
  prompt: string;
  visualStyle: string;
  cameraAngle: string;
}

const videoTemplates: Template[] = [
  {
    id: "v1",
    name: "Luxury Atelier",
    description: "Intimate setting with golden hour lighting and graceful camera movement",
    type: "video",
    thumbnail: "🎬",
    prompt: "In an intimate atelier bathed in golden hour light, the product rests on polished Italian marble. Soft shadows dance across the surface as the camera gracefully orbits, revealing the exquisite craftsmanship and sophisticated details.",
    visualStyle: "luxury boutique",
    cameraAngle: "360 degree orbit",
  },
  {
    id: "v2",
    name: "Metropolitan Elegance",
    description: "Sleek metropolitan setting with refined lighting and purposeful camera work",
    type: "video",
    thumbnail: "🌆",
    prompt: "Against the backdrop of a sleek metropolitan setting, refined lighting illuminates the product with understated sophistication. The camera moves with purpose and grace, capturing the essence of modern luxury.",
    visualStyle: "premium studio",
    cameraAngle: "smooth glide",
  },
  {
    id: "v3",
    name: "Celestial Grace",
    description: "Ethereal suspended product with soft lighting and ballet-like camera movement",
    type: "video",
    thumbnail: "✨",
    prompt: "Suspended in an ethereal realm of soft pearl light, the product appears to float with graceful poise. Delicate light rays create an aura of sophistication as the camera performs a ballet-like movement around the piece.",
    visualStyle: "elegant showcase",
    cameraAngle: "360 degree orbit",
  },
  {
    id: "v4",
    name: "Artisan Reveal",
    description: "Close-up exploration of textures with slow reveal of complete product",
    type: "video",
    thumbnail: "🔍",
    prompt: "Beginning with an intimate exploration of luxurious textures and masterful details, the camera slowly unveils the complete vision. Each movement celebrates the artisanal quality and sophisticated design philosophy.",
    visualStyle: "premium studio",
    cameraAngle: "close-up reveal",
  },
];

const imageTemplates: Template[] = [
  {
    id: "i1",
    name: "Classic Studio",
    description: "Clean, professional studio shot with neutral background",
    type: "image",
    thumbnail: "📸",
    prompt: "Professional studio photograph of the product on a clean white background with soft, even lighting highlighting every detail and texture.",
    visualStyle: "",
    cameraAngle: "",
  },
  {
    id: "i2",
    name: "Lifestyle Luxury",
    description: "Product in elegant lifestyle setting",
    type: "image",
    thumbnail: "🏛️",
    prompt: "Elegant lifestyle photograph featuring the product in a sophisticated setting with warm ambient lighting, marble surfaces, and subtle luxury elements in soft focus background.",
    visualStyle: "luxury boutique",
    cameraAngle: "",
  },
  {
    id: "i3",
    name: "Dramatic Shadow",
    description: "High-contrast image with dramatic shadows",
    type: "image",
    thumbnail: "🌓",
    prompt: "Dramatic high-contrast photograph of the product with bold directional lighting creating striking shadows and highlights, emphasizing form and texture against a dark background.",
    visualStyle: "elegant showcase",
    cameraAngle: "",
  },
  {
    id: "i4",
    name: "Minimalist Modern",
    description: "Clean minimalist composition with subtle gradient",
    type: "image",
    thumbnail: "⚪",
    prompt: "Minimalist modern photograph featuring the product centered on a smooth gradient background, with soft diffused lighting creating gentle highlights and a serene, contemporary aesthetic.",
    visualStyle: "",
    cameraAngle: "",
  },
];

export default function CreateTab(props: CreateTabProps) {
  const [mode, setMode] = useState<CreateMode>("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<Template | null>(null);
  const [showImageGeneration, setShowImageGeneration] = useState(false);
  const [showImageChat, setShowImageChat] = useState(false);
  const { selectedProduct } = useProduct();

  const modes = [
    {
      id: "templates" as CreateMode,
      name: "Templates",
      icon: Wand2,
      description: "Quick start with pre-designed templates",
    },
    {
      id: "agent" as CreateMode,
      name: "AI Agent",
      icon: MessageSquare,
      description: "Chat with AI for custom creations",
    },
    {
      id: "advanced" as CreateMode,
      name: "Advanced",
      icon: Settings2,
      description: "Full manual control",
    },
  ];

  const handleTemplateSelect = (template: Template) => {
    // Show dialog for both image and video templates
    setPendingTemplate(template);
    setShowTemplateDialog(true);
  };

  const handleGenerateNow = () => {
    if (pendingTemplate) {
      setSelectedTemplate(pendingTemplate);
      
      if (pendingTemplate.type === 'image') {
        // Check if product is selected for image generation
        if (!selectedProduct) {
          alert('Please select a product from the Assets tab first');
          setShowTemplateDialog(false);
          setPendingTemplate(null);
          if (props.onNavigateToAssets) {
            props.onNavigateToAssets();
          }
          return;
        }
        // Show the VisualGeneration screen for images
        setShowImageGeneration(true);
        setShowTemplateDialog(false);
        setPendingTemplate(null);
      } else {
        // For videos, use the advanced mode as before
        props.setPrompt(pendingTemplate.prompt);
        props.setVisualStyle(pendingTemplate.visualStyle);
        props.setCameraAngle(pendingTemplate.cameraAngle);
        props.setShowImageTools(false);
        setMode("advanced");
        setShowTemplateDialog(false);
        setPendingTemplate(null);
      }
    }
  };

  const handleChatWithAgent = () => {
    if (pendingTemplate) {
      setSelectedTemplate(pendingTemplate);
      
      if (pendingTemplate.type === 'image') {
        // Check if product is selected for image generation
        if (!selectedProduct) {
          alert('Please select a product from the Assets tab first');
          setShowTemplateDialog(false);
          setPendingTemplate(null);
          if (props.onNavigateToAssets) {
            props.onNavigateToAssets();
          }
          return;
        }
        // Show the AgenticVisualChat screen for images
        setShowImageChat(true);
        setShowTemplateDialog(false);
        setPendingTemplate(null);
      } else {
        // For video templates, we can pre-fill the prompt in advanced mode
        // but switch to agent mode for refinement
        props.setPrompt(pendingTemplate.prompt);
        setMode("agent");
        setShowTemplateDialog(false);
        setPendingTemplate(null);
      }
    }
  };

  const renderTemplatesMode = () => {
    return (
      <div className="space-y-8">
        {/* Video Templates */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Video className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Video Templates</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {videoTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className="bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-purple-500 rounded-lg p-6 text-left transition-all group"
              >
                <div className="text-4xl mb-3">{template.thumbnail}</div>
                <h4 className="text-white font-medium mb-2 group-hover:text-purple-300 transition-colors">
                  {template.name}
                </h4>
                <p className="text-gray-400 text-sm line-clamp-2">
                  {template.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-purple-400 text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  Use Template
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Image Templates */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Image Templates</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {imageTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className="bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-blue-500 rounded-lg p-6 text-left transition-all group"
              >
                <div className="text-4xl mb-3">{template.thumbnail}</div>
                <h4 className="text-white font-medium mb-2 group-hover:text-blue-300 transition-colors">
                  {template.name}
                </h4>
                <p className="text-gray-400 text-sm line-clamp-2">
                  {template.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-blue-400 text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  Use Template
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Info */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-white font-medium mb-1">How Templates Work</h4>
              <p className="text-gray-400 text-sm">
                Select a template to auto-fill the prompt, style, and camera settings. 
                You can then customize the settings in Advanced mode before generating.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAgentMode = () => {
    if (!selectedProduct) {
      return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-2">No Product Selected</h3>
          <p className="text-gray-400 text-sm mb-6">
            Please select a product from the Assets tab first to use the AI Agent.
          </p>
          <button
            onClick={props.onNavigateToAssets}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Go to Assets
          </button>
        </div>
      );
    }

    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <AgenticVisualChat
          productName={selectedProduct.title}
          productDescription={selectedProduct.description}
          productImage={selectedProduct.image}
          onVisualSelected={(imageData, mimeType) => {
            // Handle visual selection
            console.log("Visual selected:", mimeType);
          }}
          onBack={() => setMode("templates")}
        />
      </div>
    );
  };

  const renderAdvancedMode = () => {
    return (
      <div>
        <PromptManagementTab {...props} />
        
        {/* Show generated video preview if available */}
        {props.videoUrl && (
          <div className="mt-6 bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-white font-medium mb-4">Generated Video Preview</h3>
            <video
              src={props.videoUrl}
              controls
              className="w-full max-w-2xl mx-auto rounded-lg"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Show VisualGeneration screen if active */}
      {showImageGeneration && selectedProduct ? (
        <VisualGeneration
          productName={selectedProduct.title}
          productDescription={selectedProduct.description}
          productImage={selectedProduct.image}
          onVisualSelected={(imageData, mimeType) => {
            console.log('Visual selected:', mimeType);
            // Handle visual selection - could save to library
          }}
          onBack={() => {
            setShowImageGeneration(false);
            setSelectedTemplate(null);
          }}
        />
      ) : showImageChat && selectedProduct ? (
        /* Show AgenticVisualChat screen if active */
        <AgenticVisualChat
          productName={selectedProduct.title}
          productDescription={selectedProduct.description}
          productImage={selectedProduct.image}
          onVisualSelected={(imageData, mimeType) => {
            console.log('Visual selected from chat:', mimeType);
            // Handle visual selection - could save to library
          }}
          onBack={() => {
            setShowImageChat(false);
            setSelectedTemplate(null);
          }}
        />
      ) : (
        /* Regular Create Tab UI */
        <>
          {/* Mode Selector */}
          <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
            <div className="flex items-center gap-2">
              {modes.map((m) => {
                const Icon = m.icon;
                const isActive = mode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                      ${
                        isActive
                          ? "bg-purple-600 text-white"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-750 hover:text-white"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{m.name}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-gray-400 text-sm mt-2">
              {modes.find((m) => m.id === mode)?.description}
            </p>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {mode === "templates" && renderTemplatesMode()}
            {mode === "agent" && renderAgentMode()}
            {mode === "advanced" && renderAdvancedMode()}
          </div>
        </>
      )}

      {/* Template Choice Dialog */}
      <Dialog.Root open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 rounded-lg shadow-xl border border-gray-700 p-6 w-full max-w-md z-50">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Dialog.Title className="text-xl font-semibold text-white mb-2">
                  {pendingTemplate?.name}
                </Dialog.Title>
                <Dialog.Description className="text-gray-400 text-sm">
                  How would you like to create this {pendingTemplate?.type === 'image' ? 'image' : 'video'}?
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            <div className="space-y-3 mt-6">
              <button
                onClick={handleGenerateNow}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-lg transition-all flex items-start gap-3 group"
              >
                <div className="bg-white/20 p-2 rounded-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold mb-1">Generate Now</div>
                  <div className="text-sm text-blue-100 opacity-90">
                    Use this template as-is and generate immediately
                  </div>
                </div>
              </button>

              <button
                onClick={handleChatWithAgent}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-4 rounded-lg transition-all flex items-start gap-3 group"
              >
                <div className="bg-white/20 p-2 rounded-lg">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold mb-1">Refine with AI Agent</div>
                  <div className="text-sm text-purple-100 opacity-90">
                    Customize and refine this template by chatting with AI
                  </div>
                </div>
              </button>

              <button
                onClick={() => setShowTemplateDialog(false)}
                className="w-full bg-gray-800 hover:bg-gray-750 text-gray-300 px-6 py-3 rounded-lg transition-all text-sm"
              >
                Cancel
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
