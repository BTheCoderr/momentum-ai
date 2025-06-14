'use client';

import React, { useState } from 'react';
import { 
  Server, 
  Shield, 
  Activity, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Monitor,
  Cloud,
  Eye,
  Bell,
  Download,
  Play
} from 'lucide-react';

export default function LaunchInfrastructure() {
  const [activeTab, setActiveTab] = useState<'overview' | 'deployment' | 'monitoring' | 'security'>('overview');

  const systemMetrics = [
    { name: 'API Response Time', value: '145ms', status: 'healthy', description: 'Average response time across all endpoints' },
    { name: 'Database Performance', value: '99.8%', status: 'healthy', description: 'Query success rate and connection pool health' },
    { name: 'Memory Usage', value: '67%', status: 'warning', description: 'Current memory utilization across all services' },
    { name: 'Error Rate', value: '0.02%', status: 'healthy', description: 'Application error rate over the last 24 hours' }
  ];

  const environments = [
    { name: 'Production', status: 'active', version: 'v2.1.4', health: 99.8, url: 'https://app.momentum-ai.com' },
    { name: 'Staging', status: 'deploying', version: 'v2.2.0-rc1', health: 95.2, url: 'https://staging.momentum-ai.com' },
    { name: 'Development', status: 'active', version: 'v2.2.0-dev', health: 87.5, url: 'https://dev.momentum-ai.com' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'warning':
      case 'deploying':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Launch Infrastructure</h2>
          <p className="text-gray-600">Monitor, deploy, and scale your platform</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
            <Download className="w-4 h-4" />
            <span>Export Logs</span>
          </button>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Play className="w-4 h-4" />
            <span>Deploy</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-6 border-b border-gray-200">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'deployment', label: 'Deployment', icon: Server },
          { id: 'monitoring', label: 'Monitoring', icon: Monitor },
          { id: 'security', label: 'Security', icon: Shield }
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
          {/* System Health Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {systemMetrics.map((metric, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">{metric.name}</h3>
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                    {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{metric.description}</p>
              </div>
            ))}
          </div>

          {/* Environment Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Environment Status</h3>
            <div className="space-y-4">
              {environments.map((env, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      env.status === 'active' ? 'bg-green-500' :
                      env.status === 'deploying' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{env.name}</p>
                      <p className="text-sm text-gray-500">{env.version} • {env.health}% healthy</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(env.status)}`}>
                      {env.status.charAt(0).toUpperCase() + env.status.slice(1)}
                    </span>
                    <button className="text-blue-600 hover:text-blue-700">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Deployment Tab */}
      {activeTab === 'deployment' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Deployment Pipeline</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {environments.map((env, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">{env.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(env.status)}`}>
                      {env.status.charAt(0).toUpperCase() + env.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Current Version</p>
                      <p className="font-mono text-sm">{env.version}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Health Score</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${env.health}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{env.health}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-4">
                    <button className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 text-sm">
                      <Play className="w-4 h-4 inline mr-1" />
                      Deploy
                    </button>
                    <button className="flex-1 bg-gray-50 text-gray-600 py-2 px-3 rounded-lg hover:bg-gray-100 text-sm">
                      Rollback
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Monitoring Tab */}
      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">CPU Usage</p>
                  <p className="text-2xl font-bold text-gray-900">34%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Database className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Memory</p>
                  <p className="text-2xl font-bold text-gray-900">67%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Database className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Database</p>
                  <p className="text-2xl font-bold text-gray-900">12ms</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Cloud className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Network I/O</p>
                  <p className="text-2xl font-bold text-gray-900">2.4GB</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Monitoring</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Real-time performance dashboard</p>
                <p className="text-sm text-gray-400">System metrics and application performance</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Security Score</p>
                  <p className="text-2xl font-bold text-gray-900">94/100</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Open Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">2</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">SSL Status</p>
                  <p className="text-2xl font-bold text-gray-900">Valid</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Scan</p>
                  <p className="text-2xl font-bold text-gray-900">4h ago</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Security Alerts</h3>
            <div className="space-y-4">
              {[
                { title: 'Outdated NPM Package Detected', severity: 'medium', description: 'lodash@4.17.20 has known vulnerabilities', resolved: false },
                { title: 'Unusual Login Pattern', severity: 'low', description: 'Multiple failed login attempts detected', resolved: true },
                { title: 'GDPR Data Retention Review', severity: 'high', description: 'User data retention policy review required', resolved: false }
              ].map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      alert.severity === 'high' ? 'bg-red-500' :
                      alert.severity === 'medium' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-600">{alert.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {alert.resolved ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <button className="bg-blue-50 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-100">
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 