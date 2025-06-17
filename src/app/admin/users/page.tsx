'use client';

import React, { useState } from 'react';
import { 
  Users, UserPlus, Upload, Download, Settings, 
  Shield, Mail, Key, AlertCircle, CheckCircle,
  Search, Filter, MoreVertical, Edit, Trash2,
  RefreshCw, Database, Eye
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'partner' | 'associate' | 'paralegal' | 'client';
  department: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  ssoEnabled: boolean;
  mfaEnabled: boolean;
}

const UserManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [showAddUser, setShowAddUser] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importMethod, setImportMethod] = useState<'csv' | 'ad'>('csv');

  const [users] = useState<User[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@smithlaw.com',
      role: 'admin',
      department: 'Management',
      status: 'active',
      lastLogin: '2024-01-10T10:30:00Z',
      ssoEnabled: true,
      mfaEnabled: true
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@smithlaw.com',
      role: 'partner',
      department: 'Corporate Law',
      status: 'active',
      lastLogin: '2024-01-10T09:15:00Z',
      ssoEnabled: true,
      mfaEnabled: true
    },
    {
      id: '3',
      name: 'Michael Chen',
      email: 'michael.chen@smithlaw.com',
      role: 'associate',
      department: 'Litigation',
      status: 'active',
      lastLogin: '2024-01-09T16:45:00Z',
      ssoEnabled: false,
      mfaEnabled: false
    },
    {
      id: '4',
      name: 'Emily Davis',
      email: 'emily.davis@smithlaw.com',
      role: 'paralegal',
      department: 'Corporate Law',
      status: 'pending',
      lastLogin: '',
      ssoEnabled: false,
      mfaEnabled: false
    }
  ]);

  const roles = [
    { value: 'admin', label: 'Administrator', description: 'Full system access and user management' },
    { value: 'partner', label: 'Partner', description: 'Senior attorney with management responsibilities' },
    { value: 'associate', label: 'Associate', description: 'Attorney with case and client responsibilities' },
    { value: 'paralegal', label: 'Paralegal', description: 'Legal assistant with document access' },
    { value: 'client', label: 'Client', description: 'External client with limited portal access' }
  ];

  const departments = [
    'Corporate Law', 'Litigation', 'Employment Law', 'Intellectual Property',
    'Real Estate', 'Family Law', 'Criminal Defense', 'Tax Law'
  ];

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      partner: 'bg-purple-100 text-purple-800',
      associate: 'bg-blue-100 text-blue-800',
      paralegal: 'bg-green-100 text-green-800',
      client: 'bg-gray-100 text-gray-800'
    };
    return colors[role as keyof typeof colors] || colors.client;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const AddUserModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New User</h3>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              placeholder="e.g., Jane Doe"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              placeholder="jane.doe@smithlaw.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Select department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="send-invite"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="send-invite" className="text-sm text-gray-700">
              Send invitation email immediately
            </label>
          </div>
        </form>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setShowAddUser(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Add User
          </button>
        </div>
      </div>
    </div>
  );

  const ImportModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Users</h3>
        
        <div className="space-y-6">
          {/* Import Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Import Method
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center space-x-3 cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="radio"
                  name="import-method"
                  value="csv"
                  checked={importMethod === 'csv'}
                  onChange={(e) => setImportMethod(e.target.value as 'csv')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">CSV Upload</div>
                  <div className="text-sm text-gray-600">Bulk import from spreadsheet</div>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="radio"
                  name="import-method"
                  value="ad"
                  checked={importMethod === 'ad'}
                  onChange={(e) => setImportMethod(e.target.value as 'ad')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">Active Directory</div>
                  <div className="text-sm text-gray-600">Sync from AD/Azure AD</div>
                </div>
              </label>
            </div>
          </div>

          {/* CSV Import */}
          {importMethod === 'csv' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">CSV Import Instructions</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Download the template below and fill in user information</li>
                  <li>• Required columns: Name, Email, Role</li>
                  <li>• Optional columns: Department, Phone, Title</li>
                  <li>• Email addresses must be from your domain (@smithlaw.com)</li>
                </ul>
              </div>

              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                  <Download className="h-4 w-4" />
                  Download CSV Template
                </button>
                <button className="flex items-center gap-2 text-green-600 hover:text-green-700 text-sm font-medium">
                  <Eye className="h-4 w-4" />
                  View Sample Data
                </button>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Drop your CSV file here or <span className="text-blue-600 cursor-pointer">browse</span>
                </p>
                <p className="text-sm text-gray-500">Maximum file size: 10MB</p>
              </div>
            </div>
          )}

          {/* AD Import */}
          {importMethod === 'ad' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Active Directory Sync</h4>
                <p className="text-sm text-green-700">
                  Automatically import users from your Active Directory or Azure AD. 
                  This will sync user information, roles, and department assignments.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    AD Domain
                  </label>
                  <input
                    type="text"
                    value="smithlaw.onmicrosoft.com"
                    disabled
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sync Options
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                      <span className="text-sm text-gray-700">Import all users</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                      <span className="text-sm text-gray-700">Map AD groups to roles</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                      <span className="text-sm text-gray-700">Enable automatic sync (daily)</span>
                    </label>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-700">
                      <strong>Note:</strong> AD sync requires your SSO configuration to be completed. 
                      Users will be created when they first sign in.
                    </div>
                  </div>
                </div>

                <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  <RefreshCw className="h-4 w-4" />
                  Start AD Sync
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setShowImportModal(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            {importMethod === 'csv' ? 'Upload & Import' : 'Configure Sync'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage firm users, roles, and permissions</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Upload className="h-4 w-4" />
              Import Users
            </button>
            <button
              onClick={() => setShowAddUser(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <UserPlus className="h-4 w-4" />
              Add User
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">SSO Enabled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.ssoEnabled).length}
                </p>
              </div>
              <Key className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Invites</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.status === 'pending').length}
                </p>
              </div>
              <Mail className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">All Roles</option>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>

              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm">
                <Filter className="h-4 w-4" />
                More Filters
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Security
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {user.ssoEnabled && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            SSO
                          </span>
                        )}
                        {user.mfaEnabled && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            MFA
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddUser && <AddUserModal />}
      {showImportModal && <ImportModal />}
    </div>
  );
};

export default UserManagementPage; 