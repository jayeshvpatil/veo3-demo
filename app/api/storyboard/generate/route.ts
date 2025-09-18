import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

interface VideoScene {
  id: string;
  name: string;
  prompt: string;
  startFrame?: string;
  endFrame?: string;
  duration: number;
  aspectRatio: string;
  model: string;
}

interface SocialMediaTemplate {
  id: string;
  name: string;
  aspectRatio: string;
  duration: number;
  description: string;
  scenes: number;
}

interface StoryboardRequest {
  scenes: VideoScene[];
  template: SocialMediaTemplate;
}

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY environment variable is not set." }, { status: 500 });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    const body: StoryboardRequest = await req.json();
    const { scenes, template } = body;

    if (!scenes || scenes.length === 0) {
      return NextResponse.json({ error: "No scenes provided" }, { status: 400 });
    }

    // Start generating videos for each scene
    const sceneOperations: Array<{
      sceneId: string;
      operationName: string;
      scene: VideoScene;
    }> = [];

    for (const scene of scenes) {
      try {
        // Prepare image data for start/end frames
        let image: { imageBytes: string; mimeType: string } | undefined;
        
        if (scene.startFrame) {
          const imageData = scene.startFrame.includes(',') 
            ? scene.startFrame.split(',')[1] 
            : scene.startFrame;
          image = { 
            imageBytes: imageData, 
            mimeType: "image/png" 
          };
        }

        // Enhanced prompt with scene-specific instructions
        const enhancedPrompt = `
${scene.prompt}

This is scene ${scenes.indexOf(scene) + 1} of ${scenes.length} in a ${template.name} social media ad.
Duration: ${scene.duration} seconds.
Style: Professional, engaging, suitable for social media.
${scene.startFrame ? 'Starting from the provided image frame.' : ''}
${scene.endFrame ? 'Ending at the provided end frame.' : ''}
`;

        const operation = await ai.models.generateVideos({
          model: scene.model,
          prompt: enhancedPrompt.trim(),
          ...(image ? { image } : {}),
          config: {
            aspectRatio: scene.aspectRatio,
            durationSeconds: scene.duration,
            numberOfVideos: 1,
            // Add end frame if provided
            ...(scene.endFrame ? { 
              lastFrame: {
                imageBytes: scene.endFrame.includes(',') 
                  ? scene.endFrame.split(',')[1] 
                  : scene.endFrame,
                mimeType: "image/png"
              }
            } : {}),
          },
        });

        const operationName = (operation as unknown as { name?: string }).name;
        if (operationName) {
          sceneOperations.push({
            sceneId: scene.id,
            operationName,
            scene,
          });
        }
      } catch (error) {
        console.error(`Error generating video for scene ${scene.id}:`, error);
        // Continue with other scenes even if one fails
      }
    }

    if (sceneOperations.length === 0) {
      return NextResponse.json({ error: "Failed to start any video generations" }, { status: 500 });
    }

    // Return the operation details for tracking
    return NextResponse.json({
      storyboardId: `storyboard-${Date.now()}`,
      template,
      totalScenes: scenes.length,
      operationsStarted: sceneOperations.length,
      operations: sceneOperations.map(op => ({
        sceneId: op.sceneId,
        operationName: op.operationName,
        sceneName: op.scene.name,
        status: 'generating'
      })),
      estimatedTotalDuration: scenes.reduce((total, scene) => total + scene.duration, 0)
    });

  } catch (error: unknown) {
    console.error("Error generating storyboard:", error);
    
    // Enhanced error handling for storyboard generation
    if (error && typeof error === 'object' && 'status' in error && error.status === 429) {
      return NextResponse.json(
        { 
          error: "API quota exceeded. Storyboard generation requires multiple video calls. Please try again later or reduce the number of scenes.",
          type: "quota_exceeded"
        },
        { status: 429 }
      );
    }
    
    if (error && typeof error === 'object' && 'status' in error) {
      const apiError = error as { status: number; message?: string };
      return NextResponse.json(
        { 
          error: apiError.message || "API request failed",
          type: "api_error"
        },
        { status: apiError.status }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to generate storyboard" },
      { status: 500 }
    );
  }
}