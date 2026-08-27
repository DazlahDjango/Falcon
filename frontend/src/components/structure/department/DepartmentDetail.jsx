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
        title="Department Not Found"
        description="The department you are looking for does not exist."
        actionLabel="Back to Departments"
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
        {/* Parent Breadcrumbs Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          backgroundColor: 'rgba(79, 70, 229, 0.04)',
          border: '1px solid rgba(79, 70, 229, 0.1)',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '13px',
          color: 'var(--text-secondary, #64748b)'
        }}>
          <span 
            onClick={() => navigate(STRUCTURE_ROUTES.DIVISIONS)}
            style={{ cursor: 'pointer', color: 'var(--primary-color, #4f46e5)', fontWeight: 500 }}
          >
            Divisions
          </span>
          <FiChevronRight size={14} />
          {currentItem.division_id ? (
            <span 
              onClick={() => navigate(STRUCTURE_ROUTES.DIVISION_DETAIL(currentItem.division_id))}
              style={{ cursor: 'pointer', color: 'var(--primary-color, #4f46e5)', fontWeight: 500 }}
            >
              {currentItem.parent_name || 'Parent Division'}
            </span>
          ) : (
            <span>{currentItem.parent_name || 'Direct Division'}</span>
          )}
          <FiChevronRight size={14} />
          <span style={{ fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
            {currentItem.name}
          </span>
        </div>

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
                background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '18px',
                boxShadow: '0 4px 6px -1px rgba(2, 132, 199, 0.2)'
              }}>
                {currentItem.leader?.name ? currentItem.leader.name.charAt(0).toUpperCase() : 'M'}
              </div>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', tracking: '0.05em', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>
                  Department Head / Manager
                </div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
                  {currentItem.leader?.name || (currentItem.manager_id ? 'Assigned Manager' : 'No Manager Assigned')}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary, #475569)' }}>
                  {currentItem.leader?.title || 'Department Manager'} {currentItem.leader?.email ? `• ${currentItem.leader.email}` : ''}
                </div>
              </div>
            </div>
            <button
              onClick={() => { setSelectedManagerId(currentItem.manager_id || ''); setShowManagerModal(true); }}
              className="btn btn-secondary btn-sm"
              title="Assign / Change Manager"
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
              <span style={{ fontSize: '12px', color: 'var(--text-secondary, #64748b)', fontWeight: 500 }}>Sections</span>
              <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--primary-color, #4f46e5)', marginTop: '4px' }}>
                {currentItem.section_count || currentItem.sections?.length || 0}
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
            <DetailRow label="Division">
              {currentItem.division_id ? (
                <span 
                  onClick={() => navigate(STRUCTURE_ROUTES.DIVISION_DETAIL(currentItem.division_id))}
                  style={{ cursor: 'pointer', color: 'var(--primary-color, #4f46e5)', fontWeight: 600 }}
                >
                  {currentItem.parent_name} ({currentItem.parent_code}) →
                </span>
              ) : (
                currentItem.parent_name || '-'
              )}
            </DetailRow>
            <DetailRow label="Description" value={currentItem.description} />
            <DetailRow label="Depth" value={currentItem.depth || 0} />
            <DetailRow label="Path" value={currentItem.path} />
            <DetailRow label="Full Path" value={currentItem.full_path} />
          </div>
        </div>

        <div className="detail-section">
          <h3>Configuration</h3>
          <div className="detail-grid">
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

        <div className="detail-section" style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Sections under this Department</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary, #64748b)' }}>
                Overview of functional sections, their appointed supervisors, and operational units.
              </p>
            </div>
            <button onClick={handleAddSection} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiPlus size={14} /> Add Section
            </button>
          </div>

          {currentItem.sections && currentItem.sections.length > 0 ? (
            <div className="sections-list-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {currentItem.sections.map((sec) => (
                <div 
                  key={sec.id} 
                  onClick={() => navigate(STRUCTURE_ROUTES.SECTION_DETAIL(sec.id))}
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
                        {sec.code}
                      </span>
                      <StructureStatusBadge status={sec.is_active ? 'active' : 'inactive'} size="sm" />
                    </div>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary, #1e293b)' }}>
                      {sec.name}
                    </h4>
                    <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-secondary, #64748b)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {sec.description || 'No description provided.'}
                    </p>
                  </div>

                  <div>
                    {/* Section Leader Pill */}
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
                        backgroundColor: sec.leader?.name ? '#0284c7' : '#94a3b8',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: '11px'
                      }}>
                        {sec.leader?.name ? sec.leader.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary, #1e293b)' }}>
                          {sec.leader?.name || 'Supervisor Unassigned'}
                        </span>
                        {sec.leader?.title && (
                          <span style={{ color: 'var(--text-muted, #64748b)', marginLeft: '4px' }}>
                            • {sec.leader.title}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats & Direct Action */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted, #94a3b8)', borderTop: '1px solid var(--border-color, #f1f5f9)', paddingTop: '10px' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <span>📁 <strong>{sec.unit_count || 0}</strong> Units</span>
                        <span>👥 <strong>{sec.employee_count || 0}</strong> Staff</span>
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
              <p style={{ color: 'var(--text-secondary, #64748b)', margin: '0 0 12px 0' }}>No sections linked to this department yet.</p>
              <button onClick={handleAddSection} className="btn btn-secondary btn-sm">
                <FiPlus size={14} /> Create First Section
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
