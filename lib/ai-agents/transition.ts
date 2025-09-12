import { VideoAgent, VideoAnalysis, EditingSuggestion, AgentAction, AgentCapability } from './types';

// Transition Agent - AI-powered transitions and effects between scenes
export class TransitionAgent extends VideoAgent {
  name = 'Transition Master';
  description = 'Creates intelligent transitions between scenes based on content analysis and pacing';

  async analyze(input: any): Promise<any> {
    return {
      transitionOpportunities: this.findTransitionPoints(input),
      sceneRelationships: this.analyzeSceneRelationships(input),
      pacingAnalysis: this.analyzePacingFlow(input)
    };
  }

  async generateSuggestions(analysis: VideoAnalysis, preferences: any): Promise<EditingSuggestion[]> {
    const suggestions: EditingSuggestion[] = [];

    // Analyze transitions between consecutive scenes
    for (let i = 0; i < analysis.scenes.length - 1; i++) {
      const currentScene = analysis.scenes[i];
      const nextScene = analysis.scenes[i + 1];
      
      const transitionPoint = currentScene.endTime;
      const gap = nextScene.startTime - currentScene.endTime;

      // Suggest appropriate transition based on scene types and content
      const transitionType = this.determineTransitionType(currentScene, nextScene, preferences);
      
      suggestions.push({
        id: this.generateId(),
        type: 'transition',
        priority: this.getTransitionPriority(currentScene, nextScene),
        description: `Add ${transitionType} transition between ${currentScene.type} and ${nextScene.type} scenes`,
        timeRange: { start: Math.max(0, transitionPoint - 0.5), end: Math.min(analysis.duration, transitionPoint + 0.5) },
        parameters: {
          transitionType,
          duration: this.calculateTransitionDuration(currentScene, nextScene),
          easing: this.selectEasing(currentScene, nextScene),
          direction: this.determineDirection(currentScene, nextScene),
          customParameters: this.getCustomParameters(transitionType, currentScene, nextScene)
        },
        reasoning: this.explainTransitionChoice(currentScene, nextScene, transitionType),
        autoApply: preferences.autoAddTransitions && transitionType !== 'complex_3d'
      });

      // Suggest motion-based transitions for action scenes
      if (currentScene.type === 'action' || nextScene.type === 'action') {
        suggestions.push({
          id: this.generateId(),
          type: 'transition',
          priority: 'medium',
          description: 'Dynamic motion-based transition for action sequence',
          timeRange: { start: transitionPoint - 0.3, end: transitionPoint + 0.3 },
          parameters: {
            transitionType: 'motion_match',
            motionDirection: this.analyzeMotionDirection(currentScene, nextScene),
            speedRamping: true,
            motionBlur: 0.4,
            energyLevel: 'high'
          },
          reasoning: 'Action scenes benefit from dynamic, motion-aware transitions',
          autoApply: false
        });
      }

      // Suggest color-based transitions for scenes with strong color themes
      if (this.hasStrongColorTheme(currentScene) || this.hasStrongColorTheme(nextScene)) {
        const colorTransition = this.suggestColorTransition(currentScene, nextScene);
        suggestions.push({
          id: this.generateId(),
          type: 'transition',
          priority: 'low',
          description: `Color-based transition using ${colorTransition.method}`,
          timeRange: { start: transitionPoint - 0.4, end: transitionPoint + 0.4 },
          parameters: {
            transitionType: 'color_morph',
            method: colorTransition.method,
            fromColors: currentScene.dominantColors,
            toColors: nextScene.dominantColors,
            duration: 0.8,
            smoothness: 0.8
          },
          reasoning: 'Strong color themes allow for visually appealing color-based transitions',
          autoApply: false
        });
      }
    }

    // Suggest opening and closing transitions
    if (analysis.scenes.length > 0) {
      const firstScene = analysis.scenes[0];
      const lastScene = analysis.scenes[analysis.scenes.length - 1];

      // Opening transition
      suggestions.push({
        id: this.generateId(),
        type: 'transition',
        priority: 'medium',
        description: 'Add professional opening transition',
        timeRange: { start: 0, end: 1 },
        parameters: {
          transitionType: 'fade_in',
          duration: 1.0,
          easing: 'ease_out',
          overlay: preferences.addBranding ? 'logo_fade' : 'none'
        },
        reasoning: 'Professional opening sets the tone for the video',
        autoApply: preferences.autoAddOpeningTransition || false
      });

      // Closing transition
      suggestions.push({
        id: this.generateId(),
        type: 'transition',
        priority: 'medium',
        description: 'Add professional closing transition',
        timeRange: { start: lastScene.endTime - 1, end: lastScene.endTime },
        parameters: {
          transitionType: 'fade_out',
          duration: 1.5,
          easing: 'ease_in',
          overlay: preferences.addBranding ? 'end_card' : 'none'
        },
        reasoning: 'Professional closing provides satisfying conclusion',
        autoApply: preferences.autoAddClosingTransition || false
      });
    }

    // Suggest rhythm-based transitions for music synchronization
    if (analysis.audioLevels.some(audio => audio.hasMusic)) {
      suggestions.push({
        id: this.generateId(),
        type: 'transition',
        priority: 'low',
        description: 'Sync transitions with music beats for rhythmic flow',
        timeRange: { start: 0, end: analysis.duration },
        parameters: {
          transitionType: 'beat_sync',
          beatDetection: true,
          syncThreshold: 0.8,
          transitionOnBeat: true,
          musicalPhrasing: true
        },
        reasoning: 'Music synchronization creates more engaging rhythm',
        autoApply: false
      });
    }

    return suggestions;
  }

