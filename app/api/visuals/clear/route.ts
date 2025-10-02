import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
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

    // Delete all visuals for this user
    const deletedCount = await prisma.visual.deleteMany({
      where: {
        userId: user.id
      }
    });

    return NextResponse.json({ 
      success: true, 
      deletedCount: deletedCount.count,
      message: `Deleted ${deletedCount.count} visuals`
    });
  } catch (error) {
    console.error('Error clearing visuals:', error);
    return NextResponse.json({ error: 'Failed to clear visuals' }, { status: 500 });
  }
}