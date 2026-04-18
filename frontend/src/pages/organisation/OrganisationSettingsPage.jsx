/**
 * Organisation Settings Page
 * Tabbed interface for all organisation settings
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSettings } from '../../store/organisation/slice/settingsSlice';
import { fetchBranding } from '../../store/organisation/slice/brandingSlice';
import {
  GeneralSettings,
  NotificationSettings,
  SecuritySettings,
  BillingSettings,
  IntegrationSettings,
} from '../../components/Organisation/settings';

const tabs = [
  { id: 'general', label: 'General', icon: '⚙️', description: 'Regional and display preferences', component: GeneralSettings },
  { id: 'notifications', label: 'Notifications', icon: '🔔', description: 'Email and in-app notification settings', component: NotificationSettings },
  { id: 'security', label: 'Security', icon: '🔒', description: 'Security policies and authentication', component: SecuritySettings },
  { id: 'billing', label: 'Billing', icon: '💰', description: 'Payment methods and invoices', component: BillingSettings },
  { id: 'integrations', label: 'Integrations', icon: '🔌', description: 'API keys and webhooks', component: IntegrationSettings },
];

const OrganisationSettingsPage = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('general');
  const { settings, loading: settingsLoading } = useSelector((state) => state.settings);
  const { branding, loading: brandingLoading } = useSelector((state) => state.branding);

  useEffect(() => {
    dispatch(fetchSettings());
    dispatch(fetchBranding());
  }, [dispatch]);

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;
  const isLoading = settingsLoading || brandingLoading;

  if (isLoading && !settings) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your organisation settings and preferences
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                group flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                ${activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <span className="ml-1 w-1.5 h-1.5 rounded-full bg-indigo-500" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Description */}
      <div className="mt-4 mb-6">
        <h2 className="text-lg font-medium text-gray-900">
          {tabs.find(tab => tab.id === activeTab)?.label}
        </h2>
        <p className="text-sm text-gray-500">
          {tabs.find(tab => tab.id === activeTab)?.description}
        </p>
      </div>

      {/* Active Tab Content */}
      <div className="bg-white rounded-lg shadow">
        {ActiveComponent && <ActiveComponent settings={settings} branding={branding} />}
      </div>
    </div>
  );
};

export default OrganisationSettingsPage;