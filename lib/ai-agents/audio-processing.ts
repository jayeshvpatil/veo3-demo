import { VideoAgent, VideoAnalysis, EditingSuggestion, AgentAction, AgentCapability } from './types';

// Audio Processing Agent - AI-powered audio enhancement and processing
export class AudioProcessingAgent extends VideoAgent {
  name = 'Audio Processor';
  description = 'Enhances audio quality, removes noise, balances levels, and adds audio effects';

  async analyze(input: any): Promise<any> {
    return {
      noiseProfile: this.analyzeBackgroundNoise(input),
      volumeLevels: this.analyzeVolumeConsistency(input),
      speechClarity: this.analyzeSpeechClarity(input),
      musicBalance: this.analyzeMusicBalance(input)
    };
  }

  async generateSuggestions(analysis: VideoAnalysis, preferences: any): Promise<EditingSuggestion[]> {
    const suggestions: EditingSuggestion[] = [];

    // Analyze audio segments for enhancement opportunities
    for (const audio of analysis.audioLevels) {
      // Detect low volume segments
      if (audio.volume < 0.3 && audio.hasVoice) {
        suggestions.push({
          id: this.generateId(),
          type: 'audio',
          priority: 'high',
          description: 'Low volume speech detected - normalize audio levels',
          timeRange: { start: audio.startTime, end: audio.endTime },
          parameters: {
            enhancementType: 'volume_normalization',
            targetVolume: 0.7,
            preserveDynamics: true,
            method: 'intelligent_gain'
          },
          reasoning: 'Low volume speech may be difficult to understand',
          autoApply: preferences.autoNormalizeAudio || false
        });
      }

      // Detect poor speech clarity
      if (audio.hasVoice && audio.clarity < 0.7) {
        suggestions.push(this.createSuggestion(
          'audio',
          'high',
          'Voice Enhancement',
          `Enhance voice clarity at ${audio.startTime}s-${audio.endTime}s`,
          { start: audio.startTime, end: audio.endTime },
          {
            enhancementType: 'voice',
            targetVolume: 0.7,
            preserveDynamics: true,
            method: 'spectralSubtraction'
          },
          0.8
        ));
      }

      // Detect competing audio (voice + music)
      if (audio.hasVoice && audio.hasMusic) {
        suggestions.push({
          id: this.generateId(),
          type: 'audio',
          priority: 'medium',
          description: 'Voice and music competing - balance audio mix',
          timeRange: { start: audio.startTime, end: audio.endTime },
          parameters: {
            enhancementType: 'audio_separation',
            voiceBoost: 1.2,
            musicReduction: 0.7,
            intelligibilityMode: true,
            preserveMoodMusic: true
          },
          reasoning: 'Voice and background music may compete for attention',
          autoApply: preferences.autoBalanceAudio || false
        });
      }

      // Detect harsh frequencies
      if (audio.frequency === 'high' && audio.volume > 0.8) {
        suggestions.push({
          id: this.generateId(),
          type: 'audio',
          priority: 'medium',
          description: 'Harsh high frequencies detected - apply smoothing',
          timeRange: { start: audio.startTime, end: audio.endTime },
          parameters: {
            enhancementType: 'frequency_smoothing',
            highFreqReduction: 0.3,
            harshnessTaming: 0.4,
            preserveClarity: true
          },
          reasoning: 'High volume high frequencies can be unpleasant',
          autoApply: preferences.autoSmoothAudio || false
        });
      }
    }

    // Analyze overall audio consistency
    const volumeVariation = this.calculateVolumeVariation(analysis.audioLevels);
    if (volumeVariation > 0.4) {
      suggestions.push({
        id: this.generateId(),
        type: 'audio',
        priority: 'high',
        description: 'Inconsistent audio levels throughout video - apply compression',
        timeRange: { start: 0, end: analysis.duration },
        parameters: {
          enhancementType: 'dynamic_range_compression',
          compressionRatio: 3,
          threshold: -18,
          attackTime: 10,
          releaseTime: 100,
          makeupGain: 2
        },
        reasoning: 'High volume variation can create poor listening experience',
        autoApply: preferences.autoCompressAudio || false
      });
    }

    // Suggest adding background music for silent segments
    const silentSegments = analysis.audioLevels.filter(audio => 
      !audio.hasVoice && !audio.hasMusic && audio.volume < 0.1
    );

    for (const silent of silentSegments) {
      if (silent.endTime - silent.startTime > 3) {
        suggestions.push({
          id: this.generateId(),
          type: 'audio',
          priority: 'low',
          description: 'Silent segment - consider adding background music',
          timeRange: { start: silent.startTime, end: silent.endTime },
          parameters: {
            enhancementType: 'background_music',
            musicType: 'ambient',
            volume: 0.3,
            fadeIn: 1,
            fadeOut: 1,
            moodMatching: true
          },
          reasoning: 'Extended silence may benefit from subtle background music',
          autoApply: false
        });
      }
    }

    // Suggest audio ducking for voice-over music
    const voiceOverMusic = analysis.audioLevels.filter(audio => 
      audio.hasVoice && audio.hasMusic && audio.volume > 0.6
    );

    for (const segment of voiceOverMusic) {
      suggestions.push({
        id: this.generateId(),
        type: 'audio',
        priority: 'medium',
        description: 'Voice over music - apply ducking for clarity',
        timeRange: { start: segment.startTime, end: segment.endTime },
        parameters: {
          enhancementType: 'audio_ducking',
          duckingAmount: 0.4,
          threshold: -20,
          attackTime: 50,
          releaseTime: 200,
          voicePriority: true
        },
        reasoning: 'Audio ducking improves voice intelligibility over music',
        autoApply: preferences.autoAudioDuck || false
      });
    }

    return suggestions;
  }

