import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { Send, Bot, User, Download, Check, Loader2, MessageCircle, Zap } from 'lucide-react';
import { useProduct } from '../../contexts/ProductContext';

interface AgenticVisualChatProps {
  productName: string;
  productDescription?: string;
  productImage?: string;
  onVisualSelected: (imageData: string, mimeType: string) => void;
  onBack: () => void;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  visuals?: GeneratedVisual[];
  isGenerating?: boolean;
}

interface GeneratedVisual {
  data: string;
  mimeType: string;
  description?: string;
  imageUrl?: string;
}

const agentPersonalities = [
  {
    id: 'creative',
    name: 'Creative Director',
    icon: '🎨',
    description: 'Focuses on artistic composition and brand aesthetics',
    style: 'artistic and brand-focused'
  },
  {
    id: 'photographer',
    name: 'Product Photographer',
    icon: '📸',
    description: 'Expert in lighting, angles, and technical photography',
    style: 'technically precise and professional'
  },
  {
    id: 'marketer',
    name: 'Marketing Specialist',
    icon: '📈',
    description: 'Optimizes visuals for conversion and engagement',
    style: 'conversion-focused and platform-optimized'
  }
];

export function AgenticVisualChat({ productName, productDescription, productImage, onVisualSelected, onBack }: AgenticVisualChatProps) {
  const { saveVisualToLibrary } = useProduct();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(agentPersonalities[0]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'agent',
      content: `Hi! I'm your ${selectedAgent.name} 👋 I'll help you create stunning visuals for "${productName}". 

I can see the product image and will use it as reference for creating new visuals. Tell me what kind of visual you'd like to create! You can say things like:

• "Create a luxury product shot with dramatic lighting"
• "Show it in a lifestyle setting for Instagram"
• "Make it look premium for an e-commerce listing"
• "I want something more artistic and creative"
• "Make it brighter with better contrast"
• "Change the background to something more elegant"

I'll remember our conversation and can make iterative improvements based on your feedback. What's your vision?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [productName, selectedAgent]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateVisualFromPrompt = async (userPrompt: string) => {
    try {
      // Use the new chat API instead of the visuals generate API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage: userPrompt,
          conversationHistory: messages,
          productName,
          productDescription,
          productImage, // Pass the product image for multimodal processing
          agentPersonality: selectedAgent,
          previouslyGeneratedImages: messages
            .filter(m => m.visuals && m.visuals.length > 0)
            .flatMap(m => m.visuals || [])
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.images && result.images.length > 0) {
        const visuals: GeneratedVisual[] = result.images.map((img: { data: string; mimeType: string }) => ({
          data: img.data,
          mimeType: img.mimeType,
          description: result.response,
          imageUrl: undefined // Chat API returns base64 only
        }));

        return visuals;
      } else {
        throw new Error('No images generated');
      }
    } catch (error) {
      console.error('Error generating visual:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsGenerating(true);

    // Add generating message
    const generatingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'agent',
      content: `Perfect! I'm creating a ${selectedAgent.style} visual based on your request. This will take just a moment...`,
      timestamp: new Date(),
      isGenerating: true
    };

    setMessages(prev => [...prev, generatingMessage]);

    try {
      // Build conversation context
      const visuals = await generateVisualFromPrompt(userMessage.content);

      // Remove generating message and add result
      setMessages(prev => {
        const withoutGenerating = prev.filter(m => m.id !== generatingMessage.id);
        
        // Check if this is a modification of existing visual
        const hasExistingVisuals = messages.some(m => m.visuals && m.visuals.length > 0);
        const isModification = hasExistingVisuals && (
          userMessage.content.toLowerCase().includes('make it') ||
          userMessage.content.toLowerCase().includes('change') ||
          userMessage.content.toLowerCase().includes('modify') ||
          userMessage.content.toLowerCase().includes('adjust')
        );
        
        const resultMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          type: 'agent',
          content: `Great! I've ${isModification ? 'modified the previous visual' : 'created a new visual'} based on your request. Here's what I came up with:

${isModification ? 
  'This version builds upon the previous image with your requested changes.' : 
  'This is created using the original product image as reference.'}

You can ask me to modify this further by saying things like:
• "Make it brighter"
• "Change the background" 
• "Make it more luxurious"
• "Try a different angle"
• "Add more dramatic lighting"

What would you like to adjust?`,
          timestamp: new Date(),
          visuals: visuals
        };

        return [...withoutGenerating, resultMessage];
      });

      // Save to library automatically
      if (visuals.length > 0) {
        const visualToSave = {
          id: Date.now().toString(),
          url: visuals[0].imageUrl || `data:${visuals[0].mimeType};base64,${visuals[0].data}`,
          prompt: userMessage.content,
          timestamp: Date.now()
        };
        saveVisualToLibrary(visualToSave);
      }

    } catch {
      // Remove generating message and show error
      setMessages(prev => {
        const withoutGenerating = prev.filter(m => m.id !== generatingMessage.id);
        
        const errorMessage: ChatMessage = {
          id: (Date.now() + 3).toString(),
          type: 'agent',
          content: `I apologize, but I encountered an issue creating that visual. Could you try rephrasing your request or being more specific about what you'd like to see?`,
          timestamp: new Date()
        };

        return [...withoutGenerating, errorMessage];
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDownload = (visual: GeneratedVisual, messageId: string, index: number) => {
    const link = document.createElement('a');
    link.href = `data:${visual.mimeType};base64,${visual.data}`;
    link.download = `${productName}-chat-visual-${messageId}-${index + 1}.${visual.mimeType.split('/')[1]}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectVisual = (visual: GeneratedVisual) => {
    onVisualSelected(visual.data, visual.mimeType);
  };

  const handleStartOver = () => {
    // Reset conversation to initial state
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'agent',
      content: `Let's start fresh! I'm ready to create new visuals for "${productName}" using the original product image as reference. 

What kind of visual would you like to create?`,
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
    setInputMessage('');
  };

  const suggestedPrompts = [
    "Make it more luxurious and premium",
    "Change the background to white",
    "Add dramatic lighting and shadows", 
    "Make it brighter with better contrast",
    "Try a different camera angle",
    "Make it more minimalist",
    "Add a lifestyle setting",
    "Focus on the product details",
    "Make it Instagram-ready",
    "Create something more artistic"
  ];

  return (
    <div className="bg-gray-50 h-screen flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
        {/* Header */}
        <div className="bg-white border-b p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <MessageCircle className="text-purple-600" />
                Visual Creation Chat
              </h2>
              <p className="text-gray-600 text-sm">Creating visuals for {productName}</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Start Over Button - only show if there are generated visuals */}
              {messages.some(m => m.visuals && m.visuals.length > 0) && (
                <Button
                  onClick={handleStartOver}
                  variant="outline"
                  size="sm"
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  🔄 Start Over
                </Button>
              )}
              <Button onClick={onBack} variant="outline" size="sm">
                ← Back
              </Button>
            </div>
          </div>
          
          {/* Original Product Display */}
          {productImage && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Original Product</h3>
              <div className="flex items-center gap-3">
                <img
                  src={productImage}
                  alt={productName}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{productName}</p>
                  {productDescription && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{productDescription}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-2xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div
                  className={`rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-purple-600 text-white ml-auto'
                      : 'bg-white border shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {message.type === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <div className="flex items-center gap-1">
                        <Bot className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-medium text-purple-600">
                          {selectedAgent.icon} {selectedAgent.name}
                        </span>
                      </div>
                    )}
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>

                  {message.isGenerating && (
                    <div className="flex items-center gap-2 mt-2 text-purple-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-xs">Generating visual...</span>
                    </div>
                  )}

                  {/* Visuals */}
                  {message.visuals && message.visuals.length > 0 && (
                    <div className="mt-3 space-y-3">
                      {message.visuals.map((visual, index) => (
                        <div key={index} className="relative group">
                          <div className="border rounded-lg overflow-hidden bg-white">
                            {visual.imageUrl ? (
                              <img
                                src={visual.imageUrl}
                                alt={`Generated visual ${index + 1}`}
                                className="w-full h-auto object-contain max-h-96"
                                onError={(e) => {
                                  console.log('Image URL failed, trying data URI:', visual.imageUrl);
                                  const dataUri = `data:${visual.mimeType};base64,${visual.data}`;
                                  e.currentTarget.src = dataUri;
                                }}
                                onLoad={() => {
                                  console.log('Image loaded successfully via URL:', visual.imageUrl);
                                }}
                              />
                            ) : (
                              <img
                                src={`data:${visual.mimeType};base64,${visual.data}`}
                                alt={`Generated visual ${index + 1}`}
                                className="w-full h-auto object-contain max-h-96"
                                onError={() => {
                                  console.log('Data URI failed to load:', visual.mimeType, visual.data?.length);
                                }}
                                onLoad={() => {
                                  console.log('Image loaded successfully via data URI');
                                }}
                              />
                            )}
                          </div>
                          
                          {/* Action buttons below image */}
                          <div className="mt-2 flex gap-2 justify-center">
                            <Button
                              onClick={() => handleDownload(visual, message.id, index)}
                              size="sm"
                              variant="outline"
                              className="text-xs px-3 py-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                            <Button
                              onClick={() => {
                                handleSelectVisual(visual);
                              }}
                              size="sm"
                              className="bg-purple-600 text-white hover:bg-purple-700 text-xs px-3 py-1"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Use for Video
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        {!isGenerating && messages.length <= 2 && (
          <div className="p-4 bg-white border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Quick suggestions:</h4>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(prompt)}
                  className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                >
                  <Zap className="w-3 h-3 inline mr-1" />
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 bg-white border-t">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Tell ${selectedAgent.name} what you'd like to see...`}
              className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isGenerating}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isGenerating}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}