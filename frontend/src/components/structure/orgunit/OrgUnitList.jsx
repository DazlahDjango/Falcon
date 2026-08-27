import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLayers, FiActivity, FiRefreshCw } from 'react-icons/fi';
import { useOrganizationalUnits, useStructureReferenceData } from '../../../hooks/structure';
import {
  StructureTable,
  StructureSearchBar,
  StructureFilters,
  StructureStatusBadge,
  StructureLoading,
  StructureEmptyState,
} from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import '../division/division.css';

const COLUMNS = [
  { key: 'code', header: 'Code', width: '120px' },
  { key: 'name', header: 'Name', width: '200px' },
  { 
    key: 'level', 
    header: 'Type', 
    width: '100px',
    render: (item) => item.level ? item.level.charAt(0).toUpperCase() + item.level.slice(1) : 'Unit'
  },
  { 
    key: 'parent_name', 
    header: 'Parent Unit', 
    render: (item) => item.parent_name || <span className="text-muted">None</span>
  },
  {
    key: 'headcount_limit',
    header: 'Headcount',
    width: '100px',
    render: (item) => item.headcount_limit ? <span className="badge badge-info">{item.headcount_limit}</span> : '-'
  },
  {
    key: 'is_active',
    header: 'Status',
    width: '120px',
    render: (item) => (
      <StructureStatusBadge status={item.is_active ? 'active' : 'inactive'} />
    ),
  },
];

export const OrgUnitList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});

  const {
    items,
    isLoading,
    error,
    totalCount,
    stats,
    fetchAll,
    fetchStats,
    clearError,
  } = useOrganizationalUnits({ autoFetch: false });

  const { orgUnits: referenceParentUnits, fetch: fetchRefData } = useStructureReferenceData({ autoFetch: false });

  useEffect(() => {
    fetchStats();
    fetchRefData();
  }, [fetchStats, fetchRefData]);

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
    if (item.level === 'division') navigate(STRUCTURE_ROUTES.DIVISION_DETAIL(item.id));
    else if (item.level === 'department') navigate(STRUCTURE_ROUTES.DEPARTMENT_DETAIL(item.id));
    else if (item.level === 'section') navigate(STRUCTURE_ROUTES.SECTION_DETAIL(item.id));
    else navigate(STRUCTURE_ROUTES.UNIT_DETAIL(item.id));
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

  const summaryStats = useMemo(() => {
    if (stats) {
      return [
        { label: 'Total Units', value: stats.total || totalCount || 0, icon: FiLayers },
        { label: 'Divisions', value: stats.by_level?.division || 0, icon: FiLayers },
        { label: 'Departments', value: stats.by_level?.department || 0, icon: FiLayers },
        { label: 'Active', value: stats.active || items?.filter(i => i.is_active).length || 0, icon: FiActivity },
      ];
    }
    
    // Fallback if stats endpoint fails
    const itemsArray = Array.isArray(items) ? items : [];
    const activeCount = itemsArray.filter((item) => item.is_active).length;
    
    return [
      { label: 'Total Units', value: totalCount || 0, icon: FiLayers },
      { label: 'Active', value: activeCount, icon: FiActivity }
    ];
  }, [items, totalCount, stats]);

  if (error) {
    return (
      <div className="division-list-error">
        <p>{typeof error === 'object' ? (error?.message || error?.detail || JSON.stringify(error)) : String(error || '')}</p>
        <button onClick={clearError} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  const paginationProps = {
    currentPage: page,
    totalPages: Math.ceil((totalCount || 0) / pageSize) || 1,
    pageSize,
    totalItems: totalCount || 0,
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
  };

  return (
    <div className="division-list-container">
      <div className="division-list-hero">
        <div className="division-list-hero__content">
          <div className="division-list-hero__icon">
            <FiLayers size={22} />
          </div>
          <div>
            <p className="division-list-hero__eyebrow">Structure management</p>
            <h2>Organizational Units</h2>
            <p>Master list of all divisions, departments, sections, and units in your organization.</p>
          </div>
        </div>
        <div className="division-list-hero__stats">
          {summaryStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="division-stat-card">
                <div className="division-stat-card__icon">
                  <Icon size={16} />
                </div>
                <div>
                  <div className="division-stat-card__value">{stat.value}</div>
                  <div className="division-stat-card__label">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="division-list-header">
        <div className="header-left">
          <h1>Organizational Units</h1>
          <span className="header-count">{totalCount || 0} total</span>
        </div>
        <div className="header-right">
          <button onClick={handleRefresh} className="btn btn-secondary" title="Refresh">
            <FiRefreshCw size={16} />
          </button>
        </div>
      </div>

      <StructureFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        searchPlaceholder="Search all units..."
      >
        <div className="filter-group">
          <label>Type</label>
          <select
            value={filters.level || ''}
            onChange={(e) => handleFilterChange({ ...filters, level: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="division">Division</option>
            <option value="department">Department</option>
            <option value="section">Section</option>
            <option value="unit">Unit</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Status</label>
          <select
            value={filters.is_active || ''}
            onChange={(e) => handleFilterChange({ ...filters, is_active: e.target.value })}
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Parent Unit</label>
          <select
            value={filters.parent_id || ''}
            onChange={(e) => handleFilterChange({ ...filters, parent_id: e.target.value })}
          >
            <option value="">All Parents</option>
            {referenceParentUnits?.map(unit => (
              <option key={unit.id} value={unit.id}>{unit.name}</option>
            ))}
          </select>
        </div>
      </StructureFilters>

      <StructureSearchBar
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search by code or name..."
        debounce={400}
      />

      <StructureTable hideEmptyState={true}
        columns={COLUMNS}
        data={items || []}
        loading={isLoading}
        onView={handleView}
        pagination={paginationProps}
      />

      {!isLoading && (!items || items.length === 0) && (
        <StructureEmptyState
          title="No Units Found"
          description="Your organization has no structural units yet."
        />
      )}
    </div>
  );
};

export default OrgUnitList;
