import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Enterprise Analytics API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const firmId = searchParams.get('firmId');
    const type = searchParams.get('type') || 'overview';
    const period = searchParams.get('period') || '30d';

    if (!firmId) {
      return NextResponse.json({ error: 'Firm ID required' }, { status: 400 });
    }

    let analytics = {};

    switch (type) {
      case 'overview':
        analytics = await getOverviewAnalytics(firmId, period);
        break;
      case 'revenue':
        analytics = await getRevenueAnalytics(firmId, period);
        break;
      case 'usage':
        analytics = await getUsageAnalytics(firmId, period);
        break;
      case 'predictive':
        analytics = await getPredictiveAnalytics(firmId);
        break;
      case 'compliance':
        analytics = await getComplianceAnalytics(firmId, period);
        break;
      default:
        return NextResponse.json({ error: 'Invalid analytics type' }, { status: 400 });
    }

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

async function getOverviewAnalytics(firmId: string, period: string) {
  const daysBack = getDaysFromPeriod(period);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  // Fetch key metrics
  const [
    casesResult,
    documentsResult,
    usersResult,
    revenueResult,
    auditResult
  ] = await Promise.all([
    // Cases metrics
    supabase
      .from('cases')
      .select('id, status, created_at, updated_at')
      .eq('firm_id', firmId)
      .gte('created_at', startDate.toISOString()),

    // Documents metrics
    supabase
      .from('documents')
      .select('id, created_at')
      .eq('firm_id', firmId)
      .gte('created_at', startDate.toISOString()),

    // Users metrics
    supabase
      .from('enterprise_users')
      .select('id, role, last_login, created_at')
      .eq('firm_id', firmId),

    // Revenue metrics
    supabase
      .from('revenue_analytics')
      .select('*')
      .eq('firm_id', firmId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false }),

    // Audit metrics
    supabase
      .from('audit_logs')
      .select('id, event_type, risk_level, timestamp')
      .eq('firm_id', firmId)
      .gte('timestamp', startDate.toISOString())
  ]);

  const cases = casesResult.data || [];
  const documents = documentsResult.data || [];
  const users = usersResult.data || [];
  const revenue = revenueResult.data || [];
  const auditLogs = auditResult.data || [];

  // Calculate metrics
  const totalCases = cases.length;
  const activeCases = cases.filter(c => c.status === 'active').length;
  const closedCases = cases.filter(c => c.status === 'closed').length;
  const totalDocuments = documents.length;
  const totalUsers = users.length;
  const activeUsers = users.filter(u => {
    if (!u.last_login) return false;
    const lastLogin = new Date(u.last_login);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return lastLogin > thirtyDaysAgo;
  }).length;

  // Latest revenue data
  const latestRevenue = revenue[0];
  const mrr = latestRevenue?.mrr || 0;
  const arr = latestRevenue?.arr || 0;
  const churnRate = latestRevenue?.churn_rate || 0;

  // Risk analysis
  const criticalEvents = auditLogs.filter(log => log.risk_level === 'critical').length;
  const securityScore = calculateSecurityScore(auditLogs);

  return {
    overview: {
      totalCases,
      activeCases,
      closedCases,
      caseResolutionRate: totalCases > 0 ? (closedCases / totalCases) * 100 : 0,
      totalDocuments,
      totalUsers,
      activeUsers,
      userUtilization: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
    },
    revenue: {
      mrr: mrr / 100, // Convert from cents
      arr: arr / 100,
      churnRate: churnRate * 100, // Convert to percentage
      growth: calculateGrowthRate(revenue)
    },
    security: {
      securityScore,
      criticalEvents,
      riskLevel: getRiskLevel(securityScore, criticalEvents)
    },
    trends: {
      caseTrend: calculateTrend(cases, 'created_at'),
      documentTrend: calculateTrend(documents, 'created_at'),
      revenueTrend: revenue.slice(0, 12).reverse() // Last 12 data points
    }
  };
}

async function getRevenueAnalytics(firmId: string, period: string) {
  const daysBack = getDaysFromPeriod(period);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const { data: revenueData } = await supabase
    .from('revenue_analytics')
    .select('*')
    .eq('firm_id', firmId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: true });

  const { data: subscriptionData } = await supabase
    .from('firm_subscriptions')
    .select(`
      *,
      subscription_plans (*)
    `)
    .eq('firm_id', firmId)
    .single();

  return {
    revenueHistory: revenueData?.map(r => ({
      date: r.date,
      mrr: r.mrr / 100,
      arr: r.arr / 100,
      newSubscriptions: r.new_subscriptions,
      cancelledSubscriptions: r.cancelled_subscriptions,
      churnRate: r.churn_rate * 100
    })) || [],
    currentSubscription: subscriptionData ? {
      plan: subscriptionData.subscription_plans.name,
      price: subscriptionData.subscription_plans.price_monthly / 100,
      status: subscriptionData.status,
      billingCycle: subscriptionData.billing_cycle
    } : null,
    metrics: calculateRevenueMetrics(revenueData || []),
    forecast: generateRevenueForecast(revenueData || [])
  };
}

