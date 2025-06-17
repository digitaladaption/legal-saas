'use client';

import React, { useState } from 'react';
import { 
  Building2, Users, Shield, Upload, CheckCircle, 
  ArrowRight, ArrowLeft, Settings, Download, 
  UserPlus, Mail, Key, Database, Zap
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  completed: boolean;
}

const FirmOnboardingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [firmData, setFirmData] = useState({
    name: '',
    domain: '',
    size: '',
    practice_areas: [],
    admin_name: '',
    admin_email: '',
    sso_enabled: false,
    ad_domain: '',
    import_method: 'manual'
  });

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'firm-details',
      title: 'Firm Information',
      description: 'Basic details about your law firm',
      icon: Building2,
      completed: false
    },
    {
      id: 'admin-setup',
      title: 'Admin Account',
      description: 'Set up your primary administrator',
      icon: Shield,
      completed: false
    },
    {
      id: 'sso-integration',
      title: 'SSO Integration',
      description: 'Connect with Active Directory or SAML',
      icon: Key,
      completed: false
    },
    {
      id: 'user-import',
      title: 'User Management',
      description: 'Import users and set up teams',
      icon: Users,
      completed: false
    },
    {
      id: 'data-migration',
      title: 'Data Import',
      description: 'Migrate existing cases and documents',
      icon: Upload,
      completed: false
    },
    {
      id: 'configuration',
      title: 'Platform Setup',
      description: 'Configure workflows and preferences',
      icon: Settings,
      completed: false
    }
  ];

  const practiceAreas = [
    'Corporate Law', 'Litigation', 'Employment Law', 'Intellectual Property',
    'Real Estate', 'Family Law', 'Criminal Defense', 'Personal Injury',
    'Tax Law', 'Immigration', 'Bankruptcy', 'Environmental Law'
  ];

  const firmSizes = [
    { value: 'solo', label: 'Solo Practitioner (1 lawyer)' },
    { value: 'small', label: 'Small Firm (2-10 lawyers)' },
    { value: 'medium', label: 'Medium Firm (11-50 lawyers)' },
    { value: 'large', label: 'Large Firm (51-200 lawyers)' },
    { value: 'enterprise', label: 'Enterprise (200+ lawyers)' }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Firm Details
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Firm Name *
              </label>
              <input
                type="text"
                value={firmData.name}
                onChange={(e) => setFirmData({ ...firmData, name: e.target.value })}
                placeholder="e.g., Smith & Associates Law"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Domain *
              </label>
              <input
                type="text"
                value={firmData.domain}
                onChange={(e) => setFirmData({ ...firmData, domain: e.target.value })}
                placeholder="e.g., smithlaw.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Used for user authentication and email domain verification
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Firm Size *
              </label>
              <select
                value={firmData.size}
                onChange={(e) => setFirmData({ ...firmData, size: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select firm size</option>
                {firmSizes.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Practice Areas
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {practiceAreas.map((area) => (
                  <label key={area} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={firmData.practice_areas.includes(area)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFirmData({
                            ...firmData,
                            practice_areas: [...firmData.practice_areas, area]
                          });
                        } else {
                          setFirmData({
                            ...firmData,
                            practice_areas: firmData.practice_areas.filter(p => p !== area)
                          });
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{area}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 1: // Admin Setup
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Primary Administrator</span>
              </div>
              <p className="text-sm text-blue-700">
                This user will have full administrative access to manage the firm, users, and settings.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Administrator Name *
              </label>
              <input
                type="text"
                value={firmData.admin_name}
                onChange={(e) => setFirmData({ ...firmData, admin_name: e.target.value })}
                placeholder="e.g., John Smith"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Administrator Email *
              </label>
              <input
                type="email"
                value={firmData.admin_email}
                onChange={(e) => setFirmData({ ...firmData, admin_email: e.target.value })}
                placeholder={`e.g., admin@${firmData.domain || 'yourfirm.com'}`}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Must use your firm's domain ({firmData.domain || 'yourfirm.com'})
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Administrator Permissions</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Manage all users and roles</li>
                <li>• Configure firm settings and integrations</li>
                <li>• Access all cases and documents</li>
                <li>• View analytics and reports</li>
                <li>• Manage billing and subscriptions</li>
              </ul>
            </div>
          </div>
        );

      case 2: // SSO Integration
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Key className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Enterprise Single Sign-On</span>
              </div>
              <p className="text-sm text-green-700">
                Connect with your existing identity provider for seamless user authentication.
              </p>
            </div>

            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={firmData.sso_enabled}
                  onChange={(e) => setFirmData({ ...firmData, sso_enabled: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Enable Single Sign-On (SSO)
                </span>
              </label>
            </div>

            {firmData.sso_enabled && (
              <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Identity Provider
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select provider</option>
                    <option value="azure-ad">Azure Active Directory</option>
                    <option value="okta">Okta</option>
                    <option value="auth0">Auth0</option>
                    <option value="saml">Generic SAML 2.0</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Active Directory Domain
                  </label>
                  <input
                    type="text"
                    value={firmData.ad_domain}
                    onChange={(e) => setFirmData({ ...firmData, ad_domain: e.target.value })}
                    placeholder="e.g., smithlaw.onmicrosoft.com"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="font-medium text-blue-900 mb-2">SSO Benefits</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Users login with existing corporate credentials</li>
                    <li>• Automatic user provisioning and deprovisioning</li>
                    <li>• Enhanced security with MFA enforcement</li>
                    <li>• Centralized access management</li>
                  </ul>
                </div>
              </div>
            )}

            {!firmData.sso_enabled && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-700">
                  <strong>Manual Authentication:</strong> Users will create individual accounts with email/password. 
                  You can enable SSO later in the admin settings.
                </p>
              </div>
            )}
          </div>
        );

      case 3: // User Import
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">User Management Options</h3>
              <p className="text-gray-600">Choose how you want to add users to your firm's platform.</p>
            </div>

            <div className="space-y-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="import_method"
                  value="manual"
                  checked={firmData.import_method === 'manual'}
                  onChange={(e) => setFirmData({ ...firmData, import_method: e.target.value })}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">Manual User Creation</div>
                  <div className="text-sm text-gray-600">
                    Add users one by one through the admin interface. Best for smaller firms.
                  </div>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="import_method"
                  value="csv"
                  checked={firmData.import_method === 'csv'}
                  onChange={(e) => setFirmData({ ...firmData, import_method: e.target.value })}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">CSV Import</div>
                  <div className="text-sm text-gray-600">
                    Bulk import users from a CSV file. Includes name, email, role, and department.
                  </div>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="import_method"
                  value="ad_sync"
                  checked={firmData.import_method === 'ad_sync'}
                  onChange={(e) => setFirmData({ ...firmData, import_method: e.target.value })}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">Active Directory Sync</div>
                  <div className="text-sm text-gray-600">
                    Automatically import users from your AD. Requires SSO setup.
                  </div>
                </div>
              </label>
            </div>

            {firmData.import_method === 'csv' && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">CSV Import Instructions</h4>
                <div className="space-y-3">
                  <div>
                    <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                      <Download className="h-4 w-4" />
                      Download CSV Template
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p className="mb-2"><strong>Required columns:</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Name (Full name of the user)</li>
                      <li>Email (Must be from your domain)</li>
                      <li>Role (admin, partner, associate, paralegal)</li>
                      <li>Department (optional)</li>
                    </ul>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Drop your CSV file here or <span className="text-blue-600 cursor-pointer">browse</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {firmData.import_method === 'ad_sync' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3">Active Directory Sync</h4>
                <div className="space-y-3 text-sm text-blue-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Automatic user provisioning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Role mapping from AD groups</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Real-time sync when users are added/removed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Department and title synchronization</span>
                  </div>
                </div>
                
                <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Requires SSO configuration to be completed first. 
                    Users will be automatically imported during the first SSO login.
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 4: // Data Migration
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Data Migration</h3>
              <p className="text-gray-600">Import your existing legal data into the platform.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Database className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-gray-900">Cases & Clients</h4>
                </div>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Case information and status</li>
                  <li>• Client contact details</li>
                  <li>• Matter descriptions and dates</li>
                  <li>• Billing and time entries</li>
                </ul>
                <button className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Upload Cases CSV
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Upload className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-gray-900">Documents</h4>
                </div>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Contracts and agreements</li>
                  <li>• Court filings and briefs</li>
                  <li>• Correspondence and emails</li>
                  <li>• Research and notes</li>
                </ul>
                <button className="mt-3 text-green-600 hover:text-green-700 text-sm font-medium">
                  Upload Documents
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">Migration Options</h4>
              <div className="space-y-2 text-sm text-yellow-700">
                <label className="flex items-center space-x-2">
                  <input type="radio" name="migration" className="text-yellow-600" />
                  <span>Self-service migration (upload files yourself)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="migration" className="text-yellow-600" />
                  <span>Assisted migration (our team helps with complex data)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="migration" className="text-yellow-600" />
                  <span>White-glove migration (full service data transfer)</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 5: // Configuration
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Platform Configuration</h3>
              <p className="text-gray-600">Customize the platform for your firm's workflows.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Workflow Settings</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Case Statuses
                  </label>
                  <div className="space-y-2">
                    {['New', 'Active', 'On Hold', 'Closed', 'Archived'].map((status) => (
                      <label key={status} className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                        <span className="text-sm text-gray-700">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Tracking
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                    <option>6-minute increments (0.1 hours)</option>
                    <option>15-minute increments (0.25 hours)</option>
                    <option>30-minute increments (0.5 hours)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">AI Settings</h4>
                
                <div>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                    <span className="text-sm text-gray-700">Enable AI document analysis</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                    <span className="text-sm text-gray-700">AI-powered case outcome predictions</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                    <span className="text-sm text-gray-700">Automated email responses</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Model Preference
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                    <option>OpenAI GPT-4 (Recommended)</option>
                    <option>Google Gemini Pro</option>
                    <option>Automatic (Best for task)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Ready to Launch!</span>
              </div>
              <p className="text-sm text-green-700">
                Your firm's Legal AI Operating System is configured and ready to use. 
                You can always modify these settings later in the admin panel.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome to LegalOS</h1>
              <p className="text-gray-600">Let's set up your firm's AI-powered legal platform</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {onboardingSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted 
                      ? 'bg-green-600 border-green-600' 
                      : isActive 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'bg-white border-gray-300'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6 text-white" />
                    ) : (
                      <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    )}
                  </div>
                  {index < onboardingSteps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-2 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {onboardingSteps[currentStep].title}
            </h2>
            <p className="text-gray-600">
              {onboardingSteps[currentStep].description}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>

          <button
            onClick={nextStep}
            disabled={currentStep === onboardingSteps.length - 1}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg ${
              currentStep === onboardingSteps.length - 1
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {currentStep === onboardingSteps.length - 1 ? (
              <>
                <Zap className="h-4 w-4" />
                Launch Platform
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FirmOnboardingPage; 