'use client';

import React from 'react';
import { 
  Shield, Brain, TrendingUp, Users, Lock, Zap, 
  Award, Globe, Settings, ChevronRight, Star,
  Building2, Briefcase, Scale, Eye
} from 'lucide-react';
import Link from 'next/link';

const EnterprisePage: React.FC = () => {
  const enterpriseFeatures = [
    {
      icon: Shield,
      title: 'Enterprise Security & SSO',
      description: 'Azure AD, SAML, Multi-factor authentication, and advanced compliance',
      features: ['Single Sign-On (SSO)', 'Multi-Factor Authentication', 'Role-based Access Control', 'SOC 2 Compliance'],
      color: 'blue'
    },
    {
      icon: Brain,
      title: 'Advanced AI & Analytics',
      description: 'Predictive insights, custom AI models, and comprehensive business intelligence',
      features: ['Custom AI Models', 'Predictive Analytics', 'Revenue Forecasting', 'Case Outcome Prediction'],
      color: 'purple'
    },
    {
      icon: Eye,
      title: 'Audit & Compliance Logging',
      description: 'Complete audit trails, compliance monitoring, and regulatory reporting',
      features: ['Real-time Audit Logs', 'Compliance Monitoring', 'Risk Assessment', 'Regulatory Reporting'],
      color: 'green'
    },
    {
      icon: TrendingUp,
      title: 'Revenue Optimization',
      description: 'Advanced pricing strategies, subscription management, and growth analytics',
      features: ['Dynamic Pricing', 'Subscription Analytics', 'Revenue Forecasting', 'Churn Prevention'],
      color: 'orange'
    }
  ];

  const enterpriseStats = [
    { label: 'Fortune 500 Clients', value: '150+', icon: Building2 },
    { label: 'Average ROI', value: '340%', icon: TrendingUp },
    { label: 'Security Certifications', value: '8', icon: Shield },
    { label: 'Uptime SLA', value: '99.9%', icon: Award },
  ];

  const testimonials = [
    {
      quote: "LegalOS transformed our practice. We've seen a 45% increase in efficiency and 30% growth in revenue.",
      author: "Sarah Chen",
      role: "Managing Partner",
      company: "Chen & Associates",
      logo: "🏛️"
    },
    {
      quote: "The AI capabilities are game-changing. Our case success rate improved by 22% in the first quarter.",
      author: "Michael Rodriguez",
      role: "Senior Partner",
      company: "Rodriguez Law Group",
      logo: "⚖️"
    },
    {
      quote: "Enterprise security features give us complete confidence. Perfect for our compliance requirements.",
      author: "Emily Watson",
      role: "COO",
      company: "Watson Legal Solutions",
      logo: "🏢"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600 border-blue-200',
      purple: 'bg-purple-100 text-purple-600 border-purple-200',
      green: 'bg-green-100 text-green-600 border-green-200',
      orange: 'bg-orange-100 text-orange-600 border-orange-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Legal AI Operating System
              <span className="block text-blue-200">For Enterprise</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Transform your legal practice with AI-powered automation, enterprise security, 
              and world-class analytics. Built for firms that demand excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/enterprise/demo"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Schedule Demo
              </Link>
              <Link 
                href="/enterprise/pricing"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                View Enterprise Pricing
              </Link>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {enterpriseStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 text-center">
                <Icon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enterprise Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Enterprise-Grade Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Built for the world's leading law firms with enterprise security, 
            advanced AI, and comprehensive business intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {enterpriseFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className={`w-16 h-16 rounded-lg ${getColorClasses(feature.color)} flex items-center justify-center mb-6`}>
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link 
                  href={`/enterprise/${feature.title.toLowerCase().replace(/ /g, '-')}`}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mt-4"
                >
                  Learn More <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Integration & Platform Section */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Seamless Integrations
            </h2>
            <p className="text-xl text-gray-600">
              Connect with your existing tools and workflows
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
            {[
              { name: 'Microsoft 365', logo: '🔷' },
              { name: 'Google Workspace', logo: '🔴' },
              { name: 'Slack', logo: '💬' },
              { name: 'Zoom', logo: '📹' },
              { name: 'Salesforce', logo: '☁️' },
              { name: 'QuickBooks', logo: '💰' },
            ].map((integration, index) => (
              <div key={index} className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl mb-2">{integration.logo}</div>
                <div className="text-sm font-medium text-gray-900">{integration.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Leading Law Firms
          </h2>
          <div className="flex justify-center items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
            ))}
            <span className="ml-2 text-gray-600">4.9/5 from 500+ reviews</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-4xl mb-4">{testimonial.logo}</div>
              <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
              <div className="border-t pt-4">
                <div className="font-semibold text-gray-900">{testimonial.author}</div>
                <div className="text-sm text-gray-600">{testimonial.role}</div>
                <div className="text-sm text-gray-500">{testimonial.company}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Practice?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join the world's leading law firms using AI to drive growth, 
              improve efficiency, and deliver exceptional client outcomes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/enterprise/demo"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Schedule Your Demo
              </Link>
              <Link 
                href="/contact"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Navigation */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold mb-8 text-center">Explore Enterprise Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/analytics" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <TrendingUp className="h-6 w-6 text-blue-400 mb-2" />
              <div className="font-medium">Advanced Analytics</div>
              <div className="text-sm text-gray-400">Business intelligence & insights</div>
            </Link>
            <Link href="/audit" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <Eye className="h-6 w-6 text-green-400 mb-2" />
              <div className="font-medium">Audit & Compliance</div>
              <div className="text-sm text-gray-400">Complete audit trails</div>
            </Link>
            <Link href="/revenue" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <TrendingUp className="h-6 w-6 text-orange-400 mb-2" />
              <div className="font-medium">Revenue Optimization</div>
              <div className="text-sm text-gray-400">Pricing & growth strategies</div>
            </Link>
            <Link href="/security" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <Shield className="h-6 w-6 text-purple-400 mb-2" />
              <div className="font-medium">Enterprise Security</div>
              <div className="text-sm text-gray-400">SSO & advanced security</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterprisePage; 