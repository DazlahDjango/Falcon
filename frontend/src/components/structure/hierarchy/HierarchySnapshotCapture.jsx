import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCamera, FiFileText, FiTag, FiInfo, FiAlertCircle } from 'react-icons/fi';
import { useHierarchy, useStructureForm } from '../../../hooks/structure';
import { StructureForm, StructureLoading } from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './hierarchy.css';

export const HierarchySnapshotCapture = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captureResult, setCaptureResult] = useState(null);

  const { capture, isLoading, error, clearError } = useHierarchy({ autoFetch: false });

  const { values, handleChange, handleSubmit, setFieldValue, resetForm } = useStructureForm({
    initialValues: {
      name: '',
      description: '',
      version_type: 'manual',
      notes: '',
    },
    onSubmit: async (formData) => {
      setIsSubmitting(true);
      try {
        const result = await capture(formData);
        setCaptureResult(result.data || result);
        setTimeout(() => {
          navigate(STRUCTURE_ROUTES.HIERARCHY);
        }, 3000);
      } catch (err) {
        console.error('Capture failed:', err);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleCancel = useCallback(() => {
    navigate(STRUCTURE_ROUTES.HIERARCHY);
  }, [navigate]);

  const versionTypes = [
    { value: 'manual', label: 'Manual Snapshot' },
    { value: 'restructure', label: 'Reorganization' },
    { value: 'yearly', label: 'Yearly Archive' },
    { value: 'acquisition', label: 'Merger/Acquisition' },
  ];

  if (isLoading || isSubmitting) {
    return (
      <div className="hierarchy-capture-loading">
        <StructureLoading text={isSubmitting ? 'Capturing snapshot...' : 'Loading...'} />
      </div>
    );
  }

  if (captureResult) {
    return (
      <div className="hierarchy-capture-success">
        <div className="success-icon">✓</div>
        <h2>Snapshot Captured Successfully!</h2>
        <p>Hierarchy version {captureResult.version?.version_number || 'saved'} has been created.</p>
        <div className="success-details">
          <div className="detail-item">
            <span className="detail-label">Version Number</span>
            <span className="detail-value">v{captureResult.version?.version_number || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Name</span>
            <span className="detail-value">{captureResult.version?.name || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Type</span>
            <span className="detail-value">{captureResult.version?.version_type || 'manual'}</span>
          </div>
        </div>
        <button onClick={() => navigate(STRUCTURE_ROUTES.HIERARCHY)} className="btn btn-primary">
          View All Versions
        </button>
      </div>
    );
  }

  return (
    <div className="hierarchy-capture-container">
      <div className="hierarchy-capture-header">
        <button onClick={handleCancel} className="back-btn">
          <FiArrowLeft size={18} />
          Back
        </button>
        <h1>Capture Hierarchy Snapshot</h1>
      </div>

      <div className="hierarchy-capture-body">
        <div className="capture-info-banner">
          <FiInfo size={20} />
          <div>
            <strong>What is a hierarchy snapshot?</strong>
            <p>A snapshot captures the complete organizational structure at a specific point in time. This allows you to track changes, restore previous versions, and compare different states of your organization.</p>
          </div>
        </div>

        <StructureForm
          title="Snapshot Details"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        >
          <div className="form-group">
            <label htmlFor="name">
              Snapshot Name <span className="required">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g., Q4 2024 Snapshot"
              value={values.name || ''}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="version_type">
              Version Type <span className="required">*</span>
            </label>
            <select
              id="version_type"
              name="version_type"
              value={values.version_type || 'manual'}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            >
              {versionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group form-group-full">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe what this snapshot captures..."
              rows="3"
              value={values.description || ''}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group form-group-full">
            <label htmlFor="notes">Additional Notes</label>
            <textarea
              id="notes"
              name="notes"
              placeholder="Any additional notes about this snapshot..."
              rows="3"
              value={values.notes || ''}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="capture-error">
              <FiAlertCircle size={16} />
              <span>{error}</span>
              <button onClick={clearError} className="btn btn-secondary">
                Dismiss
              </button>
            </div>
          )}

          <div className="capture-warning">
            <FiAlertCircle size={16} />
            <span>This will create a new version of the entire organizational hierarchy. The current hierarchy will be preserved as a snapshot.</span>
          </div>
        </StructureForm>
      </div>
    </div>
  );
};

export default HierarchySnapshotCapture;