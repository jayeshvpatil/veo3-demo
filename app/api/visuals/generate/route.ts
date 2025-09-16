import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY environment variable is not set." }, { status: 500 });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    const body = await req.json();
    const { prompt, productName, productDescription, style = "professional product photography", count = 1 } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const config = {
      responseModalities: ['IMAGE', 'TEXT'],
    };

    const model = 'gemini-2.5-flash-image-preview';
    
    // Google Gemini recommended product photography template with STRICT MATERIAL FIDELITY
    const enhancedPrompt = `A high-resolution, studio-lit product photograph of a ${productDescription || productName || 'Michael Kors Atlas trainer'} on a ${style === 'Professional Photography' ? 'clean white seamless paper backdrop' : 'premium surface that complements the product'}.

CRITICAL MATERIAL ACCURACY REQUIREMENTS:
- If this is an Atlas trainer in "Natural" color: MUST maintain the exact grayish-natural tone (NOT beige/tan/warm tones)
- If mesh materials are described: PRESERVE the exact breathable mesh texture and appearance
- If suede is mentioned: MAINTAIN the soft suede texture and original color exactly
- If leather panels exist: KEEP smooth leather panels with their authentic finish
- If sculptural rubber sole described: PRESERVE the exact sole design and color

EXACT PRODUCT REPRODUCTION MANDATORY:
The product MUST be reproduced with 100% material and color accuracy to: "${productDescription || 'the original product description'}"

FORBIDDEN COLOR SHIFTS (CRITICAL):
- NO changing "Natural" to beige, tan, brown, or any warmer tones
- NO altering mesh texture, pattern, or color
- NO modifying suede color, texture, or material appearance  
- NO changing leather panel colors, finishes, or materials
- NO altering sole design, color, proportions, or sculptural details
- PRESERVE the exact cool-toned grayish "Natural" color as described

The lighting is a three-point softbox setup to highlight the authentic materials without any color temperature shifts or distortion. The camera angle is a 45-degree elevated view to showcase the product's authentic form and precise material details. Ultra-realistic, with sharp focus on maintaining exact color accuracy and material fidelity.

Creative direction: ${prompt}

STRICT MATERIAL PRESERVATION CHECKLIST:
✓ Reproduce EXACT color described (especially "Natural" = cool grayish tone, NOT warm beige/tan)
✓ Maintain ALL texture details (mesh, suede, leather) exactly as originally described
✓ Preserve ALL design elements including sole shape, proportions, and sculptural features
✓ Keep ALL logos, text, branding identical, legible, and undistorted
✓ NO modifications to product materials, colors, textures, or design elements
✓ Focus enhancement ONLY on lighting, background, and camera positioning

Generate a professional product photograph that showcases the authentic product with perfect material fidelity and exact color reproduction. The product must be immediately recognizable as the exact same item with identical materials, colors, and design. 16:9 aspect ratio.`;

    // Generate multiple images (limit to 4 max for performance)
    const imageCount = Math.min(Math.max(count, 1), 4);
    const generatePromises = Array.from({ length: imageCount }, () => {
      const contents = [
        {
          role: 'user' as const,
          parts: [
            {
              text: enhancedPrompt,
            },
          ],
        },
      ];

      return ai.models.generateContent({
        model,
        config,
        contents,
      });
    });

    console.log(`Generating ${imageCount} visuals...`);
    const responses = await Promise.all(generatePromises);
    console.log('Generated responses count:', responses.length);

    const generatedImages: Array<{ data: string; mimeType: string; description?: string }> = [];
    let textResponse = '';

    // Extract images and text from all responses
    for (const response of responses) {
      if (response.candidates && response.candidates[0]?.content?.parts) {
        const parts = response.candidates[0].content.parts;
        
        for (const part of parts) {
          // Handle image data
          if (part.inlineData) {
            console.log('Found inline data with mime type:', part.inlineData.mimeType);
            console.log('Data length:', part.inlineData.data?.length);
            console.log('Data sample:', part.inlineData.data?.substring(0, 50) + '...');
            
            if (part.inlineData.data && part.inlineData.data.length > 0) {
              // Clean the base64 data to ensure it's properly formatted
              const cleanedData = part.inlineData.data.replace(/\s/g, '');
              
              // Validate base64 format
              try {
                atob(cleanedData);
                console.log('✅ Valid base64 data:', {
                  originalLength: part.inlineData.data.length,
                  cleanedLength: cleanedData.length,
                  mimeType: part.inlineData.mimeType,
                  dataPrefix: cleanedData.substring(0, 50)
                });
              } catch (error) {
                console.error('❌ Invalid base64 data:', error);
                continue;
              }
              
              generatedImages.push({
                data: cleanedData,
                mimeType: part.inlineData.mimeType || 'image/jpeg',
              });
            } else {
              console.warn('⚠️ Empty image data found in response part');
            }
          }
          
          // Handle text response (only from first response to avoid duplication)
          if (part.text && textResponse === '') {
            textResponse = part.text;
          }
        }
      }
    }

    console.log('Generated images count:', generatedImages.length);
    console.log('Text response length:', textResponse.length);

    return NextResponse.json({
      images: generatedImages,
      description: textResponse,
      prompt: enhancedPrompt,
    });

  } catch (error: unknown) {
    console.error("Error generating product visuals:", error);
    return NextResponse.json(
      { error: "Failed to generate product visuals" },
      { status: 500 }
    );
  }
}
