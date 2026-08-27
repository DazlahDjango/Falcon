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
  FiGitBranch,
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

  const handleViewEmployeeChain = useCallback(() => {
    if (currentItem?.employee_user_id) {
      navigate(STRUCTURE_ROUTES.REPORTING_CHAIN(currentItem.employee_user_id));
    }
  }, [navigate, currentItem]);

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
        <p>{typeof error === 'object' ? (error?.message || error?.detail || JSON.stringify(error)) : String(error || '')}</p>
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
          {currentItem && currentItem.employee_user_id && (
            <button onClick={handleViewEmployeeChain} className="btn btn-secondary" title="View Employee Reporting Chain">
              <FiGitBranch size={16} />
              <span className="hidden-sm">View Employee Chain</span>
            </button>
          )}
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
        {/* Profile Banners for Covered Employee and Interim Manager */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {/* Covered Employee Card */}
          <div style={{
            padding: '20px',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-surface, #ffffff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              {currentItem.employee_name ? currentItem.employee_name.charAt(0).toUpperCase() : 'E'}
            </div>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>
                Covered Employee
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
                {currentItem.employee_name || currentItem.employee_user_id}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary, #475569)' }}>
                {currentItem.employee_position || 'Staff'}
              </div>
            </div>
          </div>

          {/* Acting Manager Card */}
          <div style={{
            padding: '20px',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-surface, #ffffff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              {currentItem.interim_manager_name ? currentItem.interim_manager_name.charAt(0).toUpperCase() : 'M'}
            </div>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>
                Acting / Interim Manager
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
                {currentItem.interim_manager_name || currentItem.interim_manager_user_id}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary, #475569)' }}>
                {currentItem.interim_manager_position || 'Manager'}
              </div>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <StatCard
            icon={FiUser}
            label="Covered Employee"
            value={currentItem.employee_name || 'Assigned'}
            color="primary"
          />
          <StatCard
            icon={FiUser}
            label="Interim Manager"
            value={currentItem.interim_manager_name || 'Assigned'}
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
            <DetailRow label="Employee Name" value={currentItem.employee_name || '-'} />
            <DetailRow label="Employee Position" value={currentItem.employee_position || '-'} />
            <DetailRow label="Interim Manager" value={currentItem.interim_manager_name || '-'} />
            <DetailRow label="Manager Position" value={currentItem.interim_manager_position || '-'} />
            <DetailRow label="Reporting Type" value={currentItem.reporting_type_display || currentItem.reporting_type || 'Interim'} />
            <DetailRow label="Reason" value={currentItem.reason || 'Not specified'} />
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
