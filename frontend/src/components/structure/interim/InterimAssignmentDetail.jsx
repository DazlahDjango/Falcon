import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiEdit,
  FiTrash2,
  FiRefreshCw,
  FiUser,
  FiCalendar,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
} from 'react-icons/fi';
import { useInterimAssignments } from '../../../hooks/structure';
import {
  StructureLoading,
  StructureEmptyState,
  StructureStatusBadge,
  StructureConfirmDialog,
} from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './interim.css';

export const InterimAssignmentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    currentItem,
    isLoading,
    error,
    fetchById,
    remove,
    clearError,
  } = useInterimAssignments({ autoFetch: false });

  useEffect(() => {
    if (id) {
      fetchById(id);
    }
  }, [id, fetchById]);

  const handleBack = useCallback(() => {
    navigate(STRUCTURE_ROUTES.INTERIM_ASSIGNMENTS);
  }, [navigate]);

  const handleEdit = useCallback(() => {
    navigate(STRUCTURE_ROUTES.INTERIM_ASSIGNMENT_EDIT(id));
  }, [navigate, id]);

  const handleDeleteClick = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      await remove(id);
      navigate(STRUCTURE_ROUTES.INTERIM_ASSIGNMENTS);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }, [id, remove, navigate]);

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  const handleRefresh = useCallback(() => {
    if (id) {
      fetchById(id);
    }
  }, [id, fetchById]);

  if (isLoading) {
    return (
      <div className="interim-detail-loading">
        <StructureLoading text="Loading interim assignment details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="interim-detail-error">
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
        title="Interim Assignment Not Found"
        description="The interim assignment you are looking for does not exist."
        actionLabel="Back to Interim Assignments"
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
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isExpiringSoon = currentItem.days_remaining <= 7 && currentItem.days_remaining > 0;
  const isExpired = currentItem.days_remaining === 0 && currentItem.is_active;

  return (
    <div className="interim-detail-container">
      <div className="interim-detail-header">
        <div className="header-left">
          <button onClick={handleBack} className="back-btn">
            <FiArrowLeft size={18} />
            Back
          </button>
          <h1>Interim Assignment</h1>
          <StructureStatusBadge
            status={currentItem.is_active ? 'active' : 'inactive'}
            customLabel={currentItem.is_active ? 'Active' : 'Inactive'}
            size="lg"
          />
          {isExpiringSoon && !isExpired && (
            <span className="status-warning-badge">
              <FiClock size={14} />
              Expiring Soon
            </span>
          )}
          {isExpired && (
            <span className="status-expired-badge">
              <FiAlertCircle size={14} />
              Expired
            </span>
          )}
        </div>
        <div className="header-right">
          <button onClick={handleRefresh} className="btn btn-secondary" title="Refresh">
            <FiRefreshCw size={16} />
          </button>
          <button onClick={handleEdit} className="btn btn-primary">
            <FiEdit size={16} />
            Edit
          </button>
          <button onClick={handleDeleteClick} className="btn btn-danger">
            <FiTrash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      <div className="interim-detail-body">
        <div className="stats-grid">
          <StatCard
            icon={FiUser}
            label="Employee"
            value={currentItem.employee_user_id || currentItem.employee_id}
            color="primary"
          />
          <StatCard
            icon={FiUser}
            label="Interim Manager"
            value={currentItem.interim_manager_user_id || currentItem.interim_manager_id}
            color="success"
          />
          <StatCard
            icon={FiClock}
            label="Days Remaining"
            value={currentItem.days_remaining || 0}
            color={isExpiringSoon ? 'warning' : 'secondary'}
          />
          <StatCard
            icon={currentItem.is_active ? FiCheckCircle : FiAlertCircle}
            label="Status"
            value={currentItem.is_active ? 'Active' : 'Inactive'}
            color={currentItem.is_active ? 'success' : 'danger'}
          />
        </div>

        <div className="detail-section">
          <h3>Assignment Information</h3>
          <div className="detail-grid">
            <DetailRow label="Employee ID" value={currentItem.employee_id} />
            <DetailRow label="Employee User ID" value={currentItem.employee_user_id} />
            <DetailRow label="Interim Manager ID" value={currentItem.interim_manager_id} />
            <DetailRow label="Interim Manager User ID" value={currentItem.interim_manager_user_id} />
            <DetailRow label="Reporting Type" value={currentItem.reporting_type} />
            <DetailRow label="Reason" value={currentItem.reason} />
          </div>
        </div>

        <div className="detail-section">
          <h3>Timeline</h3>
          <div className="detail-grid">
            <DetailRow label="Effective From">
              <span className="date-value">{formatDate(currentItem.effective_from)}</span>
            </DetailRow>
            <DetailRow label="Effective To">
              <span className="date-value">{formatDate(currentItem.effective_to)}</span>
            </DetailRow>
            <DetailRow label="Days Remaining">
              <span className={`days-remaining-value ${isExpiringSoon ? 'urgent' : ''}`}>
                {currentItem.days_remaining || 0} days
              </span>
            </DetailRow>
            <DetailRow label="Status">
              <StructureStatusBadge
                status={currentItem.is_active ? 'active' : 'inactive'}
                customLabel={currentItem.is_active ? 'Active' : 'Inactive'}
              />
            </DetailRow>
          </div>
        </div>

        <div className="detail-section">
          <h3>Additional Information</h3>
          <div className="detail-grid">
            <DetailRow label="Notes" value={currentItem.notes} />
            <DetailRow label="Approved By" value={currentItem.approved_by_id || 'Not approved'} />
            <DetailRow label="Approved At" value={currentItem.approved_at ? new Date(currentItem.approved_at).toLocaleString() : '-'} />
            <DetailRow label="Created At" value={new Date(currentItem.created_at).toLocaleString()} />
            <DetailRow label="Updated At" value={currentItem.updated_at ? new Date(currentItem.updated_at).toLocaleString() : '-'} />
          </div>
        </div>

        {isExpiringSoon && !isExpired && (
          <div className="warning-banner">
            <FiAlertCircle size={20} />
            <span>This interim assignment is expiring in {currentItem.days_remaining} days. Please review and take action.</span>
          </div>
        )}

        {isExpired && (
          <div className="expired-banner">
            <FiAlertCircle size={20} />
            <span>This interim assignment has expired. Please review and update the reporting structure.</span>
          </div>
        )}
      </div>

      <StructureConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Interim Assignment"
        message={`Are you sure you want to delete this interim assignment? This will remove the temporary reporting relationship. This action cannot be undone.`}
        type="danger"
        confirmLabel="Delete"
      />
    </div>
  );
};

export default InterimAssignmentDetail;