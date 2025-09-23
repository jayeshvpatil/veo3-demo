import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  console.log('Brand guidelines extraction API called');
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY not found');
    return NextResponse.json({ error: "GEMINI_API_KEY environment variable is not set." }, { status: 500 });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    console.log('Parsing form data...');
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    console.log('File received:', file?.name, file?.type, file?.size);
    
    if (!file) {
      return NextResponse.json({ error: "No PDF file provided" }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
    }

    // Convert file to base64 for Gemini
    console.log('Converting file to base64...');
    const bytes = await file.arrayBuffer();
    const base64Data = Buffer.from(bytes).toString('base64');
    console.log('Base64 conversion complete, length:', base64Data.length);

    // Use Gemini 2.5 Flash to directly analyze the PDF
    console.log('Sending PDF to Gemini for analysis...');
    
    const extractionPrompt = `You are a brand guidelines expert. Analyze this PDF document and extract structured brand information.

Please extract and format the brand guidelines into the following JSON structure. Be precise and only extract information that is explicitly mentioned or clearly implied in the document:

{
  "colors": ["#hexcode1", "#hexcode2", ...],
  "fonts": ["Font Name 1", "Font Name 2", ...],
  "tone": "Brief description of brand tone and voice",
  "style": "Brief description of visual style guidelines", 
  "lighting": "Lighting preferences and requirements",
  "composition": "Composition and layout guidelines",
  "rules": ["Specific do/don't rule 1", "Specific do/don't rule 2", ...]
}

EXTRACTION RULES:
1. For colors: Look for hex codes (#RRGGBB), RGB values, color names, or Pantone references. Convert to hex codes when possible.
2. For fonts: Extract specific font family names mentioned in the document.
3. For tone: Summarize the brand voice, personality, and communication style in 1-2 sentences.
4. For style: Describe the overall visual aesthetic, design principles, and brand look in 1-2 sentences.
5. For lighting: Extract any photography or visual lighting requirements and preferences.
6. For composition: Extract layout rules, spacing guidelines, composition principles mentioned.
7. For rules: Extract specific DO and DON'T statements, restrictions, mandatory requirements, and compliance rules. Look for phrases like "Do not", "Never", "Always", "Must", "Required", "Prohibited", etc. Include exact restrictions about logo usage, layout manipulation, color modifications, etc.

If specific information is not found in the document, use "Not specified in guidelines" for that field.
Respond with ONLY the JSON object, no additional text.`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: extractionPrompt },
            {
              inlineData: {
                data: base64Data,
                mimeType: "application/pdf"
              }
            }
          ]
        }
      ],
      config: {
        temperature: 0.1,
        topP: 0.8
      }
    });

    const extractedGuidelines = result.candidates[0]?.content?.parts[0]?.text || '';

    console.log('Gemini response:', extractedGuidelines);

    // Parse the JSON response
    let parsedGuidelines;
    try {
      // Clean the response - remove any markdown formatting
      const cleanResponse = extractedGuidelines.replace(/```json\s*|\s*```/g, '').trim();
      parsedGuidelines = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      console.error('Raw response:', extractedGuidelines);
      
      // Return the raw response so we can debug
      return NextResponse.json({ 
        error: "Failed to parse brand guidelines from PDF",
        details: `Gemini response: ${extractedGuidelines}`,
        parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error'
      }, { status: 400 });
    }

    // Validate and clean the extracted guidelines
    const cleanedGuidelines = {
      colors: Array.isArray(parsedGuidelines.colors) ? parsedGuidelines.colors.slice(0, 10) : [],
      fonts: Array.isArray(parsedGuidelines.fonts) ? parsedGuidelines.fonts.slice(0, 5) : [],
      tone: typeof parsedGuidelines.tone === 'string' ? parsedGuidelines.tone : 'Professional brand communication',
      style: typeof parsedGuidelines.style === 'string' ? parsedGuidelines.style : 'Brand-compliant visual design',
      lighting: typeof parsedGuidelines.lighting === 'string' ? parsedGuidelines.lighting : 'Professional lighting standards',
      composition: typeof parsedGuidelines.composition === 'string' ? parsedGuidelines.composition : 'Brand-compliant composition',
      rules: Array.isArray(parsedGuidelines.rules) ? parsedGuidelines.rules.slice(0, 15) : []
    };

    return NextResponse.json({
      success: true,
      guidelines: cleanedGuidelines,
      fileName: file.name,
      processingMethod: 'gemini-direct-pdf'
    });

  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json({ 
      error: "Failed to process PDF and extract brand guidelines",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}