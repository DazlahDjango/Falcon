/**
 * Organisation Admin Page
 * Super admin only - manage all organisations
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrganisations } from '../../store/organisations/slice/organisationSlice';
import { OrganisationList, OrganisationApprove } from '../../components/organisations/admin';

const adminTabs = [
  { id: 'all', label: 'All Organisations', icon: '🏢', description: 'View and manage all organisations', component: OrganisationList },
  { id: 'pending', label: 'Pending Approval', icon: '⏳', description: 'Review and approve new organisations', component: OrganisationApprove },
];

const OrganisationAdminPage = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('all');
  const { organisations, loading, total } = useSelector((state) => state.organisation);
  const pendingCount = organisations?.filter(org => org.status === 'pending').length || 0;

  useEffect(() => {
    dispatch(fetchOrganisations());
  }, [dispatch]);

  const ActiveComponent = adminTabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage all organisations in the Falcon PMS platform
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total Organisations</p>
          <p className="text-2xl font-bold text-gray-900">{total || 0}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4">
          <p className="text-sm text-yellow-600">Pending Approval</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4">
          <p className="text-sm text-green-600">Active</p>
          <p className="text-2xl font-bold text-green-600">{organisations?.filter(o => o.status === 'active').length || 0}</p>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4">
          <p className="text-sm text-red-600">Suspended</p>
          <p className="text-2xl font-bold text-red-600">{organisations?.filter(o => o.status === 'suspended').length || 0}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {adminTabs.map((tab) => (
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

      {/* Active Tab Content */}
      <div className="mt-6">
        {ActiveComponent && <ActiveComponent organisations={organisations} loading={loading} />}
      </div>
    </div>
  );
};

export default OrganisationAdminPage;