'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  Key, 
  Webhook, 
  Link, 
  Shield, 
  Activity, 
  Code, 
  Copy, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  Edit,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Database,
  Globe
} from 'lucide-react';

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  lastUsed: string;
  created: string;
  status: 'active' | 'inactive' | 'expired';
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  category: 'productivity' | 'communication' | 'analytics' | 'storage';
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  lastTriggered: string;
  successRate: number;
}

export default function APIIntegration() {
  const [activeTab, setActiveTab] = useState<'overview' | 'keys' | 'integrations' | 'webhooks' | 'docs'>('overview');
  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false);
  const [showCreateWebhookModal, setShowCreateWebhookModal] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const apiKeys: APIKey[] = [
    {
      id: '1',
      name: 'Production API',
      key: 'mk_live_1234567890abcdef',
      permissions: ['read', 'write', 'delete'],
      lastUsed: '2024-01-14T10:30:00Z',
      created: '2023-12-01T09:00:00Z',
      status: 'active'
    },
    {
      id: '2',
      name: 'Development API',
      key: 'mk_test_abcdef1234567890',
      permissions: ['read', 'write'],
      lastUsed: '2024-01-13T15:45:00Z',
      created: '2023-12-15T14:20:00Z',
      status: 'active'
    },
    {
      id: '3',
      name: 'Analytics API',
      key: 'mk_analytics_fedcba0987654321',
      permissions: ['read'],
      lastUsed: '2024-01-10T08:15:00Z',
      created: '2024-01-05T11:30:00Z',
      status: 'inactive'
    }
  ];

  const integrations: Integration[] = [
    {
      id: '1',
      name: 'Slack',
      description: 'Get goal notifications in your Slack channels',
      icon: '💬',
      status: 'connected',
      lastSync: '2024-01-14T10:30:00Z',
      category: 'communication'
    },
    {
      id: '2',
      name: 'Google Calendar',
      description: 'Sync goal deadlines with your calendar',
      icon: '📅',
      status: 'connected',
      lastSync: '2024-01-14T09:15:00Z',
      category: 'productivity'
    },
    {
      id: '3',
      name: 'Notion',
      description: 'Export goals and progress to Notion pages',
      icon: '📝',
      status: 'disconnected',
      lastSync: 'Never',
      category: 'productivity'
    },
    {
      id: '4',
      name: 'Google Analytics',
      description: 'Track goal completion events',
      icon: '📊',
      status: 'error',
      lastSync: '2024-01-13T16:20:00Z',
      category: 'analytics'
    },
    {
      id: '5',
      name: 'Zapier',
      description: 'Connect with 5000+ apps via Zapier',
      icon: '⚡',
      status: 'connected',
      lastSync: '2024-01-14T11:00:00Z',
      category: 'productivity'
    }
  ];

  const webhooks: Webhook[] = [
    {
      id: '1',
      name: 'Goal Completion Webhook',
      url: 'https://api.yourapp.com/webhooks/goal-completed',
      events: ['goal.completed', 'goal.updated'],
      status: 'active',
      lastTriggered: '2024-01-14T10:30:00Z',
      successRate: 98.5
    },
    {
      id: '2',
      name: 'User Registration Webhook',
      url: 'https://analytics.company.com/events',
      events: ['user.created', 'user.updated'],
      status: 'active',
      lastTriggered: '2024-01-14T09:15:00Z',
      successRate: 100
    },
    {
      id: '3',
      name: 'Team Activity Webhook',
      url: 'https://slack.com/api/webhooks/team-updates',
      events: ['team.created', 'member.added', 'member.removed'],
      status: 'inactive',
      lastTriggered: '2024-01-12T14:20:00Z',
      successRate: 95.2
    }
  ];

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
        return 'text-green-600 bg-green-100';
      case 'inactive':
      case 'disconnected':
        return 'text-gray-600 bg-gray-100';
      case 'error':
      case 'expired':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'inactive':
      case 'disconnected':
        return <Clock className="w-4 h-4 text-gray-600" />;
      case 'error':
      case 'expired':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">API & Integrations</h2>
          <p className="text-gray-600">Manage API keys, webhooks, and third-party integrations</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateWebhookModal(true)}
            className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            <Webhook className="w-4 h-4" />
            <span>Add Webhook</span>
          </button>
          <button
            onClick={() => setShowCreateKeyModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Key className="w-4 h-4" />
            <span>Create API Key</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-6 border-b border-gray-200">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'keys', label: 'API Keys', icon: Key },
          { id: 'integrations', label: 'Integrations', icon: Link },
          { id: 'webhooks', label: 'Webhooks', icon: Webhook },
          { id: 'docs', label: 'Documentation', icon: Code }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Key className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">API Keys</p>
                  <p className="text-2xl font-bold text-gray-900">{apiKeys.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Link className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Connected Apps</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {integrations.filter(i => i.status === 'connected').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Webhook className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Webhooks</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {webhooks.filter(w => w.status === 'active').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">API Calls Today</p>
                  <p className="text-2xl font-bold text-gray-900">2,847</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recent API Activity</h3>
            <div className="space-y-4">
              {[
                { endpoint: 'POST /api/goals', status: 200, time: '2 minutes ago', ip: '192.168.1.100' },
                { endpoint: 'GET /api/users/profile', status: 200, time: '5 minutes ago', ip: '10.0.0.50' },
                { endpoint: 'PUT /api/goals/123', status: 404, time: '8 minutes ago', ip: '192.168.1.100' },
                { endpoint: 'GET /api/analytics/dashboard', status: 200, time: '12 minutes ago', ip: '172.16.0.25' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 200 ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-mono text-sm text-gray-900">{activity.endpoint}</p>
                      <p className="text-xs text-gray-500">{activity.ip}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      activity.status === 200 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {activity.status}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'keys' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Name</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Key</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Permissions</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Last Used</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((key) => (
                    <tr key={key.id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">{key.name}</p>
                          <p className="text-sm text-gray-500">Created {new Date(key.created).toLocaleDateString()}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                            {visibleKeys.has(key.id) ? key.key : '••••••••••••••••'}
                          </code>
                          <button
                            onClick={() => toggleKeyVisibility(key.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {visibleKeys.has(key.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(key.key)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {key.permissions.map((permission) => (
                            <span
                              key={permission}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {permission}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(key.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(key.status)}`}>
                            {key.status.charAt(0).toUpperCase() + key.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {new Date(key.lastUsed).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-700">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
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
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          {/* Categories */}
          {['productivity', 'communication', 'analytics', 'storage'].map((category) => (
            <div key={category} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 capitalize">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations
                  .filter((integration) => integration.category === category)
                  .map((integration) => (
                    <div key={integration.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{integration.icon}</span>
                          <div>
                            <h4 className="font-semibold text-gray-900">{integration.name}</h4>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(integration.status)}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                                {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{integration.description}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>Last sync: {integration.lastSync === 'Never' ? 'Never' : new Date(integration.lastSync).toLocaleDateString()}</span>
                      </div>
                      
                      <button
                        className={`w-full py-2 px-4 rounded-lg font-medium ${
                          integration.status === 'connected'
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}
                      >
                        {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Webhooks Tab */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Name</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">URL</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Events</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Success Rate</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {webhooks.map((webhook) => (
                    <tr key={webhook.id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">{webhook.name}</p>
                          <p className="text-sm text-gray-500">
                            Last triggered: {new Date(webhook.lastTriggered).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {webhook.url}
                        </code>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {webhook.events.map((event) => (
                            <span
                              key={event}
                              className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                            >
                              {event}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(webhook.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(webhook.status)}`}>
                            {webhook.status.charAt(0).toUpperCase() + webhook.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${webhook.successRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{webhook.successRate}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-700">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
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
      )}

      {/* Documentation Tab */}
      {activeTab === 'docs' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">API Documentation</h3>
            
            <div className="space-y-6">
              {/* Quick Start */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Quick Start</h4>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <code className="text-green-400 text-sm">
                    {`curl -X GET "https://api.momentum-ai.com/v1/goals" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                  </code>
                </div>
              </div>

              {/* Endpoints */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Available Endpoints</h4>
                <div className="space-y-3">
                  {[
                    { method: 'GET', endpoint: '/v1/goals', description: 'Retrieve all goals' },
                    { method: 'POST', endpoint: '/v1/goals', description: 'Create a new goal' },
                    { method: 'PUT', endpoint: '/v1/goals/{id}', description: 'Update a specific goal' },
                    { method: 'DELETE', endpoint: '/v1/goals/{id}', description: 'Delete a specific goal' },
                    { method: 'GET', endpoint: '/v1/analytics', description: 'Get analytics data' },
                    { method: 'GET', endpoint: '/v1/users/profile', description: 'Get user profile' }
                  ].map((endpoint, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                        endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                        endpoint.method === 'POST' ? 'bg-green-100 text-green-800' :
                        endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {endpoint.method}
                      </span>
                      <code className="font-mono text-sm text-gray-900">{endpoint.endpoint}</code>
                      <span className="text-gray-600">{endpoint.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rate Limits */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Rate Limits</h4>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    <strong>Free Plan:</strong> 1,000 requests per hour<br />
                    <strong>Pro Plan:</strong> 10,000 requests per hour<br />
                    <strong>Enterprise Plan:</strong> Unlimited requests
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create API Key Modal */}
      {showCreateKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create API Key</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              alert('API Key created successfully!');
              setShowCreateKeyModal(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Production API Key"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions
                  </label>
                  <div className="space-y-2">
                    {['read', 'write', 'delete'].map((permission) => (
                      <label key={permission} className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm text-gray-700 capitalize">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Create Key
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateKeyModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Webhook Modal */}
      {showCreateWebhookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create Webhook</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              alert('Webhook created successfully!');
              setShowCreateWebhookModal(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Webhook Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Goal Completion Webhook"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Webhook URL
                  </label>
                  <input
                    type="url"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://your-app.com/webhooks/goals"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Events
                  </label>
                  <div className="space-y-2">
                    {['goal.created', 'goal.updated', 'goal.completed', 'goal.deleted', 'user.created', 'user.updated'].map((event) => (
                      <label key={event} className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm text-gray-700 font-mono">{event}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Create Webhook
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateWebhookModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 