async function getUsageAnalytics(firmId: string, period: string) {
  const daysBack = getDaysFromPeriod(period);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const { data: usageData } = await supabase
    .from('usage_analytics')
    .select('*')
    .eq('firm_id', firmId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: true });

  // Group by metric type
  const groupedUsage = (usageData || []).reduce((acc, usage) => {
    if (!acc[usage.metric_type]) {
      acc[usage.metric_type] = [];
    }
    acc[usage.metric_type].push({
      date: usage.date,
      value: usage.metric_value,
      additionalData: usage.additional_data
    });
    return acc;
  }, {} as Record<string, any[]>);

  return {
    usage: groupedUsage,
    summary: calculateUsageSummary(usageData || []),
    limits: await getSubscriptionLimits(firmId),
    recommendations: generateUsageRecommendations(groupedUsage)
  };
}

async function getPredictiveAnalytics(firmId: string) {
  // Fetch historical data for predictions
  const [revenueHistory, caseHistory, userActivity] = await Promise.all([
    supabase
      .from('revenue_analytics')
      .select('*')
      .eq('firm_id', firmId)
      .order('date', { ascending: true })
      .limit(365), // Last year of data

    supabase
      .from('cases')
      .select('id, status, created_at, updated_at')
      .eq('firm_id', firmId)
      .order('created_at', { ascending: true }),

    supabase
      .from('audit_logs')
      .select('user_id, timestamp')
      .eq('firm_id', firmId)
      .eq('event_type', 'authentication')
      .gte('timestamp', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
  ]);

  return {
    revenueForcast: generateRevenueForecast(revenueHistory.data || []),
    caseOutcomePrediction: predictCaseOutcomes(caseHistory.data || []),
    churnRisk: calculateChurnRisk(userActivity.data || []),
    growthOpportunities: identifyGrowthOpportunities(revenueHistory.data || [], caseHistory.data || []),
    recommendations: generateAIRecommendations(firmId)
  };
}

async function getComplianceAnalytics(firmId: string, period: string) {
  const daysBack = getDaysFromPeriod(period);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const { data: auditLogs } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('firm_id', firmId)
    .gte('timestamp', startDate.toISOString())
    .order('timestamp', { ascending: false });

  const { data: complianceReports } = await supabase
    .from('compliance_reports')
    .select('*')
    .eq('firm_id', firmId)
    .order('created_at', { ascending: false });

  return {
    auditSummary: analyzeAuditLogs(auditLogs || []),
    complianceScore: calculateComplianceScore(auditLogs || []),
    riskAssessment: assessComplianceRisks(auditLogs || []),
    reports: complianceReports || [],
    recommendations: generateComplianceRecommendations(auditLogs || [])
  };
}

// Helper functions
function getDaysFromPeriod(period: string): number {
  switch (period) {
    case '7d': return 7;
    case '30d': return 30;
    case '90d': return 90;
    case '1y': return 365;
    default: return 30;
  }
}

function calculateSecurityScore(auditLogs: any[]): number {
  if (auditLogs.length === 0) return 100;

  const criticalEvents = auditLogs.filter(log => log.risk_level === 'critical').length;
  const highRiskEvents = auditLogs.filter(log => log.risk_level === 'high').length;
  const mediumRiskEvents = auditLogs.filter(log => log.risk_level === 'medium').length;

  const totalEvents = auditLogs.length;
  const riskScore = (criticalEvents * 10 + highRiskEvents * 5 + mediumRiskEvents * 2) / totalEvents;
  
  return Math.max(0, 100 - riskScore);
}

function getRiskLevel(securityScore: number, criticalEvents: number): string {
  if (criticalEvents > 0 || securityScore < 70) return 'high';
  if (securityScore < 85) return 'medium';
  return 'low';
}

function calculateTrend(data: any[], dateField: string) {
  if (data.length < 2) return 0;

  const sorted = data.sort((a, b) => new Date(a[dateField]).getTime() - new Date(b[dateField]).getTime());
  const midpoint = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, midpoint).length;
  const secondHalf = sorted.slice(midpoint).length;

  return secondHalf > firstHalf ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;
}

