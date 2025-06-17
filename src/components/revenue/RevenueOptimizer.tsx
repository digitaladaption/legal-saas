'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, Users, Target, CreditCard, 
  Zap, Award, Settings, ArrowUp, ArrowDown, Check 
} from 'lucide-react';

// Revenue Optimization Types
interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  limits: {
    cases: number;
    users: number;
    storage: string;
    apiCalls: number;
  };
  popular?: boolean;
}

interface RevenueMetrics {
  mrr: number;
  arr: number;
  churnRate: number;
  ltv: number;
  cac: number;
  grossMargin: number;
  netRevenue: number;
  subscriptions: {
    active: number;
    new: number;
    cancelled: number;
    upgraded: number;
  };
}

interface PricingStrategy {
  type: 'value-based' | 'competitive' | 'cost-plus' | 'dynamic';
  factors: string[];
  recommendations: string[];
  impact: number;
}

const RevenueOptimizer: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState<RevenueMetrics>({
    mrr: 285000,
    arr: 3420000,
    churnRate: 2.3,
    ltv: 85000,
    cac: 12500,
    grossMargin: 73,
    netRevenue: 2496600,
    subscriptions: {
      active: 247,
      new: 23,
      cancelled: 8,
      upgraded: 15
    }
  });

  const [subscriptionTiers] = useState<SubscriptionTier[]>([
    {
      id: 'starter',
      name: 'Starter',
      price: 299,
      features: [
        'Up to 25 cases',
        '3 team members',
        'Basic AI assistant',
        'Document management',
        'Email support'
      ],
      limits: {
        cases: 25,
        users: 3,
        storage: '10GB',
        apiCalls: 1000
      }
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 599,
      features: [
        'Up to 100 cases',
        '10 team members',
        'Advanced AI assistant',
        'Document management',
        'Client portal',
        'Analytics dashboard',
        'Priority support'
      ],
      limits: {
        cases: 100,
        users: 10,
        storage: '100GB',
        apiCalls: 5000
      },
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 1299,
      features: [
        'Unlimited cases',
        'Unlimited users',
        'Custom AI models',
        'Advanced analytics',
        'SSO & enterprise security',
        'API access',
        'Dedicated support',
        'Custom integrations'
      ],
      limits: {
        cases: -1,
        users: -1,
        storage: 'Unlimited',
        apiCalls: -1
      }
    }
  ]);

  const [pricingStrategies] = useState<PricingStrategy[]>([
    {
      type: 'value-based',
      factors: [
        'Time savings: 40+ hours/month',
        'Case win rate improvement: +15%',
        'Client satisfaction increase: +22%',
        'Revenue per case: +$12,000'
      ],
      recommendations: [
        'Increase Enterprise tier by 25%',
        'Add premium AI features tier',
        'Implement success-based pricing'
      ],
      impact: 28
    },
    {
      type: 'competitive',
      factors: [
        'Market average: $450-$800/month',
        'Feature comparison: 15% more features',
        'Customer satisfaction: 4.6/5 vs 3.8/5',
        'Implementation time: 50% faster'
      ],
      recommendations: [
        'Premium pricing strategy',
        'Emphasize unique AI capabilities',
        'Bundle complementary services'
      ],
      impact: 18
    }
  ]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const getMetricColor = (value: number, type: 'positive' | 'negative'): string => {
    const isGood = type === 'positive' ? value > 0 : value < 0;
    return isGood ? 'text-green-600' : 'text-red-600';
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: TrendingUp },
    { id: 'pricing', name: 'Pricing Strategy', icon: DollarSign },
    { id: 'subscriptions', name: 'Subscriptions', icon: CreditCard },
    { id: 'optimization', name: 'Optimization', icon: Zap },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Revenue Optimization</h1>
          <div className="flex items-center gap-2">
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              ARR: {formatCurrency(metrics.arr)}
            </div>
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              MRR: {formatCurrency(metrics.mrr)}
            </div>
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
            {/* Key Revenue Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Monthly Recurring Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.mrr)}</p>
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <ArrowUp className="h-3 w-3" />
                      +12.5% vs last month
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Customer LTV</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.ltv)}</p>
                    <p className="text-sm text-blue-600">LTV:CAC ratio 6.8:1</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Churn Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPercentage(metrics.churnRate)}</p>
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <ArrowDown className="h-3 w-3" />
                      -0.5% vs last month
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-orange-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Gross Margin</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPercentage(metrics.grossMargin)}</p>
                    <p className="text-sm text-purple-600">Industry leading</p>
                  </div>
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Subscription Metrics */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Subscription Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{metrics.subscriptions.active}</div>
                  <div className="text-sm text-gray-600">Active Subscriptions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{metrics.subscriptions.new}</div>
                  <div className="text-sm text-gray-600">New This Month</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{metrics.subscriptions.upgraded}</div>
                  <div className="text-sm text-gray-600">Upgrades</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{metrics.subscriptions.cancelled}</div>
                  <div className="text-sm text-gray-600">Cancellations</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Strategy Tab */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            {/* Current Pricing Tiers */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-6">Current Pricing Tiers</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {subscriptionTiers.map((tier) => (
                  <div
                    key={tier.id}
                    className={`border-2 rounded-lg p-6 relative ${
                      tier.popular ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-600 text-white px-3 py-1 text-xs font-medium rounded-full">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <div className="text-center mb-4">
                      <h4 className="text-xl font-bold text-gray-900">{tier.name}</h4>
                      <div className="mt-2">
                        <span className="text-3xl font-bold text-gray-900">{formatCurrency(tier.price)}</span>
                        <span className="text-gray-600">/month</span>
                      </div>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Cases: {tier.limits.cases === -1 ? 'Unlimited' : tier.limits.cases}</div>
                      <div>Users: {tier.limits.users === -1 ? 'Unlimited' : tier.limits.users}</div>
                      <div>Storage: {tier.limits.storage}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Strategy Analysis */}
            <div className="space-y-4">
              {pricingStrategies.map((strategy, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold capitalize">{strategy.type.replace('-', ' ')} Pricing</h3>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      +{strategy.impact}% Revenue Impact
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Key Factors:</h4>
                      <ul className="space-y-1">
                        {strategy.factors.map((factor, factorIndex) => (
                          <li key={factorIndex} className="text-sm text-gray-600 flex items-start gap-2">
                            <div className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Recommendations:</h4>
                      <ul className="space-y-1">
                        {strategy.recommendations.map((rec, recIndex) => (
                          <li key={recIndex} className="text-sm text-gray-600 flex items-start gap-2">
                            <div className="w-1 h-1 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optimization Tab */}
        {activeTab === 'optimization' && (
          <div className="space-y-6">
            {/* Revenue Optimization Opportunities */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Revenue Optimization Opportunities</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-medium text-green-800">High Impact: Implement Usage-Based Pricing</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Add API call tiers and document processing fees. Projected impact: +35% revenue
                  </p>
                  <div className="mt-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded">High ROI</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded ml-2">6 weeks to implement</span>
                  </div>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium text-blue-800">Medium Impact: Enterprise Add-ons</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Create premium modules for compliance, advanced analytics, and custom integrations
                  </p>
                  <div className="mt-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded">Medium ROI</span>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 text-xs rounded ml-2">12 weeks to implement</span>
                  </div>
                </div>

                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-medium text-yellow-800">Quick Win: Annual Billing Incentives</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Offer 2-month discount for annual payments. Projected cash flow improvement: +$180k
                  </p>
                  <div className="mt-2">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 text-xs rounded">Low effort</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded ml-2">1 week to implement</span>
                  </div>
                </div>
              </div>
            </div>

            {/* A/B Testing Results */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">A/B Testing Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Pricing Page Optimization</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Conversion Rate</span>
                      <span className="text-sm font-medium text-green-600">+23%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Average Deal Size</span>
                      <span className="text-sm font-medium text-green-600">+$127</span>
                    </div>
                    <div className="text-xs text-gray-500">Test running for 4 weeks</div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Free Trial Length</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Trial-to-Paid</span>
                      <span className="text-sm font-medium text-red-600">-8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Time to Value</span>
                      <span className="text-sm font-medium text-green-600">-12 days</span>
                    </div>
                    <div className="text-xs text-gray-500">14 days vs 30 days trial</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueOptimizer; 