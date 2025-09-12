// Core types and interfaces for AI Agent System

export interface VideoAnalysis {
  duration: number;
  scenes: Scene[];
  audioLevels: AudioSegment[];
  visualElements: VisualElement[];
  suggestions: EditingSuggestion[];
}

export interface Scene {
  startTime: number;
  endTime: number;
  type: 'action' | 'dialogue' | 'transition' | 'static';
  confidence: number;
  keyframes: string[];
  dominantColors: string[];
  motionIntensity: number;
}

export interface AudioSegment {
  startTime: number;
  endTime: number;
  volume: number;
  frequency: 'low' | 'mid' | 'high';
  hasVoice: boolean;
  hasMusic: boolean;
  clarity: number;
}

export interface VisualElement {
  type: 'face' | 'object' | 'text' | 'logo' | 'scene';
  boundingBox: { x: number; y: number; width: number; height: number };
  confidence: number;
  timeRange: { start: number; end: number };
  label: string;
}

export interface EditingSuggestion {
  id: string;
  type: 'cut' | 'enhance' | 'effect' | 'audio' | 'caption' | 'transition';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timeRange: { start: number; end: number };
  parameters: Record<string, any>;
  reasoning: string;
  autoApply: boolean;
}

export interface AgentAction {
  id: string;
  agent: string;
  action: string;
  parameters: Record<string, any>;
  timestamp: number;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

export interface AgentCapability {
  name: string;
  description: string;
  inputTypes: string[];
  outputTypes: string[];
  confidence: number;
  complexity: 'low' | 'medium' | 'high';
}

// Base class for all video editing agents
export abstract class VideoAgent {
  abstract name: string;
  abstract description: string;

  abstract analyze(input: any): Promise<any>;
  abstract generateSuggestions(analysis: VideoAnalysis, preferences: any): Promise<EditingSuggestion[]>;
  abstract executeAction(action: AgentAction): Promise<any>;
  abstract getCapabilities(): AgentCapability[];

  protected generateId(): string {
    return `${this.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  protected calculateConfidence(factors: number[]): number {
    return factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
  }
}