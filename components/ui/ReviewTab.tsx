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
        <div className="flex-1 flex items-center justify-center p-12 bg-gray-50">
          {!videoUrl &&
            (isGenerating ? (
              <div className="text-gray-600 select-none inline-flex items-center gap-4 text-xl">
                <Clock className="w-6 h-6 animate-spin" /> Generating Video...
              </div>
            ) : (
              <div className="text-center text-gray-500 select-none max-w-lg">
                <div className="text-9xl mb-8">🎬</div>
                <div className="text-3xl mb-6 font-medium text-gray-700">No video generated yet</div>
                <div className="text-lg leading-relaxed">Go to the Prompt tab to generate your first video</div>
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
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Generated Videos</h3>
          <p className="text-sm text-gray-600 mt-1">Recent generations</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {generatedVideos.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <div className="text-4xl mb-2">📽️</div>
              <p className="text-sm">No videos generated yet</p>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {generatedVideos.map((video, index) => (
                <div
                  key={video.id}
                  className={`p-3 border border-gray-200 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                    index === 0 ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => handleVideoSelect(video)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1">
                        {video.timestamp.toLocaleString()}
                        {index === 0 && <span className="ml-2 text-blue-600 font-medium">(Current)</span>}
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {video.prompt || 'No prompt available'}
                      </p>
                    </div>
                    
                    {video.rating && (
                      <div className="ml-2 flex-shrink-0">
                        {video.rating === 'up' ? (
                          <ThumbsUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <ThumbsDown className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  {index === 0 && video.rating && (
                    <div className={`mt-2 text-xs px-2 py-1 rounded-full inline-block ${
                      video.rating === 'up' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      Rated {video.rating === 'up' ? 'good' : 'not good'}
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
