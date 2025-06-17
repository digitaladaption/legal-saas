'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Shield, Eye, AlertTriangle, Download, Filter, Search } from 'lucide-react';

// Audit Log Types
interface AuditLog {
  id: string;
  event_type: 'authentication' | 'data_access' | 'document_action' | 'user_management' | 'system_config' | 'compliance';
  event_name: string;
  user_id: string;
  user_email: string;
  user_name: string;
  firm_id: string;
  details: any;
  timestamp: string;
  ip_address: string;
  user_agent: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  compliance_relevant: boolean;
}

interface AuditStats {
  totalEvents: number;
  criticalEvents: number;
  failedLogins: number;
  dataAccess: number;
  complianceEvents: number;
}

const AuditLogger: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats>({
    totalEvents: 0,
    criticalEvents: 0,
    failedLogins: 0,
    dataAccess: 0,
    complianceEvents: 0
  });
  const [filters, setFilters] = useState({
    eventType: '',
    riskLevel: '',
    dateRange: '7d',
    userId: '',
    searchTerm: ''
  });
  const [loading, setLoading] = useState(true);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadAuditLogs();
    loadAuditStats();
  }, [filters]);

  const loadAuditLogs = async () => {
    try {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          users!inner(email, name)
        `)
        .order('timestamp', { ascending: false })
        .limit(100);

      // Apply filters
      if (filters.eventType) {
        query = query.eq('event_type', filters.eventType);
      }
      if (filters.riskLevel) {
        query = query.eq('risk_level', filters.riskLevel);
      }
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      // Date range filter
      const now = new Date();
      const daysBack = parseInt(filters.dateRange.replace('d', ''));
      const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
      query = query.gte('timestamp', startDate.toISOString());

      const { data, error } = await query;

      if (error) {
        console.error('Error loading audit logs:', error);
        return;
      }

      const formattedLogs: AuditLog[] = data?.map(log => ({
        ...log,
        user_email: log.users?.email || 'Unknown',
        user_name: log.users?.name || 'Unknown User'
      })) || [];

      // Apply search filter
      if (filters.searchTerm) {
        const filteredLogs = formattedLogs.filter(log =>
          log.event_name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          log.user_email.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          log.user_name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          JSON.stringify(log.details).toLowerCase().includes(filters.searchTerm.toLowerCase())
        );
        setLogs(filteredLogs);
      } else {
        setLogs(formattedLogs);
      }

    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAuditStats = async () => {
    try {
      const { data: totalData } = await supabase
        .from('audit_logs')
        .select('id', { count: 'exact' });

      const { data: criticalData } = await supabase
        .from('audit_logs')
        .select('id', { count: 'exact' })
        .eq('risk_level', 'critical');

      const { data: failedLoginData } = await supabase
        .from('audit_logs')
        .select('id', { count: 'exact' })
        .eq('event_name', 'login_failed');

      const { data: dataAccessData } = await supabase
        .from('audit_logs')
        .select('id', { count: 'exact' })
        .eq('event_type', 'data_access');

      const { data: complianceData } = await supabase
        .from('audit_logs')
        .select('id', { count: 'exact' })
        .eq('compliance_relevant', true);

      setStats({
        totalEvents: totalData?.length || 0,
        criticalEvents: criticalData?.length || 0,
        failedLogins: failedLoginData?.length || 0,
        dataAccess: dataAccessData?.length || 0,
        complianceEvents: complianceData?.length || 0
      });

    } catch (error) {
      console.error('Error loading audit stats:', error);
    }
  };

  const exportAuditLogs = async () => {
    try {
      const csv = convertToCSV(logs);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting audit logs:', error);
    }
  };

  const convertToCSV = (data: AuditLog[]): string => {
    const headers = ['Timestamp', 'Event Type', 'Event Name', 'User', 'Email', 'Risk Level', 'IP Address', 'Details'];
    const rows = data.map(log => [
      log.timestamp,
      log.event_type,
      log.event_name,
      log.user_name,
      log.user_email,
      log.risk_level,
      log.ip_address,
      JSON.stringify(log.details)
    ]);

    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  const getRiskColor = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'authentication': return <Shield className="h-4 w-4" />;
      case 'data_access': return <Eye className="h-4 w-4" />;
      case 'compliance': return <AlertTriangle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-24 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-16 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Audit & Compliance Logs</h1>
          <button
            onClick={exportAuditLogs}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Logs
          </button>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{stats.totalEvents}</div>
            <div className="text-sm text-gray-600">Total Events</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">{stats.criticalEvents}</div>
            <div className="text-sm text-gray-600">Critical Events</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-orange-600">{stats.failedLogins}</div>
            <div className="text-sm text-gray-600">Failed Logins</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{stats.dataAccess}</div>
            <div className="text-sm text-gray-600">Data Access</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">{stats.complianceEvents}</div>
            <div className="text-sm text-gray-600">Compliance</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
              <select
                value={filters.eventType}
                onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All Types</option>
                <option value="authentication">Authentication</option>
                <option value="data_access">Data Access</option>
                <option value="document_action">Document Action</option>
                <option value="user_management">User Management</option>
                <option value="compliance">Compliance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
              <select
                value={filters.riskLevel}
                onChange={(e) => setFilters({ ...filters, riskLevel: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All Levels</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="1d">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  placeholder="Search events, users, or details..."
                  className="w-full border rounded-lg pl-10 pr-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        {getEventTypeIcon(log.event_type)}
                        <div>
                          <div className="font-medium text-gray-900">{log.event_name}</div>
                          <div className="text-gray-500 capitalize">{log.event_type.replace('_', ' ')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div>
                        <div className="font-medium text-gray-900">{log.user_name}</div>
                        <div className="text-gray-500">{log.user_email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getRiskColor(log.risk_level)}`}>
                        {log.risk_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.ip_address}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div className="truncate">
                        {JSON.stringify(log.details, null, 2).substring(0, 100)}...
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {logs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No audit logs found</h3>
            <p className="mt-1 text-sm text-gray-500">No logs match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogger; 