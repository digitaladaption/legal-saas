'use client'

import { useEffect, useState } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Scale, 
  Users, 
  FileText,
  Calendar,
  Clock,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'

interface AnalyticsData {
  totalCases: number
  activeCases: number
  closedCases: number
  totalClients: number
  totalRevenue: number
  averageCaseValue: number
  casesByStatus: { status: string; count: number }[]
  casesByType: { type: string; count: number }[]
  monthlyRevenue: { month: string; revenue: number }[]
  caseResolutionTime: number
  billableHours: number
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('last_30_days')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  async function fetchAnalytics() {
    try {
      // In a real implementation, you'd fetch actual data from your database
      // For demo purposes, let's use mock data
      
      const mockAnalytics: AnalyticsData = {
        totalCases: 245,
        activeCases: 89,
        closedCases: 156,
        totalClients: 178,
        totalRevenue: 892400,
        averageCaseValue: 3640,
        casesByStatus: [
          { status: 'Active', count: 89 },
          { status: 'Pending', count: 23 },
          { status: 'Closed', count: 156 },
          { status: 'On Hold', count: 12 }
        ],
        casesByType: [
          { type: 'Family Law', count: 78 },
          { type: 'Criminal Defense', count: 56 },
          { type: 'Corporate Law', count: 45 },
          { type: 'Personal Injury', count: 34 },
          { type: 'Real Estate', count: 32 }
        ],
        monthlyRevenue: [
          { month: 'Jan', revenue: 68000 },
          { month: 'Feb', revenue: 72000 },
          { month: 'Mar', revenue: 84000 },
          { month: 'Apr', revenue: 79000 },
          { month: 'May', revenue: 91000 },
          { month: 'Jun', revenue: 88000 }
        ],
        caseResolutionTime: 45, // days
        billableHours: 1248
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setAnalytics(mockAnalytics)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) return null

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">Track performance and insights across your law firm</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="last_90_days">Last 90 Days</option>
            <option value="last_year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalRevenue)}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 font-medium">+12.5%</span>
            <span className="text-sm text-gray-500 ml-2">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Cases</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.activeCases}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Scale className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 font-medium">+8.2%</span>
            <span className="text-sm text-gray-500 ml-2">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalClients}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 font-medium">+15.3%</span>
            <span className="text-sm text-gray-500 ml-2">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Case Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.averageCaseValue)}</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            <span className="text-sm text-red-600 font-medium">-3.1%</span>
            <span className="text-sm text-gray-500 ml-2">vs last period</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {analytics.monthlyRevenue.map((data, index) => (
              <div key={data.month} className="flex items-center">
                <div className="w-12 text-sm text-gray-600">{data.month}</div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${(data.revenue / Math.max(...analytics.monthlyRevenue.map(d => d.revenue))) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
                <div className="w-20 text-sm text-gray-900 text-right">
                  {formatCurrency(data.revenue)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Case Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Cases by Status</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {analytics.casesByStatus.map((data, index) => {
              const colors = ['bg-green-500', 'bg-yellow-500', 'bg-blue-500', 'bg-gray-500']
              const percentage = ((data.count / analytics.totalCases) * 100).toFixed(1)
              return (
                <div key={data.status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${colors[index]} mr-3`}></div>
                    <span className="text-sm text-gray-600">{data.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{data.count}</span>
                    <span className="text-xs text-gray-500">({percentage}%)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case Types */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Practice Areas</h3>
            <FileText className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {analytics.casesByType.slice(0, 5).map((data, index) => (
              <div key={data.type} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{data.type}</span>
                <span className="text-sm font-medium text-gray-900">{data.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-sm text-gray-600">Avg Resolution Time</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{analytics.caseResolutionTime} days</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm text-gray-600">Billable Hours</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{analytics.billableHours.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-purple-500 mr-2" />
                <span className="text-sm text-gray-600">Success Rate</span>
              </div>
              <span className="text-sm font-medium text-gray-900">94.2%</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="text-sm font-medium text-gray-900">Generate Monthly Report</div>
              <div className="text-xs text-gray-500">Export analytics data</div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="text-sm font-medium text-gray-900">Schedule Review</div>
              <div className="text-xs text-gray-500">Performance meeting</div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="text-sm font-medium text-gray-900">Export Data</div>
              <div className="text-xs text-gray-500">Download CSV/Excel</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 