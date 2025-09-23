import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY environment variable is not set." }, { status: 500 });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    const body = await req.json();
    const { 
      prompt, 
      count = 1,
      productImage,
      templateFields = {},
      brandGuidelines = ''
    } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // Extract template fields with defaults
    const {
      productSubject = 'premium product',
      backgroundSurface = 'clean white seamless paper backdrop',
      lightingSetup = 'three-point softbox setup',
      lightingPurpose = 'highlight authentic materials without color distortion',
      cameraAngle = '45-degree elevated view',
      showcaseFeature = "the product's authentic form and material details",
      focusDetail = 'material fidelity and exact color reproduction',
      aspectRatio = '16:9 aspect ratio'
    } = templateFields;

    const config = {
      responseModalities: ['IMAGE', 'TEXT'],
      temperature:1.0,
    };

    const model = 'gemini-2.5-flash-image-preview';
    
    // Helper function to convert image URL to base64
    const getImageData = async (imageUrl: string) => {
      if (!imageUrl) return null;
      
      try {
        // If it's already a data URL, extract the base64 part
        if (imageUrl.startsWith('data:')) {
          const base64Match = imageUrl.match(/data:([^;]+);base64,(.+)/);
          if (base64Match) {
            return {
              data: base64Match[2],
              mimeType: base64Match[1]
            };
          }
        }
        
        // If it's a regular URL, fetch and convert
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error('Failed to fetch image');
        
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const mimeType = response.headers.get('content-type') || 'image/jpeg';
        
        return {
          data: base64,
          mimeType
        };
      } catch (error) {
        console.error('Error processing image:', error);
        return null;
      }
    };

    // Get product image data if available
    const imageData = productImage ? await getImageData(productImage) : null;

    const enhancedPrompt = imageData 
      ? `Create a hyper-realistic, studio-quality product photograph based on the provided product image reference. Place the product on a ${backgroundSurface}. 

PHOTOGRAPHY SETUP: The lighting is a ${lightingSetup} to ${lightingPurpose}. The camera angle is a ${cameraAngle} to showcase ${showcaseFeature}. Ultra-realistic studio photography, with sharp focus on ${focusDetail}. ${aspectRatio}.

STRICT PRESERVATION REQUIREMENTS:
- NEVER alter, modify, or distort any text, fonts, logos, or brand markings visible on the product
- PRESERVE all typography exactly as it appears in the original image
- MAINTAIN the exact look and feel of all logos and brand elements
- DO NOT change, enhance, or stylize any textual elements
- KEEP all product labels, tags, and markings identical to the source
- ENSURE brand integrity is absolutely maintained

PROFESSIONAL PHOTOGRAPHY STANDARDS:
- Use hyper-specific material reproduction: exact texture details, surface properties, and finish characteristics
- Apply professional studio lighting techniques with precise shadow control and highlight placement
- Implement macro-level detail capture with crystal-clear edge definition
- Create museum-quality color accuracy and tonal reproduction
- Position product with intentional composition following rule of thirds and professional framing

Creative direction: ${prompt}

${brandGuidelines ? `BRAND GUIDELINES COMPLIANCE:
${brandGuidelines}

IMPORTANT: Ensure all visual elements strictly adhere to the brand guidelines above while maintaining the technical photography requirements.

` : ''}FINAL REQUIREMENTS: The generated image must be immediately recognizable as the exact same product with identical branding, typography, and design elements. Focus enhancement ONLY on lighting, background, and camera positioning while preserving 100% product authenticity.`
      : `Create a hyper-realistic, studio-quality product photograph of a ${productSubject} positioned on a ${backgroundSurface}.

PHOTOGRAPHY SETUP: The lighting is a ${lightingSetup} to ${lightingPurpose}. The camera angle is a ${cameraAngle} to showcase ${showcaseFeature}. Ultra-realistic studio photography, with sharp focus on ${focusDetail}. ${aspectRatio}.

PROFESSIONAL PHOTOGRAPHY STANDARDS:
- Use hyper-specific material descriptions with exact texture details and surface properties
- Apply professional studio lighting techniques with precise shadow control
- Implement macro-level detail capture with crystal-clear definition
- Create museum-quality color accuracy and tonal reproduction
- Position subject with intentional composition following professional framing principles

Creative direction: ${prompt}

${brandGuidelines ? `BRAND GUIDELINES COMPLIANCE:
${brandGuidelines}

IMPORTANT: Ensure all visual elements strictly adhere to the brand guidelines above while maintaining the technical photography requirements.

` : ''}TECHNICAL SPECIFICATIONS: Professional commercial photography quality with sharp edge definition, accurate material representation, and studio-grade lighting execution.`;

    // Generate multiple images (limit to 4 max for performance)
    const imageCount = Math.min(Math.max(count, 1), 4);
    const generatePromises = Array.from({ length: imageCount }, () => {
      const parts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [
        {
          text: enhancedPrompt,
        }
      ];

      // Add the product image if available
      if (imageData) {
        parts.push({
          inlineData: {
            data: imageData.data,
            mimeType: imageData.mimeType,
          },
        });
      }

      const contents = [
        {
          role: 'user' as const,
          parts,
        },
      ];

      return ai.models.generateContent({
        model,
        config,
        contents,
      });
    });

    console.log(`Generating ${imageCount} visuals...`);
    console.log('Product image provided:', !!productImage);
    console.log('Image data processed:', !!imageData);
    if (imageData) {
      console.log('Image mime type:', imageData.mimeType);
      console.log('Image data length:', imageData.data.length);
    }
    
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
