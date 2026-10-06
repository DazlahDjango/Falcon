// src/components/reviews/supervisor-reviews/list/SupervisorReviewList.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Eye,
  User,
  Calendar,
  CheckCircle,
  Clock,
  Building2,
  Layers,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  Award,
  TrendingUp,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { useSupervisorReview, useReviewsPermissions } from '../../../../hooks/reviews';
import { useAuthContext } from '../../../../contexts/accounts/AuthContext';
import {
  ReviewLoading,
  ReviewError,
  ReviewEmptyState,
  ReviewPagination,
  ReviewSearchBar,
  ReviewStatusBadge
} from '../../common';
import './list.css';

const SupervisorReviewList = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { isAdmin, isHrAdmin, isSupervisor, isExecutive } = useReviewsPermissions();
  const {
    data = [],
    loading,
    error,
    fetchAll,
    pagination,
    setPagination,
    filters,
    setFilters
  } = useSupervisorReview();

  const [searchTerm, setSearchTerm] = useState('');
  const [groupByDept, setGroupByDept] = useState(true);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [collapsedDepts, setCollapsedDepts] = useState({});

  const paginationSafe = pagination || {
    currentPage: 1,
    pageSize: 50,
    totalItems: data?.length || 0,
    totalPages: Math.ceil((data?.length || 0) / 50) || 1,
  };

  useEffect(() => {
    fetchAll({
      page: paginationSafe.currentPage,
      page_size: paginationSafe.pageSize || 50,
      ...filters,
    });
  }, [paginationSafe.currentPage, paginationSafe.pageSize, filters, fetchAll]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    if (setFilters) setFilters({ search: term });
  }, [setFilters]);

  const handlePageChange = useCallback((page) => {
    if (setPagination) setPagination({ currentPage: page });
  }, [setPagination]);

  const handlePageSizeChange = useCallback((size) => {
    if (setPagination) setPagination({ pageSize: size, currentPage: 1 });
  }, [setPagination]);

  const handleView = (id) => {
    navigate(`/reviews/supervisor-reviews/${id}`);
  };

  const toggleDeptCollapse = (deptName) => {
    setCollapsedDepts((prev) => ({
      ...prev,
      [deptName]: !prev[deptName],
    }));
  };

  // Filter and sanitize reviews data
  const displayData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    let filtered = [...data];

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((r) => {
        const s = (r.status || '').toLowerCase();
        if (statusFilter === 'SUBMITTED') return s === 'submitted' || s === 'completed';
        if (statusFilter === 'APPROVED') return s === 'approved';
        if (statusFilter === 'DRAFT') return s === 'draft' || s === 'in_progress' || s === 'pending';
        return s === statusFilter.toLowerCase();
      });
    }

    // Department filter
    if (selectedDeptFilter !== 'ALL') {
      filtered = filtered.filter((r) => {
        const d = r.department_name || r.department?.name || 'Unassigned';
        return d === selectedDeptFilter;
      });
    }

    // Client-side search match
    if (searchTerm && searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter((r) => {
        const empName = (r.employee_name || '').toLowerCase();
        const empEmail = (r.employee_email || '').toLowerCase();
        const supName = (r.supervisor_name || '').toLowerCase();
        const dept = (r.department_name || '').toLowerCase();
        const cycle = (r.review_cycle_name || '').toLowerCase();
        return empName.includes(q) || empEmail.includes(q) || supName.includes(q) || dept.includes(q) || cycle.includes(q);
      });
    }

    return filtered;
  }, [data, statusFilter, selectedDeptFilter, searchTerm]);

  // Unique departments for filter dropdown
  const availableDepartments = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const depts = new Set();
    data.forEach((r) => {
      const d = r.department_name || r.department?.name || 'Unassigned';
      if (d) depts.add(d);
    });
    return Array.from(depts).sort();
  }, [data]);

  // Group items by department
  const departmentGroups = useMemo(() => {
    const groups = {};
    displayData.forEach((item) => {
      const deptName = item.department_name || item.department?.name || 'Unassigned';
      if (!groups[deptName]) {
        groups[deptName] = [];
      }
      groups[deptName].push(item);
    });
    return groups;
  }, [displayData]);

  // Stats calculation
  const stats = useMemo(() => {
    if (!Array.isArray(data)) return { total: 0, submitted: 0, approved: 0, drafts: 0 };
    let submitted = 0;
    let approved = 0;
    let drafts = 0;

    data.forEach((r) => {
      const s = (r.status || '').toLowerCase();
      if (s === 'approved') approved++;
      else if (s === 'submitted' || s === 'completed' || s === 'reviewed') submitted++;
      else drafts++;
    });

    return {
      total: data.length,
      submitted,
      approved,
      drafts,
    };
  }, [data]);

  if (loading && !data.length) return <ReviewLoading size="lg" text="Loading submitted supervisor reviews..." />;
  if (error) return <ReviewError error={error} onRetry={() => fetchAll()} />;

  const renderReviewCard = (review) => {
    const isSubmitted = review.status === 'submitted' || review.status === 'completed' || review.status === 'approved';
    const hasKpi = review.effective_kpi_score !== null && review.effective_kpi_score !== undefined;

    return (
      <div
        key={review.id}
        className="self-assessment-card"
        onClick={() => handleView(review.id)}
      >
        <div className="card-top">
          <div className="user-avatar-wrap">
            <div className="user-avatar">
              {(review.employee_name || 'E').charAt(0).toUpperCase()}
            </div>
            <div className="user-meta">
              <h4 className="user-name">{review.employee_name || 'Employee'}</h4>
              <span className="user-email">{review.employee_email || 'No email provided'}</span>
              {review.position_title && (
                <span className="user-position-tag">{review.position_title}</span>
              )}
            </div>
          </div>
          <div className="card-top-right">
            <ReviewStatusBadge status={review.status} />
          </div>
        </div>

        <div className="card-details-grid">
          <div className="detail-item">
            <span className="detail-label">Department</span>
            <span className="detail-value highlight-dept">
              <Building2 size={13} />
              {review.department_name || 'Unassigned'}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Supervisor / Manager</span>
            <span className="detail-value">
              <User size={13} />
              {review.supervisor_name || 'Not assigned'}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Review Cycle</span>
            <span className="detail-value">
              <Calendar size={13} />
              {review.review_cycle_name || 'Active Cycle'}
            </span>
          </div>

          {hasKpi && (
            <div className="detail-item">
              <span className="detail-label">KPI Score</span>
              <span className="detail-value kpi-score-badge">
                <Award size={13} />
                {Number(review.effective_kpi_score).toFixed(1)}%
              </span>
            </div>
          )}

          {review.recommendation && (
            <div className="detail-item">
              <span className="detail-label">Recommendation</span>
              <span className="detail-value recommendation-badge">
                <TrendingUp size={13} />
                {review.recommendation_display || review.recommendation}
              </span>
            </div>
          )}
        </div>

        {review.self_assessment && (
          <div className="self-submitted-badge">
            <CheckCircle size={13} color="#10b981" />
            <span>Self-Assessment Linked</span>
          </div>
        )}

        <div className="card-footer">
          <button
            type="button"
            className="action-btn view-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleView(review.id);
            }}
          >
            <Eye size={15} />
            <span>View Appraisal</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="self-assessment-list-container">
      {/* Top Banner & KPI Summary */}
      <div className="self-assessment-summary-cards">
        <div className="summary-card total">
          <div className="summary-icon-wrap">
            <FileCheck size={22} />
          </div>
          <div className="summary-info">
            <span className="summary-label">Total Appraisals</span>
            <span className="summary-value">{stats.total}</span>
          </div>
        </div>

        <div className="summary-card submitted">
          <div className="summary-icon-wrap">
            <CheckCircle size={22} />
          </div>
          <div className="summary-info">
            <span className="summary-label">Approved & Finalized</span>
            <span className="summary-value">{stats.approved}</span>
          </div>
        </div>

        <div className="summary-card pending">
          <div className="summary-icon-wrap">
            <Clock size={22} />
          </div>
          <div className="summary-info">
            <span className="summary-label">Submitted Appraisals</span>
            <span className="summary-value">{stats.submitted}</span>
          </div>
        </div>

        <div className="summary-card draft">
          <div className="summary-icon-wrap">
            <AlertCircle size={22} />
          </div>
          <div className="summary-info">
            <span className="summary-label">Draft / Pending</span>
            <span className="summary-value">{stats.drafts}</span>
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="self-assessment-toolbar">
        <div className="toolbar-left">
          <ReviewSearchBar
            placeholder="Search appraisals by employee, supervisor, department..."
            onSearch={handleSearch}
            className="custom-search-bar"
          />

          <div className="filter-group">
            <label htmlFor="dept-filter" className="filter-label">
              <Building2 size={14} />
              Department:
            </label>
            <select
              id="dept-filter"
              className="filter-select"
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
            >
              <option value="ALL">All Departments ({stats.total})</option>
              {availableDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="status-filter" className="filter-label">
              Status:
            </label>
            <select
              id="status-filter"
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">Approved ({stats.approved})</option>
              <option value="SUBMITTED">Submitted ({stats.submitted})</option>
              <option value="DRAFT">Draft / In Progress ({stats.drafts})</option>
            </select>
          </div>
        </div>

        <div className="toolbar-right">
          <button
            type="button"
            className={`view-toggle-btn ${groupByDept ? 'active' : ''}`}
            onClick={() => setGroupByDept(!groupByDept)}
            title="Toggle Group by Department"
          >
            {groupByDept ? <Layers size={16} /> : <LayoutGrid size={16} />}
            <span>{groupByDept ? 'Grouped by Dept' : 'Flat Grid'}</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      {displayData.length === 0 ? (
        <ReviewEmptyState
          title="No Submitted Appraisals Found"
          description="There are no supervisor reviews matching your search and filter criteria."
          icon="📋"
        />
      ) : groupByDept ? (
        /* Accordion Group by Department */
        <div className="department-groups-container">
          {Object.entries(departmentGroups).map(([deptName, items]) => {
            const isCollapsed = collapsedDepts[deptName];
            const deptSubmittedCount = items.filter(
              (i) => (i.status || '').toLowerCase() === 'approved' || (i.status || '').toLowerCase() === 'submitted'
            ).length;
            const progressPercent = items.length > 0 ? Math.round((deptSubmittedCount / items.length) * 100) : 0;

            return (
              <div key={deptName} className={`department-group-card ${isCollapsed ? 'collapsed' : ''}`}>
                <div
                  className="dept-group-header"
                  onClick={() => toggleDeptCollapse(deptName)}
                >
                  <div className="dept-header-left">
                    <div className="dept-icon-box">
                      <Building2 size={20} />
                    </div>
                    <div className="dept-header-titles">
                      <h3 className="dept-name">{deptName}</h3>
                      <span className="dept-meta">
                        {items.length} appraisal{items.length !== 1 ? 's' : ''} • {deptSubmittedCount} completed ({progressPercent}%)
                      </span>
                    </div>
                  </div>

                  <div className="dept-header-right">
                    <div className="dept-progress-bar-wrap">
                      <div
                        className="dept-progress-bar-fill"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <button type="button" className="collapse-toggle-btn">
                      {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                    </button>
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="dept-group-body">
                    <div className="self-assessment-cards-grid">
                      {items.map(renderReviewCard)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Flat Grid */
        <div className="self-assessment-cards-grid flat-grid">
          {displayData.map(renderReviewCard)}
        </div>
      )}

      {/* Pagination */}
      {paginationSafe.totalPages > 1 && (
        <ReviewPagination
          currentPage={paginationSafe.currentPage}
          totalPages={paginationSafe.totalPages}
          pageSize={paginationSafe.pageSize}
          totalItems={paginationSafe.totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
};

export default SupervisorReviewList;