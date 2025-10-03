import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
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

    const collection = await prisma.collection.findFirst({
      where: { 
        id: params.id,
        userId: user.id
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
            visual: true
          },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { collectionVisuals: true }
        }
      }
    });

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    return NextResponse.json({ collection });
  } catch (error) {
    console.error("Error fetching collection:", error);
    return NextResponse.json({ error: "Failed to fetch collection" }, { status: 500 });
  }
}

export async function PUT(
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
    const { name, description, color, thumbnail } = body;

    const collection = await prisma.collection.updateMany({
      where: { 
        id: params.id,
        userId: user.id 
      },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(color && { color }),
        ...(thumbnail !== undefined && { thumbnail }),
        updatedAt: new Date()
      }
    });

    if (collection.count === 0) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    // Fetch updated collection
    const updatedCollection = await prisma.collection.findUnique({
      where: { id: params.id },
      include: {
        collectionVisuals: {
          include: {
            visual: true
          },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { collectionVisuals: true }
        }
      }
    });

    return NextResponse.json({ collection: updatedCollection });
  } catch (error) {
    console.error("Error updating collection:", error);
    return NextResponse.json({ error: "Failed to update collection" }, { status: 500 });
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

    const collection = await prisma.collection.deleteMany({
      where: { 
        id: params.id,
        userId: user.id 
      }
    });

    if (collection.count === 0) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting collection:", error);
    return NextResponse.json({ error: "Failed to delete collection" }, { status: 500 });
  }
}