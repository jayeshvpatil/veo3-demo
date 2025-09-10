import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory cache for generated images
const imageCache = new Map<string, { data: string; mimeType: string }>();

export async function POST(request: NextRequest) {
  try {
    const { imageData, mimeType } = await request.json();
    
    // Generate a unique ID for this image
    const imageId = Math.random().toString(36).substring(2, 15);
    
    // Store in cache
    imageCache.set(imageId, { data: imageData, mimeType });
    
    // Clean up old entries (keep only last 20 images)
    if (imageCache.size > 20) {
      const firstKey = imageCache.keys().next().value;
      imageCache.delete(firstKey);
    }
    
    console.log(`Stored image ${imageId}, cache size: ${imageCache.size}`);
    
    return NextResponse.json({ imageId });
  } catch (error) {
    console.error('Error storing image:', error);
    return NextResponse.json({ error: 'Failed to store image' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const imageId = url.searchParams.get('id');
    
    if (!imageId) {
      return NextResponse.json({ error: 'Image ID required' }, { status: 400 });
    }
    
    const imageData = imageCache.get(imageId);
    
    if (!imageData) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }
    
    // Convert base64 to buffer
    const buffer = Buffer.from(imageData.data, 'base64');
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': imageData.mimeType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json({ error: 'Failed to serve image' }, { status: 500 });
  }
}
