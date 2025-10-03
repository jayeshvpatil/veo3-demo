import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.0-flash-exp";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { visualId, imageUrl } = await request.json();

    if (!visualId || !imageUrl) {
      return NextResponse.json(
        { error: "Visual ID and image URL are required" },
        { status: 400 }
      );
    }

    // Get the visual from database
    const visual = await prisma.visual.findUnique({
      where: { id: visualId },
      include: { user: true }
    });

    if (!visual || visual.user.email !== session.user.email) {
      return NextResponse.json(
        { error: "Visual not found or unauthorized" },
        { status: 404 }
      );
    }

    // Call Gemini API for image analysis
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: "Analyze this image and provide: 1) A list of relevant tags (objects, scenes, colors, mood, style) separated by commas. 2) A brief description for search purposes. Format your response as JSON with 'tags' and 'description' fields."
              },
              {
                inlineData: {
                  mimeType: imageUrl.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
                  data: imageUrl.split(',')[1] || imageUrl
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 500
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      console.error('Gemini API error:', await geminiResponse.text());
      return NextResponse.json(
        { error: "Failed to analyze image" },
        { status: 500 }
      );
    }

    const geminiData = await geminiResponse.json();
    const analysisText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse the JSON response from Gemini
    let aiTags = '';
    let aiDescription = '';
    
    try {
      // Try to extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        aiTags = parsed.tags || '';
        aiDescription = parsed.description || '';
      } else {
        // Fallback: use the entire text as description
        aiDescription = analysisText;
      }
    } catch (e) {
      console.error('Failed to parse Gemini response:', e);
      aiDescription = analysisText;
    }

    // Update the visual with AI-generated tags and description
    const updatedVisual = await prisma.visual.update({
      where: { id: visualId },
      data: {
        aiTags,
        aiDescription
      }
    });

    return NextResponse.json({
      success: true,
      aiTags,
      aiDescription,
      visual: updatedVisual
    });

  } catch (error) {
    console.error("Error generating AI tags:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate AI tags";
    return NextResponse.json(
      { error: errorMessage, details: error },
      { status: 500 }
    );
  }
}
