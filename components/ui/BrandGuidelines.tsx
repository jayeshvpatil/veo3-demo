'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, Download, Eye, Trash2, Palette, Type, Lightbulb, AlertTriangle } from 'lucide-react';
import { useBrandGuidelines, BrandGuideline } from '@/contexts/BrandGuidelinesContext';

interface BrandGuidelinesProps {
  className?: string;
}

export default function BrandGuidelines({ className = '' }: BrandGuidelinesProps) {
  const { guidelines, addGuideline, removeGuideline, activeBrandGuideline, setActiveBrandGuideline } = useBrandGuidelines();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, []);

  const handleFiles = async (files: FileList) => {
    const file = files[0];
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    setUploading(true);
    
    try {
      // Create FormData to send file to API
      const formData = new FormData();
      formData.append('file', file);

      // Call the PDF extraction API
      const response = await fetch('/api/brand-guidelines/extract', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process PDF');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to extract brand guidelines');
      }

      const newGuideline: BrandGuideline = {
        id: Date.now().toString(),
        name: file.name,
        file: file,
        uploadDate: new Date(),
        extractedGuidelines: result.guidelines
      };
      
      addGuideline(newGuideline);
      setUploading(false);
      
      // Show success message
      console.log('Successfully extracted brand guidelines:', result.guidelines);
      
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert(error instanceof Error ? error.message : 'Failed to process PDF. Please try again.');
      setUploading(false);
    }
  };

  const handleRemoveGuideline = (id: string) => {
    removeGuideline(id);
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`h-full flex bg-slate-900 ${className}`}>
      {/* Guidelines List */}
      <div className="w-1/3 bg-slate-800 border-r border-slate-700 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-semibold text-white mb-2">Brand Guidelines</h2>
          <p className="text-slate-300 text-sm">
            Upload PDF brand guidelines to ensure consistent visual generation
          </p>
        </div>

        {/* Upload Area */}
        <div className="p-6">
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
              ${dragActive 
                ? 'border-blue-400 bg-blue-50/5' 
                : 'border-slate-600 hover:border-slate-500'
              }
              ${uploading ? 'opacity-50 pointer-events-none' : ''}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />
            
            {uploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
                <p className="text-slate-300">Extracting PDF content...</p>
                <p className="text-slate-400 text-sm mt-1">Analyzing with Gemini 2.5 Flash</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="h-8 w-8 text-slate-400 mb-3" />
                <p className="text-slate-300 mb-1">Drop PDF here or click to upload</p>
                <p className="text-slate-400 text-sm">Brand guidelines in PDF format</p>
              </div>
            )}
          </div>

          <button
            onClick={onButtonClick}
            disabled={uploading}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Choose PDF File
          </button>
        </div>

        {/* Guidelines List */}
        <div className="flex-1 overflow-y-auto p-6 pt-0">
          <div className="space-y-3">
            {guidelines.map((guideline) => (
              <div
                key={guideline.id}
                className={`
                  p-4 rounded-lg border cursor-pointer transition-all
                  ${activeBrandGuideline?.id === guideline.id
                    ? 'border-blue-500 bg-blue-600/10'
                    : 'border-slate-600 bg-slate-700/50 hover:bg-slate-700'
                  }
                `}
                onClick={() => setActiveBrandGuideline(guideline)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <FileText className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-sm font-medium truncate">
                        {guideline.name}
                      </h4>
                      <p className="text-slate-400 text-xs mt-1">
                        {guideline.uploadDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveGuideline(guideline.id);
                    }}
                    className="text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {guidelines.length === 0 && !uploading && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No brand guidelines uploaded</p>
                <p className="text-slate-500 text-sm mt-1">Upload a PDF to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Guidelines Details */}
      <div className="flex-1 flex flex-col">
        {activeBrandGuideline ? (
          <>
            {/* Header */}
            <div className="bg-slate-800 border-b border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {activeBrandGuideline.name}
                  </h3>
                  <p className="text-slate-300 mt-1">
                    Uploaded on {activeBrandGuideline.uploadDate.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                    <Eye className="h-4 w-4" />
                    Preview
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>
              </div>
            </div>

            {/* Extracted Guidelines */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl space-y-6">
                {/* Colors */}
                <div className="bg-slate-800 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Palette className="h-5 w-5 text-blue-400" />
                    <h4 className="text-lg font-semibold text-white">Brand Colors</h4>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {activeBrandGuideline.extractedGuidelines.colors.map((color, index) => (
                      <div key={index} className="text-center">
                        <div
                          className="w-16 h-16 rounded-lg border border-slate-600 mb-2"
                          style={{ backgroundColor: color }}
                        ></div>
                        <p className="text-slate-300 text-sm font-mono">{color}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Typography */}
                <div className="bg-slate-800 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Type className="h-5 w-5 text-green-400" />
                    <h4 className="text-lg font-semibold text-white">Typography</h4>
                  </div>
                  <div className="space-y-2">
                    {activeBrandGuideline.extractedGuidelines.fonts.map((font, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-slate-300">{font}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Style Guidelines */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-slate-800 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Lightbulb className="h-5 w-5 text-yellow-400" />
                      <h4 className="text-lg font-semibold text-white">Tone & Voice</h4>
                    </div>
                    <p className="text-slate-300">
                      {activeBrandGuideline.extractedGuidelines.tone}
                    </p>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Eye className="h-5 w-5 text-purple-400" />
                      <h4 className="text-lg font-semibold text-white">Visual Style</h4>
                    </div>
                    <p className="text-slate-300">
                      {activeBrandGuideline.extractedGuidelines.style}
                    </p>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Lightbulb className="h-5 w-5 text-orange-400" />
                      <h4 className="text-lg font-semibold text-white">Lighting</h4>
                    </div>
                    <p className="text-slate-300">
                      {activeBrandGuideline.extractedGuidelines.lighting}
                    </p>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Eye className="h-5 w-5 text-cyan-400" />
                      <h4 className="text-lg font-semibold text-white">Composition</h4>
                    </div>
                    <p className="text-slate-300">
                      {activeBrandGuideline.extractedGuidelines.composition}
                    </p>
                  </div>

                  {/* Brand Rules */}
                  {activeBrandGuideline.extractedGuidelines.rules && activeBrandGuideline.extractedGuidelines.rules.length > 0 && (
                    <div className="bg-slate-800 rounded-lg p-6 border border-red-900/30">
                      <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                        <h4 className="text-lg font-semibold text-white">Strict Brand Rules</h4>
                      </div>
                      <div className="space-y-3">
                        {activeBrandGuideline.extractedGuidelines.rules.map((rule, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                            <p className="text-slate-300 text-sm leading-relaxed">{rule}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Guidelines Selected</h3>
              <p className="text-slate-400">
                Select a brand guideline from the left panel to view details
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}