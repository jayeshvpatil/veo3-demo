import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY environment variable is not set." }, { status: 500 });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
    const model = (form.get("model") as string) || "veo-3.0-generate-preview";
    const negativePrompt = (form.get("negativePrompt") as string) || undefined;
    const aspectRatio = (form.get("aspectRatio") as string) || undefined;

    const imageFile = form.get("imageFile");
    const imageBase64 = (form.get("imageBase64") as string) || undefined;
    const imageMimeType = (form.get("imageMimeType") as string) || undefined;

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    let image: { imageBytes: string; mimeType: string } | undefined;

    // Check if the imageFile has the required methods (works in both browser and Node.js)
    if (imageFile && typeof imageFile === 'object' && 'arrayBuffer' in imageFile) {
      const fileObject = imageFile as { arrayBuffer(): Promise<ArrayBuffer>; type?: string };
      const buf = await fileObject.arrayBuffer();
      const b64 = Buffer.from(buf).toString("base64");
      const mimeType = fileObject.type || "image/png";
      image = { imageBytes: b64, mimeType };
    } else if (imageBase64) {
      const cleaned = imageBase64.includes(",")
        ? imageBase64.split(",")[1]
        : imageBase64;
      image = { imageBytes: cleaned, mimeType: imageMimeType || "image/png" };
    }

    // Implement retry logic with exponential backoff
    let operation;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        operation = await ai.models.generateVideos({
          model,
          prompt,
          ...(image ? { image } : {}),
          config: {
            ...(aspectRatio ? { aspectRatio } : {}),
            ...(negativePrompt ? { negativePrompt } : {}),
          },
        });
        break; // Success, exit retry loop
      } catch (error: any) {
        retryCount++;
        
        // Check if it's a rate limit error
        if (error?.status === 429 || error?.message?.includes('quota') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
          if (retryCount < maxRetries) {
            const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
            console.log(`Rate limited. Retrying in ${delay}ms (attempt ${retryCount}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          } else {
            // Max retries reached, return user-friendly error
            return NextResponse.json({
              error: "API quota exceeded. Please try again later or check your billing plan.",
              details: "You've exceeded your current quota for video generation. Please check your plan and billing details at https://ai.google.dev/gemini-api/docs/rate-limits",
              retryAfter: "Please wait a few minutes before trying again."
            }, { status: 429 });
          }
        } else {
          // Different error, don't retry
          throw error;
        }
      }
    }

    const name = (operation as unknown as { name?: string }).name;
    return NextResponse.json({ name });
  } catch (error: unknown) {
    console.error("Error starting Veo generation:", error);
    return NextResponse.json(
      { error: "Failed to start generation" },
      { status: 500 }
    );
  }
}
