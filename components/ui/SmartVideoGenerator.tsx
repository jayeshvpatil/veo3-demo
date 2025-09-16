import React, { useState } from 'react';
import QuotaMonitor from './QuotaMonitor';

interface SmartVideoGeneratorProps {
  onVideoGenerated?: (result: any) => void;
  className?: string;
}

export default function SmartVideoGenerator({ onVideoGenerated, className = '' }: SmartVideoGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Advanced options
  const [costPriority, setCostPriority] = useState<'lowest' | 'balanced' | 'quality'>('balanced');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [budget, setBudget] = useState<'low' | 'medium' | 'high'>('medium');
  const [style, setStyle] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a video prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);
    setGenerationProgress({ phase: 'analysis', message: 'AI agents analyzing your request...' });

    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('costPriority', costPriority);
      formData.append('urgency', urgency);
      formData.append('budget', budget);
      if (style) formData.append('style', style);
      if (imageFile) formData.append('imageFile', imageFile);

      setGenerationProgress({ phase: 'generation', message: 'Generating video with optimal provider...' });

      const response = await fetch('/api/smart-video', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      setResult(data);
      setGenerationProgress({ phase: 'complete', message: 'Video generated successfully!' });

      if (onVideoGenerated) {
        onVideoGenerated(data);
      }

    } catch (err: any) {
      console.error('Smart video generation error:', err);
      setError(err.message);
      setGenerationProgress(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const getCostIcon = (level: string) => {
    switch (level) {
      case 'lowest': return '💰';
      case 'balanced': return '⚖️';
      case 'quality': return '✨';
      default: return '🎯';
    }
  };

  const getUrgencyIcon = (level: string) => {
    switch (level) {
      case 'low': return '🐌';
      case 'medium': return '🏃';
      case 'high': return '🚀';
      default: return '⏱️';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">🤖 Smart AI Video Generator</h2>
        <QuotaMonitor className="text-sm" />
      </div>

      {/* Prompt Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Video Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the video you want to generate..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          disabled={isGenerating}
        />
      </div>

      {/* Image Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reference Image (Optional)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isGenerating}
        />
        {imageFile && (
          <p className="text-sm text-gray-600 mt-1">
            Selected: {imageFile.name}
          </p>
        )}
      </div>

      {/* Quick Options */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cost Priority
          </label>
          <select
            value={costPriority}
            onChange={(e) => setCostPriority(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isGenerating}
          >
            <option value="lowest">{getCostIcon('lowest')} Lowest Cost</option>
            <option value="balanced">{getCostIcon('balanced')} Balanced</option>
            <option value="quality">{getCostIcon('quality')} Best Quality</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Urgency
          </label>
          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isGenerating}
          >
            <option value="low">{getUrgencyIcon('low')} Low</option>
            <option value="medium">{getUrgencyIcon('medium')} Medium</option>
            <option value="high">{getUrgencyIcon('high')} High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Budget
          </label>
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isGenerating}
          >
            <option value="low">💸 Low</option>
            <option value="medium">💳 Medium</option>
            <option value="high">💎 High</option>
          </select>
        </div>
      </div>

      {/* Advanced Options */}
      <div className="mb-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          {showAdvanced ? '▼' : '▶'} Advanced Options
        </button>
        
        {showAdvanced && (
          <div className="mt-3 p-4 bg-gray-50 rounded-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Style (Optional)
              </label>
              <input
                type="text"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="e.g., cinematic, anime, photorealistic"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isGenerating}
              />
            </div>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
          isGenerating || !prompt.trim()
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isGenerating ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            {generationProgress?.message || 'Generating...'}
          </div>
        ) : (
          '🎬 Generate Smart Video'
        )}
      </button>

      {/* Progress */}
      {generationProgress && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center">
            <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm text-blue-700">{generationProgress.message}</span>
          </div>
          
          {generationProgress.phase === 'analysis' && (
            <div className="mt-2 text-xs text-blue-600">
              ✓ Analyzing prompt with 6 AI agents<br/>
              ✓ Optimizing for cost and quality<br/>
              ✓ Selecting best provider
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">❌</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Generation Failed</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Success Result */}
      {result && result.success && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-green-400">✅</span>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-green-800">Video Generated Successfully!</h3>
              
              <div className="mt-2 grid grid-cols-2 gap-4 text-xs text-green-700">
                <div>
                  <strong>Provider:</strong> {result.provider}<br/>
                  <strong>Cost:</strong> ${result.cost?.toFixed(3) || 'N/A'}<br/>
                  <strong>Confidence:</strong> {Math.round((result.analysisResults?.confidence || 0) * 100)}%
                </div>
                <div>
                  <strong>Optimizations:</strong><br/>
                  {result.optimizations?.promptEnhanced && '✓ Prompt enhanced<br/>'}
                  {result.optimizations?.costSavings && `✓ ${result.optimizations.costSavings}<br/>`}
                  {result.usedFallback && '⚠️ Used fallback provider'}
                </div>
              </div>

              {result.videoUrl && (
                <div className="mt-3">
                  <video 
                    src={result.videoUrl} 
                    controls 
                    className="w-full max-w-md rounded-md"
                    autoPlay
                    muted
                  />
                </div>
              )}

              {result.analysisResults?.suggestions && result.analysisResults.suggestions.length > 0 && (
                <div className="mt-3">
                  <details className="text-xs">
                    <summary className="cursor-pointer font-medium">AI Insights ({result.analysisResults.suggestions.length})</summary>
                    <div className="mt-1 space-y-1">
                      {result.analysisResults.suggestions.slice(0, 3).map((suggestion: any, index: number) => (
                        <div key={index} className="text-green-600">
                          • {suggestion.title}: {suggestion.description}
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}