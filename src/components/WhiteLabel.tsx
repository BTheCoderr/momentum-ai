'use client';

import React, { useState } from 'react';
import { 
  Palette, 
  Upload, 
  Eye, 
  Save, 
  RotateCcw, 
  Settings, 
  Globe, 
  Smartphone, 
  Monitor,
  Type,
  Image,
  Code,
  Download,
  Copy,
  CheckCircle
} from 'lucide-react';

interface BrandSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  logo: string;
  favicon: string;
  companyName: string;
  tagline: string;
  font: string;
  borderRadius: string;
}

interface CustomDomain {
  domain: string;
  status: 'pending' | 'active' | 'error';
  sslStatus: 'pending' | 'active' | 'error';
}

export default function WhiteLabel() {
  const [activeTab, setActiveTab] = useState<'branding' | 'domain' | 'customization' | 'preview' | 'export'>('branding');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const [brandSettings, setBrandSettings] = useState<BrandSettings>({
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    accentColor: '#10B981',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    logo: '',
    favicon: '',
    companyName: 'Your Company',
    tagline: 'Achieve Your Goals',
    font: 'Inter',
    borderRadius: '8px'
  });

  const [customDomains] = useState<CustomDomain[]>([
    {
      domain: 'goals.yourcompany.com',
      status: 'active',
      sslStatus: 'active'
    },
    {
      domain: 'momentum.acmecorp.com',
      status: 'pending',
      sslStatus: 'pending'
    }
  ]);

  const handleColorChange = (key: keyof BrandSettings, value: string) => {
    setBrandSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    console.log('Saving brand settings:', brandSettings);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    setBrandSettings({
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      accentColor: '#10B981',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      logo: '',
      favicon: '',
      companyName: 'Your Company',
      tagline: 'Achieve Your Goals',
      font: 'Inter',
      borderRadius: '8px'
    });
  };

  const generateCSS = () => {
    return `:root {
  --primary-color: ${brandSettings.primaryColor};
  --secondary-color: ${brandSettings.secondaryColor};
  --accent-color: ${brandSettings.accentColor};
  --background-color: ${brandSettings.backgroundColor};
  --text-color: ${brandSettings.textColor};
  --border-radius: ${brandSettings.borderRadius};
  --font-family: '${brandSettings.font}', sans-serif;
}

.btn-primary {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  border-radius: var(--border-radius);
}

.btn-secondary {
  background-color: var(--secondary-color);
  border-color: var(--secondary-color);
  border-radius: var(--border-radius);
}

.text-primary {
  color: var(--primary-color);
}

.bg-primary {
  background-color: var(--primary-color);
}

body {
  font-family: var(--font-family);
  background-color: var(--background-color);
  color: var(--text-color);
}`;
  };

  const copyCSS = () => {
    navigator.clipboard.writeText(generateCSS());
    alert('CSS copied to clipboard!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'desktop': return Monitor;
      case 'tablet': return Monitor;
      case 'mobile': return Smartphone;
      default: return Monitor;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">White Label & Customization</h2>
          <p className="text-gray-600">Customize the platform with your brand identity</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Success Message */}
      {showSaveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800">Brand settings saved successfully!</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-6 border-b border-gray-200">
        {[
          { id: 'branding', label: 'Branding', icon: Palette },
          { id: 'domain', label: 'Custom Domain', icon: Globe },
          { id: 'customization', label: 'Advanced', icon: Settings },
          { id: 'preview', label: 'Preview', icon: Eye },
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

      {/* Branding Tab */}
      {activeTab === 'branding' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Settings Panel */}
          <div className="space-y-6">
            {/* Company Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={brandSettings.companyName}
                    onChange={(e) => handleColorChange('companyName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={brandSettings.tagline}
                    onChange={(e) => handleColorChange('tagline', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Colors */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Brand Colors</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'primaryColor', label: 'Primary Color' },
                  { key: 'secondaryColor', label: 'Secondary Color' },
                  { key: 'accentColor', label: 'Accent Color' },
                  { key: 'backgroundColor', label: 'Background Color' },
                  { key: 'textColor', label: 'Text Color' }
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {label}
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={brandSettings[key as keyof BrandSettings] as string}
                        onChange={(e) => handleColorChange(key as keyof BrandSettings, e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={brandSettings[key as keyof BrandSettings] as string}
                        onChange={(e) => handleColorChange(key as keyof BrandSettings, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Typography</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Font Family
                  </label>
                  <select
                    value={brandSettings.font}
                    onChange={(e) => handleColorChange('font', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Poppins">Poppins</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Border Radius
                  </label>
                  <select
                    value={brandSettings.borderRadius}
                    onChange={(e) => handleColorChange('borderRadius', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="0px">Sharp (0px)</option>
                    <option value="4px">Small (4px)</option>
                    <option value="8px">Medium (8px)</option>
                    <option value="12px">Large (12px)</option>
                    <option value="16px">Extra Large (16px)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Logo Upload */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo & Assets</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Logo
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Drop your logo here or <button className="text-blue-600 hover:text-blue-700">browse</button>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG up to 2MB</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Favicon
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Drop your favicon here or <button className="text-blue-600 hover:text-blue-700">browse</button>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">ICO, PNG 32x32px</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h3>
            <div 
              className="border rounded-lg p-6 space-y-4"
              style={{ 
                backgroundColor: brandSettings.backgroundColor,
                color: brandSettings.textColor,
                fontFamily: brandSettings.font
              }}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: brandSettings.primaryColor }}
                ></div>
                <h4 className="text-xl font-bold">{brandSettings.companyName}</h4>
              </div>
              <p className="text-sm opacity-75">{brandSettings.tagline}</p>
              
              <div className="space-y-3">
                <button
                  className="px-4 py-2 text-white font-medium rounded"
                  style={{ 
                    backgroundColor: brandSettings.primaryColor,
                    borderRadius: brandSettings.borderRadius
                  }}
                >
                  Primary Button
                </button>
                <button
                  className="px-4 py-2 text-white font-medium rounded ml-2"
                  style={{ 
                    backgroundColor: brandSettings.secondaryColor,
                    borderRadius: brandSettings.borderRadius
                  }}
                >
                  Secondary Button
                </button>
              </div>
              
              <div className="space-y-2">
                <div 
                  className="h-2 rounded-full"
                  style={{ backgroundColor: brandSettings.primaryColor + '20' }}
                >
                  <div 
                    className="h-2 rounded-full w-3/4"
                    style={{ backgroundColor: brandSettings.primaryColor }}
                  ></div>
                </div>
                <div 
                  className="h-2 rounded-full"
                  style={{ backgroundColor: brandSettings.accentColor + '20' }}
                >
                  <div 
                    className="h-2 rounded-full w-1/2"
                    style={{ backgroundColor: brandSettings.accentColor }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Domain Tab */}
      {activeTab === 'domain' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Domains</h3>
            
            {/* Add Domain Form */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Add New Domain</h4>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="goals.yourcompany.com"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Add Domain
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Make sure to point your domain's CNAME record to: <code className="bg-gray-200 px-1 rounded">app.momentum-ai.com</code>
              </p>
            </div>

            {/* Domain List */}
            <div className="space-y-4">
              {customDomains.map((domain, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{domain.domain}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-gray-500">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(domain.status)}`}>
                          {domain.status.charAt(0).toUpperCase() + domain.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-gray-500">SSL:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(domain.sslStatus)}`}>
                          {domain.sslStatus.charAt(0).toUpperCase() + domain.sslStatus.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-700">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-700">
                      <Upload className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preview Tab */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          {/* Device Selector */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Preview Device:</span>
            {['desktop', 'tablet', 'mobile'].map((device) => {
              const Icon = getDeviceIcon(device);
              return (
                <button
                  key={device}
                  onClick={() => setPreviewDevice(device as any)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                    previewDevice === device
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="capitalize">{device}</span>
                </button>
              );
            })}
          </div>

          {/* Preview Frame */}
          <div className="bg-gray-100 p-8 rounded-xl">
            <div 
              className={`mx-auto bg-white rounded-lg shadow-lg overflow-hidden ${
                previewDevice === 'desktop' ? 'max-w-6xl' :
                previewDevice === 'tablet' ? 'max-w-2xl' :
                'max-w-sm'
              }`}
            >
              <div 
                className="p-6"
                style={{ 
                  backgroundColor: brandSettings.backgroundColor,
                  color: brandSettings.textColor,
                  fontFamily: brandSettings.font
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded"
                      style={{ backgroundColor: brandSettings.primaryColor }}
                    ></div>
                    <div>
                      <h1 className="text-xl font-bold">{brandSettings.companyName}</h1>
                      <p className="text-sm opacity-75">{brandSettings.tagline}</p>
                    </div>
                  </div>
                  <button
                    className="px-4 py-2 text-white font-medium rounded"
                    style={{ 
                      backgroundColor: brandSettings.primaryColor,
                      borderRadius: brandSettings.borderRadius
                    }}
                  >
                    Get Started
                  </button>
                </div>

                {/* Sample Content */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-3">Your Goals Dashboard</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { title: 'Active Goals', value: '12', color: brandSettings.primaryColor },
                        { title: 'Completed', value: '8', color: brandSettings.accentColor },
                        { title: 'Success Rate', value: '89%', color: brandSettings.secondaryColor }
                      ].map((stat, index) => (
                        <div key={index} className="p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-8 h-8 rounded"
                              style={{ backgroundColor: stat.color + '20' }}
                            ></div>
                            <div>
                              <p className="text-sm opacity-75">{stat.title}</p>
                              <p className="text-xl font-bold">{stat.value}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Recent Progress</h3>
                    <div className="space-y-3">
                      {['Complete Q1 Marketing Plan', 'Launch New Product', 'Team Building Workshop'].map((goal, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                          <span>{goal}</span>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-16 h-2 rounded-full"
                              style={{ backgroundColor: brandSettings.primaryColor + '20' }}
                            >
                              <div 
                                className="h-2 rounded-full"
                                style={{ 
                                  backgroundColor: brandSettings.primaryColor,
                                  width: `${[75, 45, 90][index]}%`
                                }}
                              ></div>
                            </div>
                            <span className="text-sm">{[75, 45, 90][index]}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Custom CSS</h3>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Use this CSS to apply your brand customizations to external applications or custom implementations.
              </p>
              
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm">
                  <code>{generateCSS()}</code>
                </pre>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={copyCSS}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy CSS</span>
                </button>
                <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
                  <Download className="w-4 h-4" />
                  <span>Download CSS File</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Brand Assets Package</h3>
            
            <p className="text-gray-600 mb-4">
              Download a complete package of your brand assets including logos, color palettes, and style guides.
            </p>
            
            <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <Download className="w-4 h-4" />
              <span>Download Brand Package</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 