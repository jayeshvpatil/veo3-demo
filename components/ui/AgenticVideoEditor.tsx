"use client";

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Scissors, 
  Wand2, 
  Volume2, 
  FileText, 
  Sparkles, 
  Zap,
  Brain,
  Settings,
  Download,
  Upload,
  Eye,
  Mic,
  Music,
  Sliders,
  Layers,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

interface AgentCapability {
  name: string;
  description: string;
  confidence: number;
  complexity: 'low' | 'medium' | 'high';
}

interface EditingSuggestion {
  id: string;
  type: 'cut' | 'enhance' | 'effect' | 'audio' | 'caption' | 'transition';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timeRange: { start: number; end: number };
  reasoning: string;
  autoApply: boolean;
}

interface AgentAction {
  id: string;
  agent: string;
  action: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

const AgenticVideoEditor: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<EditingSuggestion[]>([]);
  const [capabilities, setCapabilities] = useState<Record<string, AgentCapability[]>>({});
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [activeAgent, setActiveAgent] = useState<string>('all');
  const [autoMode, setAutoMode] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    loadCapabilities();
  }, []);

  const loadCapabilities = async () => {
    try {
      const response = await fetch('/api/ai-agents');
      const data = await response.json();
      setCapabilities(data.capabilities);
    } catch (error) {
      console.error('Failed to load AI capabilities:', error);
    }
  };

  const analyzeVideo = async (videoUrl: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl,
          action: 'generate_plan',
          preferences: {
            autoStabilize: autoMode,
            autoColorCorrect: autoMode,
            autoNormalizeAudio: autoMode,
            autoGenerateCaptions: autoMode,
            autoAddTransitions: autoMode
          }
        })
      });

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const executeSuggestion = async (suggestion: EditingSuggestion) => {
    try {
      const response = await fetch('/api/ai-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: selectedVideo,
          action: 'execute_plan',
          suggestions: [suggestion]
        })
      });

      const data = await response.json();
      setActions(prev => [...prev, ...data.actions]);
    } catch (error) {
      console.error('Execution failed:', error);
    }
  };

  const getAgentIcon = (agentName: string) => {
    const icons = {
      'analyzer': <Eye className="w-5 h-5" />,
      'cutter': <Scissors className="w-5 h-5" />,
      'enhancer': <Sparkles className="w-5 h-5" />,
      'audio': <Volume2 className="w-5 h-5" />,
      'transition': <Layers className="w-5 h-5" />,
      'caption': <FileText className="w-5 h-5" />
    };
    return icons[agentName as keyof typeof icons] || <Brain className="w-5 h-5" />;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'critical': 'text-red-500 bg-red-50 border-red-200',
      'high': 'text-orange-500 bg-orange-50 border-orange-200',
      'medium': 'text-yellow-500 bg-yellow-50 border-yellow-200',
      'low': 'text-blue-500 bg-blue-50 border-blue-200'
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'executing': return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredSuggestions = activeAgent === 'all' 
    ? suggestions 
    : suggestions.filter(s => {
        const agentMap = {
          'cut': 'cutter',
          'enhance': 'enhancer', 
          'effect': 'enhancer',
          'audio': 'audio',
          'caption': 'caption',
          'transition': 'transition'
        };
        return agentMap[s.type as keyof typeof agentMap] === activeAgent;
      });

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white overflow-hidden">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Brain className="w-8 h-8 text-purple-400" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Agentic AI Video Editor
              </h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Zap className="w-4 h-4" />
              <span>{Object.keys(capabilities).length} AI Agents Ready</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoMode}
                onChange={(e) => setAutoMode(e.target.checked)}
                className="rounded bg-white/10 border-white/20"
              />
              Auto Mode
            </label>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Advanced
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar - AI Agents */}
        <div className="w-80 bg-black/20 backdrop-blur-sm border-r border-white/10 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              AI Agents
            </h2>

            {/* Agent Filter */}
            <div className="mb-4">
              <select
                value={activeAgent}
                onChange={(e) => setActiveAgent(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                <option value="all">All Agents</option>
                {Object.keys(capabilities).map(agent => (
                  <option key={agent} value={agent}>
                    {agent.charAt(0).toUpperCase() + agent.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Agent Capabilities */}
            {Object.entries(capabilities).map(([agentName, caps]) => (
              <div key={agentName} className="mb-4 bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  {getAgentIcon(agentName)}
                  <h3 className="font-medium text-sm">
                    {agentName.charAt(0).toUpperCase() + agentName.slice(1)}
                  </h3>
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                    {caps.length} capabilities
                  </span>
                </div>
                
                {showAdvanced && (
                  <div className="space-y-1">
                    {caps.slice(0, 2).map((cap, idx) => (
                      <div key={idx} className="text-xs text-gray-300">
                        <div className="flex justify-between">
                          <span>{cap.name}</span>
                          <span className="text-green-400">{Math.round(cap.confidence * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full"
                            style={{ width: `${cap.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Video Upload/Analysis */}
          <div className="bg-black/10 backdrop-blur-sm border-b border-white/10 p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Enter video URL or upload video..."
                  value={selectedVideo || ''}
                  onChange={(e) => setSelectedVideo(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                <Upload className="w-4 h-4" />
                Upload
              </button>
              <button
                onClick={() => selectedVideo && analyzeVideo(selectedVideo)}
                disabled={!selectedVideo || isAnalyzing}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Analyze Video
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex">
            {/* Suggestions Panel */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  AI Suggestions ({filteredSuggestions.length})
                </h2>
                <div className="flex gap-2">
                  {['critical', 'high', 'medium', 'low'].map(priority => {
                    const count = filteredSuggestions.filter(s => s.priority === priority).length;
                    return count > 0 ? (
                      <span key={priority} className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(priority)}`}>
                        {priority}: {count}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>

              <div className="space-y-3">
                {filteredSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-purple-400/50 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getAgentIcon(suggestion.type)}
                          <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(suggestion.priority)}`}>
                            {suggestion.priority}
                          </span>
                          <span className="text-xs text-gray-400">
                            {suggestion.timeRange.start}s - {suggestion.timeRange.end}s
                          </span>
                        </div>
                        
                        <h3 className="font-medium mb-1">{suggestion.description}</h3>
                        <p className="text-sm text-gray-300 mb-2">{suggestion.reasoning}</p>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => executeSuggestion(suggestion)}
                            className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded hover:from-purple-500/30 hover:to-pink-500/30 transition-all text-sm"
                          >
                            <Play className="w-3 h-3" />
                            Apply
                          </button>
                          
                          {suggestion.autoApply && (
                            <span className="text-xs text-green-400 flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              Auto-applicable
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredSuggestions.length === 0 && !isAnalyzing && (
                  <div className="text-center py-12 text-gray-400">
                    <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Upload a video and click "Analyze Video" to get AI-powered editing suggestions</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Panel */}
            <div className="w-80 bg-black/20 backdrop-blur-sm border-l border-white/10 p-4 overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" />
                Recent Actions ({actions.length})
              </h2>

              <div className="space-y-2">
                {actions.slice(-10).reverse().map((action) => (
                  <div key={action.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{action.action}</span>
                      {getStatusIcon(action.status)}
                    </div>
                    <div className="text-xs text-gray-400 mb-1">Agent: {action.agent}</div>
                    {action.error && (
                      <div className="text-xs text-red-400">{action.error}</div>
                    )}
                    {action.result && (
                      <div className="text-xs text-green-400">✓ Completed</div>
                    )}
                  </div>
                ))}

                {actions.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No actions yet</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all">
                  <Download className="w-4 h-4" />
                  Export Video
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgenticVideoEditor;