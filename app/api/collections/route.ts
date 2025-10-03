import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get projectId from query params if provided
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const collections = await prisma.collection.findMany({
      where: {
        userId: user.id,
        ...(projectId && { projectId })
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        collectionVisuals: {
          include: {
            visual: {
              select: {
                id: true,
                type: true,
                imageUrl: true,
                videoUrl: true,
                createdAt: true
              }
            }
          },
          orderBy: { order: 'asc' },
          take: 3 // Get first 3 visuals for preview
        },
        _count: {
          select: { collectionVisuals: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({ collections });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, color, projectId } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Collection name is required" }, { status: 400 });
    }

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id
      }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const collection = await prisma.collection.create({
      data: {
        userId: user.id,
        projectId,
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#3B82F6'
      },
      include: {
        collectionVisuals: {
          include: {
            visual: true
          }
        },
        _count: {
          select: { collectionVisuals: true }
        }
      }
    });

    return NextResponse.json({ collection });
  } catch (error) {
    console.error("Error creating collection:", error);
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
  }
}