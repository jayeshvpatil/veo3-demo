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
      userMessage,
      conversationHistory = [],
      productName,
      productDescription,
      productImage,
      agentPersonality,
      previouslyGeneratedImages = []
    } = body;

    if (!userMessage) {
      return NextResponse.json({ error: "Missing user message" }, { status: 400 });
    }

    // Convert product image URL to base64 if provided
    let productImageData = null;
    if (productImage) {
      try {
        const imageResponse = await fetch(productImage);
        if (imageResponse.ok) {
          const imageBuffer = await imageResponse.arrayBuffer();
          const base64Image = Buffer.from(imageBuffer).toString('base64');
          
          // Determine MIME type from response headers or URL
          const contentType = imageResponse.headers.get('content-type') || 
            (productImage.toLowerCase().includes('.jpg') || productImage.toLowerCase().includes('.jpeg') ? 'image/jpeg' : 
             productImage.toLowerCase().includes('.png') ? 'image/png' : 'image/jpeg');
          
          productImageData = {
            data: base64Image,
            mimeType: contentType
          };
        }
      } catch (error) {
        console.warn('Failed to fetch product image:', error);
      }
    }

    // Analyze user intent using simple text analysis (simplified approach)
    const conversationContext = conversationHistory
      .map((msg: { type: string; content: string }) => `${msg.type}: ${msg.content}`)
      .join('\n');

    // Simple intent detection based on keywords
    const message = userMessage.toLowerCase();
    const isModificationRequest = message.includes('modify') || message.includes('change') || 
                                 message.includes('adjust') || message.includes('different') ||
                                 message.includes('better') || message.includes('improve') ||
                                 message.includes('more') || message.includes('less') ||
                                 message.includes('brighter') || message.includes('darker') ||
                                 message.includes('make it') || message.includes('try') ||
                                 message.includes('background') || message.includes('lighting') ||
                                 message.includes('angle') || message.includes('style');
    
    const isQuestionOrConversation = message.includes('?') || message.includes('how') || 
                                   message.includes('what') || message.includes('why') ||
                                   message.includes('explain') || message.includes('tell me');

    let intent = 'generate_new';
    if (isModificationRequest && previouslyGeneratedImages.length > 0) {
      intent = 'modify_existing';
    } else if (isQuestionOrConversation) {
      intent = 'conversation';
    }

    const needsImageGeneration = intent !== 'conversation';
    
    // Determine which image to use as reference
    let referenceImageData = null;
    if (intent === 'modify_existing' && previouslyGeneratedImages.length > 0) {
      // Use the most recent generated image for modifications
      const latestImage = previouslyGeneratedImages[previouslyGeneratedImages.length - 1];
      referenceImageData = {
        data: latestImage.data,
        mimeType: latestImage.mimeType
      };
      console.log('Using latest generated image for modification');
    } else {
      // Use original product image for new generations
      referenceImageData = productImageData;
      console.log('Using original product image for new generation');
    }
    
    // Generate image if needed
    if (needsImageGeneration) {
      const model = 'gemini-2.5-flash-image-preview';

      // Enhanced prompt with conversation context and brand preservation requirements
      const enhancedPrompt = `
${userMessage}

${intent === 'modify_existing' ? 
  'MODIFICATION REQUEST: Make adjustments to the provided image while preserving the core product and branding.' :
  'NEW VISUAL REQUEST: Create a new visual based on the product image reference.'}

CRITICAL REQUIREMENTS:
- NEVER alter or change any text, fonts, logos, or brand markings visible in the reference image
- Preserve ALL typography, brand elements, and textual content exactly as shown
- Maintain product authenticity and material characteristics
- Focus on ${agentPersonality?.style || 'professional'} visual treatment

TECHNICAL SPECIFICATIONS:
- Professional product photography standards
- Proper lighting and composition for ${agentPersonality?.name || 'general'} use case
- Maintain visual consistency with product brand identity

PRODUCT CONTEXT:
Product: ${productName}
Description: ${productDescription || 'High-quality product'}
Agent Focus: ${agentPersonality?.description || 'Professional visual creation'}

CONVERSATION CONTEXT:
${conversationContext}

Create a compelling visual that addresses the specific request while maintaining absolute brand integrity.`;

      const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [{ text: enhancedPrompt }];

      // Add reference image (either latest generated or original product image)
      if (referenceImageData) {
        parts.push({
          inlineData: {
            mimeType: referenceImageData.mimeType,
            data: referenceImageData.data
          }
        });
      }

      try {
        const imageResult = await ai.models.generateContent({
          model,
          contents: [{
            role: 'user' as const,
            parts
          }]
        });

        // Extract images from the response
        const generatedImages: Array<{ data: string; mimeType: string }> = [];
        if (imageResult.candidates && imageResult.candidates[0]?.content?.parts) {
          const parts = imageResult.candidates[0].content.parts;
          
          for (const part of parts) {
            // Handle image data
            if (part.inlineData) {
              console.log('Found inline data with mime type:', part.inlineData.mimeType);
              
              if (part.inlineData.data && part.inlineData.data.length > 0) {
                // Clean the base64 data to ensure it's properly formatted
                const cleanedData = part.inlineData.data.replace(/\s/g, '');
                
                generatedImages.push({
                  data: cleanedData,
                  mimeType: part.inlineData.mimeType
                });
              }
            }
          }
        }

        console.log('Generated images count:', generatedImages.length);

        return NextResponse.json({
          response: `Great! I've created a ${agentPersonality?.style || 'professional'} visual based on your request. Here's what I came up with:`,
          images: generatedImages,
          intent: intent,
          conversationContinues: true
        });

      } catch (error) {
        console.error('Error generating image:', error);
        return NextResponse.json({
          response: "I apologize, but I encountered an issue generating the visual. Could you try rephrasing your request or being more specific about what you'd like to see?",
          images: [],
          intent: intent,
          error: "Image generation failed"
        }, { status: 500 });
      }
    } else {
      // Handle conversation without image generation
      return NextResponse.json({
        response: `I'd be happy to help! As your ${agentPersonality?.name || 'Creative Assistant'}, I can create visuals for "${productName}". What kind of visual would you like to see? You can ask for things like "make it more luxurious", "show it in a lifestyle setting", or "create something artistic".`,
        images: [],
        intent: intent,
        conversationContinues: true
      });
    }

  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { 
        error: "Failed to process chat message",
        response: "I apologize, but I encountered an error. Please try again.",
        images: []
      },
      { status: 500 }
    );
  }
}