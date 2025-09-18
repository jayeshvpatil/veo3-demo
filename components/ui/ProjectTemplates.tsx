import React, { useState } from 'react';
import { 
  Play, 
  Image, 
  BarChart3, 
  GraduationCap, 
  Megaphone, 
  Building2,
  Sparkles,
  Clock,
  Users
} from 'lucide-react';
import { Button } from './RadixButton';
import { Input } from './RadixInput';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './RadixCard';
import { cn } from '@/lib/cn';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'product' | 'marketing' | 'educational' | 'corporate' | 'social';
  duration: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  previewImage?: string;
}

interface ProjectTemplatesProps {
  onTemplateSelect: (template: Template) => void;
  onCustomProject: () => void;
}

const ProjectTemplates: React.FC<ProjectTemplatesProps> = ({
  onTemplateSelect,
  onCustomProject
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const templates: Template[] = [
    {
      id: 'product-demo',
      name: 'Product Demo',
      description: 'Showcase product features with dynamic visuals and compelling narration',
      icon: Play,
      category: 'product',
      duration: '30-60s',
      complexity: 'beginner'
    },
    {
      id: 'explainer-video',
      name: 'Explainer Video',
      description: 'Break down complex concepts into engaging, easy-to-understand content',
      icon: GraduationCap,
      category: 'educational',
      duration: '60-120s',
      complexity: 'intermediate'
    },
    {
      id: 'social-media-ad',
      name: 'Social Media Ad',
      description: 'Create thumb-stopping content optimized for social platforms',
      icon: Megaphone,
      category: 'marketing',
      duration: '15-30s',
      complexity: 'beginner'
    },
    {
      id: 'educational-content',
      name: 'Educational Content',
      description: 'Develop comprehensive learning materials with structured information flow',
      icon: GraduationCap,
      category: 'educational',
      duration: '120-300s',
      complexity: 'advanced'
    },
    {
      id: 'marketing-campaign',
      name: 'Marketing Campaign',
      description: 'Multi-format campaign content for integrated marketing strategies',
      icon: BarChart3,
      category: 'marketing',
      duration: '30-90s',
      complexity: 'intermediate'
    },
    {
      id: 'corporate-presentation',
      name: 'Corporate Presentation',
      description: 'Professional presentations for business communications and reporting',
      icon: Building2,
      category: 'corporate',
      duration: '180-600s',
      complexity: 'advanced'
    }
  ];

  const categories = [
    { id: 'all', label: 'All templates', count: templates.length },
    { id: 'product', label: 'Product display', count: templates.filter(t => t.category === 'product').length },
    { id: 'marketing', label: 'Marketing', count: templates.filter(t => t.category === 'marketing').length },
    { id: 'social', label: 'Social media', count: templates.filter(t => t.category === 'social').length },
    { id: 'educational', label: 'Educational', count: templates.filter(t => t.category === 'educational').length },
    { id: 'corporate', label: 'Corporate', count: templates.filter(t => t.category === 'corporate').length }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getComplexityColor = (complexity: Template['complexity']) => {
    switch (complexity) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Start a new project</h1>
        <p className="text-gray-600">Choose from our templates or start from scratch</p>
      </div>

      {/* Custom Project Option */}
      <div className="mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-xl">Start with a prompt</CardTitle>
            <CardDescription>Describe the video you want to create and let AI guide you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <textarea
                  placeholder="Describe the video you want to create..."
                  className="w-full p-4 border border-gray-200 rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button
                onClick={onCustomProject}
                variant="primary"
                size="lg"
                className="self-end"
              >
                Generate
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Template Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Start with a template</h2>
        <p className="text-gray-600 mb-6">Create videos faster with beautiful, pre-made templates.</p>

        {/* Category Filter */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {categories.map(category => (
            <Button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              variant={selectedCategory === category.id ? "primary" : "outline"}
              className="whitespace-nowrap"
            >
              {category.label}
              <span className="ml-2 text-sm opacity-75">({category.count})</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => {
          const Icon = template.icon;
          
          return (
            <Card
              key={template.id}
              onClick={() => onTemplateSelect(template)}
              className="hover:shadow-lg transition-all cursor-pointer group hover:scale-105 hover:border-blue-300"
            >
              {/* Template Preview */}
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-gray-600" />
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    getComplexityColor(template.complexity)
                  )}>
                    {template.complexity}
                  </span>
                </div>
              </div>

              <CardContent className="p-4">
                <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
                <CardDescription className="mb-3 line-clamp-2">
                  {template.description}
                </CardDescription>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{template.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span className="capitalize">{template.category}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600">Try adjusting your search or category filter</p>
        </div>
      )}
    </div>
  );
};

export default ProjectTemplates;