  async executeAction(action: AgentAction): Promise<any> {
    switch (action.action) {
      case 'transition':
        return await this.applyTransition(action.parameters);
      case 'fade':
        return await this.applyFade(action.parameters);
      case 'wipe':
        return await this.applyWipe(action.parameters);
      case 'motion_match':
        return await this.applyMotionTransition(action.parameters);
      default:
        throw new Error(`Unknown transition action: ${action.action}`);
    }
  }

  getCapabilities(): AgentCapability[] {
    return [
      {
        name: 'Smart Scene Transitions',
        description: 'Automatically select and apply appropriate transitions between scenes',
        inputTypes: ['video', 'scene_analysis'],
        outputTypes: ['transitioned_video'],
        confidence: 0.85,
        complexity: 'medium'
      },
      {
        name: 'Motion-Aware Transitions',
        description: 'Transitions that follow and enhance natural motion in the video',
        inputTypes: ['video', 'motion_analysis'],
        outputTypes: ['motion_transitioned_video'],
        confidence: 0.8,
        complexity: 'high'
      },
      {
        name: 'Beat-Synchronized Transitions',
        description: 'Sync transitions with music beats for rhythmic editing',
        inputTypes: ['video', 'audio_analysis'],
        outputTypes: ['rhythm_synced_video'],
        confidence: 0.75,
        complexity: 'high'
      },
      {
        name: 'Color-Based Transitions',
        description: 'Transitions based on color analysis and thematic matching',
        inputTypes: ['video', 'color_analysis'],
        outputTypes: ['color_transitioned_video'],
        confidence: 0.8,
        complexity: 'medium'
      },
      {
        name: '3D Transitions',
        description: 'Advanced 3D transitions for dramatic scene changes',
        inputTypes: ['video'],
        outputTypes: ['3d_transitioned_video'],
        confidence: 0.7,
        complexity: 'high'
      }
    ];
  }

  private findTransitionPoints(analysis: VideoAnalysis): Array<{timestamp: number, confidence: number, suggestedType: string}> {
    const points = [];
    
    for (let i = 0; i < analysis.scenes.length - 1; i++) {
      const current = analysis.scenes[i];
      const next = analysis.scenes[i + 1];
      
      points.push({
        timestamp: current.endTime,
        confidence: this.calculateTransitionConfidence(current, next),
        suggestedType: this.determineTransitionType(current, next, {})
      });
    }
    
    return points;
  }

  private analyzeSceneRelationships(analysis: VideoAnalysis): Array<{sceneIndex: number, relationship: string, strength: number}> {
    const relationships = [];
    
    for (let i = 0; i < analysis.scenes.length - 1; i++) {
      const current = analysis.scenes[i];
      const next = analysis.scenes[i + 1];
      
      const relationship = this.determineSceneRelationship(current, next);
      const strength = this.calculateRelationshipStrength(current, next);
      
      relationships.push({
        sceneIndex: i,
        relationship,
        strength
      });
    }
    
    return relationships;
  }

