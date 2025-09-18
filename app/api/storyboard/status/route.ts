import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

interface StoryboardStatusRequest {
  storyboardId: string;
  operations: Array<{
    sceneId: string;
    operationName: string;
    sceneName: string;
    status: string;
  }>;
}

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY environment variable is not set." }, { status: 500 });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    const body: StoryboardStatusRequest = await req.json();
    const { storyboardId, operations } = body;

    if (!operations || operations.length === 0) {
      return NextResponse.json({ error: "No operations to check" }, { status: 400 });
    }

    // Check status of each video generation operation
    const updatedOperations = [];
    const completedVideos = [];

    for (const operation of operations) {
      if (operation.status === 'completed') {
        updatedOperations.push(operation);
        continue;
      }

      try {
        const fresh = await ai.operations.getVideosOperation({
          operation: { name: operation.operationName } as unknown as never,
        });

        if (fresh?.done) {
          const videoUri = fresh?.response?.generatedVideos?.[0]?.video?.uri;
          if (videoUri) {
            // Download the video for combining later
            const downloadResponse = await fetch("/api/veo/download", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ uri: videoUri }),
            });

            if (downloadResponse.ok) {
              const blob = await downloadResponse.blob();
              const videoDataUrl = URL.createObjectURL(blob);
              
              completedVideos.push({
                sceneId: operation.sceneId,
                videoUri: videoDataUrl,
                originalUri: videoUri,
                sceneName: operation.sceneName
              });

              updatedOperations.push({
                ...operation,
                status: 'completed',
                videoUri: videoDataUrl
              });
            } else {
              updatedOperations.push({
                ...operation,
                status: 'error'
              });
            }
          } else {
            updatedOperations.push({
              ...operation,
              status: 'error'
            });
          }
        } else {
          // Still generating
          updatedOperations.push({
            ...operation,
            status: 'generating'
          });
        }
      } catch (error) {
        console.error(`Error checking operation ${operation.operationName}:`, error);
        updatedOperations.push({
          ...operation,
          status: 'error'
        });
      }
    }

    // Check if all videos are completed
    const allCompleted = updatedOperations.every(op => op.status === 'completed');
    const hasErrors = updatedOperations.some(op => op.status === 'error');

    let finalVideoUrl = null;
    let combineStatus = 'pending';

    // If all videos are completed, attempt to combine them
    if (allCompleted && completedVideos.length > 0) {
      try {
        // For now, we'll return the individual videos
        // In a production system, you'd use a video processing service like FFmpeg
        // to combine the videos into a single file
        combineStatus = 'completed';
        
        // TODO: Implement actual video combining logic
        // This would involve:
        // 1. Downloading all video blobs
        // 2. Using FFmpeg or similar to concatenate them
        // 3. Uploading the final combined video
        // 4. Returning the final video URL
        
        console.log("All videos completed, ready for combining:", completedVideos);
      } catch (error) {
        console.error("Error combining videos:", error);
        combineStatus = 'error';
      }
    }

    return NextResponse.json({
      storyboardId,
      operations: updatedOperations,
      progress: {
        completed: updatedOperations.filter(op => op.status === 'completed').length,
        total: updatedOperations.length,
        errors: updatedOperations.filter(op => op.status === 'error').length
      },
      allCompleted,
      hasErrors,
      combineStatus,
      finalVideoUrl,
      individualVideos: completedVideos
    });

  } catch (error: unknown) {
    console.error("Error checking storyboard status:", error);
    return NextResponse.json(
      { error: "Failed to check storyboard status" },
      { status: 500 }
    );
  }
}