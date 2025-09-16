import { NextResponse } from "next/server";
import { videoRouter, VideoGenerationRequest } from "@/lib/video-providers";

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
    const model = (form.get("model") as string) || "auto";
    const negativePrompt = (form.get("negativePrompt") as string) || undefined;
    const aspectRatio = (form.get("aspectRatio") as string) || undefined;
    const costPriority = (form.get("costPriority") as string) || "balanced";
    const urgency = (form.get("urgency") as string) || "medium";

    const imageFile = form.get("imageFile") as File | null;
    const imageBase64 = (form.get("imageBase64") as string) || undefined;
    const imageMimeType = (form.get("imageMimeType") as string) || undefined;

    // Prepare image data
    let image = undefined;
    if (imageFile) {
      const buffer = await imageFile.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      image = {
        base64,
        mimeType: imageFile.type,
      };
    } else if (imageBase64) {
      const cleaned = imageBase64.includes(",")
        ? imageBase64.split(",")[1]
        : imageBase64;
      image = {
        base64: cleaned,
        mimeType: imageMimeType || "image/png",
      };
    }

    // Determine required capabilities
    const capabilities: string[] = [];
    if (image) capabilities.push('imageToVideo');
    if (prompt.toLowerCase().includes('face') || prompt.toLowerCase().includes('person')) {
      capabilities.push('faceEnhancement');
    }
    if (prompt.toLowerCase().includes('motion') || prompt.toLowerCase().includes('camera')) {
      capabilities.push('motionControl');
    }

    const request: VideoGenerationRequest = {
      prompt,
      model: model === "auto" ? undefined : model,
      aspectRatio,
      negativePrompt,
      image,
      preferences: {
        costPriority: costPriority as any,
        urgency: urgency as any,
        capabilities,
      },
    };

    console.log(`🎬 Video generation request:`, {
      prompt: prompt.substring(0, 100) + "...",
      provider: "auto-select",
      capabilities,
      costPriority,
    });

    const result = await videoRouter.generateVideo(request);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error,
          provider: result.provider,
          suggestions: [
            "Try again in a few minutes if quota exceeded",
            "Consider using lower cost priority",
            "Check API key configuration",
          ]
        },
        { status: result.error?.includes('quota') ? 429 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      provider: result.provider,
      operationId: result.operationId,
      videoUrl: result.videoUrl,
      estimatedTime: result.estimatedTime,
      cost: result.cost,
      name: result.operationId, // For compatibility with existing frontend
    });

  } catch (error: any) {
    console.error("Video generation error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check provider status
export async function GET() {
  const providers = videoRouter.getAvailableProviders();
  
  return NextResponse.json({
    availableProviders: providers.map(p => ({
      name: p.name,
      costLevel: p.costLevel,
      capabilities: p.capabilities,
      quotaStatus: p.quotaStatus,
    })),
    totalProviders: providers.length,
    recommendedProvider: providers.length > 0 ? providers[0].name : 'none',
  });
}