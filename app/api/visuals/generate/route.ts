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
    
    // Enhanced prompt for stunning product visuals - MAINTAIN ORIGINAL PRODUCT DESIGN
    const enhancedPrompt = `Create a stunning, professional product photography scene featuring EXACTLY the same product described below.

🔒 CRITICAL PRODUCT INTEGRITY REQUIREMENTS:
- The product MUST remain 100% identical to the original design
- Keep ALL colors, patterns, textures, and materials EXACTLY as described
- Preserve ALL logos, text, branding, labels, and graphics without any distortion
- Maintain the product's exact shape, proportions, size, and features
- Do NOT modify, alter, or change ANY aspect of the actual product
- The product should look IDENTICAL to the original - only enhance the photography

📋 EXACT PRODUCT TO PRESERVE:
Product Name: ${productName || 'product'}
Detailed Description: ${productDescription || 'No description provided'}

🎨 PHOTOGRAPHY STYLE ENHANCEMENT:
Style Direction: ${style}
Creative Vision: ${prompt}

✨ PHOTOGRAPHY IMPROVEMENTS ONLY:
- Professional studio lighting and dramatic shadows
- Premium background environment that complements the product
- Sophisticated camera angles and composition
- High-end commercial photography aesthetic
- Perfect color grading and exposure
- Marketing-ready visual appeal
- Artistic mood and atmosphere

🚫 STRICTLY FORBIDDEN:
- Changing product colors or design elements
- Modifying logos, text, or branding
- Altering product shape or features
- Adding or removing product elements
- Distorting any visual characteristics

✅ GOAL: Create a professional, visually stunning photograph that showcases the EXACT SAME product in an enhanced photography setup. Only change lighting, background, camera work, and artistic presentation - NEVER the product itself.

Generate a high-quality product photograph that maintains 100% product integrity while achieving maximum visual impact.`;

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
