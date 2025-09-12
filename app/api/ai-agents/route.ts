import { NextResponse } from "next/server";
import { VideoEditingAI } from "@/lib/ai-agents/core";

export async function POST(req: Request) {
  try {
    const { videoUrl, action, preferences = {} } = await req.json();

    if (!videoUrl) {
      return NextResponse.json({ error: "Video URL is required" }, { status: 400 });
    }

    const ai = new VideoEditingAI();

    switch (action) {
      case 'analyze':
        const analysis = await ai.analyzeVideo(videoUrl);
        return NextResponse.json({ analysis });

      case 'generate_plan':
        const videoAnalysis = await ai.analyzeVideo(videoUrl);
        const editingSuggestions = await ai.generateEditingPlan(videoAnalysis, preferences);
        return NextResponse.json({ 
          analysis: videoAnalysis,
          suggestions: editingSuggestions,
          totalSuggestions: editingSuggestions.length,
          highPriority: editingSuggestions.filter(s => s.priority === 'high').length
        });

      case 'execute_plan':
        const requestBody = await req.json();
        const { suggestions: planSuggestions } = requestBody;
        if (!planSuggestions) {
          return NextResponse.json({ error: "Suggestions array is required for execution" }, { status: 400 });
        }
        const actions = await ai.executeEditingPlan(planSuggestions);
        return NextResponse.json({ actions });

      case 'get_capabilities':
        const capabilities = ai.getCapabilities();
        return NextResponse.json({ capabilities });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

  } catch (error: unknown) {
    console.error("Error in AI agent processing:", error);
    return NextResponse.json(
      { error: "Failed to process AI agent request" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const ai = new VideoEditingAI();
    const capabilities = ai.getCapabilities();
    
    return NextResponse.json({
      status: "AI Video Editing System Online",
      agents: Object.keys(capabilities),
      totalCapabilities: Object.values(capabilities).reduce((sum, caps) => sum + caps.length, 0),
      capabilities
    });
  } catch (error: unknown) {
    console.error("Error getting AI system status:", error);
    return NextResponse.json(
      { error: "Failed to get AI system status" },
      { status: 500 }
    );
  }
}