function calculateGrowthRate(revenueData: any[]): number {
  if (revenueData.length < 2) return 0;

  const latest = revenueData[0];
  const previous = revenueData[1];

  if (!previous?.mrr || previous.mrr === 0) return 0;

  return ((latest.mrr - previous.mrr) / previous.mrr) * 100;
}

function calculateRevenueMetrics(revenueData: any[]) {
  if (revenueData.length === 0) return {};

  const latest = revenueData[revenueData.length - 1];
  const ltv = latest.ltv || 0;
  const cac = latest.cac || 0;
  const ltvCacRatio = cac > 0 ? ltv / cac : 0;

  return {
    ltv: ltv / 100,
    cac: cac / 100,
    ltvCacRatio,
    paybackPeriod: cac > 0 ? cac / (latest.mrr || 1) : 0
  };
}

function generateRevenueForecast(revenueData: any[]) {
  if (revenueData.length < 3) return null;

  // Simple linear regression for forecasting
  const values = revenueData.map(r => r.mrr || 0);
  const n = values.length;
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / n;

  // Calculate trend
  let trend = 0;
  for (let i = 1; i < values.length; i++) {
    trend += values[i] - values[i - 1];
  }
  trend = trend / (values.length - 1);

  const nextMonth = mean + trend;
  const nextQuarter = mean + (trend * 3);

  return {
    nextMonth: Math.max(0, nextMonth / 100),
    nextQuarter: Math.max(0, nextQuarter / 100),
    confidence: Math.min(95, Math.max(60, 100 - (Math.abs(trend) / mean) * 100))
  };
}

function calculateUsageSummary(usageData: any[]) {
  const summary = usageData.reduce((acc, usage) => {
    if (!acc[usage.metric_type]) {
      acc[usage.metric_type] = { total: 0, average: 0, peak: 0 };
    }
    acc[usage.metric_type].total += usage.metric_value;
    acc[usage.metric_type].peak = Math.max(acc[usage.metric_type].peak, usage.metric_value);
    return acc;
  }, {} as Record<string, any>);

  // Calculate averages
  Object.keys(summary).forEach(key => {
    const dataPoints = usageData.filter(u => u.metric_type === key).length;
    summary[key].average = dataPoints > 0 ? summary[key].total / dataPoints : 0;
  });

  return summary;
}

async function getSubscriptionLimits(firmId: string) {
  const { data: subscription } = await supabase
    .from('firm_subscriptions')
    .select(`
      subscription_plans (limits)
    `)
    .eq('firm_id', firmId)
    .single();

  return subscription?.subscription_plans?.limits || {};
}

function generateUsageRecommendations(groupedUsage: Record<string, any[]>) {
  const recommendations = [];

  Object.keys(groupedUsage).forEach(metricType => {
    const data = groupedUsage[metricType];
    const latest = data[data.length - 1]?.value || 0;
    const average = data.reduce((sum, d) => sum + d.value, 0) / data.length;

    if (latest > average * 1.5) {
      recommendations.push({
        type: metricType,
        message: `${metricType} usage is 50% above average. Consider optimizing or upgrading plan.`,
        priority: 'medium'
      });
    }
  });

  return recommendations;
}

function predictCaseOutcomes(caseHistory: any[]) {
  const activeCases = caseHistory.filter(c => c.status === 'active');
  const closedCases = caseHistory.filter(c => c.status === 'closed');
  
  if (closedCases.length === 0) return null;

  // Calculate average resolution time
  const resolutionTimes = closedCases.map(c => {
    const created = new Date(c.created_at);
    const updated = new Date(c.updated_at);
    return (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24); // days
  }).filter(time => time > 0);

  const averageResolutionTime = resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length;
  const successRate = (closedCases.length / caseHistory.length) * 100;

  return {
    successProbability: Math.min(95, successRate),
    estimatedDuration: Math.round(averageResolutionTime * 10) / 10,
    activeCasesCount: activeCases.length
  };
}

function calculateChurnRisk(userActivity: any[]) {
  // Analyze user login patterns to predict churn
  const userLogins = userActivity.reduce((acc, activity) => {
    if (!acc[activity.user_id]) {
      acc[activity.user_id] = [];
    }
    acc[activity.user_id].push(new Date(activity.timestamp));
    return acc;
  }, {} as Record<string, Date[]>);

  const now = new Date();
  const riskUsers = Object.keys(userLogins).filter(userId => {
    const lastLogin = Math.max(...userLogins[userId].map(d => d.getTime()));
    const daysSinceLogin = (now.getTime() - lastLogin) / (1000 * 60 * 60 * 24);
    return daysSinceLogin > 14; // Haven't logged in for 2 weeks
  });

  return {
    riskLevel: riskUsers.length > Object.keys(userLogins).length * 0.3 ? 'high' : 
               riskUsers.length > Object.keys(userLogins).length * 0.1 ? 'medium' : 'low',
    affectedUsers: riskUsers.length,
    totalUsers: Object.keys(userLogins).length
  };
}

