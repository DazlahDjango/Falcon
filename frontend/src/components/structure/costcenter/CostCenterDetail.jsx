import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiEdit,
  FiTrash2,
  FiRefreshCw,
  FiDollarSign,
  FiPercent,
  FiCalendar,
  FiUsers,
  FiPieChart,
  FiActivity,
} from 'react-icons/fi';
import { useCostCenters } from '../../../hooks/structure';
import {
  StructureLoading,
  StructureEmptyState,
  StructureStatusBadge,
  StructureConfirmDialog,
} from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './costcenter.css';

export const CostCenterDetail = () => {
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
  } = useCostCenters({ autoFetch: false });

  useEffect(() => {
    if (id) {
      fetchById(id);
    }
  }, [id, fetchById]);

  const handleBack = useCallback(() => {
    navigate(STRUCTURE_ROUTES.COST_CENTERS);
  }, [navigate]);

  const handleEdit = useCallback(() => {
    navigate(STRUCTURE_ROUTES.COST_CENTER_EDIT(id));
  }, [navigate, id]);

  const handleViewUtilization = useCallback(() => {
    navigate(STRUCTURE_ROUTES.COST_CENTER_UTILIZATION(id));
  }, [navigate, id]);

  const handleDeleteClick = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      await remove(id);
      navigate(STRUCTURE_ROUTES.COST_CENTERS);
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
      <div className="costcenter-detail-loading">
        <StructureLoading text="Loading cost center details..." />
      </div>
    );
  }

  if (error) {
    const errorMessage = typeof error === 'string'
      ? error
      : (error?.displayMessage || error?.message || error?.detail || error?.error || JSON.stringify(error));
    return (
      <div className="costcenter-detail-error">
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
        title="Cost Center Not Found"
        description="The cost center you are looking for does not exist."
        actionLabel="Back to Cost Centers"
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

  const StatCard = ({ icon: Icon, label, value, color = 'primary', suffix = '' }) => (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-icon">
        <Icon size={20} />
      </div>
      <div>
        <span className="stat-label">{label}</span>
        <span className="stat-value">
          {typeof value === 'number' && label.includes('Budget')
            ? `$${value.toLocaleString()}`
            : value}
          {suffix}
        </span>
      </div>
    </div>
  );

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return `$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="costcenter-detail-container">
      <div className="costcenter-detail-header">
        <div className="header-left">
          <button onClick={handleBack} className="back-btn">
            <FiArrowLeft size={18} />
            Back
          </button>
          <h1>{currentItem.name}</h1>
          <StructureStatusBadge
            status={currentItem.is_active ? 'active' : 'inactive'}
            size="lg"
          />
          {currentItem.is_shared && (
            <span className="shared-badge">Shared</span>
          )}
          <span className={`category-badge category-${currentItem.category}`}>
            {currentItem.category || 'operational'}
          </span>
        </div>
        <div className="header-right">
          <button onClick={handleViewUtilization} className="btn btn-secondary" title="View Utilization">
            <FiActivity size={16} />
            <span className="hidden-sm">Utilization</span>
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

      <div className="costcenter-detail-body">
        <div className="stats-grid">
          <StatCard
            icon={FiDollarSign}
            label="Budget Amount"
            value={currentItem.budget_amount ? formatCurrency(currentItem.budget_amount) : 'Not Set'}
            color="primary"
          />
          <StatCard
            icon={FiPercent}
            label="Allocation"
            value={currentItem.allocation_percentage || 0}
            color="success"
            suffix="%"
          />
          <StatCard
            icon={FiCalendar}
            label="Fiscal Year"
            value={currentItem.fiscal_year || '-'}
            color="secondary"
          />
          <StatCard
            icon={FiPieChart}
            label="Remaining Budget"
            value={currentItem.remaining_budget !== null && currentItem.remaining_budget !== undefined
              ? formatCurrency(currentItem.remaining_budget)
              : 'N/A'}
            color={currentItem.remaining_budget > 0 ? 'success' : 'warning'}
          />
        </div>

        <div className="detail-section">
          <h3>Basic Information</h3>
          <div className="detail-grid">
            <DetailRow label="Code" value={currentItem.code} />
            <DetailRow label="Name" value={currentItem.name} />
            <DetailRow label="Description" value={currentItem.description} />
            <DetailRow label="Category" value={currentItem.category || 'operational'} />
            <DetailRow label="Fiscal Year" value={currentItem.fiscal_year} />
            <DetailRow label="Allocation Percentage" value={currentItem.allocation_percentage ? `${currentItem.allocation_percentage}%` : '-'} />
          </div>
        </div>

        <div className="detail-section">
          <h3>Financial Information</h3>
          <div className="detail-grid">
            <DetailRow label="Budget Amount" value={formatCurrency(currentItem.budget_amount)} />
            <DetailRow label="Remaining Budget" value={currentItem.remaining_budget !== null && currentItem.remaining_budget !== undefined ? formatCurrency(currentItem.remaining_budget) : 'N/A'} />
            <DetailRow label="Requires Budget Approval">
              <StructureStatusBadge
                status={currentItem.requires_budget_approval ? 'active' : 'inactive'}
                customLabel={currentItem.requires_budget_approval ? 'Yes' : 'No'}
              />
            </DetailRow>
          </div>
        </div>

        <div className="detail-section">
          <h3>Organizational Context</h3>
          <div className="detail-grid">
            <DetailRow label="Organizational Unit" value={currentItem.organizational_unit_name || 'Not Assigned'} />
            <DetailRow label="Shared Service">
              <StructureStatusBadge
                status={currentItem.is_shared ? 'active' : 'inactive'}
                customLabel={currentItem.is_shared ? 'Yes' : 'No'}
              />
            </DetailRow>
            <DetailRow label="Status">
              <StructureStatusBadge
                status={currentItem.is_active ? 'active' : 'inactive'}
              />
            </DetailRow>
          </div>
        </div>

        <div className="detail-section">
          <h3>Approval Configuration</h3>
          <div className="detail-grid">
            <DetailRow label="Authorized Approvers" value={currentItem.authorized_approver_ids?.length > 0 ? currentItem.authorized_approver_ids.join(', ') : 'None'} />
            <DetailRow label="Requires Budget Approval" value={currentItem.requires_budget_approval ? 'Yes' : 'No'} />
          </div>
        </div>

        <div className="detail-section">
          <h3>Audit Information</h3>
          <div className="detail-grid">
            <DetailRow label="Created At" value={new Date(currentItem.created_at).toLocaleString()} />
            <DetailRow label="Updated At" value={currentItem.updated_at ? new Date(currentItem.updated_at).toLocaleString() : '-'} />
          </div>
        </div>
      </div>

      <StructureConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Cost Center"
        message={`Are you sure you want to delete "${currentItem.name}"? This will remove the cost center and all associated financial data. This action cannot be undone.`}
        type="danger"
        confirmLabel="Delete"
      />
    </div>
  );
};

export default CostCenterDetail;
