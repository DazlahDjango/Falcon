import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiEdit, FiTrash2, FiRefreshCw, FiChevronRight, FiPlus, FiUserPlus, FiGitBranch } from 'react-icons/fi';
import { useDivisions } from '../../../hooks/structure';
import {
  StructureLoading,
  StructureEmptyState,
  StructureStatusBadge,
  StructureConfirmDialog,
} from '../common';
import UserSelector from '../../accounts/users/UserSelector';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './division.css';

export const DivisionDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDirectorModal, setShowDirectorModal] = useState(false);
  const [selectedDirectorId, setSelectedDirectorId] = useState('');
  const [isUpdatingDirector, setIsUpdatingDirector] = useState(false);

  const {
    currentItem,
    isLoading,
    error,
    fetchById,
    update,
    remove,
    clearError,
  } = useDivisions({ autoFetch: false });

  useEffect(() => {
    if (id) {
      fetchById(id);
    }
  }, [id, fetchById]);

  const handleBack = useCallback(() => {
    navigate(STRUCTURE_ROUTES.DIVISIONS);
  }, [navigate]);

  const handleEdit = useCallback(() => {
    navigate(STRUCTURE_ROUTES.DIVISION_EDIT(id));
  }, [navigate, id]);

  const handleDeleteClick = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      await remove(id);
      navigate(STRUCTURE_ROUTES.DIVISIONS);
    } catch (err) {
      console.error('Delete failed:', err);
      setShowDeleteConfirm(false);
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

  const handleAddDepartment = useCallback(() => {
    navigate(STRUCTURE_ROUTES.DEPARTMENT_CREATE + '?division_id=' + id);
  }, [navigate, id]);

  const handleViewOrgChart = useCallback(() => {
    navigate(STRUCTURE_ROUTES.ORG_CHART_TREE + '?root_id=' + id);
  }, [navigate, id]);

  const handleAssignDirectorSubmit = useCallback(async () => {
    if (!selectedDirectorId) return;
    setIsUpdatingDirector(true);
    try {
      await update(id, { director_id: selectedDirectorId });
      setShowDirectorModal(false);
      fetchById(id);
    } catch (err) {
      console.error('Failed to assign director:', err);
    } finally {
      setIsUpdatingDirector(false);
    }
  }, [id, selectedDirectorId, update, fetchById]);

  if (isLoading) {
    return (
      <div className="division-detail-loading">
        <StructureLoading text="Loading division details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="division-detail-error">
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
        title="Division Not Found"
        description="The division you are looking for does not exist."
        actionLabel="Back to Divisions"
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

  return (
    <div className="division-detail-container">
      <div className="division-detail-header">
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
          <button onClick={handleAddDepartment} className="btn btn-secondary" title="Quick Add Department">
            <FiPlus size={16} />
            <span className="hidden-sm">Add Dept</span>
          </button>
          <button onClick={() => { setSelectedDirectorId(currentItem.director_id || ''); setShowDirectorModal(true); }} className="btn btn-secondary" title="Assign Director">
            <FiUserPlus size={16} />
            <span className="hidden-sm">Assign Director</span>
          </button>
          <button onClick={handleViewOrgChart} className="btn btn-secondary" title="View Org Chart">
            <FiGitBranch size={16} />
            <span className="hidden-sm">Org Chart</span>
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

      <div className="division-detail-body">
        <div className="detail-section">
          <h3>Basic Information</h3>
          <div className="detail-grid">
            <DetailRow label="Code" value={currentItem.code} />
            <DetailRow label="Name" value={currentItem.name} />
            <DetailRow label="Level" value={currentItem.level || 'Division'} />
            <DetailRow label="Depth" value={currentItem.depth || 0} />
            <DetailRow label="Path" value={currentItem.path} />
            <DetailRow label="Description" value={currentItem.description} />
          </div>
        </div>

        <div className="detail-section">
          <h3>Configuration</h3>
          <div className="detail-grid">
            <DetailRow label="Headcount Limit" value={currentItem.headcount_limit || 'Unlimited'} />
            <DetailRow label="Created At" value={new Date(currentItem.created_at).toLocaleDateString()} />
            <DetailRow label="Updated At" value={currentItem.updated_at ? new Date(currentItem.updated_at).toLocaleDateString() : '-'} />
            <DetailRow label="Status">
              <StructureStatusBadge status={currentItem.is_active ? 'active' : 'inactive'} />
            </DetailRow>
          </div>
        </div>

        <div className="detail-section">
          <h3>Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Departments</span>
              <span className="stat-value">{currentItem.department_count || 0}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Employees</span>
              <span className="stat-value">{currentItem.employee_count || 0}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Children</span>
              <span className="stat-value">{currentItem.children_count || 0}</span>
            </div>
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
        title="Delete Division"
        message={`Are you sure you want to delete "${currentItem.name}"? This will also remove all associated departments and positions. This action cannot be undone.`}
        type="danger"
        confirmLabel="Delete"
      />

      {showDirectorModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', padding: '24px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Assign Director</h3>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label>Select Director</label>
              <UserSelector
                value={selectedDirectorId}
                onChange={setSelectedDirectorId}
                disabled={isUpdatingDirector}
                className="w-full"
              />
            </div>
            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setShowDirectorModal(false)} 
                className="btn btn-secondary"
                disabled={isUpdatingDirector}
              >
                Cancel
              </button>
              <button 
                onClick={handleAssignDirectorSubmit} 
                className="btn btn-primary"
                disabled={!selectedDirectorId || isUpdatingDirector}
              >
                {isUpdatingDirector ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DivisionDetail;
