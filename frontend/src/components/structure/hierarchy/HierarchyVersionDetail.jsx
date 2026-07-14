import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiRefreshCw,
  FiClock,
  FiGitBranch,
  FiUsers,
  FiLayers,
  FiEye,
  FiDatabase,
  FiCalendar,
} from 'react-icons/fi';
import { useHierarchy } from '../../../hooks/structure';
import {
  StructureLoading,
  StructureEmptyState,
  StructureStatusBadge,
  StructureConfirmDialog,
} from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './hierarchy.css';

export const HierarchyVersionDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  const {
    currentItem,
    isLoading,
    error,
    fetchById,
    restore,
    clearError,
  } = useHierarchy({ autoFetch: false });

  useEffect(() => {
    if (id) {
      fetchById(id);
    }
  }, [id, fetchById]);

  const handleBack = useCallback(() => {
    navigate(STRUCTURE_ROUTES.HIERARCHY);
  }, [navigate]);

  const handleRestoreClick = useCallback(() => {
    setShowRestoreConfirm(true);
  }, []);

  const handleRestoreConfirm = useCallback(async () => {
    try {
      await restore(id);
      setShowRestoreConfirm(false);
      navigate(STRUCTURE_ROUTES.HIERARCHY);
    } catch (err) {
      console.error('Restore failed:', err);
    }
  }, [id, restore, navigate]);

  const handleRestoreCancel = useCallback(() => {
    setShowRestoreConfirm(false);
  }, []);

  const handleRefresh = useCallback(() => {
    if (id) {
      fetchById(id);
    }
  }, [id, fetchById]);

  const handleDiff = useCallback(() => {
    navigate(STRUCTURE_ROUTES.HIERARCHY_DIFF(id, ':compareToId'));
  }, [navigate, id]);

  if (isLoading) {
    return (
      <div className="hierarchy-detail-loading">
        <StructureLoading text="Loading hierarchy version..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="hierarchy-detail-error">
        <p>{error}</p>
        <button onClick={clearError} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (!currentItem) {
    return (
      <StructureEmptyState
        title="Version Not Found"
        description="The hierarchy version you are looking for does not exist."
        actionLabel="Back to Hierarchy"
        onAction={handleBack}
      />
    );
  }

  const DetailRow = ({ label, value, children }) => (
    <div className="detail-row">
      <div className="detail-label">{label}</div>
      <div className="detail-value">{children || value || '-'}</div>
    </div>
  );

  const StatCard = ({ icon: Icon, label, value, color = 'primary' }) => (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-icon">
        <Icon size={20} />
      </div>
      <div>
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
      </div>
    </div>
  );

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const snapshotPreview = currentItem.snapshot_preview || {};
  const changesSummary = currentItem.changes_summary_preview || {};

  return (
    <div className="hierarchy-detail-container">
      <div className="hierarchy-detail-header">
        <div className="header-left">
          <button onClick={handleBack} className="back-btn">
            <FiArrowLeft size={18} />
            Back
          </button>
          <h1>Version {currentItem.version_number}</h1>
          <StructureStatusBadge
            status={currentItem.is_current ? 'active' : 'inactive'}
            customLabel={currentItem.is_current ? 'Current' : 'Archived'}
            size="lg"
          />
          <span className={`version-type-badge type-${currentItem.version_type}`}>
            {currentItem.version_type || 'manual'}
          </span>
        </div>
        <div className="header-right">
          <button onClick={handleRefresh} className="btn btn-secondary" title="Refresh">
            <FiRefreshCw size={16} />
          </button>
          {!currentItem.is_current && (
            <button onClick={handleRestoreClick} className="btn btn-warning">
              <FiDatabase size={16} />
              Restore
            </button>
          )}
          <button onClick={handleDiff} className="btn btn-secondary">
            <FiGitBranch size={16} />
            Compare
          </button>
        </div>
      </div>

      <div className="hierarchy-detail-body">
        <div className="stats-grid">
          <StatCard
            icon={FiClock}
            label="Version Number"
            value={`v${currentItem.version_number}`}
            color="primary"
          />
          <StatCard
            icon={FiCalendar}
            label="Effective From"
            value={formatDate(currentItem.effective_from)}
            color="secondary"
          />
          <StatCard
            icon={FiDatabase}
            label="Snapshot Hash"
            value={currentItem.snapshot_hash ? currentItem.snapshot_hash.substring(0, 8) + '...' : 'N/A'}
            color="info"
          />
          <StatCard
            icon={FiUsers}
            label="Departments Count"
            value={snapshotPreview.departments_count || 0}
            color="success"
          />
        </div>

        <div className="detail-section">
          <h3>Basic Information</h3>
          <div className="detail-grid">
            <DetailRow label="Version Number" value={`v${currentItem.version_number}`} />
            <DetailRow label="Name" value={currentItem.name} />
            <DetailRow label="Description" value={currentItem.description} />
            <DetailRow label="Version Type" value={currentItem.version_type || 'manual'} />
            <DetailRow label="Snapshot Hash" value={currentItem.snapshot_hash || 'N/A'} />
          </div>
        </div>

        <div className="detail-section">
          <h3>Timeline</h3>
          <div className="detail-grid">
            <DetailRow label="Effective From" value={formatDate(currentItem.effective_from)} />
            <DetailRow label="Effective To" value={currentItem.effective_to ? formatDate(currentItem.effective_to) : 'Current'} />
            <DetailRow label="Status">
              <StructureStatusBadge
                status={currentItem.is_current ? 'active' : 'inactive'}
                customLabel={currentItem.is_current ? 'Current' : 'Archived'}
              />
            </DetailRow>
          </div>
        </div>

        <div className="detail-section">
          <h3>Changes Summary</h3>
          {changesSummary.summary ? (
            <div className="changes-grid">
              <div className="change-item">
                <span className="change-label">Summary</span>
                <span className="change-value">{changesSummary.summary}</span>
              </div>
              <div className="change-item">
                <span className="change-label">Change Count</span>
                <span className="change-value">{changesSummary.change_count || 0}</span>
              </div>
              <div className="change-item">
                <span className="change-label">Divisions Added</span>
                <span className="change-value">{changesSummary.divisions_added || 0}</span>
              </div>
              <div className="change-item">
                <span className="change-label">Divisions Removed</span>
                <span className="change-value">{changesSummary.divisions_removed || 0}</span>
              </div>
            </div>
          ) : (
            <p className="no-changes">No changes recorded for this version</p>
          )}
        </div>

        <div className="detail-section">
          <h3>Approval & Audit</h3>
          <div className="detail-grid">
            <DetailRow label="Approved By" value={currentItem.approved_by_id || 'Not approved'} />
            <DetailRow label="Approved At" value={currentItem.approved_at ? formatDate(currentItem.approved_at) : '-'} />
            <DetailRow label="Approved Notes" value={currentItem.approved_notes} />
            <DetailRow label="Created By" value={currentItem.created_by || 'System'} />
            <DetailRow label="Created At" value={formatDate(currentItem.created_at)} />
          </div>
        </div>
      </div>

      <StructureConfirmDialog
        isOpen={showRestoreConfirm}
        onClose={handleRestoreCancel}
        onConfirm={handleRestoreConfirm}
        title="Restore Hierarchy Version"
        message={`Are you sure you want to restore version ${currentItem.version_number}? This will replace the current hierarchy with this snapshot. This action cannot be undone.`}
        type="warning"
        confirmLabel="Restore"
      />
    </div>
  );
};

export default HierarchyVersionDetail;
