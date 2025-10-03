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

    const { visualIds, collectionId } = await request.json();

    if (!visualIds || !Array.isArray(visualIds) || visualIds.length === 0) {
      return NextResponse.json(
        { error: "Visual IDs array is required" },
        { status: 400 }
      );
    }

    if (!collectionId) {
      return NextResponse.json(
        { error: "Collection ID is required" },
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

    // Verify collection ownership
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      include: { project: true }
    });

    if (!collection || collection.project.userId !== user.id) {
      return NextResponse.json(
        { error: "Collection not found or unauthorized" },
        { status: 404 }
      );
    }

    // Verify all visuals belong to the user
    const visuals = await prisma.visual.findMany({
      where: {
        id: { in: visualIds },
        userId: user.id
      }
    });

    if (visuals.length !== visualIds.length) {
      return NextResponse.json(
        { error: "Some visuals not found or unauthorized" },
        { status: 404 }
      );
    }

    // Create CollectionVisual entries for each visual
    const collectionVisuals = await Promise.all(
      visualIds.map((visualId) =>
        prisma.collectionVisual.upsert({
          where: {
            collectionId_visualId: {
              collectionId,
              visualId
            }
          },
          create: {
            collectionId,
            visualId
          },
          update: {}
        })
      )
    );

    return NextResponse.json({
      success: true,
      count: collectionVisuals.length,
      collection
    });

  } catch (error) {
    console.error("Error adding visuals to collection:", error);
    return NextResponse.json(
      { error: "Failed to add visuals to collection" },
      { status: 500 }
    );
  }
}

// Remove visuals from collection
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { visualIds } = await request.json();

    if (!visualIds || !Array.isArray(visualIds) || visualIds.length === 0) {
      return NextResponse.json(
        { error: "Visual IDs array is required" },
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

    // Remove visuals from collection (delete CollectionVisual entries)
    const deleteResult = await prisma.collectionVisual.deleteMany({
      where: {
        visualId: { in: visualIds },
        collection: {
          project: {
            userId: user.id
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      count: deleteResult.count
    });

  } catch (error) {
    console.error("Error removing visuals from collection:", error);
    return NextResponse.json(
      { error: "Failed to remove visuals from collection" },
      { status: 500 }
    );
  }
}
