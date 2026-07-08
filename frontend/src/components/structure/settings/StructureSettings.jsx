import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiSave,
  FiRefreshCw,
  FiAlertCircle,
  FiCheck,
  FiSettings,
  FiShield,
  FiDatabase,
  FiZap,
  FiRefreshCcw,
} from 'react-icons/fi';
import { useStructureSettings } from '../../../hooks/structure';
import {
  StructureLoading,
  StructureEmptyState,
  StructureStatusBadge,
  StructureConfirmDialog,
} from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './settings.css';

export const StructureSettings = () => {
  const navigate = useNavigate();
  const { settings, version, isLoading, error, fetch, update, reset, clearError } = useStructureSettings({ autoFetch: true });
  const [formValues, setFormValues] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState('hierarchy');

  useEffect(() => {
    if (settings) {
      setFormValues(settings);
    }
  }, [settings]);

  const handleChange = useCallback((section, key, value) => {
    setFormValues((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await update(formValues);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  }, [formValues, update]);

  const handleReset = useCallback(async () => {
    setShowResetConfirm(false);
    try {
      await reset();
    } catch (err) {
      console.error('Reset failed:', err);
    }
  }, [reset]);

  const handleBack = useCallback(() => {
    navigate(STRUCTURE_ROUTES.BASE);
  }, [navigate]);

  const handleRefresh = useCallback(() => {
    fetch();
  }, [fetch]);

  const sections = [
    {
      id: 'hierarchy',
      label: 'Hierarchy',
      icon: FiSettings,
      fields: [
        { key: 'max_depth', label: 'Maximum Depth', type: 'number', default: 12 },
        { key: 'allow_matrix_reporting', label: 'Allow Matrix Reporting', type: 'checkbox', default: true },
        { key: 'cycle_detection_on_save', label: 'Cycle Detection on Save', type: 'checkbox', default: true },
      ],
    },
    {
      id: 'validation',
      label: 'Validation',
      icon: FiShield,
      fields: [
        { key: 'enforce_headcount_limits', label: 'Enforce Headcount Limits', type: 'checkbox', default: true },
        { key: 'enforce_budget_caps', label: 'Enforce Budget Caps', type: 'checkbox', default: true },
        { key: 'block_delete_with_children', label: 'Block Delete with Children', type: 'checkbox', default: true },
      ],
    },
    {
      id: 'security',
      label: 'Security',
      icon: FiShield,
      fields: [
        { key: 'hierarchy_access_enforced', label: 'Hierarchy Access Enforced', type: 'checkbox', default: true },
        { key: 'sensitivity_classification_enabled', label: 'Sensitivity Classification', type: 'checkbox', default: true },
        { key: 'scope_enforcement_enabled', label: 'Scope Enforcement', type: 'checkbox', default: true },
      ],
    },
    {
      id: 'sync',
      label: 'Sync',
      icon: FiRefreshCcw,
      fields: [
        { key: 'cache_warm_on_change', label: 'Cache Warm on Change', type: 'checkbox', default: true },
        { key: 'publish_org_events', label: 'Publish Organization Events', type: 'checkbox', default: true },
      ],
    },
    {
      id: 'realtime',
      label: 'Realtime',
      icon: FiZap,
      fields: [
        { key: 'websocket_enabled', label: 'WebSocket Enabled', type: 'checkbox', default: true },
        { key: 'push_department_changes', label: 'Push Department Changes', type: 'checkbox', default: true },
        { key: 'push_team_changes', label: 'Push Team Changes', type: 'checkbox', default: true },
        { key: 'push_employment_changes', label: 'Push Employment Changes', type: 'checkbox', default: true },
        { key: 'use_channels_primary', label: 'Use Channels Primary', type: 'checkbox', default: true },
      ],
    },
  ];

  const renderField = (sectionId, field) => {
    const value = formValues[sectionId]?.[field.key] ?? field.default;

    if (field.type === 'checkbox') {
      return (
        <div className="settings-field checkbox-field" key={field.key}>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleChange(sectionId, field.key, e.target.checked)}
              disabled={isSaving}
            />
            <span>{field.label}</span>
          </label>
        </div>
      );
    }

    return (
      <div className="settings-field" key={field.key}>
        <label htmlFor={`${sectionId}_${field.key}`}>{field.label}</label>
        <input
          id={`${sectionId}_${field.key}`}
          type={field.type}
          value={value}
          onChange={(e) => handleChange(sectionId, field.key, field.type === 'number' ? parseInt(e.target.value, 10) : e.target.value)}
          disabled={isSaving}
          min={field.type === 'number' ? 1 : undefined}
        />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="settings-loading">
        <StructureLoading text="Loading structure settings..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="settings-error">
        <p>{error}</p>
        <button onClick={clearError} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <button onClick={handleBack} className="back-btn">
          <FiArrowLeft size={18} />
          Back
        </button>
        <h1>Structure Settings</h1>
        <span className="settings-version">v{version || 1}</span>
        <div className="header-actions">
          <button onClick={handleRefresh} className="btn btn-secondary" title="Refresh">
            <FiRefreshCw size={16} />
          </button>
          <button onClick={handleSave} className="btn btn-primary" disabled={isSaving}>
            {isSaving ? 'Saving...' : (
              <>
                <FiSave size={16} />
                Save Changes
              </>
            )}
          </button>
          <button onClick={() => setShowResetConfirm(true)} className="btn btn-danger">
            <FiRefreshCcw size={16} />
            Reset
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="settings-success-banner">
          <FiCheck size={20} />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <div className="settings-body">
        <div className="settings-sidebar">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                className={`sidebar-btn ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <Icon size={18} />
                {section.label}
              </button>
            );
          })}
        </div>

        <div className="settings-content">
          {sections.map((section) => (
            <div
              key={section.id}
              className={`settings-section ${activeSection === section.id ? 'active' : ''}`}
            >
              <div className="section-header">
                <h2>{section.label}</h2>
                <p>Configure {section.label.toLowerCase()} settings for the structure module.</p>
              </div>
              <div className="section-fields">
                {section.fields.map((field) => renderField(section.id, field))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <StructureConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleReset}
        title="Reset Structure Settings"
        message="Are you sure you want to reset all structure settings to their default values? This action cannot be undone."
        type="warning"
        confirmLabel="Reset"
      />
    </div>
  );
};

export default StructureSettings;