/**
 * Organisation Reports Page
 * Generate and view various reports
 */

import React, { useState } from 'react';
import { KPIReport, UserActivityReport } from '../../components/organisations/reports';

const reportTabs = [
  { id: 'kpi', label: 'KPI Report', icon: '📊', description: 'KPI performance and trends', component: KPIReport },
  { id: 'users', label: 'User Activity', icon: '👥', description: 'User engagement and activity', component: UserActivityReport },
];

const OrganisationReportsPage = () => {
  const [activeTab, setActiveTab] = useState('kpi');
  const [dateRange, setDateRange] = useState('30');

  const ActiveComponent = reportTabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Analyze performance and activity across your organisation
        </p>
      </div>

      {/* Date Range Selector */}
      <div className="mb-6 flex justify-end">
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {reportTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                group flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Description */}
      <div className="mt-4 mb-6">
        <p className="text-sm text-gray-500">
          {reportTabs.find(tab => tab.id === activeTab)?.description}
        </p>
      </div>

      {/* Active Tab Content */}
      {ActiveComponent && <ActiveComponent dateRange={dateRange} />}
    </div>
  );
};

export default OrganisationReportsPage;