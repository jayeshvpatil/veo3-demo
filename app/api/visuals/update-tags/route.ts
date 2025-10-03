import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { visualId, tags } = await request.json();

    if (!visualId) {
      return NextResponse.json(
        { error: "Visual ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const visual = await prisma.visual.findUnique({
      where: { id: visualId },
      include: { user: true }
    });

    if (!visual || visual.user.email !== session.user.email) {
      return NextResponse.json(
        { error: "Visual not found or unauthorized" },
        { status: 404 }
      );
    }

    // Update tags
    const updatedVisual = await prisma.visual.update({
      where: { id: visualId },
      data: { tags: tags || null }
    });

    return NextResponse.json({
      success: true,
      visual: updatedVisual
    });

  } catch (error) {
    console.error("Error updating tags:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update tags";
    return NextResponse.json(
      { error: errorMessage, details: error },
      { status: 500 }
    );
  }
}