  async executeAction(action: AgentAction): Promise<any> {
    switch (action.action) {
      case 'audio':
        return await this.processAudio(action.parameters);
      case 'normalize':
        return await this.normalizeVolume(action.parameters);
      case 'denoise':
        return await this.reduceNoise(action.parameters);
      case 'enhance_speech':
        return await this.enhanceSpeech(action.parameters);
      default:
        throw new Error(`Unknown audio action: ${action.action}`);
    }
  }

  getCapabilities(): AgentCapability[] {
    return [
      {
        name: 'AI Noise Reduction',
        description: 'Advanced noise reduction using AI to preserve speech quality',
        inputTypes: ['audio', 'video'],
        outputTypes: ['cleaned_audio'],
        confidence: 0.9,
        complexity: 'high'
      },
      {
        name: 'Voice Enhancement',
        description: 'Improve speech clarity and intelligibility',
        inputTypes: ['audio', 'speech_segments'],
        outputTypes: ['enhanced_speech'],
        confidence: 0.85,
        complexity: 'medium'
      },
      {
        name: 'Audio Leveling',
        description: 'Consistent volume levels throughout the video',
        inputTypes: ['audio'],
        outputTypes: ['normalized_audio'],
        confidence: 0.95,
        complexity: 'low'
      },
      {
        name: 'Dynamic Range Control',
        description: 'Intelligent compression and limiting for optimal playback',
        inputTypes: ['audio'],
        outputTypes: ['compressed_audio'],
        confidence: 0.9,
        complexity: 'medium'
      },
      {
        name: 'Audio Separation',
        description: 'Separate and balance voice, music, and effects',
        inputTypes: ['mixed_audio'],
        outputTypes: ['separated_audio_tracks'],
        confidence: 0.8,
        complexity: 'high'
      },
      {
        name: 'Spatial Audio',
        description: 'Create immersive spatial audio experiences',
        inputTypes: ['audio', 'scene_analysis'],
        outputTypes: ['spatial_audio'],
        confidence: 0.75,
        complexity: 'high'
      }
    ];
  }

  private analyzeBackgroundNoise(analysis: VideoAnalysis): Array<{timeRange: {start: number, end: number}, noiseLevel: number, type: string}> {
    const noiseSegments = [];
    
    for (const audio of analysis.audioLevels) {
      if (!audio.hasVoice && !audio.hasMusic && audio.volume > 0.05) {
        noiseSegments.push({
          timeRange: { start: audio.startTime, end: audio.endTime },
          noiseLevel: audio.volume,
          type: audio.frequency === 'high' ? 'hiss' : audio.frequency === 'low' ? 'hum' : 'broadband'
        });
      }
    }
    
    return noiseSegments;
  }

