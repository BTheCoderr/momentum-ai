'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar, 
  Filter, 
  Share, 
  Settings,
  PieChart,
  LineChart,
  Users,
  Target,
  Clock,
  Award,
  FileText,
  Mail,
  Printer,
  Eye,
  Plus
} from 'lucide-react';

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'goals' | 'users' | 'teams' | 'performance';
  lastGenerated: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  recipients: string[];
  status: 'active' | 'paused';
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }[];
}

export default function AdvancedReporting() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'custom' | 'scheduled' | 'export'>('dashboard');
  const [selectedDateRange, setSelectedDateRange] = useState('last30days');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['goals', 'completion', 'users']);
  const [showCreateReportModal, setShowCreateReportModal] = useState(false);

  const reports: Report[] = [
    {
      id: '1',
      name: 'Weekly Goal Performance',
      description: 'Comprehensive overview of goal completion rates and trends',
      type: 'goals',
      lastGenerated: '2024-01-14T10:00:00Z',
      frequency: 'weekly',
      recipients: ['manager@company.com', 'team@company.com'],
      status: 'active'
    },
    {
      id: '2',
      name: 'Monthly Team Analytics',
      description: 'Team performance metrics and collaboration insights',
      type: 'teams',
      lastGenerated: '2024-01-01T09:00:00Z',
      frequency: 'monthly',
      recipients: ['hr@company.com'],
      status: 'active'
    },
    {
      id: '3',
      name: 'User Engagement Report',
      description: 'User activity, retention, and engagement metrics',
      type: 'users',
      lastGenerated: '2024-01-13T15:30:00Z',
      frequency: 'weekly',
      recipients: ['analytics@company.com'],
      status: 'paused'
    }
  ];

  // Mock chart data
  const goalCompletionData: ChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Goals Completed',
        data: [65, 78, 90, 81, 95, 88],
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6'
      },
      {
        label: 'Goals Created',
        data: [85, 92, 105, 98, 110, 102],
        backgroundColor: '#10B981',
        borderColor: '#10B981'
      }
    ]
  };

  const teamPerformanceData: ChartData = {
    labels: ['Product', 'Engineering', 'Marketing', 'Sales', 'Design'],
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: [89, 76, 92, 68, 85],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
      }
    ]
  };

  const userEngagementData: ChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Active Users',
        data: [245, 267, 289, 301],
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6'
      },
      {
        label: 'New Users',
        data: [12, 18, 15, 22],
        backgroundColor: '#10B981',
        borderColor: '#10B981'
      }
    ]
  };

  const handleExportReport = (format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Exporting report as ${format}`);
    alert(`Report exported as ${format.toUpperCase()}!`);
  };

  const handleScheduleReport = (reportData: any) => {
    console.log('Scheduling report:', reportData);
    alert('Report scheduled successfully!');
    setShowCreateReportModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Advanced Reporting</h2>
          <p className="text-gray-600">Generate comprehensive reports and analytics</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
            <Share className="w-4 h-4" />
            <span>Share</span>
          </button>
          <button
            onClick={() => setShowCreateReportModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Create Report</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-6 border-b border-gray-200">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'reports', label: 'Reports', icon: FileText },
          { id: 'custom', label: 'Custom', icon: Settings },
          { id: 'scheduled', label: 'Scheduled', icon: Calendar },
          { id: 'export', label: 'Export', icon: Download }
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

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex items-center space-x-4 bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="last7days">Last 7 days</option>
                <option value="last30days">Last 30 days</option>
                <option value="last90days">Last 90 days</option>
                <option value="lastyear">Last year</option>
                <option value="custom">Custom range</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">Metrics:</span>
              {['goals', 'completion', 'users', 'teams'].map((metric) => (
                <label key={metric} className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={selectedMetrics.includes(metric)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMetrics([...selectedMetrics, metric]);
                      } else {
                        setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm capitalize">{metric}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Goals</p>
                  <p className="text-2xl font-bold text-gray-900">1,247</p>
                  <p className="text-sm text-green-600">+12% from last month</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">84.2%</p>
                  <p className="text-sm text-green-600">+3.1% from last month</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">301</p>
                  <p className="text-sm text-green-600">+8% from last month</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg. Time to Complete</p>
                  <p className="text-2xl font-bold text-gray-900">12.4d</p>
                  <p className="text-sm text-red-600">+1.2d from last month</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Goal Completion Trend */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Goal Completion Trend</h3>
                <LineChart className="w-5 h-5 text-gray-400" />
              </div>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Interactive chart would render here</p>
                  <p className="text-sm text-gray-400">Goals Created vs Completed over time</p>
                </div>
              </div>
            </div>

            {/* Team Performance */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Team Performance</h3>
                <PieChart className="w-5 h-5 text-gray-400" />
              </div>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Team completion rates by department</p>
                  <div className="mt-4 space-y-2">
                    {teamPerformanceData.labels.map((label, index) => (
                      <div key={label} className="flex items-center justify-between text-sm">
                        <span>{label}</span>
                        <span className="font-medium">{teamPerformanceData.datasets[0].data[index]}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Engagement */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">User Engagement Trends</h3>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">User activity and engagement metrics</p>
                <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                  {userEngagementData.labels.map((label, index) => (
                    <div key={label} className="text-center">
                      <p className="font-medium">{label}</p>
                      <p className="text-blue-600">{userEngagementData.datasets[0].data[index]} active</p>
                      <p className="text-green-600">+{userEngagementData.datasets[1].data[index]} new</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Goal Performance Report',
                description: 'Comprehensive analysis of goal completion rates, trends, and insights',
                icon: Target,
                color: 'blue'
              },
              {
                title: 'Team Analytics Report',
                description: 'Team collaboration metrics, performance comparisons, and recommendations',
                icon: Users,
                color: 'green'
              },
              {
                title: 'User Engagement Report',
                description: 'User activity patterns, retention metrics, and engagement insights',
                icon: TrendingUp,
                color: 'purple'
              },
              {
                title: 'Executive Summary',
                description: 'High-level overview of key metrics and business insights',
                icon: BarChart3,
                color: 'orange'
              },
              {
                title: 'Productivity Analysis',
                description: 'Time tracking, efficiency metrics, and productivity recommendations',
                icon: Clock,
                color: 'red'
              },
              {
                title: 'Achievement Report',
                description: 'Milestone tracking, badge distribution, and recognition analytics',
                icon: Award,
                color: 'yellow'
              }
            ].map((report, index) => {
              const Icon = report.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-12 h-12 bg-${report.color}-100 rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 text-${report.color}-600`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{report.title}</h3>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{report.description}</p>
                  
                  <div className="flex items-center space-x-2">
                    <button className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 text-sm">
                      <Eye className="w-4 h-4 inline mr-1" />
                      Preview
                    </button>
                    <button className="flex-1 bg-gray-50 text-gray-600 py-2 px-3 rounded-lg hover:bg-gray-100 text-sm">
                      <Download className="w-4 h-4 inline mr-1" />
                      Generate
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Scheduled Reports Tab */}
      {activeTab === 'scheduled' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Report Name</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Type</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Frequency</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Recipients</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Last Generated</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">{report.name}</p>
                          <p className="text-sm text-gray-500">{report.description}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                          {report.type}
                        </span>
                      </td>
                      <td className="py-4 px-6 capitalize">{report.frequency}</td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {report.recipients.slice(0, 2).map((email, index) => (
                            <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {email}
                            </span>
                          ))}
                          {report.recipients.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{report.recipients.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {new Date(report.lastGenerated).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-700">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-700">
                            <Settings className="w-4 h-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-700">
                            <Mail className="w-4 h-4" />
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

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                format: 'PDF',
                description: 'Professional formatted reports with charts and graphs',
                icon: FileText,
                color: 'red'
              },
              {
                format: 'Excel',
                description: 'Spreadsheet format with raw data and pivot tables',
                icon: BarChart3,
                color: 'green'
              },
              {
                format: 'CSV',
                description: 'Raw data export for custom analysis and integration',
                icon: Download,
                color: 'blue'
              }
            ].map((exportOption, index) => {
              const Icon = exportOption.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-12 h-12 bg-${exportOption.color}-100 rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 text-${exportOption.color}-600`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{exportOption.format}</h3>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{exportOption.description}</p>
                  
                  <button
                    onClick={() => handleExportReport(exportOption.format.toLowerCase() as any)}
                    className="w-full bg-blue-50 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-100"
                  >
                    Export as {exportOption.format}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="last7days">Last 7 days</option>
                  <option value="last30days">Last 30 days</option>
                  <option value="last90days">Last 90 days</option>
                  <option value="lastyear">Last year</option>
                  <option value="custom">Custom range</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Include Data
                </label>
                <div className="space-y-2">
                  {['Goals', 'Users', 'Teams', 'Analytics', 'Comments', 'Attachments'].map((dataType) => (
                    <label key={dataType} className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm text-gray-700">{dataType}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-3 pt-4">
                <button
                  onClick={() => handleExportReport('pdf')}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Report</span>
                </button>
                <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
                  <Mail className="w-4 h-4" />
                  <span>Email Report</span>
                </button>
                <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Report Modal */}
      {showCreateReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create Scheduled Report</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleScheduleReport({});
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Report Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Monthly Performance Report"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Report Type
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="goals">Goals Report</option>
                    <option value="users">Users Report</option>
                    <option value="teams">Teams Report</option>
                    <option value="performance">Performance Report</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipients (comma-separated emails)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="manager@company.com, team@company.com"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Create Report
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateReportModal(false)}
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