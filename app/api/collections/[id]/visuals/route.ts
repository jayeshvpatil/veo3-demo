import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
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
    const { visualIds } = body;

    if (!Array.isArray(visualIds) || visualIds.length === 0) {
      return NextResponse.json({ error: "Visual IDs are required" }, { status: 400 });
    }

    // Verify collection belongs to user
    const collection = await prisma.collection.findFirst({
      where: { 
        id: params.id,
        userId: user.id 
      }
    });

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    // Verify visuals belong to user
    const visuals = await prisma.visual.findMany({
      where: {
        id: { in: visualIds },
        userId: user.id
      }
    });

    if (visuals.length !== visualIds.length) {
      return NextResponse.json({ error: "Some visuals not found" }, { status: 404 });
    }

    // Get current max order in collection
    const maxOrder = await prisma.collectionVisual.findFirst({
      where: { collectionId: params.id },
      orderBy: { order: 'desc' },
      select: { order: true }
    });

    const startOrder = (maxOrder?.order || 0) + 1;

    // Add visuals to collection
    const collectionVisuals = await Promise.all(
      visualIds.map((visualId: string, index: number) =>
        prisma.collectionVisual.upsert({
          where: {
            collectionId_visualId: {
              collectionId: params.id,
              visualId
            }
          },
          update: {},
          create: {
            collectionId: params.id,
            visualId,
            order: startOrder + index
          }
        })
      )
    );

    return NextResponse.json({ success: true, added: collectionVisuals.length });
  } catch (error) {
    console.error("Error adding visuals to collection:", error);
    return NextResponse.json({ error: "Failed to add visuals" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
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

    const { searchParams } = new URL(request.url);
    const visualId = searchParams.get('visualId');

    if (!visualId) {
      return NextResponse.json({ error: "Visual ID is required" }, { status: 400 });
    }

    // Verify collection belongs to user
    const collection = await prisma.collection.findFirst({
      where: { 
        id: params.id,
        userId: user.id 
      }
    });

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    // Remove visual from collection
    const removed = await prisma.collectionVisual.deleteMany({
      where: {
        collectionId: params.id,
        visualId
      }
    });

    if (removed.count === 0) {
      return NextResponse.json({ error: "Visual not found in collection" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing visual from collection:", error);
    return NextResponse.json({ error: "Failed to remove visual" }, { status: 500 });
  }
}