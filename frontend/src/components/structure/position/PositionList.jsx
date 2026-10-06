import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiRefreshCw, FiUsers, FiBriefcase, FiLayers, FiGlobe } from 'react-icons/fi';
import { usePositions, useStructurePermissions } from '../../../hooks/structure';
import useAppAuth from '../../../hooks/dashboard/useAppAuth';
import { employmentService } from '../../../services/structure/employment.service';
import {
  StructureTable,
  StructureFilters,
  StructurePagination,
  StructureStatusBadge,
  StructureLoading,
  StructureEmptyState,
  StructureConfirmDialog,
  StructureSummaryCards,
} from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import { STRUCTURE_MESSAGES } from '../../../config/constants/structureConstants';
import './position.css';

const COLUMNS = [
  { key: 'job_code', header: 'Job Code', width: '130px', render: (item) => (
    <span style={{ fontWeight: 600, color: 'var(--primary-color, #4f46e5)', background: 'rgba(79, 70, 229, 0.08)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>
      {item.job_code}
    </span>
  )},
  { key: 'title', header: 'Position Title', width: '220px', render: (item) => (
    <div>
      <div style={{ fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>{item.title}</div>
      {item.category && (
        <span style={{ 
          fontSize: '11px', 
          fontWeight: 500,
          color: item.category === 'Executive' ? '#7c3aed' : item.category === 'Manager / Supervisor' ? '#0284c7' : item.category === 'Team Lead' ? '#0d9488' : '#64748b'
        }}>
          {item.category}
        </span>
      )}
    </div>
  )},
  {
    key: 'occupants',
    header: 'Assigned Occupant',
    width: '200px',
    render: (item) => {
      const occupant = item.primary_occupant || (item.occupants && item.occupants[0]);
      if (occupant) {
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: '#4f46e5',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '11px',
              flexShrink: 0
            }}>
              {occupant.name ? occupant.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <div style={{ fontWeight: 500, fontSize: '13px', color: 'var(--text-primary, #1e293b)' }}>{occupant.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>{occupant.email}</div>
            </div>
          </div>
        );
      }
      return (
        <span style={{ color: '#d97706', backgroundColor: '#fef3c7', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          ⚠️ Vacant
        </span>
      );
    }
  },
  {
    key: 'reports_to',
    header: 'Reports To',
    width: '180px',
    render: (item) => {
      if (item.reports_to_title) {
        return (
          <div>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary, #1e293b)' }}>{item.reports_to_title}</div>
            {item.reports_to_occupant_name && (
              <div style={{ fontSize: '11px', color: 'var(--text-secondary, #64748b)' }}>👤 {item.reports_to_occupant_name}</div>
            )}
          </div>
        );
      }
      return <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '12px' }}>Top-level (CEO / Board)</span>;
    }
  },
  {
    key: 'department_name',
    header: 'Department / Unit',
    width: '180px',
    render: (item) => (
      <div>
        <div style={{ fontSize: '13px', color: 'var(--text-primary, #1e293b)' }}>{item.department_name || '-'}</div>
        {item.unit_name && (
          <div style={{ fontSize: '11px', color: 'var(--text-secondary, #64748b)' }}>📁 {item.unit_name}</div>
        )}
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    width: '100px',
    render: (item) => (
      <StructureStatusBadge
        status={item.is_active ? (item.is_vacant ? 'pending' : 'active') : 'inactive'}
        customLabel={item.is_active ? (item.is_vacant ? 'Vacant' : 'Occupied') : 'Inactive'}
        size="sm"
      />
    ),
  },
  {
    key: 'action',
    header: 'Action',
    width: '100px',
    render: (item) => {
      return (
        <a 
          href={`${STRUCTURE_ROUTES.EMPLOYMENTS}?position=${item.id}`} 
          style={{ color: 'var(--primary-color, #4f46e5)', fontSize: '13px', fontWeight: '500', textDecoration: 'none' }}
          onClick={(e) => e.stopPropagation()}
        >
          View Record →
        </a>
      );
    },
  },
];

export const PositionList = () => {
  const navigate = useNavigate();
  const { user } = useAppAuth();
  const { isSuperAdmin, isClientAdmin, isExecutive, role, permissions } = useStructurePermissions();
  const canManage = permissions?.canManagePositions;

  // Audit scope for admins vs manager unit scope
  const isOrgAdmin = useMemo(() => {
    return Boolean(
      isSuperAdmin || 
      isClientAdmin || 
      isExecutive || 
      role === 'hr_admin' || 
      user?.role === 'hr_admin' ||
      user?.is_superuser
    );
  }, [isSuperAdmin, isClientAdmin, isExecutive, role, user]);

  const [scopeTab, setScopeTab] = useState(!isOrgAdmin ? 'direct' : 'all');
  const [managerPosId, setManagerPosId] = useState(null);
  const [managerDept, setManagerDept] = useState(null);
  const [isInitialReady, setIsInitialReady] = useState(isOrgAdmin);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [filters, setFilters] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    items,
    isLoading,
    error,
    totalCount,
    stats,
    fetchAll,
    fetchStats,
    remove,
    clearError,
  } = usePositions({ autoFetch: false });

  // On mount, if user is a Manager (not whole-org admin), fetch their employment details
  useEffect(() => {
    if (!isOrgAdmin) {
      employmentService.getMyEmployment()
        .then(res => {
          const emp = res?.data?.current_employment || res?.data || res;
          if (emp?.position_id) {
            setManagerPosId(emp.position_id);
          }
          if (emp?.department_id) {
            setManagerDept({
              id: emp.department_id,
              name: emp.department_name || 'Software Engineering Department',
            });
          }
          if (emp?.position_id) {
            setScopeTab('direct');
            setFilters(prev => ({ ...prev, reports_to_id: emp.position_id }));
          } else if (emp?.department_id) {
            setScopeTab('department');
            setFilters(prev => ({ ...prev, department: emp.department_id }));
          }
          setIsInitialReady(true);
        })
        .catch(err => {
          console.warn('[PositionList] Employment fetch error:', err);
          setIsInitialReady(true);
        });
    } else {
      setScopeTab('all');
      setIsInitialReady(true);
    }
  }, [isOrgAdmin]);

  // Tab switcher handler
  const handleScopeChange = useCallback((newScope) => {
    setScopeTab(newScope);
    setPage(1);
    setFilters(prev => {
      const updated = { ...prev };
      delete updated.reports_to_id;
      delete updated.reports_to;
      delete updated.department;
      if (newScope === 'direct' && managerPosId) {
        updated.reports_to_id = managerPosId;
      } else if (newScope === 'department' && managerDept?.id) {
        updated.department = managerDept.id;
      }
      return updated;
    });
  }, [managerPosId, managerDept]);

  // Fetch stats when filters change or ready
  useEffect(() => {
    if (!isInitialReady) return;
    const statsParams = {};
    if (filters.reports_to_id) statsParams.reports_to_id = filters.reports_to_id;
    if (filters.department) statsParams.department = filters.department;
    fetchStats(statsParams);
  }, [fetchStats, isInitialReady, filters.reports_to_id, filters.department]);

  // Fetch list items
  useEffect(() => {
    if (!isInitialReady) return;
    const params = {
      page,
      page_size: pageSize,
      ...filters,
    };
    fetchAll(params);
  }, [fetchAll, page, pageSize, filters, isInitialReady]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // preserve active tab scope
      ...(scopeTab === 'direct' && managerPosId ? { reports_to_id: managerPosId } : {}),
      ...(scopeTab === 'department' && managerDept?.id ? { department: managerDept.id } : {}),
    }));
    setPage(1);
  }, [scopeTab, managerPosId, managerDept]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newSize) => {
    setPageSize(newSize);
    setPage(1);
  }, []);

  const handleView = useCallback((item) => {
    navigate(STRUCTURE_ROUTES.POSITION_DETAIL(item.id));
  }, [navigate]);

  const handleEdit = useCallback((item) => {
    navigate(STRUCTURE_ROUTES.POSITION_EDIT(item.id));
  }, [navigate]);

  const handleDeleteClick = useCallback((item) => {
    setDeleteTarget(item);
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await remove(deleteTarget.id);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      const params = {
        page,
        page_size: pageSize,
        ...filters,
      };
      fetchAll(params);
      const statsParams = {};
      if (filters.reports_to_id) statsParams.reports_to_id = filters.reports_to_id;
      if (filters.department) statsParams.department = filters.department;
      fetchStats(statsParams);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }, [deleteTarget, remove, fetchAll, fetchStats, page, pageSize, filters]);

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  }, []);

  const handleCreate = useCallback(() => {
    navigate(STRUCTURE_ROUTES.POSITION_CREATE);
  }, [navigate]);

  const handleRefresh = useCallback(() => {
    const statsParams = {};
    if (filters.reports_to_id) statsParams.reports_to_id = filters.reports_to_id;
    if (filters.department) statsParams.department = filters.department;
    fetchStats(statsParams);

    const params = {
      page,
      page_size: pageSize,
      ...filters,
    };
    fetchAll(params);
  }, [fetchAll, fetchStats, page, pageSize, filters]);

  // Compute unit metrics for manager view
  const unitStats = useMemo(() => {
    if (stats && (stats.total_positions !== undefined)) {
      return stats;
    }
    const total = items.length || totalCount || 0;
    const vacant = items.filter(p => !p.primary_occupant && (!p.occupants || p.occupants.length === 0)).length;
    const occupied = total - vacant;
    const rate = total > 0 ? Math.round((occupied / total) * 100) : 100;
    return {
      total_positions: total,
      vacant_positions: vacant,
      occupied_positions: occupied,
      occupancy_rate: rate,
    };
  }, [stats, items, totalCount]);

  if (error) {
    return (
      <div className="position-list-error">
        <p>{typeof error === 'object' ? (error?.message || error?.detail || JSON.stringify(error)) : String(error || '')}</p>
        <button onClick={clearError} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  const paginationProps = {
    currentPage: page,
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
    pageSize,
    totalItems: totalCount,
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
  };

  const isPageLoading = isLoading || !isInitialReady;

  // Title generation
  const pageTitle = useMemo(() => {
    if (isOrgAdmin) return 'Positions Catalog';
    if (scopeTab === 'direct') return 'My Direct Reporting Positions';
    return managerDept?.name ? `${managerDept.name} Positions` : 'Department Unit Positions';
  }, [isOrgAdmin, scopeTab, managerDept]);

  const cardScopeTitle = useMemo(() => {
    if (isOrgAdmin) return 'Total Positions';
    if (scopeTab === 'direct') return 'Direct Positions';
    return 'Unit Positions';
  }, [isOrgAdmin, scopeTab]);

  const cardScopeDesc = useMemo(() => {
    if (isOrgAdmin) return 'Defined in organization';
    if (scopeTab === 'direct') return 'Reporting directly to your role';
    return managerDept?.name ? `Defined in ${managerDept.name}` : 'Defined in department';
  }, [isOrgAdmin, scopeTab, managerDept]);

  return (
    <div className="position-list-container">
      <div className="position-list-header">
        <div className="header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiBriefcase className="text-blue-600" size={24} />
            <h1>{pageTitle}</h1>
          </div>
          <span className="header-count">{totalCount} {totalCount === 1 ? 'position' : 'positions'}</span>
        </div>
        <div className="header-right">
          <button onClick={handleRefresh} className="btn btn-secondary" title="Refresh">
            <FiRefreshCw size={16} />
          </button>
          {canManage && (
            <button onClick={handleCreate} className="btn btn-primary">
              <FiPlus size={16} />
              New Position
            </button>
          )}
        </div>
      </div>

      {/* Scope Switcher Tabs for Managers */}
      {!isOrgAdmin && (
        <div className="position-scope-tabs">
          <button 
            type="button"
            className={`scope-tab-btn ${scopeTab === 'direct' ? 'active' : ''}`}
            onClick={() => handleScopeChange('direct')}
          >
            <FiUsers size={15} />
            <span>Direct Reports</span>
            {scopeTab === 'direct' && <span className="tab-pill-badge">{totalCount}</span>}
          </button>
          <button 
            type="button"
            className={`scope-tab-btn ${scopeTab === 'department' ? 'active' : ''}`}
            onClick={() => handleScopeChange('department')}
          >
            <FiLayers size={15} />
            <span>Entire Department</span>
            {scopeTab === 'department' && <span className="tab-pill-badge">{totalCount}</span>}
          </button>
        </div>
      )}

      {/* Scope Switcher Tabs for Org Admins */}
      {isOrgAdmin && (
        <div className="position-scope-tabs">
          <button 
            type="button"
            className={`scope-tab-btn ${scopeTab === 'all' ? 'active' : ''}`}
            onClick={() => handleScopeChange('all')}
          >
            <FiGlobe size={15} />
            <span>All Organization</span>
          </button>
        </div>
      )}

      <StructureSummaryCards
        loading={isPageLoading && items.length === 0}
        items={[
          {
            title: cardScopeTitle,
            value: unitStats?.total_positions || 0,
            variant: 'default',
            description: cardScopeDesc
          },
          {
            title: 'Vacant Positions',
            value: unitStats?.vacant_positions || 0,
            variant: unitStats?.vacant_positions > 0 ? 'warning' : 'default',
            description: 'Open positions requiring hiring'
          },
          {
            title: 'Occupied Positions',
            value: unitStats?.occupied_positions || 0,
            variant: 'success',
            description: 'Currently filled roles'
          },
          {
            title: 'Occupancy Rate',
            value: unitStats?.occupancy_rate || 0,
            suffix: '%',
            variant: 'default',
            description: 'Position staffing fulfillment'
          }
        ]}
      />

      <StructureFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        searchPlaceholder={scopeTab === 'direct' ? "Search direct reporting positions..." : "Search positions by code, title, or occupant..."}
      >
        <div className="filter-group">
          <label>Status</label>
          <select
            value={filters.is_vacant || ''}
            onChange={(e) => handleFilterChange({ ...filters, is_vacant: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="true">Vacant</option>
            <option value="false">Occupied</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Grade</label>
          <input
            type="text"
            placeholder="Filter by grade"
            value={filters.grade || ''}
            onChange={(e) => handleFilterChange({ ...filters, grade: e.target.value })}
          />
        </div>
      </StructureFilters>

      <StructureTable
        hideEmptyState={true}
        columns={COLUMNS}
        data={items}
        loading={isPageLoading}
        actions={false}
        onView={handleView}
        pagination={paginationProps}
      />

      {!isPageLoading && items.length === 0 && (
        <StructureEmptyState
          title="No Positions Found"
          description={scopeTab === 'direct' ? "No direct reporting positions found for your role." : "No position records found matching the criteria in your department unit."}
          actionLabel={canManage ? "Create Position" : undefined}
          onAction={canManage ? handleCreate : undefined}
        />
      )}

      <StructureConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Position"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This will remove the position and all associated employments. This action cannot be undone.`}
        type="danger"
        confirmLabel="Delete"
      />
    </div>
  );
};

export default PositionList;