  private analyzePacingFlow(analysis: VideoAnalysis): {overallPacing: string, pacingChanges: Array<{timestamp: number, change: string}>} {
    const sceneDurations = analysis.scenes.map(scene => scene.endTime - scene.startTime);
    const averageDuration = sceneDurations.reduce((sum, dur) => sum + dur, 0) / sceneDurations.length;
    
    let overallPacing = 'medium';
    if (averageDuration < 3) overallPacing = 'fast';
    if (averageDuration > 8) overallPacing = 'slow';
    
    const pacingChanges = [];
    for (let i = 0; i < analysis.scenes.length - 1; i++) {
      const currentDur = sceneDurations[i];
      const nextDur = sceneDurations[i + 1];
      
      if (nextDur > currentDur * 1.5) {
        pacingChanges.push({
          timestamp: analysis.scenes[i].endTime,
          change: 'deceleration'
        });
      } else if (nextDur < currentDur * 0.6) {
        pacingChanges.push({
          timestamp: analysis.scenes[i].endTime,
          change: 'acceleration'
        });
      }
    }
    
    return { overallPacing, pacingChanges };
  }

  private determineTransitionType(currentScene: any, nextScene: any, preferences: any): string {
    // Energy-based transition selection
    const energyDifference = Math.abs(currentScene.motionIntensity - nextScene.motionIntensity);
    
    if (currentScene.type === 'action' && nextScene.type === 'action') {
      return energyDifference > 0.3 ? 'impact_zoom' : 'motion_match';
    }
    
    if (currentScene.type === 'dialogue' && nextScene.type === 'dialogue') {
      return 'cross_fade';
    }
    
    if (currentScene.type === 'static' || nextScene.type === 'static') {
      return 'fade_through_black';
    }
    
    if (energyDifference > 0.5) {
      return 'dynamic_wipe';
    }
    
    // Default intelligent selection
    const transitionTypes = ['cross_fade', 'slide', 'zoom', 'rotation', 'morphing'];
    return transitionTypes[Math.floor(Math.random() * transitionTypes.length)];
  }

  private getTransitionPriority(currentScene: any, nextScene: any): 'low' | 'medium' | 'high' {
    const typeChange = currentScene.type !== nextScene.type;
    const energyChange = Math.abs(currentScene.motionIntensity - nextScene.motionIntensity) > 0.4;
    
    if (typeChange && energyChange) return 'high';
    if (typeChange || energyChange) return 'medium';
    return 'low';
  }

  private calculateTransitionDuration(currentScene: any, nextScene: any): number {
    const baseTime = 0.5;
    const energyFactor = (currentScene.motionIntensity + nextScene.motionIntensity) / 2;
    
    // Higher energy = shorter transitions
    return Math.max(0.2, baseTime - energyFactor * 0.3);
  }

  private selectEasing(currentScene: any, nextScene: any): string {
    if (currentScene.type === 'action' || nextScene.type === 'action') {
      return 'ease_out_back';
    }
    if (currentScene.type === 'dialogue' && nextScene.type === 'dialogue') {
      return 'ease_in_out';
    }
    return 'ease_out';
  }

  private determineDirection(currentScene: any, nextScene: any): string {
    // Analyze dominant colors to suggest direction
    const directions = ['left_to_right', 'right_to_left', 'top_to_bottom', 'bottom_to_top'];
    return directions[Math.floor(Math.random() * directions.length)];
  }

  private getCustomParameters(transitionType: string, currentScene: any, nextScene: any): any {
    const params: any = {};
    
    switch (transitionType) {
      case 'motion_match':
        params.motionVector = this.analyzeMotionDirection(currentScene, nextScene);
        params.accelerationCurve = 'natural';
        break;
      case 'color_morph':
        params.colorBlending = 'smooth';
        params.preserveLuminance = true;
        break;
      case 'impact_zoom':
        params.zoomCenter = 'action_point';
        params.impactIntensity = 0.8;
        break;
      case 'dynamic_wipe':
        params.wipePattern = 'organic';
        params.edgeFeathering = 0.3;
        break;
    }
    
    return params;
  }