  private analyzeVolumeConsistency(audioLevels: any[]): {variation: number, averageVolume: number, recommendations: string[]} {
    const volumes = audioLevels.map(audio => audio.volume);
    const averageVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
    
    const variance = volumes.reduce((sum, vol) => sum + Math.pow(vol - averageVolume, 2), 0) / volumes.length;
    const variation = Math.sqrt(variance);
    
    const recommendations = [];
    if (variation > 0.3) {
      recommendations.push('Apply compression to reduce volume variation');
    }
    if (averageVolume < 0.4) {
      recommendations.push('Overall volume is low - consider normalization');
    }
    if (averageVolume > 0.9) {
      recommendations.push('Overall volume is high - reduce to prevent clipping');
    }
    
    return { variation, averageVolume, recommendations };
  }

  private analyzeSpeechClarity(audioLevels: any[]): Array<{timeRange: {start: number, end: number}, clarity: number, issues: string[]}> {
    const clarityAnalysis = [];
    
    for (const audio of audioLevels) {
      if (audio.hasVoice) {
        const issues = [];
        if (audio.clarity < 0.7) issues.push('Low clarity');
        if (audio.volume < 0.3) issues.push('Low volume');
        if (audio.frequency === 'high') issues.push('Harsh frequencies');
        
        clarityAnalysis.push({
          timeRange: { start: audio.startTime, end: audio.endTime },
          clarity: audio.clarity,
          issues
        });
      }
    }
    
    return clarityAnalysis;
  }

  private analyzeMusicBalance(audioLevels: any[]): Array<{timeRange: {start: number, end: number}, balance: number, hasConflict: boolean}> {
    const musicAnalysis = [];
    
    for (const audio of audioLevels) {
      if (audio.hasMusic) {
        const hasConflict = audio.hasVoice && audio.volume > 0.6;
        const balance = audio.hasVoice ? 0.5 : 1.0; // Lower balance when competing with voice
        
        musicAnalysis.push({
          timeRange: { start: audio.startTime, end: audio.endTime },
          balance,
          hasConflict
        });
      }
    }
    
    return musicAnalysis;
  }

  private calculateVolumeVariation(audioLevels: any[]): number {
    const volumes = audioLevels.map(audio => audio.volume);
    const max = Math.max(...volumes);
    const min = Math.min(...volumes);
    return max - min;
  }

  private async processAudio(parameters: any): Promise<any> {
    // Mock implementation - in production would interface with audio processing APIs
    return {
      success: true,
      enhancementType: parameters.enhancementType,
      appliedSettings: parameters,
      processingTime: `${Math.random() * 4 + 1}s`,
      qualityImprovement: {
        clarityIncrease: `${Math.floor(Math.random() * 25 + 10)}%`,
        noiseReduction: `${Math.floor(Math.random() * 40 + 20)}dB`,
        volumeConsistency: `${Math.floor(Math.random() * 30 + 15)}%`
      },
      processedAt: new Date().toISOString()
    };
  }

  private async normalizeVolume(parameters: any): Promise<any> {
    return {
      success: true,
      originalPeakLevel: `${Math.random() * 20 - 10}dB`,
      normalizedPeakLevel: `${parameters.targetVolume * 10 - 10}dB`,
      gainApplied: `${Math.random() * 6 + 2}dB`,
      processingTime: `${Math.random() * 2 + 0.5}s`,
      processedAt: new Date().toISOString()
    };
  }

  private async reduceNoise(parameters: any): Promise<any> {
    return {
      success: true,
      noiseReductionAmount: `${parameters.denoiseStrength * 40}dB`,
      artifactLevel: parameters.preserveNaturalness ? 'minimal' : 'moderate',
      processingTime: `${Math.random() * 6 + 2}s`,
      processedAt: new Date().toISOString()
    };
  }

  private async enhanceSpeech(parameters: any): Promise<any> {
    return {
      success: true,
      clarityImprovement: `${parameters.clarityBoost * 30}%`,
      frequencyOptimization: parameters.frequencyRange,
      naturalness: parameters.preserveNaturalness ? 'preserved' : 'enhanced',
      processingTime: `${Math.random() * 5 + 2}s`,
      processedAt: new Date().toISOString()
    };
  }
}