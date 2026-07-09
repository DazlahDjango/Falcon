import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiEdit,
  FiTrash2,
  FiRefreshCw,
  FiChevronRight,
  FiUsers,
  FiLayers,
  FiGrid,
  FiPlus,
  FiUserPlus,
  FiGitBranch,
} from 'react-icons/fi';
import { useDepartments } from '../../../hooks/structure';
import {
  StructureLoading,
  StructureEmptyState,
  StructureStatusBadge,
  StructureConfirmDialog,
} from '../common';
import UserSelector from '../../accounts/users/UserSelector';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './department.css';

export const DepartmentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [isUpdatingManager, setIsUpdatingManager] = useState(false);

  const {
    currentItem,
    isLoading,
    error,
    fetchById,
    update,
    remove,
    clearError,
  } = useDepartments({ autoFetch: false });

  useEffect(() => {
    if (id) {
      fetchById(id);
    }
  }, [id, fetchById]);

  const handleBack = useCallback(() => {
    navigate(STRUCTURE_ROUTES.DEPARTMENTS);
  }, [navigate]);

  const handleEdit = useCallback(() => {
    navigate(STRUCTURE_ROUTES.DEPARTMENT_EDIT(id));
  }, [navigate, id]);

  const handleDeleteClick = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      await remove(id);
      navigate(STRUCTURE_ROUTES.DEPARTMENTS);
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

  const handleAddSection = useCallback(() => {
    navigate(STRUCTURE_ROUTES.SECTION_CREATE + '?department_id=' + id);
  }, [navigate, id]);

  const handleViewOrgChart = useCallback(() => {
    navigate(STRUCTURE_ROUTES.ORG_CHART_TREE + '?root_id=' + id);
  }, [navigate, id]);

  const handleViewEmployees = useCallback(() => {
    navigate(STRUCTURE_ROUTES.EMPLOYMENTS + '?department_id=' + id);
  }, [navigate, id]);

  const handleAssignManagerSubmit = useCallback(async () => {
    if (!selectedManagerId) return;
    setIsUpdatingManager(true);
    try {
      await update(id, { manager_id: selectedManagerId });
      setShowManagerModal(false);
      fetchById(id);
    } catch (err) {
      console.error('Failed to assign manager:', err);
    } finally {
      setIsUpdatingManager(false);
    }
  }, [id, selectedManagerId, update, fetchById]);

  if (isLoading) {
    return (
      <div className="department-detail-loading">
        <StructureLoading text="Loading department details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="department-detail-error">
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
        title="Department Not Found"
        description="The department you are looking for does not exist."
        actionLabel="Back to Departments"
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

  const getSensitivityColor = (level) => {
    const colors = {
      public: 'sensitivity-public',
      internal: 'sensitivity-internal',
      confidential: 'sensitivity-confidential',
      restricted: 'sensitivity-restricted',
    };
    return colors[level] || 'sensitivity-internal';
  };

  return (
    <div className="department-detail-container">
      <div className="department-detail-header">
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
          <span className={`sensitivity-badge ${getSensitivityColor(currentItem.sensitivity_level)}`}>
            {currentItem.sensitivity_level || 'internal'}
          </span>
        </div>
        <div className="header-right">
          <button onClick={handleAddSection} className="btn btn-secondary" title="Quick Add Section">
            <FiPlus size={16} />
            <span className="hidden-sm">Add Section</span>
          </button>
          <button onClick={() => { setSelectedManagerId(currentItem.manager_id || ''); setShowManagerModal(true); }} className="btn btn-secondary" title="Assign Manager">
            <FiUserPlus size={16} />
            <span className="hidden-sm">Assign Manager</span>
          </button>
          <button onClick={handleViewOrgChart} className="btn btn-secondary" title="View Org Chart">
            <FiGitBranch size={16} />
            <span className="hidden-sm">Org Chart</span>
          </button>
          <button onClick={handleViewEmployees} className="btn btn-secondary" title="View Employees">
            <FiUsers size={16} />
            <span className="hidden-sm">Employees</span>
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

      <div className="department-detail-body">
        <div className="stats-grid">
          <StatCard icon={FiGrid} label="Sections" value={currentItem.section_count || 0} />
          <StatCard icon={FiUsers} label="Employees" value={currentItem.employee_count || 0} />
          <StatCard icon={FiLayers} label="Child Count" value={currentItem.child_count || 0} />
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
            <DetailRow label="Parent Department" value={currentItem.parent_name || 'Root'} />
            <DetailRow label="Cost Center ID" value={currentItem.cost_center_id} />
            <DetailRow label="Budget Code" value={currentItem.budget_code} />
            <DetailRow label="Headcount Limit" value={currentItem.headcount_limit || 'Unlimited'} />
            <DetailRow label="Sensitivity Level" value={currentItem.sensitivity_level || 'internal'} />
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
        title="Delete Department"
        message={`Are you sure you want to delete "${currentItem.name}"? This will also remove all associated sections, units, and positions. This action cannot be undone.`}
        type="danger"
        confirmLabel="Delete"
      />

      {showManagerModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', padding: '24px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Assign Manager</h3>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label>Select Manager</label>
              <UserSelector
                value={selectedManagerId}
                onChange={setSelectedManagerId}
                disabled={isUpdatingManager}
                className="w-full"
              />
            </div>
            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setShowManagerModal(false)} 
                className="btn btn-secondary"
                disabled={isUpdatingManager}
              >
                Cancel
              </button>
              <button 
                onClick={handleAssignManagerSubmit} 
                className="btn btn-primary"
                disabled={!selectedManagerId || isUpdatingManager}
              >
                {isUpdatingManager ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentDetail;