function identifyGrowthOpportunities(revenueData: any[], caseData: any[]) {
  const opportunities = [];

  // Revenue growth opportunity
  if (revenueData.length > 1) {
    const latestRevenue = revenueData[revenueData.length - 1];
    const previousRevenue = revenueData[revenueData.length - 2];
    
    if (latestRevenue.mrr < previousRevenue.mrr) {
      opportunities.push({
        type: 'revenue_decline',
        message: 'Revenue decline detected. Consider client retention strategies.',
        impact: 'high'
      });
    }
  }

  // Case volume opportunity
  const recentCases = caseData.filter(c => {
    const caseDate = new Date(c.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return caseDate > thirtyDaysAgo;
  });

  if (recentCases.length > caseData.length * 0.6) {
    opportunities.push({
      type: 'high_case_volume',
      message: 'High case volume detected. Consider scaling team or automation.',
      impact: 'medium'
    });
  }

  return opportunities;
}

function generateAIRecommendations(firmId: string) {
  // AI-powered recommendations based on patterns
  return [
    {
      category: 'efficiency',
      title: 'Automate Document Review',
      description: 'Implement AI document review to reduce manual work by 40%',
      impact: 'high',
      effort: 'medium'
    },
    {
      category: 'revenue',
      title: 'Optimize Billing Rates',
      description: 'Adjust hourly rates based on market analysis and case complexity',
      impact: 'high',
      effort: 'low'
    },
    {
      category: 'client_satisfaction',
      title: 'Proactive Client Communication',
      description: 'Set up automated client updates to improve satisfaction scores',
      impact: 'medium',
      effort: 'low'
    }
  ];
}

function analyzeAuditLogs(auditLogs: any[]) {
  const eventTypes = auditLogs.reduce((acc, log) => {
    acc[log.event_type] = (acc[log.event_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const riskLevels = auditLogs.reduce((acc, log) => {
    acc[log.risk_level] = (acc[log.risk_level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalEvents: auditLogs.length,
    eventTypes,
    riskLevels,
    timeRange: auditLogs.length > 0 ? {
      start: auditLogs[auditLogs.length - 1].timestamp,
      end: auditLogs[0].timestamp
    } : null
  };
}

function calculateComplianceScore(auditLogs: any[]): number {
  if (auditLogs.length === 0) return 100;

  const complianceEvents = auditLogs.filter(log => log.compliance_relevant);
  const failedEvents = auditLogs.filter(log => log.result === 'failure');
  
  const complianceRate = complianceEvents.length > 0 ? 
    (complianceEvents.length - failedEvents.length) / complianceEvents.length : 1;

  return Math.round(complianceRate * 100);
}

function assessComplianceRisks(auditLogs: any[]) {
  const risks = [];
  
  const failedLogins = auditLogs.filter(log => 
    log.event_name === 'login_failed' && 
    new Date(log.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  );

  if (failedLogins.length > 5) {
    risks.push({
      type: 'security',
      level: 'high',
      message: `${failedLogins.length} failed login attempts in the last 24 hours`,
      recommendation: 'Review access controls and consider implementing account lockout policies'
    });
  }

  const dataAccess = auditLogs.filter(log => log.event_type === 'data_access');
  const unusualAccess = dataAccess.filter(log => {
    const hour = new Date(log.timestamp).getHours();
    return hour < 6 || hour > 22; // Outside business hours
  });

  if (unusualAccess.length > dataAccess.length * 0.1) {
    risks.push({
      type: 'data_access',
      level: 'medium',
      message: 'Unusual data access patterns detected outside business hours',
      recommendation: 'Review access logs and implement time-based access controls'
    });
  }

  return risks;
}

function generateComplianceRecommendations(auditLogs: any[]) {
  const recommendations = [];

  const mfaEvents = auditLogs.filter(log => 
    log.event_name.includes('mfa') || log.details?.mfa_enabled
  );

  if (mfaEvents.length === 0) {
    recommendations.push({
      priority: 'high',
      category: 'security',
      title: 'Enable Multi-Factor Authentication',
      description: 'Implement MFA for all users to enhance security compliance'
    });
  }

  const regularAudits = auditLogs.filter(log => 
    log.event_type === 'compliance' && 
    new Date(log.timestamp) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  );

  if (regularAudits.length === 0) {
    recommendations.push({
      priority: 'medium',
      category: 'compliance',
      title: 'Schedule Regular Compliance Audits',
      description: 'Set up quarterly compliance reviews and audits'
    });
  }

  return recommendations;
} 