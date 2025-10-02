import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const timeframe = url.searchParams.get('timeframe') || '30d'
    
    const dateFilter = new Date()
    switch (timeframe) {
      case '7d':
        dateFilter.setDate(dateFilter.getDate() - 7)
        break
      case '30d':
        dateFilter.setDate(dateFilter.getDate() - 30)
        break
      case '90d':
        dateFilter.setDate(dateFilter.getDate() - 90)
        break
      default:
        dateFilter.setDate(dateFilter.getDate() - 30)
    }

    // Get analytics data
    const analytics = await prisma.analytics.findMany({
      where: {
        createdAt: {
          gte: dateFilter
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Calculate user metrics
    const totalUsers = await prisma.user.count()
    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: dateFilter
        }
      }
    })

    // Get user activity patterns
    const userActivities = await prisma.analytics.groupBy({
      by: ['userId'],
      _count: {
        action: true
      },
      where: {
        createdAt: {
          gte: dateFilter
        }
      }
    })

    const avgActivitiesPerUser = userActivities.length > 0 
      ? userActivities.reduce((sum, user) => sum + user._count.action, 0) / userActivities.length 
      : 0

    // Get action breakdown
    const actionBreakdown = await prisma.analytics.groupBy({
      by: ['action'],
      _count: {
        action: true
      },
      where: {
        createdAt: {
          gte: dateFilter
        }
      }
    })

    // Get recent users with low activity
    const recentUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: dateFilter
        }
      },
      include: {
        analytics: {
          select: {
            action: true,
            createdAt: true
          }
        }
      }
    })

    const lowEngagementUsers = recentUsers.filter(user => user.analytics.length < 3)

    const insights = {
      totalUsers,
      newUsers,
      avgActivitiesPerUser,
      lowEngagementCount: lowEngagementUsers.length,
      actionBreakdown: actionBreakdown.map(action => ({
        action: action.action,
        count: action._count.action
      })),
      // Calculate estimated engagement score
      engagementScore: avgActivitiesPerUser > 0 ? Math.min(avgActivitiesPerUser * 10, 100) : 0,
      recommendations: []
    }

    // Generate insights
    if (insights.lowEngagementCount > insights.newUsers * 0.3) {
      insights.recommendations.push({
        type: 'high_churn_risk',
        message: 'High percentage of low-engagement users detected. Consider implementing onboarding improvements.',
        priority: 'high'
      })
    }

    if (insights.engagementScore < 30) {
      insights.recommendations.push({
        type: 'low_engagement',
        message: 'User engagement is below optimal levels. Consider adding more interactive features.',
        priority: 'medium'
      })
    }

    if (insights.newUsers > 0 && insights.avgActivitiesPerUser > 5) {
      insights.recommendations.push({
        type: 'growth_opportunity',
        message: 'New users are highly engaged. Consider scaling acquisition efforts.',
        priority: 'low'
      })
    }

    return NextResponse.json({
      analytics,
      insights,
      timeframe
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}