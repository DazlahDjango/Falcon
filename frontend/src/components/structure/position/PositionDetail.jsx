import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiEdit,
  FiTrash2,
  FiRefreshCw,
  FiUsers,
  FiChevronRight,
  FiBriefcase,
  FiUserPlus,
  FiGitBranch,
} from 'react-icons/fi';
import { usePositions } from '../../../hooks/structure';
import {
  StructureLoading,
  StructureEmptyState,
  StructureStatusBadge,
  StructureConfirmDialog,
} from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './position.css';

export const PositionDetail = () => {
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
  } = usePositions({ autoFetch: false });

  useEffect(() => {
    if (id) {
      fetchById(id);
    }
  }, [id, fetchById]);

  const handleBack = useCallback(() => {
    navigate(STRUCTURE_ROUTES.POSITIONS);
  }, [navigate]);

  const handleEdit = useCallback(() => {
    navigate(STRUCTURE_ROUTES.POSITION_EDIT(id));
  }, [navigate, id]);

  const handleAssignEmployee = useCallback(() => {
    navigate(STRUCTURE_ROUTES.EMPLOYMENT_CREATE + '?position_id=' + id);
  }, [navigate, id]);

  const handleViewChain = useCallback(() => {
    navigate(STRUCTURE_ROUTES.POSITION_REPORTING_CHAIN(id));
  }, [navigate, id]);

  const handleDeleteClick = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      await remove(id);
      navigate(STRUCTURE_ROUTES.POSITIONS);
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
      <div className="position-detail-loading">
        <StructureLoading text="Loading position details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="position-detail-error">
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
        title="Position Not Found"
        description="The position you are looking for does not exist."
        actionLabel="Back to Positions"
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

  return (
    <div className="position-detail-container">
      <div className="position-detail-header">
        <div className="header-left">
          <button onClick={handleBack} className="back-btn">
            <FiArrowLeft size={18} />
            Back
          </button>
          <h1>{currentItem.title}</h1>
          <StructureStatusBadge
            status={currentItem.is_vacant ? 'inactive' : 'active'}
            customLabel={currentItem.is_vacant ? 'Vacant' : 'Occupied'}
            size="lg"
          />
          {currentItem.is_single_incumbent && (
            <span className="single-incumbent-badge">Single Incumbent</span>
          )}
        </div>
        <div className="header-right">
          <button onClick={handleAssignEmployee} className="btn btn-secondary" title="Assign Employee">
            <FiUserPlus size={16} />
            <span className="hidden-sm">Assign Employee</span>
          </button>
          <button onClick={handleViewChain} className="btn btn-secondary" title="View Reporting Chain">
            <FiGitBranch size={16} />
            <span className="hidden-sm">View Chain</span>
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

      <div className="position-detail-body">
        <div className="stats-grid">
          <StatCard
            icon={FiUsers}
            label="Current Incumbents"
            value={currentItem.current_incumbents_count || 0}
            color={currentItem.current_incumbents_count === 0 ? 'warning' : 'primary'}
          />
          <StatCard
            icon={FiUsers}
            label="Max Incumbents"
            value={currentItem.max_incumbents || 'Unlimited'}
            color="secondary"
          />
          <StatCard
            icon={FiBriefcase}
            label="Direct Reports"
            value={currentItem.direct_report_count || 0}
            color="success"
          />
        </div>

        <div className="detail-section">
          <h3>Basic Information</h3>
          <div className="detail-grid">
            <DetailRow label="Job Code" value={currentItem.job_code} />
            <DetailRow label="Title" value={currentItem.title} />
            <DetailRow label="Grade" value={currentItem.grade} />
            <DetailRow label="Level" value={currentItem.level} />
          </div>
        </div>

        <div className="detail-section">
          <h3>Reporting & Configuration</h3>
          <div className="detail-grid">
            <DetailRow label="Reports To" value={currentItem.reports_to_title || 'None'}>
              {currentItem.reports_to_title && (
                <span className="reports-to-link">
                  {currentItem.reports_to_title} ({currentItem.reports_to_code})
                </span>
              )}
            </DetailRow>
            <DetailRow label="Minimum Tenure" value={currentItem.min_tenure_months ? `${currentItem.min_tenure_months} months` : 'None'} />
            <DetailRow label="Single Incumbent" value={currentItem.is_single_incumbent ? 'Yes' : 'No'} />
            <DetailRow label="Requires Supervisor Approval" value={currentItem.requires_supervisor_approval ? 'Yes' : 'No'} />
          </div>
        </div>

        <div className="detail-section">
          <h3>Competencies</h3>
          {currentItem.required_competencies && currentItem.required_competencies.length > 0 ? (
            <div className="competencies-list">
              {currentItem.required_competencies.map((comp, index) => (
                <span key={index} className="competency-tag">{comp}</span>
              ))}
            </div>
          ) : (
            <p className="no-competencies">No required competencies defined</p>
          )}
        </div>

        <div className="detail-section">
          <h3>Status & Audit</h3>
          <div className="detail-grid">
            <DetailRow label="Status">
              <StructureStatusBadge
                status={currentItem.is_active ? 'active' : 'inactive'}
                customLabel={currentItem.is_active ? 'Active' : 'Inactive'}
              />
            </DetailRow>
            <DetailRow label="Vacant" value={currentItem.is_vacant ? 'Yes' : 'No'} />
            <DetailRow label="Created At" value={new Date(currentItem.created_at).toLocaleDateString()} />
            <DetailRow label="Updated At" value={currentItem.updated_at ? new Date(currentItem.updated_at).toLocaleDateString() : '-'} />
          </div>
        </div>

        {currentItem.reports_to && (
          <div className="detail-section">
            <h3>Reporting Hierarchy</h3>
            <div className="breadcrumb-trail">
              <span className="breadcrumb-item">Root</span>
              <FiChevronRight size={14} />
              {currentItem.reports_to_title && (
                <>
                  <span className="breadcrumb-item">{currentItem.reports_to_title}</span>
                  <FiChevronRight size={14} />
                </>
              )}
              <span className="breadcrumb-item current">{currentItem.title}</span>
            </div>
          </div>
        )}
      </div>

      <StructureConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Position"
        message={`Are you sure you want to delete "${currentItem.title}"? This will remove the position and all associated employments. This action cannot be undone.`}
        type="danger"
        confirmLabel="Delete"
      />
    </div>
  );
};

export default PositionDetail;
