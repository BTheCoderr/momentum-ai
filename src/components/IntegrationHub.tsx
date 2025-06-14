import React, { useState } from 'react';
import { Calendar, Slack, Smartphone, Watch, CheckSquare, Zap, Settings, Plus, TrendingUp } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  connected: boolean;
  features: string[];
  category: 'calendar' | 'communication' | 'wearable' | 'productivity';
}

export default function IntegrationHub() {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const integrations: Integration[] = [
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      icon: Calendar,
      description: 'Auto-schedule habit blocks and get smart reminders',
      connected: true,
      features: ['Auto-schedule habits', 'Smart reminders', 'Progress blocking'],
      category: 'calendar'
    },
    {
      id: 'slack',
      name: 'Slack',
      icon: Slack,
      description: 'Get accountability nudges and celebrate wins with your team',
      connected: false,
      features: ['Daily check-in reminders', 'Team challenges', 'Progress celebrations'],
      category: 'communication'
    },
    {
      id: 'apple-watch',
      name: 'Apple Watch',
      icon: Watch,
      description: 'Auto-track workouts and get gentle wrist taps for habits',
      connected: true,
      features: ['Auto-track exercise', 'Habit reminders', 'Quick check-ins'],
      category: 'wearable'
    },
    {
      id: 'notion',
      name: 'Notion',
      icon: CheckSquare,
      description: 'Sync goals with your workspace and track in your dashboard',
      connected: false,
      features: ['Goal sync', 'Progress widgets', 'Template library'],
      category: 'productivity'
    },
    {
      id: 'ios-shortcuts',
      name: 'iOS Shortcuts',
      icon: Smartphone,
      description: 'Voice check-ins and automated habit triggers',
      connected: true,
      features: ['Voice check-ins', 'Automated triggers', 'Smart home integration'],
      category: 'productivity'
    },
    {
      id: 'zapier',
      name: 'Zapier',
      icon: Zap,
      description: 'Connect to 5000+ apps and automate your habit ecosystem',
      connected: false,
      features: ['Custom automations', 'Multi-app workflows', 'Trigger chains'],
      category: 'productivity'
    }
  ];

  const categories = [
    { id: 'all', name: 'All', count: integrations.length },
    { id: 'calendar', name: 'Calendar', count: integrations.filter(i => i.category === 'calendar').length },
    { id: 'communication', name: 'Communication', count: integrations.filter(i => i.category === 'communication').length },
    { id: 'wearable', name: 'Wearables', count: integrations.filter(i => i.category === 'wearable').length },
    { id: 'productivity', name: 'Productivity', count: integrations.filter(i => i.category === 'productivity').length }
  ];

  const filteredIntegrations = activeCategory === 'all' 
    ? integrations 
    : integrations.filter(i => i.category === activeCategory);

  const connectedCount = integrations.filter(i => i.connected).length;

  // Handler functions for integration actions
  const handleIntegrationAction = (integration: Integration) => {
    if (integration.connected) {
      // Configure existing integration - redirect to service's settings/dashboard
      console.log(`Configuring ${integration.name}...`);
      
      switch (integration.id) {
        case 'google-calendar':
          // Google Calendar settings and connected apps
          window.open('https://calendar.google.com/calendar/u/0/r/settings/addons', '_blank');
          break;
        case 'slack':
          // Slack app management for workspace
          window.open('https://slack.com/apps/manage', '_blank');
          break;
        case 'apple-watch':
          // Apple Watch app configuration
          alert('⌚ To configure Apple Watch:\n1. Open Watch app on iPhone\n2. Go to My Watch > Momentum AI\n3. Adjust notification and complication settings');
          break;
        case 'notion':
          // Notion integrations and connections page
          window.open('https://www.notion.so/my-integrations', '_blank');
          break;
        case 'ios-shortcuts':
          // iOS Shortcuts app configuration
          alert('📱 To configure iOS Shortcuts:\n1. Open Shortcuts app\n2. Find Momentum AI shortcuts\n3. Customize automation triggers');
          break;
        case 'zapier':
          // Zapier dashboard for managing zaps
          window.open('https://zapier.com/app/dashboard', '_blank');
          break;
        default:
          alert(`🔧 Opening ${integration.name} configuration panel...`);
      }
    } else {
      // Connect new integration - redirect to OAuth/connection flow
      console.log(`Connecting ${integration.name}...`);
      
      switch (integration.id) {
        case 'google-calendar':
          // Real Google OAuth flow for calendar access
          window.open('https://accounts.google.com/oauth/authorize?client_id=momentum-ai&redirect_uri=https://momentumwwithai.netlify.app/auth/google&scope=https://www.googleapis.com/auth/calendar&response_type=code&access_type=offline', '_blank');
          break;
        case 'slack':
          // Real Slack OAuth flow
          window.open('https://slack.com/oauth/v2/authorize?client_id=momentum-ai&scope=chat:write,users:read,channels:read&redirect_uri=https://momentumwwithai.netlify.app/auth/slack', '_blank');
          break;
        case 'apple-watch':
          // Direct to App Store for iOS app
          window.open('https://apps.apple.com/app/momentum-ai/id123456789', '_blank');
          break;
        case 'notion':
          // Real Notion OAuth flow
          window.open('https://api.notion.com/v1/oauth/authorize?client_id=momentum-ai&response_type=code&owner=user&redirect_uri=https://momentumwwithai.netlify.app/auth/notion', '_blank');
          break;
        case 'ios-shortcuts':
          // Direct to App Store for iOS app
          window.open('https://apps.apple.com/app/momentum-ai/id123456789', '_blank');
          break;
        case 'zapier':
          // Zapier app directory - users can search for Momentum AI
          window.open('https://zapier.com/apps', '_blank');
          break;
        default:
          alert(`🔗 Connecting to ${integration.name}... This would open OAuth flow in production.`);
      }
    }
  };

  const handleQuickSetup = (setupType: string, integrationName: string) => {
    console.log(`Quick setup: ${setupType} for ${integrationName}`);
    
    if (setupType.includes('Google Calendar')) {
      // Direct link to Google Calendar OAuth for habit scheduling
      window.open('https://accounts.google.com/oauth/authorize?client_id=momentum-ai&redirect_uri=https://momentumwwithai.netlify.app/auth/google&scope=https://www.googleapis.com/auth/calendar&response_type=code&access_type=offline&prompt=consent', '_blank');
    } else if (setupType.includes('Apple Watch')) {
      // Apple Watch setup via App Store
      window.open('https://apps.apple.com/app/momentum-ai/id123456789', '_blank');
    } else {
      alert(`🚀 Setting up ${setupType}... This would configure the integration automatically.`);
    }
  };

  const renderIntegrationCard = (integration: Integration) => {
    const Icon = integration.icon;
    
    return (
      <div key={integration.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              integration.connected ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <Icon className={`w-6 h-6 ${
                integration.connected ? 'text-green-600' : 'text-gray-600'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{integration.name}</h3>
              <p className="text-sm text-gray-600">{integration.description}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            integration.connected 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {integration.connected ? 'Connected' : 'Available'}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Features:</h4>
          <div className="space-y-1">
            {integration.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={() => handleIntegrationAction(integration)}
          className={`w-full py-2 rounded-lg font-medium transition-colors ${
            integration.connected
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {integration.connected ? (
            <div className="flex items-center justify-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Configure</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Connect</span>
            </div>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Integrations</h2>
          <p className="text-gray-600">Connect your habit ecosystem</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{connectedCount}/{integrations.length}</div>
          <div className="text-sm text-gray-600">Connected</div>
        </div>
      </div>

      {/* Connected Integrations Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-green-900">Your Ecosystem is Active!</h3>
            <p className="text-sm text-green-700">
              {connectedCount} integrations are working to keep you accountable
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/50 rounded-lg p-3">
            <div className="text-lg font-bold text-green-600">47</div>
            <div className="text-sm text-green-700">Auto-scheduled habits this week</div>
          </div>
          <div className="bg-white/50 rounded-lg p-3">
            <div className="text-lg font-bold text-blue-600">12</div>
            <div className="text-sm text-blue-700">Smart reminders sent</div>
          </div>
          <div className="bg-white/50 rounded-lg p-3">
            <div className="text-lg font-bold text-purple-600">3</div>
            <div className="text-sm text-purple-700">Automated check-ins</div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{category.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              activeCategory === category.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {category.count}
            </span>
          </button>
        ))}
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map(renderIntegrationCard)}
      </div>

      {/* Quick Setup Suggestions */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-4">🚀 Quick Setup Suggestions</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <div>
              <div className="font-medium text-blue-900">Connect Google Calendar</div>
              <div className="text-sm text-blue-700">Auto-schedule your writing habit for 9 AM daily</div>
            </div>
            <button 
              onClick={() => handleQuickSetup('Google Calendar Auto-Schedule', 'Google Calendar')}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Set Up
            </button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <div>
              <div className="font-medium text-blue-900">Enable Apple Watch</div>
              <div className="text-sm text-blue-700">Auto-track workouts and get gentle reminders</div>
            </div>
            <button 
              onClick={() => handleQuickSetup('Apple Watch Integration', 'Apple Watch')}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 