import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiRefreshCw, FiUsers } from 'react-icons/fi';
import { usePositions, useStructurePermissions } from '../../../hooks/structure';
import {
  StructureTable,
  StructureSearchBar,
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
        <div style={{ fontSize: '13px', color: 'var(--text-primary, #1e293b)' }}>{item.department_name || item.division_name || '-'}</div>
        {item.unit_name && <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>📂 {item.unit_name}</div>}
      </div>
    ),
  },
  {
    key: 'is_vacant',
    header: 'Status',
    width: '110px',
    render: (item) => {
      const isVacant = item.is_vacant !== undefined ? item.is_vacant : item.current_incumbents_count === 0;
      return (
        <StructureStatusBadge
          status={isVacant ? 'inactive' : 'active'}
          customLabel={isVacant ? 'Vacant' : 'Occupied'}
        />
      );
    },
  },
  {
    key: 'actions_occupancy',
    header: 'Action',
    width: '130px',
    render: (item) => {
      const isVacant = item.is_vacant !== undefined ? item.is_vacant : item.current_incumbents_count === 0;
      if (isVacant) {
        return (
          <a
            href={`${STRUCTURE_ROUTES.EMPLOYMENT_CREATE}?position_id=${item.id}`}
            className="btn btn-primary btn-sm"
            style={{ 
              backgroundColor: '#4f46e5', 
              color: '#fff', 
              padding: '4px 10px', 
              borderRadius: '4px', 
              fontSize: '12px', 
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <FiPlus size={12} /> Assign User
          </a>
        );
      }
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
  const { permissions } = useStructurePermissions();
  const canManage = permissions?.canManagePositions;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
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

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const params = {
      page,
      page_size: pageSize,
      search: searchTerm,
      ...filters,
    };
    fetchAll(params);
  }, [fetchAll, page, pageSize, searchTerm, filters]);

  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

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
        search: searchTerm,
        ...filters,
      };
      fetchAll(params);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }, [deleteTarget, remove, fetchAll, page, pageSize, searchTerm, filters]);

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  }, []);

  const handleCreate = useCallback(() => {
    navigate(STRUCTURE_ROUTES.POSITION_CREATE);
  }, [navigate]);

  const handleRefresh = useCallback(() => {
    const params = {
      page,
      page_size: pageSize,
      search: searchTerm,
      ...filters,
    };
    fetchAll(params);
  }, [fetchAll, page, pageSize, searchTerm, filters]);

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
    totalPages: Math.ceil(totalCount / pageSize),
    pageSize,
    totalItems: totalCount,
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
  };

  return (
    <div className="position-list-container">
      <div className="position-list-header">
        <div className="header-left">
          <h1>Positions</h1>
          <span className="header-count">{totalCount} total</span>
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

      <StructureSummaryCards
        loading={!stats && isLoading}
        items={[
          {
            title: 'Total Positions',
            value: stats?.total_positions || 0,
            variant: 'default',
            description: 'Defined in structure'
          },
          {
            title: 'Vacant Positions',
            value: stats?.vacant_positions || 0,
            variant: 'warning',
            description: 'Require candidates'
          },
          {
            title: 'Occupied Positions',
            value: stats?.occupied_positions || 0,
            variant: 'success',
            description: 'Currently filled'
          },
          {
            title: 'Occupancy Rate',
            value: stats?.occupancy_rate || 0,
            suffix: '%',
            variant: 'default',
            description: 'Total fulfillment'
          }
        ]}
      />

      <StructureFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        searchPlaceholder="Search positions..."
      >
        <div className="filter-group">
          <label>Status</label>
          <select
            value={filters.is_vacant || ''}
            onChange={(e) => handleFilterChange({ ...filters, is_vacant: e.target.value })}
          >
            <option value="">All</option>
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
        <div className="filter-group">
          <label>Level Range</label>
          <div className="range-inputs">
            <input
              type="number"
              placeholder="Min"
              value={filters.level_min || ''}
              onChange={(e) => handleFilterChange({ ...filters, level_min: e.target.value })}
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.level_max || ''}
              onChange={(e) => handleFilterChange({ ...filters, level_max: e.target.value })}
            />
          </div>
        </div>
      </StructureFilters>

      <StructureSearchBar
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search by job code or title..."
        debounce={400}
      />

      <StructureTable hideEmptyState={true}
        columns={COLUMNS}
        data={items}
        loading={isLoading}
        onView={handleView}
        onEdit={canManage ? handleEdit : undefined}
        onDelete={canManage ? handleDeleteClick : undefined}
        pagination={paginationProps}
      />

      {!isLoading && items.length === 0 && (
        <StructureEmptyState
          title="No Positions Found"
          description="Create your first position to start defining roles in your organization."
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
