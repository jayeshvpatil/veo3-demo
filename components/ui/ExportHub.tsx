import React, { useState } from 'react';
import { 
  Download, 
  Share2, 
  FileVideo, 
  Image as ImageIcon, 
  Film,
  Monitor,
  Smartphone,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  Link,
  Check,
  Settings
} from 'lucide-react';
import { Button } from './RadixButton';
import { Input } from './RadixInput';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './RadixCard';
import { cn } from '@/lib/cn';

interface ExportFormat {
  id: string;
  name: string;
  extension: string;
  description: string;
  icon: React.ComponentType<any>;
}

interface Resolution {
  id: string;
  label: string;
  width: number;
  height: number;
  description: string;
}

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
}

interface ExportHubProps {
  projectName: string;
  onExport: (config: ExportConfig) => void;
  onShare: (platform: string) => void;
  isExporting?: boolean;
}

interface ExportConfig {
  format: string;
  resolution: string;
  quality: string;
  filename: string;
}

const ExportHub: React.FC<ExportHubProps> = ({
  projectName,
  onExport,
  onShare,
  isExporting = false
}) => {
  const [selectedFormat, setSelectedFormat] = useState('mp4');
  const [selectedResolution, setSelectedResolution] = useState('1080p');
  const [selectedQuality, setSelectedQuality] = useState('high');
  const [customFilename, setCustomFilename] = useState(projectName || 'My Awesome Video');

  const formats: ExportFormat[] = [
    {
      id: 'mp4',
      name: 'MP4',
      extension: '.mp4',
      description: 'Best for general use and social media',
      icon: FileVideo
    },
    {
      id: 'gif',
      name: 'GIF',
      extension: '.gif',
      description: 'Perfect for short clips and previews',
      icon: ImageIcon
    },
    {
      id: 'mov',
      name: 'MOV',
      extension: '.mov',
      description: 'High quality for professional use',
      icon: Film
    }
  ];

  const resolutions: Resolution[] = [
    {
      id: '1080p',
      label: '1080p',
      width: 1920,
      height: 1080,
      description: 'Full HD - Perfect for most platforms'
    },
    {
      id: '720p',
      label: '720p',
      width: 1280,
      height: 720,
      description: 'HD - Smaller file size'
    },
    {
      id: '480p',
      label: '480p',
      width: 854,
      height: 480,
      description: 'SD - Fastest export'
    }
  ];

  const socialPlatforms: SocialPlatform[] = [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      description: 'Share on Instagram',
      color: 'text-pink-600'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      description: 'Share on Facebook',
      color: 'text-blue-600'
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      description: 'Share on Twitter',
      color: 'text-sky-500'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: Youtube,
      description: 'Share on YouTube',
      color: 'text-red-600'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      description: 'Share on LinkedIn',
      color: 'text-blue-700'
    },
    {
      id: 'copy-link',
      name: 'Copy Link',
      icon: Link,
      description: 'Copy link to share',
      color: 'text-gray-600'
    }
  ];

  const handleExport = () => {
    onExport({
      format: selectedFormat,
      resolution: selectedResolution,
      quality: selectedQuality,
      filename: customFilename
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Export your creative</h1>
        <p className="text-gray-600">Choose your preferred format, resolution, and sharing options.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Export Configuration */}
        <div className="space-y-6">
          {/* Creative Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Creative name
            </label>
            <Input
              value={customFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
              placeholder="Enter creative name"
            />
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              {formats.map(format => {
                const Icon = format.icon;
                return (
                  <Card
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      selectedFormat === format.id
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'hover:border-gray-300'
                    )}
                  >
                    <CardContent className="p-4 text-center">
                      <Icon className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                      <CardTitle className="text-sm">{format.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {format.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Resolution Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Resolution
            </label>
            <div className="space-y-2">
              {resolutions.map(resolution => (
                <Card
                  key={resolution.id}
                  onClick={() => setSelectedResolution(resolution.id)}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    selectedResolution === resolution.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'hover:border-gray-300'
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm">{resolution.label}</CardTitle>
                        <CardDescription className="text-xs">
                          {resolution.width} × {resolution.height}
                        </CardDescription>
                      </div>
                      <CardDescription className="text-xs">
                        {resolution.description}
                      </CardDescription>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={isExporting}
            variant="primary"
            size="lg"
            className="w-full"
          >
            {isExporting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                <span>Export</span>
              </>
            )}
          </Button>
        </div>

        {/* Sharing Options */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Share</h2>
          <div className="grid grid-cols-2 gap-3">
            {socialPlatforms.map(platform => {
              const Icon = platform.icon;
              return (
                <Card
                  key={platform.id}
                  onClick={() => onShare(platform.id)}
                  className="cursor-pointer hover:shadow-md transition-all hover:scale-105"
                >
                  <CardContent className="flex flex-col items-center p-6">
                    <div className="w-12 h-12 flex items-center justify-center mb-3">
                      <Icon className={cn("w-8 h-8", platform.color)} />
                    </div>
                    <CardTitle className="text-sm text-center">{platform.name}</CardTitle>
                    <CardDescription className="text-xs text-center mt-1">
                      {platform.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Advanced Settings */}
          <Card className="mt-6 bg-gray-50">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-gray-600" />
                <CardTitle className="text-sm">Advanced Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Quality</label>
                <select
                  value={selectedQuality}
                  onChange={(e) => setSelectedQuality(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="high">High Quality</option>
                  <option value="medium">Medium Quality</option>
                  <option value="low">Low Quality (Faster)</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExportHub;