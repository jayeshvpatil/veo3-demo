import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch user's visuals
    const visuals = await prisma.visual.findMany({
      where: { 
        userId: user.id,
        status: 'completed'
      },
      include: {
        project: {
          select: { name: true }
        },
        collectionVisuals: {
          include: {
            collection: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform to match the SavedVisual interface
    const savedVisuals = visuals.map(visual => ({
      id: visual.id,
      url: visual.videoUrl || visual.imageUrl || '',
      prompt: visual.prompt,
      timestamp: visual.createdAt.getTime(),
      type: visual.type,
      metadata: visual.metadata ? JSON.parse(visual.metadata) : null,
      tags: visual.tags,
      aiTags: visual.aiTags,
      aiDescription: visual.aiDescription,
      project: visual.project,
      collections: visual.collectionVisuals.map(cv => ({ name: cv.collection.name }))
    }));

    return NextResponse.json({ visuals: savedVisuals });
  } catch (error) {
    console.error('Error fetching visuals:', error);
    return NextResponse.json({ error: 'Failed to fetch visuals' }, { status: 500 });
  }
}