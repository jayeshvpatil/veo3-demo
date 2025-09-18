"use client";

import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, Download, Clock, RotateCcw } from "lucide-react";
import VideoPlayer from "./VideoPlayer";

interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
  rating?: 'up' | 'down' | null;
  blob?: Blob;
}

interface ReviewTabProps {
  videoUrl: string | null;
  isGenerating: boolean;
  onOutputChanged?: (blob: Blob) => void;
  onDownload?: () => void;
  onResetTrim?: () => void;
  prompt: string;
  className?: string;
}

export default function ReviewTab({
  videoUrl,
  isGenerating,
  onOutputChanged,
  onDownload,
  onResetTrim,
  prompt,
  className = "",
}: ReviewTabProps) {
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [currentRating, setCurrentRating] = useState<'up' | 'down' | null>(null);

  // Add current video to history when it's generated
  React.useEffect(() => {
    if (videoUrl && prompt) {
      const newVideo: GeneratedVideo = {
        id: Date.now().toString(),
        url: videoUrl,
        prompt: prompt,
        timestamp: new Date(),
        rating: null,
      };
      
      setGeneratedVideos(prev => [newVideo, ...prev.slice(0, 9)]); // Keep last 10 videos
      setCurrentRating(null);
    }
  }, [videoUrl, prompt]);

  const handleRating = (rating: 'up' | 'down') => {
    setCurrentRating(prevRating => prevRating === rating ? null : rating);
    
    // Update the current video in history
    setGeneratedVideos(prev => 
      prev.map((video, index) => 
        index === 0 ? { ...video, rating: currentRating === rating ? null : rating } : video
      )
    );
  };

  const handleVideoSelect = (video: GeneratedVideo) => {
    // This would ideally reload the video in the player
    // For now, we'll just show a message
    alert(`Selected video from ${video.timestamp.toLocaleString()}`);
  };

  return (
    <div className={`h-full flex ${className}`}>
      {/* Main Video Display */}
      <div className="flex-1 flex flex-col">
        {/* Video Content */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100/50">
          {!videoUrl &&
            (isGenerating ? (
              <div className="text-center">
                <div className="relative">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                    <Clock className="w-10 h-10 text-white animate-spin" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-200 rounded-full animate-ping opacity-75"></div>
                  <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-200 rounded-full animate-pulse opacity-75"></div>
                </div>
                <div className="text-gray-700 text-xl font-medium mb-2">Creating Your Video</div>
                <div className="text-gray-500">This may take a few moments...</div>
              </div>
            ) : (
              <div className="text-center max-w-md">
                <div className="relative mb-8">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl flex items-center justify-center transform rotate-3 shadow-lg">
                    <div className="text-6xl">🎬</div>
                  </div>
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-purple-200 rounded-full opacity-60"></div>
                  <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-200 rounded-full opacity-60"></div>
                </div>
                
                <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                  Ready to Create Magic?
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Select a product and generate stunning visuals to bring your creative vision to life.
                </p>
                
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Choose a product</span>
                    <div className="w-8 h-px bg-gray-300"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Create visual</span>
                    <div className="w-8 h-px bg-gray-300"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Generate video</span>
                  </div>
                </div>
              </div>
            ))}
          {videoUrl && (
            <div className="w-full max-w-6xl">
              <VideoPlayer
                src={videoUrl}
                onOutputChanged={onOutputChanged}
                onDownload={onDownload}
                onResetTrim={onResetTrim}
              />
            </div>
          )}
        </div>

        {/* Rating Controls */}
        {videoUrl && !isGenerating && (
          <div className="bg-white border-t border-gray-200 p-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Rate this video</h3>
                  <p className="text-gray-600 text-sm">Your feedback helps improve future generations</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleRating('down')}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      currentRating === 'down'
                        ? 'bg-red-50 border-red-300 text-red-700'
                        : 'border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600'
                    }`}
                  >
                    <ThumbsDown className="w-5 h-5" />
                    <span className="font-medium">Not Good</span>
                  </button>
                  
                  <button
                    onClick={() => handleRating('up')}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      currentRating === 'up'
                        ? 'bg-green-50 border-green-300 text-green-700'
                        : 'border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-600'
                    }`}
                  >
                    <ThumbsUp className="w-5 h-5" />
                    <span className="font-medium">Good</span>
                  </button>
                  
                  {onDownload && (
                    <button
                      onClick={onDownload}
                      className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      <span className="font-medium">Download</span>
                    </button>
                  )}
                </div>
              </div>

              {currentRating && (
                <div className="mt-4 p-4 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-700">
                    {currentRating === 'up' 
                      ? "✨ Great! Your positive feedback has been recorded."
                      : "📝 Thanks for the feedback. This will help us improve the AI model."
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Video History Sidebar */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            Generated Videos
            {generatedVideos.length > 0 && (
              <span className="text-xs font-normal bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                {generatedVideos.length}
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-600 mt-1">Recent generations</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {generatedVideos.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                <div className="text-2xl">📽️</div>
              </div>
              <p className="text-sm text-gray-600 mb-2">No videos generated yet</p>
              <p className="text-xs text-gray-500">Your generated videos will appear here</p>
            </div>
          ) : (
            <div className="space-y-3 p-4">
              {generatedVideos.map((video, index) => (
                <div
                  key={video.id}
                  className={`group p-3 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-sm ${
                    index === 0 
                      ? 'bg-purple-50/50 border-purple-200 shadow-sm' 
                      : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                  onClick={() => handleVideoSelect(video)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        index === 0 ? 'bg-purple-500' : 'bg-gray-300'
                      }`} />
                      <p className="text-xs text-gray-500">
                        {video.timestamp.toLocaleString()}
                      </p>
                    </div>
                    
                    {video.rating && (
                      <div className="flex-shrink-0">
                        {video.rating === 'up' ? (
                          <ThumbsUp className="w-3 h-3 text-green-600" />
                        ) : (
                          <ThumbsDown className="w-3 h-3 text-red-600" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  {index === 0 && (
                    <div className="text-xs font-medium text-purple-700 mb-2 flex items-center gap-1">
                      <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse" />
                      Current video
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                    {video.prompt || 'No prompt available'}
                  </p>
                  
                  {video.rating && (
                    <div className={`mt-2 text-xs px-2 py-1 rounded-lg inline-block font-medium ${
                      video.rating === 'up' 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {video.rating === 'up' ? '👍 Good' : '👎 Needs work'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {generatedVideos.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => setGeneratedVideos([])}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Clear History
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
