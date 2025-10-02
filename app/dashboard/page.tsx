'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface AnalyticsData {
  insights: {
    totalUsers: number
    newUsers: number
    avgActivitiesPerUser: number
    lowEngagementCount: number
    estimatedCAC: number
    acquisitionChannels: Array<{
      channel: string
      count: number
    }>
    recommendations: Array<{
      type: string
      message: string
      priority: string
    }>
  }
  metrics: any[]
  timeframe: string
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchAnalytics()
    }
  }, [status, router])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/dashboard')
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const trackActivity = async (action: string, metadata?: any) => {
    try {
      await fetch('/api/analytics/activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, metadata }),
      })
    } catch (error) {
      console.error('Failed to track activity:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Analytics Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {session.user?.name || session.user?.email}
              </span>
              <button
                onClick={() => signOut()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {analytics && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="text-2xl font-bold text-gray-900">
                          {analytics.insights.totalUsers}
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Users
                          </dt>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="text-2xl font-bold text-gray-900">
                          {analytics.insights.newUsers}
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            New Users (30d)
                          </dt>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="text-2xl font-bold text-gray-900">
                          ${analytics.insights.estimatedCAC.toFixed(2)}
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Est. CAC
                          </dt>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="text-2xl font-bold text-gray-900">
                          {analytics.insights.avgActivitiesPerUser.toFixed(1)}
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Avg Activities/User
                          </dt>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acquisition Channels */}
              <div className="bg-white shadow rounded-lg mb-8">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Acquisition Channels
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analytics.insights.acquisitionChannels.map((channel, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-500 capitalize">
                          {channel.channel}
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {channel.count}
                        </div>
                        <div className="text-sm text-gray-600">
                          {((channel.count / analytics.insights.newUsers) * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI-Powered Recommendations */}
              <div className="bg-white shadow rounded-lg mb-8">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    AI-Powered Insights & Recommendations
                  </h3>
                  {analytics.insights.recommendations.length > 0 ? (
                    <div className="space-y-4">
                      {analytics.insights.recommendations.map((rec, index) => (
                        <div key={index} className={`p-4 rounded-lg ${getPriorityColor(rec.priority)}`}>
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <span className="text-xs font-medium uppercase tracking-wide">
                                {rec.priority} Priority
                              </span>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium">
                                {rec.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No specific recommendations at this time. Your metrics look healthy!</p>
                  )}
                </div>
              </div>

              {/* Demo Actions */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Demo Actions (Track User Behavior)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                      onClick={() => trackActivity('video_generated')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Generate Video
                    </button>
                    <button
                      onClick={() => trackActivity('image_created')}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Create Image
                    </button>
                    <button
                      onClick={() => trackActivity('brand_guidelines_used')}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Use Brand Guidelines
                    </button>
                    <button
                      onClick={() => trackActivity('product_viewed')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      View Product
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}