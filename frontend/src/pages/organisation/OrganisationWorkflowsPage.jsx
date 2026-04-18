/**
 * Organisation Workflows Page
 * Manage approval requests and history
 */

import React, { useState } from 'react';
import { ApprovalRequests, ApprovalHistory } from '../../components/Organisation/workflows';

const workflowTabs = [
  { id: 'pending', label: 'Pending Approvals', icon: '⏳', description: 'Requests awaiting your review', component: ApprovalRequests },
  { id: 'history', label: 'History', icon: '📋', description: 'Past approval decisions', component: ApprovalHistory },
];

const OrganisationWorkflowsPage = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingCount, setPendingCount] = useState(0);

  const ActiveComponent = workflowTabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and manage approval requests
        </p>
      </div>

      {/* Stats Card */}
      {activeTab === 'pending' && pendingCount > 0 && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-lg">⏳</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You have <strong>{pendingCount}</strong> pending approval request(s) awaiting your review.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {workflowTabs.map((tab) => (
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
              {tab.id === 'pending' && pendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Description */}
      <div className="mt-4 mb-6">
        <p className="text-sm text-gray-500">
          {workflowTabs.find(tab => tab.id === activeTab)?.description}
        </p>
      </div>

      {/* Active Tab Content */}
      {ActiveComponent && <ActiveComponent onPendingCountChange={setPendingCount} />}
    </div>
  );
};

export default OrganisationWorkflowsPage;