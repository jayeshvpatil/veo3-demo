import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, imageUrl, videoUrl, type, metadata } = await request.json();

    if (!prompt || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create visual record
    const visual = await prisma.visual.create({
      data: {
        userId: user.id,
        prompt,
        imageUrl,
        videoUrl,
        type,
        status: 'completed',
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });

    return NextResponse.json({ 
      visual: {
        id: visual.id,
        url: visual.videoUrl || visual.imageUrl || '',
        prompt: visual.prompt,
        timestamp: visual.createdAt.getTime(),
        type: visual.type,
        metadata: visual.metadata ? JSON.parse(visual.metadata) : null
      }
    });
  } catch (error) {
    console.error('Error saving visual:', error);
    return NextResponse.json({ error: 'Failed to save visual' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const visualId = searchParams.get('id');

    if (!visualId) {
      return NextResponse.json({ error: 'Visual ID required' }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete visual (only if it belongs to the user)
    await prisma.visual.deleteMany({
      where: {
        id: visualId,
        userId: user.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting visual:', error);
    return NextResponse.json({ error: 'Failed to delete visual' }, { status: 500 });
  }
}