import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { query, referenceImage, projectId } = await request.json();

    if (!query && !referenceImage) {
      return NextResponse.json(
        { error: "Query text or reference image is required" },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build where clause for filtering
    const whereClause: any = {
      userId: user.id,
      status: 'completed'
    };

    if (projectId) {
      whereClause.projectId = projectId;
    }

    // Fetch all user's visuals
    let visuals = await prisma.visual.findMany({
      where: whereClause,
      include: {
        project: {
          select: { 
            name: true,
            description: true
          }
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

    // For now, focus on text search (we'll add visual search later)
    if (query && !referenceImage) {
      const searchLower = query.toLowerCase();
      
      console.log('Search query:', searchLower);
      console.log('Total visuals before filter:', visuals.length);
      
      visuals = visuals.filter(v => {
        // Search in prompt
        const promptMatch = v.prompt?.toLowerCase().includes(searchLower);
        
        // Search in manual tags
        const tagsMatch = v.tags?.toLowerCase().includes(searchLower);
        
        // Search in AI tags
        const aiTagsMatch = v.aiTags?.toLowerCase().includes(searchLower);
        
        // Search in AI description
        const aiDescMatch = v.aiDescription?.toLowerCase().includes(searchLower);
        
        // Search in project name
        const projectNameMatch = v.project?.name?.toLowerCase().includes(searchLower);
        
        // Search in project description
        const projectDescMatch = v.project?.description?.toLowerCase().includes(searchLower);
        
        const match = promptMatch || tagsMatch || aiTagsMatch || aiDescMatch || projectNameMatch || projectDescMatch;
        
        if (match) {
          console.log('Match found:', {
            id: v.id,
            prompt: v.prompt,
            tags: v.tags,
            aiTags: v.aiTags,
            aiDescription: v.aiDescription,
            projectName: v.project?.name,
            promptMatch,
            tagsMatch,
            aiTagsMatch,
            aiDescMatch,
            projectNameMatch
          });
        }
        
        return match;
      });
      
      console.log('Total visuals after filter:', visuals.length);
    }

    // Transform to match expected format
    const formattedVisuals = visuals.map(v => ({
      id: v.id,
      url: v.videoUrl || v.imageUrl || '',
      prompt: v.prompt,
      timestamp: v.createdAt.getTime(),
      type: v.type,
      metadata: v.metadata ? JSON.parse(v.metadata) : null,
      tags: v.tags,
      aiTags: v.aiTags,
      aiDescription: v.aiDescription,
      project: v.project,
      collections: v.collectionVisuals.map(cv => ({ name: cv.collection.name }))
    }));

    return NextResponse.json({
      success: true,
      visuals: formattedVisuals,
      count: formattedVisuals.length,
      searchMethod: 'text'
    });

  } catch (error) {
    console.error("Error searching visuals:", error);
    return NextResponse.json(
      { error: "Failed to search visuals" },
      { status: 500 }
    );
  }
}
