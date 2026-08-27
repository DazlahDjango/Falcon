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
        title="Position Not Found"
        description="The position you are looking for does not exist."
        actionLabel="Back to Positions"
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
        {/* Incumbent Profile or Vacancy Action Banner */}
        <div style={{ marginBottom: '24px' }}>
          {currentItem.occupants && currentItem.occupants.length > 0 ? (
            <div style={{
              padding: '20px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-surface, #ffffff)',
              border: '1px solid var(--border-color, #e2e8f0)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted, #64748b)', fontWeight: 600, marginBottom: '12px' }}>
                Current Assigned Incumbent ({currentItem.occupants.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {currentItem.occupants.map((occ) => (
                  <div key={occ.employment_id || occ.user_id} style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '280px' }}>
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
                      fontSize: '18px',
                      boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
                    }}>
                      {occ.name ? occ.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
                        {occ.name}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary, #475569)' }}>
                        {occ.email} • <span style={{ textTransform: 'capitalize' }}>{occ.employment_type || 'Permanent'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                        {occ.is_manager && <span style={{ fontSize: '10px', background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>Manager</span>}
                        {occ.is_team_lead && <span style={{ fontSize: '10px', background: '#ccfbf1', color: '#0f766e', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>Team Lead</span>}
                        {occ.is_executive && <span style={{ fontSize: '10px', background: '#f3e8ff', color: '#7e22ce', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>Executive</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{
              padding: '24px',
              borderRadius: '12px',
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#f59e0b',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  ⚠️
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#92400e' }}>
                    Position is Currently Vacant
                  </div>
                  <div style={{ fontSize: '13px', color: '#b45309' }}>
                    No employee is currently assigned to this role. You can assign an existing user or recruit a new incumbent.
                  </div>
                </div>
              </div>
              <button
                onClick={handleAssignEmployee}
                className="btn btn-primary"
                style={{ backgroundColor: '#d97706', borderColor: '#d97706', color: '#fff', whiteSpace: 'nowrap' }}
              >
                <FiUserPlus size={16} /> Assign User
              </button>
            </div>
          )}
        </div>

        {/* Span of Control Warning if excessive */}
        {currentItem.span_warning && (
          <div style={{
            padding: '14px 18px',
            borderRadius: '8px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px',
            fontSize: '13px'
          }}>
            <span style={{ fontSize: '18px' }}>⚠️</span>
            <div>
              <strong>High Span of Control Alert:</strong> This position has <strong>{currentItem.direct_report_count} direct reports</strong>. Standard organizational best practices recommend a span of 3 to 7 direct reports per supervisor to prevent managerial overload.
            </div>
          </div>
        )}

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
            label="Direct Reports (Span)"
            value={currentItem.direct_report_count || 0}
            color={currentItem.span_warning ? 'warning' : 'success'}
          />
        </div>

        <div className="detail-section">
          <h3>Basic Information</h3>
          <div className="detail-grid">
            <DetailRow label="Job Code" value={currentItem.job_code} />
            <DetailRow label="Title" value={currentItem.title} />
            <DetailRow label="Category" value={currentItem.category || 'Staff / Specialist'} />
            <DetailRow label="Grade" value={currentItem.grade || '-'} />
            <DetailRow label="Hierarchy Level" value={currentItem.level || '-'} />
            <DetailRow label="Department" value={currentItem.department_name || '-'} />
            <DetailRow label="Division" value={currentItem.division_name || '-'} />
            <DetailRow label="Unit" value={currentItem.unit_name || '-'} />
          </div>
        </div>

        <div className="detail-section">
          <h3>Reporting & Supervisor</h3>
          <div className="detail-grid">
            <DetailRow label="Reports To">
              {currentItem.reports_to_title ? (
                <div>
                  <span 
                    onClick={() => navigate(STRUCTURE_ROUTES.POSITION_DETAIL(currentItem.reports_to_id))}
                    style={{ cursor: 'pointer', color: 'var(--primary-color, #4f46e5)', fontWeight: 600 }}
                  >
                    {currentItem.reports_to_title} ({currentItem.reports_to_code}) →
                  </span>
                  {currentItem.reports_to_occupant_name && (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary, #64748b)', marginTop: '2px' }}>
                      👤 Current Manager: <strong>{currentItem.reports_to_occupant_name}</strong>
                    </div>
                  )}
                </div>
              ) : (
                'Top-level (Reports to CEO / Board)'
              )}
            </DetailRow>
            <DetailRow label="Minimum Tenure" value={currentItem.min_tenure_months ? `${currentItem.min_tenure_months} months` : 'None'} />
            <DetailRow label="Single Incumbent" value={currentItem.is_single_incumbent ? 'Yes' : 'No'} />
            <DetailRow label="Requires Supervisor Approval" value={currentItem.requires_supervisor_approval ? 'Yes' : 'No'} />
          </div>
        </div>

        {/* Direct Reports / Span of Control Subordinates Grid */}
        {currentItem.direct_reports && currentItem.direct_reports.length > 0 && (
          <div className="detail-section" style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px' }}>
                  Direct Reports ({currentItem.direct_reports.length})
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary, #64748b)' }}>
                  Positions directly reporting to this role (Span of Control).
                </p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {currentItem.direct_reports.map((rep) => (
                <div
                  key={rep.id}
                  onClick={() => navigate(STRUCTURE_ROUTES.POSITION_DETAIL(rep.id))}
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    backgroundColor: 'var(--bg-surface, #ffffff)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary-color, #4f46e5)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color, #e2e8f0)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--primary-color, #4f46e5)', background: 'rgba(79, 70, 229, 0.08)', padding: '2px 6px', borderRadius: '4px' }}>
                      {rep.job_code}
                    </span>
                    <StructureStatusBadge status={rep.is_vacant ? 'inactive' : 'active'} customLabel={rep.is_vacant ? 'Vacant' : 'Occupied'} size="sm" />
                  </div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary, #1e293b)' }}>
                    {rep.title}
                  </h4>
                  <div style={{ fontSize: '12px', color: rep.is_vacant ? '#d97706' : 'var(--text-secondary, #64748b)' }}>
                    👤 {rep.occupant_name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="detail-section">
          <h3>Competencies</h3>
          {currentItem.required_competencies && currentItem.required_competencies.length > 0 ? (
            <div className="competencies-list">
              {currentItem.required_competencies.map((comp, index) => (
                <span key={index} className="competency-tag">
                  {typeof comp === 'object' ? (comp.level ? `${comp.name} (${comp.level})` : comp.name) : comp}
                </span>
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
