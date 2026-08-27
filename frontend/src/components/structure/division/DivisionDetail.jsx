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
        title="Division Not Found"
        description="The division you are looking for does not exist."
        actionLabel="Back to Divisions"
        onAction={handleBack}
      />
    );
  }

  const DetailRow = ({ label, value, children }) => {
    let displayValue = '-';
    if (children) {
      displayValue = children;
    } else if (value !== null && value !== undefined) {
      if (typeof value === 'object') {
        displayValue = value.name || value.title || value.code || JSON.stringify(value);
      } else {
        displayValue = String(value);
      }
    }
    return (
      <div className="detail-row">
        <div className="detail-label">{label}</div>
        <div className="detail-value">{displayValue}</div>
      </div>
    );
  };

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
        {/* Leader Profile & High-level Statistics Banner */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* Leader Card */}
          <div style={{
            padding: '20px',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-surface, #ffffff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '18px',
                boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
              }}>
                {currentItem.leader?.name ? currentItem.leader.name.charAt(0).toUpperCase() : 'D'}
              </div>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', tracking: '0.05em', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>
                  Division Director / Leader
                </div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
                  {currentItem.leader?.name || (currentItem.director_id ? 'Assigned Director' : 'No Director Assigned')}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary, #475569)' }}>
                  {currentItem.leader?.title || 'Division Head'} {currentItem.leader?.email ? `• ${currentItem.leader.email}` : ''}
                </div>
              </div>
            </div>
            <button
              onClick={() => { setSelectedDirectorId(currentItem.director_id || ''); setShowDirectorModal(true); }}
              className="btn btn-secondary btn-sm"
              title="Assign / Change Director"
              style={{ fontSize: '12px', whiteSpace: 'nowrap' }}
            >
              <FiUserPlus size={14} /> Change
            </button>
          </div>

          {/* Quick Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px'
          }}>
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-surface, #ffffff)',
              border: '1px solid var(--border-color, #e2e8f0)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary, #64748b)', fontWeight: 500 }}>Departments</span>
              <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--primary-color, #4f46e5)', marginTop: '4px' }}>
                {currentItem.department_count || currentItem.departments?.length || 0}
              </span>
            </div>
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-surface, #ffffff)',
              border: '1px solid var(--border-color, #e2e8f0)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary, #64748b)', fontWeight: 500 }}>Total Staff</span>
              <span style={{ fontSize: '22px', fontWeight: 700, color: '#059669', marginTop: '4px' }}>
                {currentItem.employee_count || 0}
              </span>
            </div>
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-surface, #ffffff)',
              border: '1px solid var(--border-color, #e2e8f0)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary, #64748b)', fontWeight: 500 }}>Headcount Limit</span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary, #1e293b)', marginTop: '4px' }}>
                {currentItem.headcount_limit || '∞'}
              </span>
            </div>
          </div>
        </div>

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

        <div className="detail-section" style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Departments under this Division</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary, #64748b)' }}>
                Overview of all business departments, their designated leaders, and active headcount.
              </p>
            </div>
            <button onClick={handleAddDepartment} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiPlus size={14} /> Add Department
            </button>
          </div>

          {currentItem.departments && currentItem.departments.length > 0 ? (
            <div className="departments-list-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {currentItem.departments.map((dept) => (
                <div 
                  key={dept.id} 
                  onClick={() => navigate(STRUCTURE_ROUTES.DEPARTMENT_DETAIL(dept.id))}
                  style={{
                    padding: '18px',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-surface, #ffffff)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary-color, #4f46e5)';
                    e.currentTarget.style.boxShadow = '0 6px 12px -2px rgba(79, 70, 229, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color, #e2e8f0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--primary-color, #4f46e5)', background: 'rgba(79, 70, 229, 0.08)', padding: '2px 8px', borderRadius: '4px' }}>
                        {dept.code}
                      </span>
                      <StructureStatusBadge status={dept.is_active ? 'active' : 'inactive'} size="sm" />
                    </div>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary, #1e293b)' }}>
                      {dept.name}
                    </h4>
                    <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-secondary, #64748b)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {dept.description || 'No description provided.'}
                    </p>
                  </div>

                  <div>
                    {/* Department Leader Pill */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      backgroundColor: 'rgba(241, 245, 249, 0.6)',
                      borderRadius: '6px',
                      marginBottom: '12px',
                      fontSize: '12px'
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: dept.leader?.name ? '#4f46e5' : '#94a3b8',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: '11px'
                      }}>
                        {dept.leader?.name ? dept.leader.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary, #1e293b)' }}>
                          {dept.leader?.name || 'Leader Unassigned'}
                        </span>
                        {dept.leader?.title && (
                          <span style={{ color: 'var(--text-muted, #64748b)', marginLeft: '4px' }}>
                            • {dept.leader.title}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats & Direct Action */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted, #94a3b8)', borderTop: '1px solid var(--border-color, #f1f5f9)', paddingTop: '10px' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <span>📂 <strong>{dept.section_count || 0}</strong> Sections</span>
                        <span>👥 <strong>{dept.employee_count || 0}</strong> Staff</span>
                      </div>
                      <span style={{ color: 'var(--primary-color, #4f46e5)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                        View <FiChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              padding: '32px',
              textAlign: 'center',
              backgroundColor: 'var(--bg-surface, #ffffff)',
              borderRadius: '8px',
              border: '1px dashed var(--border-color, #cbd5e1)'
            }}>
              <p style={{ color: 'var(--text-secondary, #64748b)', margin: '0 0 12px 0' }}>No departments linked to this division yet.</p>
              <button onClick={handleAddDepartment} className="btn btn-secondary btn-sm">
                <FiPlus size={14} /> Create First Department
              </button>
            </div>
          )}
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
