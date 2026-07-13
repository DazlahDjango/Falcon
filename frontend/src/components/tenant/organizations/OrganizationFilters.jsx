import React, { useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import {
  ORGANIZATION_STATUS_OPTIONS,
  SUBSCRIPTION_TIER_OPTIONS,
  SUBSCRIPTION_TIER_LABELS,
} from '../../../services/tenant';

const OrganizationFilters = ({ filters, onFilterChange, onReset, loading }) => {
  const [localFilters, setLocalFilters] = useState(filters || {});
  const statusOptions = ['', ...ORGANIZATION_STATUS_OPTIONS];
  const tierOptions = ['', ...SUBSCRIPTION_TIER_OPTIONS];

  const handleChange = (key, value) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    if (onFilterChange) onFilterChange(updated);
  };

  const handleReset = () => {
    const reset = {
      status: '',
      is_active: '',
      is_onboarded: '',
      subscription_tier: '',
      search: '',
    };
    setLocalFilters(reset);
    if (onReset) onReset();
  };

  return (
    <div className="org-card org-mb-6">
      <div className="org-flex-between org-mb-4">
        <h4 className="org-font-semibold org-text-sm" style={{ color: '#0f172a' }}>Filters</h4>
        <button className="org-btn org-btn-secondary org-btn-sm" onClick={handleReset} disabled={loading}>
          <FiX size={14} className="org-gap-2" /> Reset
        </button>
      </div>
      <div className="org-grid org-grid-cols-2 org-gap-4">
        <div>
          <label className="org-text-xs org-text-muted org-font-medium">Search</label>
          <div className="org-flex" style={{ position: 'relative' }}>
            <FiSearch size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="org-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Search by name or email..."
              value={localFilters.search || ''}
              onChange={(e) => handleChange('search', e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
        <div>
          <label className="org-text-xs org-text-muted org-font-medium">Status</label>
          <select
            className="org-select"
            value={localFilters.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
            disabled={loading}
          >
            {statusOptions.map((s) => (
              <option key={s || 'all'} value={s}>{s || 'All Status'}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="org-text-xs org-text-muted org-font-medium">Subscription Tier</label>
          <select
            className="org-select"
            value={localFilters.subscription_tier || ''}
            onChange={(e) => handleChange('subscription_tier', e.target.value)}
            disabled={loading}
          >
            {tierOptions.map((t) => (
              <option key={t || 'all'} value={t}>
                {t ? (SUBSCRIPTION_TIER_LABELS[t] || t) : 'All Tiers'}
              </option>
            ))}
          </select>
        </div>
        <div className="org-flex org-gap-4">
          <div>
            <label className="org-text-xs org-text-muted org-font-medium">Active</label>
            <select
              className="org-select"
              value={localFilters.is_active !== undefined && localFilters.is_active !== null ? String(localFilters.is_active) : ''}
              onChange={(e) => handleChange('is_active', e.target.value === '' ? null : e.target.value === 'true')}
              disabled={loading}
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div>
            <label className="org-text-xs org-text-muted org-font-medium">Onboarded</label>
            <select
              className="org-select"
              value={localFilters.is_onboarded !== undefined && localFilters.is_onboarded !== null ? String(localFilters.is_onboarded) : ''}
              onChange={(e) => handleChange('is_onboarded', e.target.value === '' ? null : e.target.value === 'true')}
              disabled={loading}
            >
              <option value="">All</option>
              <option value="true">Onboarded</option>
              <option value="false">Not Onboarded</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationFilters;
