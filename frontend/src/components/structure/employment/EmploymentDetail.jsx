import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiEdit,
  FiTrash2,
  FiRefreshCw,
  FiUser,
  FiBriefcase,
  FiCalendar,
  FiUsers,
  FiAward,
  FiGitBranch,
  FiRepeat,
} from 'react-icons/fi';
import { useEmployments } from '../../../hooks/structure';
import {
  StructureLoading,
  StructureEmptyState,
  StructureStatusBadge,
  StructureConfirmDialog,
} from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './employment.css';

export const EmploymentDetail = () => {
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
  } = useEmployments({ autoFetch: false });

  useEffect(() => {
    if (id) {
      fetchById(id);
    }
  }, [id, fetchById]);

  const handleBack = useCallback(() => {
    navigate(STRUCTURE_ROUTES.EMPLOYMENTS);
  }, [navigate]);

  const handleEdit = useCallback(() => {
    navigate(STRUCTURE_ROUTES.EMPLOYMENT_EDIT(id));
  }, [navigate, id]);

  const handleTransfer = useCallback(() => {
    navigate(STRUCTURE_ROUTES.EMPLOYMENT_TRANSFER + '?employment_id=' + id);
  }, [navigate, id]);

  const handleViewChain = useCallback(() => {
    if (currentItem && currentItem.user_id) {
      navigate(STRUCTURE_ROUTES.REPORTING_CHAIN(currentItem.user_id));
    }
  }, [navigate, currentItem]);

  const handleDeleteClick = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      await remove(id);
      navigate(STRUCTURE_ROUTES.EMPLOYMENTS);
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
      <div className="employment-detail-loading">
        <StructureLoading text="Loading employment details..." />
      </div>
    );
  }

  if (error) {
    const errorMessage = typeof error === 'string'
      ? error
      : (error?.displayMessage || error?.message || error?.detail || error?.error || JSON.stringify(error));
    return (
      <div className="employment-detail-error">
        <p>{errorMessage}</p>
        <button onClick={clearError} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (!currentItem) {
    return (
      <StructureEmptyState
        title="Employment Not Found"
        description="The employment record you are looking for does not exist."
        actionLabel="Back to Employments"
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

  return (
    <div className="employment-detail-container">
      <div className="employment-detail-header">
        <div className="header-left">
          <button onClick={handleBack} className="back-btn">
            <FiArrowLeft size={18} />
            Back
          </button>
          <h1>{currentItem.user_name || currentItem.user_id}</h1>
          <StructureStatusBadge
            status={currentItem.is_current ? 'active' : 'inactive'}
            customLabel={currentItem.is_current ? 'Current' : 'Inactive'}
            size="lg"
          />
          <span className={`employment-type-badge type-${currentItem.employment_type}`}>
            {currentItem.employment_type}
          </span>
        </div>
        <div className="header-right">
          {currentItem && currentItem.user_id && (
            <button onClick={handleViewChain} className="btn btn-secondary" title="View Reporting Chain">
              <FiGitBranch size={16} />
              <span className="hidden-sm">View Chain</span>
            </button>
          )}
          <button onClick={handleTransfer} className="btn btn-secondary" title="Transfer Employee">
            <FiRepeat size={16} />
            <span className="hidden-sm">Transfer</span>
          </button>
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

      <div className="employment-detail-body">
        <div className="stats-grid">
          <StatCard
            icon={FiUser}
            label="Employee"
            value={currentItem.user_name || currentItem.user_id}
            color="primary"
          />
          <StatCard
            icon={FiBriefcase}
            label="Position"
            value={currentItem.position_title || 'N/A'}
            color="success"
          />
          <StatCard
            icon={FiUsers}
            label="Department"
            value={currentItem.department_name || 'N/A'}
            color="secondary"
          />
          <StatCard
            icon={FiAward}
            label="Type"
            value={currentItem.employment_type}
            color="warning"
          />
        </div>

        <div className="detail-section">
          <h3>Employment Information</h3>
          <div className="detail-grid">
            <DetailRow label="Employee Name" value={currentItem.user_name} />
            <DetailRow label="Employee Email" value={currentItem.user_email} />
            <DetailRow label="Position" value={currentItem.position_title || currentItem.position_id} />
            <DetailRow label="Department" value={currentItem.department_name || currentItem.department_id || 'N/A'} />
            <DetailRow label="Unit" value={currentItem.unit_name || currentItem.unit_id || 'N/A'} />
            <DetailRow label="Employment Type" value={currentItem.employment_type} />
            <DetailRow label="User ID" value={currentItem.user_id} />
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
            <DetailRow label="Status">
              <StructureStatusBadge
                status={currentItem.is_current ? 'active' : 'inactive'}
                customLabel={currentItem.is_current ? 'Current' : 'Inactive'}
              />
            </DetailRow>
          </div>
        </div>

        <div className="detail-section">
          <h3>Role & Responsibilities</h3>
          <div className="detail-grid">
            <DetailRow label="Is Manager">
              <StructureStatusBadge
                status={currentItem.is_manager ? 'active' : 'inactive'}
                customLabel={currentItem.is_manager ? 'Yes' : 'No'}
              />
            </DetailRow>
            <DetailRow label="Is Executive">
              <StructureStatusBadge
                status={currentItem.is_executive ? 'active' : 'inactive'}
                customLabel={currentItem.is_executive ? 'Yes' : 'No'}
              />
            </DetailRow>
            <DetailRow label="Is Board Member">
              <StructureStatusBadge
                status={currentItem.is_board_member ? 'active' : 'inactive'}
                customLabel={currentItem.is_board_member ? 'Yes' : 'No'}
              />
            </DetailRow>
          </div>
        </div>

        <div className="detail-section">
          <h3>Additional Information</h3>
          <div className="detail-grid">
            <DetailRow label="Change Reason" value={currentItem.change_reason} />
            <DetailRow label="Created At" value={new Date(currentItem.created_at).toLocaleString()} />
            <DetailRow label="Updated At" value={currentItem.updated_at ? new Date(currentItem.updated_at).toLocaleString() : '-'} />
          </div>
        </div>
      </div>

      <StructureConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Employment"
        message={`Are you sure you want to delete this employment for "${currentItem.user_name}"? This action cannot be undone.`}
        type="danger"
        confirmLabel="Delete"
      />
    </div>
  );
};

export default EmploymentDetail;
