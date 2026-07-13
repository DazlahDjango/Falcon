// pages/tenant/ResourcesPage.jsx
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiList, FiBarChart2 } from 'react-icons/fi';
import { ResourceList, ResourceUsageDashboard } from '../../components/tenant/resources';

const TABS = [
  { id: 'list',      label: 'Resource List',      icon: FiList },
  { id: 'dashboard', label: 'Usage Dashboard',    icon: FiBarChart2 },
];

const ResourcesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'list';

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  return (
    <div className="tenant-app">
      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: '4px',
        borderBottom: '2px solid #e2e8f0',
        marginBottom: '24px', paddingBottom: '0',
      }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleTabChange(id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '10px 18px',
              fontSize: '14px', fontWeight: 500,
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: activeTab === id ? '2px solid #6366f1' : '2px solid transparent',
              color: activeTab === id ? '#6366f1' : '#64748b',
              marginBottom: '-2px',
              transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'list' && <ResourceList />}
      {activeTab === 'dashboard' && <ResourceUsageDashboard />}
    </div>
  );
};

export default ResourcesPage;