  private explainTransitionChoice(currentScene: any, nextScene: any, transitionType: string): string {
    const reasons = {
      'cross_fade': 'Smooth blending maintains flow between similar content',
      'motion_match': 'Follows natural motion for seamless visual continuity',
      'impact_zoom': 'Dynamic zoom enhances energy transition between action scenes',
      'fade_through_black': 'Clean separation provides breathing room between different scene types',
      'dynamic_wipe': 'Energy-matching wipe maintains viewer engagement',
      'slide': 'Directional slide creates smooth spatial transition',
      'color_morph': 'Color-based transition leverages visual theme continuity'
    };
    
    return reasons[transitionType] || 'Intelligent transition selection based on content analysis';
  }

  private analyzeMotionDirection(currentScene: any, nextScene: any): string {
    // Mock motion analysis - in production would analyze actual motion vectors
    const directions = ['horizontal_right', 'horizontal_left', 'vertical_up', 'vertical_down', 'diagonal', 'convergent', 'divergent'];
    return directions[Math.floor(Math.random() * directions.length)];
  }

  private hasStrongColorTheme(scene: any): boolean {
    return scene.dominantColors.length >= 2 && scene.confidence > 0.7;
  }

  private suggestColorTransition(currentScene: any, nextScene: any): {method: string, strength: number} {
    const methods = ['gradient_blend', 'color_replace', 'hue_shift', 'saturation_bridge'];
    return {
      method: methods[Math.floor(Math.random() * methods.length)],
      strength: 0.8
    };
  }

  private calculateTransitionConfidence(currentScene: any, nextScene: any): number {
    let confidence = 0.5;
    
    // Higher confidence for scene type changes
    if (currentScene.type !== nextScene.type) confidence += 0.2;
    
    // Higher confidence for energy changes
    const energyDiff = Math.abs(currentScene.motionIntensity - nextScene.motionIntensity);
    confidence += energyDiff * 0.3;
    
    // Higher confidence for high quality scenes
    confidence += (currentScene.confidence + nextScene.confidence) * 0.1;
    
    return Math.min(1.0, confidence);
  }

  private determineSceneRelationship(currentScene: any, nextScene: any): string {
    if (currentScene.type === nextScene.type) return 'similar_content';
    if (Math.abs(currentScene.motionIntensity - nextScene.motionIntensity) > 0.5) return 'energy_contrast';
    if (currentScene.dominantColors.some(color => nextScene.dominantColors.includes(color))) return 'color_continuity';
    return 'content_shift';
  }

  private calculateRelationshipStrength(currentScene: any, nextScene: any): number {
    let strength = 0;
    
    // Type similarity
    if (currentScene.type === nextScene.type) strength += 0.3;
    
    // Motion similarity
    const motionSimilarity = 1 - Math.abs(currentScene.motionIntensity - nextScene.motionIntensity);
    strength += motionSimilarity * 0.3;
    
    // Color similarity
    const commonColors = currentScene.dominantColors.filter(color => 
      nextScene.dominantColors.includes(color)
    ).length;
    strength += (commonColors / Math.max(currentScene.dominantColors.length, nextScene.dominantColors.length)) * 0.4;
    
    return strength;
  }

  private async applyTransition(parameters: any): Promise<any> {
    // Mock implementation - in production would interface with video processing APIs
    return {
      success: true,
      transitionType: parameters.transitionType,
      duration: parameters.duration,
      appliedAt: parameters.timeRange,
      processingTime: `${Math.random() * 3 + 1}s`,
      qualityImpact: 'minimal',
      processedAt: new Date().toISOString()
    };
  }

  private async applyFade(parameters: any): Promise<any> {
    return {
      success: true,
      fadeType: parameters.fadeType || 'cross_fade',
      duration: parameters.duration,
      easing: parameters.easing,
      processingTime: `${Math.random() * 1 + 0.5}s`,
      processedAt: new Date().toISOString()
    };
  }

  private async applyWipe(parameters: any): Promise<any> {
    return {
      success: true,
      wipeDirection: parameters.direction,
      pattern: parameters.customParameters?.wipePattern || 'linear',
      duration: parameters.duration,
      processingTime: `${Math.random() * 2 + 1}s`,
      processedAt: new Date().toISOString()
    };
  }

  private async applyMotionTransition(parameters: any): Promise<any> {
    return {
      success: true,
      motionVector: parameters.motionDirection,
      accelerationCurve: parameters.customParameters?.accelerationCurve || 'linear',
      motionBlur: parameters.motionBlur || 0,
      processingTime: `${Math.random() * 4 + 2}s`,
      processedAt: new Date().toISOString()
    };
  }
}