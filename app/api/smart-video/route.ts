import { NextResponse } from "next/server";
import { VideoEditingAI } from "@/lib/ai-agents/core";
import { videoRouter } from "@/lib/video-providers";

const aiSystem = new VideoEditingAI();

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Expected multipart/form-data" },
        { status: 400 }
      );
    }

    const form = await req.formData();

    const prompt = (form.get("prompt") as string) || "";
    const costPriority = (form.get("costPriority") as string) || "balanced";
    const urgency = (form.get("urgency") as string) || "medium";
    const style = (form.get("style") as string) || "";
    const budget = (form.get("budget") as string) || "medium";

    // Handle image input
    const imageFile = form.get("imageFile") as File | null;
    const imageBase64 = (form.get("imageBase64") as string) || undefined;
    let referenceImage = undefined;

    if (imageFile) {
      const buffer = await imageFile.arrayBuffer();
      referenceImage = `data:${imageFile.type};base64,${Buffer.from(buffer).toString('base64')}`;
    } else if (imageBase64) {
      referenceImage = imageBase64.includes("data:") ? imageBase64 : `data:image/png;base64,${imageBase64}`;
    }

    console.log('🎬 Smart video generation request:', {
      prompt: prompt.substring(0, 100) + "...",
      costPriority,
      urgency,
      hasImage: !!referenceImage,
    });

    // STEP 1: Offline AI Analysis (NO API CALLS)
    console.log('🧠 Phase 1: AI Agent Analysis...');
    const preparationPlan = await aiSystem.prepareVideoGeneration({
      prompt,
      referenceImage,
      userPreferences: {
        budget: budget as any,
        urgency: urgency as any,
        style,
      },
    });

    console.log('📊 Analysis Results:', {
      confidence: Math.round(preparationPlan.confidence * 100) + '%',
      estimatedCost: '$' + preparationPlan.estimatedCost.toFixed(3),
      suggestionsCount: preparationPlan.suggestions.length,
      promptOptimization: preparationPlan.optimizedPrompt.length > prompt.length,
    });

    // STEP 2: Check if we should proceed based on confidence and cost
    if (preparationPlan.confidence < 0.4) {
      return NextResponse.json({
        success: false,
        error: "Low confidence in video generation success",
        details: {
          confidence: preparationPlan.confidence,
          suggestions: preparationPlan.suggestions.slice(0, 3),
          recommendation: "Consider refining your prompt or adding more specific details",
        },
        analysisResults: preparationPlan,
      }, { status: 400 });
    }

    // STEP 3: Smart Provider Selection & Generation
    console.log('🎯 Phase 2: Intelligent Provider Selection...');
    
    const videoRequest = {
      prompt: preparationPlan.optimizedPrompt,
      aspectRatio: preparationPlan.recommendedSettings.aspectRatio,
      image: referenceImage ? {
        base64: referenceImage.split(',')[1],
        mimeType: referenceImage.split(';')[0].replace('data:', ''),
      } : undefined,
      preferences: {
        costPriority: preparationPlan.recommendedSettings.costPriority,
        urgency: urgency as any,
        capabilities: preparationPlan.recommendedSettings.requiredCapabilities,
      },
    };

    const generationResult = await videoRouter.generateVideo(videoRequest);

    if (!generationResult.success) {
      // If primary generation fails, try with simplified requirements
      console.log('🔄 Primary generation failed, trying fallback...');
      
      const fallbackRequest = {
        ...videoRequest,
        prompt: prompt, // Use original prompt
        preferences: {
          costPriority: 'lowest' as const,
          urgency: 'low' as const,
          capabilities: [], // No special requirements
        },
      };

      const fallbackResult = await videoRouter.generateVideo(fallbackRequest);
      
      if (!fallbackResult.success) {
        return NextResponse.json({
          success: false,
          error: "All video generation providers failed",
          details: {
            primaryError: generationResult.error,
            fallbackError: fallbackResult.error,
            recommendation: "Try again in a few minutes or simplify your prompt",
          },
          analysisResults: preparationPlan,
        }, { status: 503 });
      }

      return NextResponse.json({
        success: true,
        provider: fallbackResult.provider,
        operationId: fallbackResult.operationId,
        videoUrl: fallbackResult.videoUrl,
        estimatedTime: fallbackResult.estimatedTime,
        cost: fallbackResult.cost,
        analysisResults: preparationPlan,
        usedFallback: true,
        warning: "Used fallback generation due to primary provider issues",
        name: fallbackResult.operationId, // For compatibility
      });
    }

    // STEP 4: Success Response with Analysis
    return NextResponse.json({
      success: true,
      provider: generationResult.provider,
      operationId: generationResult.operationId,
      videoUrl: generationResult.videoUrl,
      estimatedTime: generationResult.estimatedTime,
      cost: generationResult.cost,
      analysisResults: preparationPlan,
      optimizations: {
        promptEnhanced: preparationPlan.optimizedPrompt !== prompt,
        confidenceScore: preparationPlan.confidence,
        costSavings: preparationPlan.estimatedCost < 0.5 ? "Low-cost provider selected" : "Quality provider selected",
      },
      name: generationResult.operationId, // For compatibility with existing frontend
    });

  } catch (error: any) {
    console.error("Smart video generation error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error",
        details: error.message,
        recommendation: "Please try again or contact support",
      },
      { status: 500 }
    );
  }
}

// GET endpoint for checking system status
export async function GET() {
  const providers = videoRouter.getAvailableProviders();
  
  return NextResponse.json({
    system: "Smart AI Video Generation",
    version: "1.0.0",
    features: [
      "Offline AI analysis before generation",
      "Multi-provider intelligent routing",
      "Cost optimization and quota management",
      "6 specialized AI agents for enhancement",
      "Automatic fallback and retry logic",
    ],
    availableProviders: providers.map(p => ({
      name: p.name,
      costLevel: p.costLevel,
      capabilities: Object.keys(p.capabilities).filter(key => 
        p.capabilities[key as keyof typeof p.capabilities]
      ),
      available: p.quotaStatus.available,
    })),
    agentCapabilities: aiSystem.getCapabilities(),
    status: providers.length > 0 ? "operational" : "limited",
  });
}