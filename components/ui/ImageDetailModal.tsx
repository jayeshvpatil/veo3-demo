"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Tag, Sparkles, Loader2 } from "lucide-react";

interface Visual {
  id: string;
  url: string;
  prompt?: string | null;
  tags?: string | null;
  aiTags?: string | null;
  aiDescription?: string | null;
  createdAt?: Date;
  timestamp?: number;
  project?: { name: string } | null;
  collection?: { name: string } | null;
  collections?: { name: string }[];
}

interface ImageDetailModalProps {
  visual: Visual | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

export default function ImageDetailModal({
  visual,
  open,
  onOpenChange,
  onUpdate
}: ImageDetailModalProps) {
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiTags, setAiTags] = useState("");
  const [aiDescription, setAiDescription] = useState("");

  useEffect(() => {
    if (visual) {
      // Parse comma-separated tags into array
      const tagsArray = visual.tags 
        ? visual.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
        : [];
      setTagsList(tagsArray);
      setNewTagInput("");
      setAiTags(visual.aiTags || "");
      setAiDescription(visual.aiDescription || "");
    }
  }, [visual]);

  const addTag = () => {
    const tag = newTagInput.trim();
    if (tag && !tagsList.includes(tag)) {
      setTagsList([...tagsList, tag]);
      setNewTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTagsList(tagsList.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSaveTags = async () => {
    if (!visual) return;

    setIsSaving(true);
    try {
      const tagsString = tagsList.join(', ');
      const response = await fetch("/api/visuals/update-tags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visualId: visual.id,
          tags: tagsString || null
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to save tags");
      }

      // Update local state with the new tags
      if (data.visual) {
        // Trigger parent refresh
        await onUpdate?.();
      }
    } catch (error) {
      console.error("Error saving tags:", error);
      alert(error instanceof Error ? error.message : "Failed to save tags");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateAITags = async () => {
    if (!visual) return;

    setIsGeneratingTags(true);
    try {
      const response = await fetch("/api/visuals/ai-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visualId: visual.id,
          imageUrl: visual.url
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate AI tags");
      }

      setAiTags(data.aiTags || "");
      setAiDescription(data.aiDescription || "");
      
      // Trigger parent refresh
      await onUpdate?.();
    } catch (error) {
      console.error("Error generating AI tags:", error);
      alert(error instanceof Error ? error.message : "Failed to generate AI tags");
    } finally {
      setIsGeneratingTags(false);
    }
  };

  if (!visual) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] max-w-6xl w-[95vw] max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
              Image Details
            </Dialog.Title>
            <Dialog.Close className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image Preview */}
              <div className="space-y-4">
                <div className="aspect-square bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                  <img
                    src={visual.url}
                    alt={visual.prompt || "Generated image"}
                    className="w-full h-full object-contain"
                  />
                </div>
                
                {/* Metadata */}
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  {visual.project && (
                    <div>
                      <span className="font-medium">Project:</span> {visual.project.name}
                    </div>
                  )}
                  {visual.collection && (
                    <div>
                      <span className="font-medium">Collection:</span> {visual.collection.name}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Created:</span>{" "}
                    {visual.createdAt 
                      ? new Date(visual.createdAt).toLocaleDateString()
                      : visual.timestamp 
                        ? new Date(visual.timestamp).toLocaleDateString()
                        : 'Unknown'
                    }
                  </div>
                  {visual.prompt && (
                    <div>
                      <span className="font-medium">Prompt:</span>
                      <p className="mt-1 text-gray-900 dark:text-white">{visual.prompt}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags Section */}
              <div className="space-y-6">
                {/* Manual Tags */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      Manual Tags
                    </label>
                  </div>
                  
                  {/* Display existing tags */}
                  {tagsList.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      {tagsList.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 rounded text-xs"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="hover:bg-blue-200 dark:hover:bg-blue-700 rounded-full p-0.5 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Input for new tag */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a tag and press Enter..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={addTag}
                      disabled={!newTagInput.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      Add
                    </button>
                  </div>
                  
                  {/* Save button */}
                  {tagsList.length > 0 && (
                    <button
                      onClick={handleSaveTags}
                      disabled={isSaving}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Tags"
                      )}
                    </button>
                  )}
                </div>

                {/* AI Tags */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <label className="text-sm font-medium text-gray-900 dark:text-white">
                        AI-Generated Tags
                      </label>
                    </div>
                    <button
                      onClick={handleGenerateAITags}
                      disabled={isGeneratingTags}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      {isGeneratingTags ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3" />
                          Generate
                        </>
                      )}
                    </button>
                  </div>
                  
                  {aiTags ? (
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                      <div className="flex flex-wrap gap-2">
                        {aiTags.split(',').map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-100 rounded text-xs"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-400">
                      No AI tags generated yet. Click "Generate" to analyze this image.
                    </div>
                  )}
                </div>

                {/* AI Description */}
                {aiDescription && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <label className="text-sm font-medium text-gray-900 dark:text-white">
                        AI Description
                      </label>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                      {aiDescription}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
