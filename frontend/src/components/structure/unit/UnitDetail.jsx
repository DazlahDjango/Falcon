import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiEdit,
  FiTrash2,
  FiRefreshCw,
  FiChevronRight,
  FiUsers,
  FiUserPlus,
  FiMap,
} from 'react-icons/fi';
import { useUnits } from '../../../hooks/structure';
import {
  StructureLoading,
  StructureEmptyState,
  StructureStatusBadge,
  StructureConfirmDialog,
} from '../common';
import UserSelector from '../../accounts/users/UserSelector';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './unit.css';

export const UnitDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [isUpdatingLead, setIsUpdatingLead] = useState(false);

  const {
    currentItem,
    isLoading,
    error,
    fetchById,
    remove,
    update,
    clearError,
  } = useUnits({ autoFetch: false });

  useEffect(() => {
    if (id) {
      fetchById(id);
    }
  }, [id, fetchById]);

  const handleBack = useCallback(() => {
    navigate(STRUCTURE_ROUTES.UNITS);
  }, [navigate]);

  const handleEdit = useCallback(() => {
    navigate(STRUCTURE_ROUTES.UNIT_EDIT(id));
  }, [navigate, id]);

  const handleDeleteClick = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      await remove(id);
      navigate(STRUCTURE_ROUTES.UNITS);
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

  const handleViewEmployees = useCallback(() => {
    navigate(STRUCTURE_ROUTES.EMPLOYMENTS + '?unit_id=' + id);
  }, [navigate, id]);

  const handleAssignLeadSubmit = useCallback(async () => {
    if (!selectedLeadId) return;
    setIsUpdatingLead(true);
    try {
      await update(id, { unit_lead_id: selectedLeadId });
      setShowLeadModal(false);
      fetchById(id);
    } catch (err) {
      console.error('Failed to assign lead:', err);
    } finally {
      setIsUpdatingLead(false);
    }
  }, [id, selectedLeadId, update, fetchById]);

  const handleViewOrgChart = useCallback(() => {
    navigate(STRUCTURE_ROUTES.ORG_CHART_TREE + '?root_id=' + id);
  }, [navigate, id]);

  const handleToggleActive = useCallback(async () => {
    if (!currentItem) return;
    try {
      await update(id, { is_active: !currentItem.is_active });
      fetchById(id);
    } catch (err) {
      console.error('Failed to toggle active status:', err);
    }
  }, [id, currentItem, update, fetchById]);

  if (isLoading) {
    return (
      <div className="unit-detail-loading">
        <StructureLoading text="Loading unit details..." />
      </div>
    );
  }

  if (error) {
    const errorMessage = typeof error === 'string'
      ? error
      : (error?.displayMessage || error?.message || error?.detail || error?.error || JSON.stringify(error));
    return (
      <div className="unit-detail-error">
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
        title="Unit Not Found"
        description="The unit you are looking for does not exist."
        actionLabel="Back to Units"
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

  const StatCard = ({ icon: Icon, label, value }) => (
    <div className="stat-card">
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
    <div className="unit-detail-container">
      <div className="unit-detail-header">
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
        </div>
        <div className="header-right">
          <button onClick={() => { setSelectedLeadId(currentItem.unit_lead_id || ''); setShowLeadModal(true); }} className="btn btn-secondary" title="Assign Unit Lead">
            <FiUserPlus size={16} />
            <span className="hidden-sm">Assign Lead</span>
          </button>
          <button onClick={handleViewOrgChart} className="btn btn-secondary" title="View Org Chart">
            <FiMap size={16} />
            <span className="hidden-sm">Org Chart</span>
          </button>
          <button onClick={handleViewEmployees} className="btn btn-secondary" title="View Employees">
            <FiUsers size={16} />
            <span className="hidden-sm">Employees</span>
          </button>
          <button onClick={handleRefresh} className="btn btn-secondary" title="Refresh">
            <FiRefreshCw size={16} />
          </button>
          <button 
            onClick={handleToggleActive} 
            className={`btn ${currentItem.is_active ? 'btn-danger' : 'btn-success'}`}
          >
            {currentItem.is_active ? 'Deactivate' : 'Activate'}
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

      <div className="unit-detail-body">
        <div className="stats-grid">
          <StatCard icon={FiUsers} label="Employees" value={currentItem.employee_count || 0} />
        </div>

        <div className="detail-section">
          <h3>Basic Information</h3>
          <div className="detail-grid">
            <DetailRow label="Code" value={currentItem.code} />
            <DetailRow label="Name" value={currentItem.name} />
            <DetailRow label="Description" value={currentItem.description} />
            <DetailRow label="Depth" value={currentItem.depth || 0} />
            <DetailRow label="Path" value={currentItem.path} />
            <DetailRow label="Full Path" value={currentItem.full_path} />
          </div>
        </div>

        <div className="detail-section">
          <h3>Configuration</h3>
          <div className="detail-grid">
            <DetailRow label="Parent Unit" value={currentItem.parent_name || 'Root'} />
            <DetailRow label="Unit Lead (ID)" value={currentItem.unit_lead_id || 'None'} />
            <DetailRow label="Headcount Limit" value={currentItem.headcount_limit || 'Unlimited'} />
            <DetailRow label="Employee Count" value={currentItem.employee_count || 0} />
            <DetailRow label="Created At" value={new Date(currentItem.created_at).toLocaleDateString()} />
            <DetailRow label="Updated At" value={currentItem.updated_at ? new Date(currentItem.updated_at).toLocaleDateString() : '-'} />
            <DetailRow label="Status">
              <StructureStatusBadge status={currentItem.is_active ? 'active' : 'inactive'} />
            </DetailRow>
          </div>
        </div>

        {currentItem.parent && (
          <div className="detail-section">
            <h3>Parent Hierarchy</h3>
            <div className="breadcrumb-trail">
              <span className="breadcrumb-item">Root</span>
              <FiChevronRight size={14} />
              {currentItem.parent_name && (
                <>
                  <span className="breadcrumb-item">{currentItem.parent_name}</span>
                  <FiChevronRight size={14} />
                </>
              )}
              <span className="breadcrumb-item current">{currentItem.name}</span>
            </div>
          </div>
        )}
      </div>

      <StructureConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Unit"
        message={`Are you sure you want to delete "${currentItem.name}"? This will also remove all associated positions and employments. This action cannot be undone.`}
        type="danger"
        confirmLabel="Delete"
      />

      {showLeadModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', padding: '24px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Assign Unit Lead</h3>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label>Select Lead</label>
              <UserSelector
                value={selectedLeadId}
                onChange={setSelectedLeadId}
                disabled={isUpdatingLead}
                className="w-full"
              />
            </div>
            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setShowLeadModal(false)} 
                className="btn btn-secondary"
                disabled={isUpdatingLead}
              >
                Cancel
              </button>
              <button 
                onClick={handleAssignLeadSubmit} 
                className="btn btn-primary"
                disabled={!selectedLeadId || isUpdatingLead}
              >
                {isUpdatingLead ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitDetail;
