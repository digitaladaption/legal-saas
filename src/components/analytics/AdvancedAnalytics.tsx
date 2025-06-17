'use client';

import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, DollarSign, Users, Clock, AlertTriangle, 
  Target, Brain, Zap, Award, ChevronRight 
} from 'lucide-react';

// Analytics Data Types
interface RevenueMetrics {
  month: string;
  revenue: number;
  predicted: number;
  target: number;
  cases: number;
  billableHours: number;
}

interface ClientMetrics {
  segment: string;
  value: number;
  growth: number;
  retention: number;
}

interface PerformanceMetrics {
  caseResolutionTime: number;
  clientSatisfaction: number;
  billableHoursUtilization: number;
  profitMargin: number;
  caseSuccessRate: number;
}

interface PredictiveInsights {
  revenueForcast: {
    nextMonth: number;
    nextQuarter: number;
    confidence: number;
  };
  clientChurn: {
    riskLevel: 'low' | 'medium' | 'high';
    affectedClients: number;
    preventionActions: string[];
  };
  caseOutcomes: {
    successProbability: number;
    estimatedDuration: number;
    recommendedActions: string[];
  };
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const AdvancedAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('12m');
  const [activeTab, setActiveTab] = useState('overview');
  const [revenueData, setRevenueData] = useState<RevenueMetrics[]>([]);
  const [clientData, setClientData] = useState<ClientMetrics[]>([]);
  const [performance, setPerformance] = useState<PerformanceMetrics>({
    caseResolutionTime: 45,
    clientSatisfaction: 4.6,
    billableHoursUtilization: 78,
    profitMargin: 34,
    caseSuccessRate: 87
  });
  const [insights, setInsights] = useState<PredictiveInsights>({
    revenueForcast: {
      nextMonth: 385000,
      nextQuarter: 1240000,
      confidence: 87
    },
    clientChurn: {
      riskLevel: 'medium',
      affectedClients: 12,
      preventionActions: [
        'Schedule quarterly business reviews',
        'Implement client success program',
        'Reduce response times by 15%'
      ]
    },
    caseOutcomes: {
      successProbability: 83,
      estimatedDuration: 6.2,
      recommendedActions: [
        'Allocate senior associate to complex cases',
        'Increase discovery timeline by 2 weeks',
        'Consider settlement negotiations'
      ]
    }
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    // Simulated analytics data - replace with real API calls
    const mockRevenueData: RevenueMetrics[] = [
      { month: 'Jan', revenue: 320000, predicted: 315000, target: 300000, cases: 34, billableHours: 1280 },
      { month: 'Feb', revenue: 285000, predicted: 290000, target: 300000, cases: 28, billableHours: 1150 },
      { month: 'Mar', revenue: 345000, predicted: 340000, target: 350000, cases: 38, billableHours: 1350 },
      { month: 'Apr', revenue: 420000, predicted: 415000, target: 400000, cases: 42, billableHours: 1480 },
      { month: 'May', revenue: 365000, predicted: 370000, target: 380000, cases: 36, billableHours: 1320 },
      { month: 'Jun', revenue: 410000, predicted: 405000, target: 420000, cases: 41, billableHours: 1420 },
      { month: 'Jul', revenue: 385000, predicted: 390000, target: 400000, cases: 39, billableHours: 1380 },
      { month: 'Aug', revenue: 435000, predicted: 430000, target: 440000, cases: 44, billableHours: 1520 },
      { month: 'Sep', revenue: 395000, predicted: 400000, target: 410000, cases: 40, billableHours: 1400 },
      { month: 'Oct', revenue: 470000, predicted: 465000, target: 450000, cases: 46, billableHours: 1600 },
      { month: 'Nov', revenue: 425000, predicted: 430000, target: 440000, cases: 43, billableHours: 1480 },
      { month: 'Dec', revenue: 0, predicted: 385000, target: 400000, cases: 0, billableHours: 0 },
    ];

    const mockClientData: ClientMetrics[] = [
      { segment: 'Commercial', value: 45, growth: 12, retention: 94 },
      { segment: 'Employment', value: 30, growth: 8, retention: 89 },
      { segment: 'Property', value: 15, growth: 25, retention: 96 },
      { segment: 'Personal Injury', value: 10, growth: -5, retention: 82 },
    ];

    setRevenueData(mockRevenueData);
    setClientData(mockClientData);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getPerformanceColor = (value: number, threshold: number) => {
    if (value >= threshold) return 'text-green-600';
    if (value >= threshold * 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: TrendingUp },
    { id: 'revenue', name: 'Revenue', icon: DollarSign },
    { id: 'clients', name: 'Clients', icon: Users },
    { id: 'performance', name: 'Performance', icon: Target },
    { id: 'predictions', name: 'AI Insights', icon: Brain },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="12m">Last 12 Months</option>
              <option value="24m">Last 24 Months</option>
            </select>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(425000)}</p>
                    <p className="text-sm text-green-600">+12% vs last month</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Cases</p>
                    <p className="text-2xl font-bold text-gray-900">127</p>
                    <p className="text-sm text-blue-600">8 new this week</p>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Billable Hours</p>
                    <p className="text-2xl font-bold text-gray-900">1,480</p>
                    <p className="text-sm text-yellow-600">78% utilization</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900">87%</p>
                    <p className="text-sm text-green-600">+3% vs last quarter</p>
                  </div>
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Revenue Trend */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Revenue Trend & Predictions</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value: number) => `£${value / 1000}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(Number(value))} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} name="Actual Revenue" />
                  <Line type="monotone" dataKey="predicted" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" name="Predicted" />
                  <Line type="monotone" dataKey="target" stroke="#F59E0B" strokeWidth={2} name="Target" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* AI Insights Tab */}
        {activeTab === 'predictions' && (
          <div className="space-y-6">
            {/* Revenue Forecast */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold">AI-Powered Revenue Forecast</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{formatCurrency(insights.revenueForcast.nextMonth)}</div>
                  <div className="text-sm text-gray-600">Next Month Forecast</div>
                  <div className="text-xs text-blue-600 mt-1">{insights.revenueForcast.confidence}% confidence</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(insights.revenueForcast.nextQuarter)}</div>
                  <div className="text-sm text-gray-600">Next Quarter Forecast</div>
                  <div className="text-xs text-green-600 mt-1">Based on 24-month trend</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">+15%</div>
                  <div className="text-sm text-gray-600">Expected Growth</div>
                  <div className="text-xs text-purple-600 mt-1">vs same period last year</div>
                </div>
              </div>
            </div>

            {/* Client Churn Risk */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold">Client Churn Risk Analysis</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-3 h-3 rounded-full ${
                      insights.clientChurn.riskLevel === 'high' ? 'bg-red-500' : 
                      insights.clientChurn.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <span className="text-lg font-medium capitalize">{insights.clientChurn.riskLevel} Risk Level</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{insights.clientChurn.affectedClients}</p>
                  <p className="text-sm text-gray-600">Clients at risk of churning in next 90 days</p>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Recommended Prevention Actions:</h4>
                  <ul className="space-y-2">
                    {insights.clientChurn.preventionActions.map((action, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <ChevronRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Case Outcome Predictions */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-yellow-600" />
                <h3 className="text-lg font-semibold">Case Outcome Predictions</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Success Probability</span>
                      <span className="text-sm font-medium">{insights.caseOutcomes.successProbability}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${insights.caseOutcomes.successProbability}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{insights.caseOutcomes.estimatedDuration} months</div>
                    <div className="text-sm text-gray-600">Estimated Duration</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">AI Recommendations:</h4>
                  <ul className="space-y-2">
                    {insights.caseOutcomes.recommendedActions.map((action, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <ChevronRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* KPI Cards */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Case Resolution Time</h3>
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <div className={`text-2xl font-bold ${getPerformanceColor(performance.caseResolutionTime, 30)}`}>
                  {performance.caseResolutionTime} days
                </div>
                <p className="text-xs text-gray-500 mt-1">Target: 30 days</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Client Satisfaction</h3>
                  <Award className="h-4 w-4 text-gray-400" />
                </div>
                <div className={`text-2xl font-bold ${getPerformanceColor(performance.clientSatisfaction, 4.5)}`}>
                  {performance.clientSatisfaction}/5.0
                </div>
                <p className="text-xs text-gray-500 mt-1">Target: 4.5+</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Billable Hours Utilization</h3>
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                </div>
                <div className={`text-2xl font-bold ${getPerformanceColor(performance.billableHoursUtilization, 80)}`}>
                  {performance.billableHoursUtilization}%
                </div>
                <p className="text-xs text-gray-500 mt-1">Target: 80%+</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Profit Margin</h3>
                  <DollarSign className="h-4 w-4 text-gray-400" />
                </div>
                <div className={`text-2xl font-bold ${getPerformanceColor(performance.profitMargin, 30)}`}>
                  {performance.profitMargin}%
                </div>
                <p className="text-xs text-gray-500 mt-1">Target: 30%+</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Case Success Rate</h3>
                  <Target className="h-4 w-4 text-gray-400" />
                </div>
                <div className={`text-2xl font-bold ${getPerformanceColor(performance.caseSuccessRate, 85)}`}>
                  {performance.caseSuccessRate}%
                </div>
                <p className="text-xs text-gray-500 mt-1">Target: 85%+</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedAnalytics; 