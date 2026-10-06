// src/components/reviews/self-assessments/list/SelfAssessmentList.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit3,
  Trash2,
  Building2,
  Layers,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  User,
  Send,
  Briefcase
} from 'lucide-react';
import { useSelfAssessment, useReviewsPermissions } from '../../../../hooks/reviews';
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

const SelfAssessmentList = ({ isTeamView = false }) => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { isAdmin, isHrAdmin, isSupervisor, isExecutive } = useReviewsPermissions();
  const {
    data = [],
    loading,
    error,
    clearErrors,
    fetchAll,
    remove,
    pagination,
    setPagination,
    filters,
    setFilters
  } = useSelfAssessment();

  const [deletingId, setDeletingId] = useState(null);
  const [groupByDept, setGroupByDept] = useState(true);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [collapsedDepts, setCollapsedDepts] = useState({});

  const isStaffOnly = !isAdmin && !isHrAdmin && !isExecutive && !isTeamView && !isSupervisor;

  const loadData = useCallback(() => {
    fetchAll({
      page: pagination.currentPage,
      page_size: pagination.pageSize || 50,
      ...(isStaffOnly ? { scope: 'my' } : {}),
      ...(isTeamView ? { is_team: true, scope: 'team' } : {}),
      ...filters,
    });
  }, [pagination.currentPage, pagination.pageSize, filters, isTeamView, isStaffOnly, fetchAll]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter and sanitize display data
  const displayData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    let filtered = [...data];

    // In Staff view, only show the user's own assessment
    if (isStaffOnly && (user?.id || user?.email)) {
      filtered = filtered.filter((item) => {
        const empId = typeof item.employee === 'object' && item.employee !== null
          ? (item.employee.id || item.employee.uuid)
          : (item.employee_id || item.employee);
        const idMatch = Boolean(empId && user?.id && String(empId).toLowerCase() === String(user.id).toLowerCase());
        const emailMatch = Boolean(item.employee_email && user?.email && item.employee_email.toLowerCase() === user.email.toLowerCase());
        return idMatch || emailMatch;
      });
    }

    // In Team view, exclude current user's own assessment (user sees all other staff/team members)
    if (isTeamView && (user?.id || user?.email)) {
      filtered = filtered.filter((item) => {
        const empId = typeof item.employee === 'object' && item.employee !== null
          ? (item.employee.id || item.employee.uuid)
          : (item.employee_id || item.employee);
        const isSelfId = Boolean(empId && user?.id && String(empId).toLowerCase() === String(user.id).toLowerCase());
        const isSelfEmail = Boolean(item.employee_email && user?.email && item.employee_email.toLowerCase() === user.email.toLowerCase());
        return !isSelfId && !isSelfEmail;
      });
    }

    // Department Filter
    if (selectedDeptFilter !== 'ALL') {
      filtered = filtered.filter((item) => {
        const dept = item.department_name || item.department || 'General';
        return dept === selectedDeptFilter;
      });
    }

    // Status Filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    return filtered;
  }, [data, isStaffOnly, isTeamView, user?.id, user?.email, selectedDeptFilter, statusFilter]);

  // Extract list of all unique departments from loaded data
  const availableDepartments = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const depts = new Set();
    data.forEach((item) => {
      const dept = item.department_name || item.department || 'General';
      if (dept) depts.add(dept);
    });
    return Array.from(depts).sort();
  }, [data]);

  // Group data by department for categorized team view
  const groupedData = useMemo(() => {
    if (!groupByDept || !isTeamView) return null;

    const groups = {};
    displayData.forEach((item) => {
      const dept = item.department_name || item.department || 'General & Administration';
      if (!groups[dept]) {
        groups[dept] = [];
      }
      groups[dept].push(item);
    });

    return groups;
  }, [displayData, groupByDept, isTeamView]);

  const toggleDeptCollapse = (deptName) => {
    setCollapsedDepts((prev) => ({
      ...prev,
      [deptName]: !prev[deptName],
    }));
  };

  const handleSearch = useCallback((searchTerm) => {
    setFilters({ search: searchTerm });
  }, [setFilters]);

  const handlePageChange = useCallback((page) => {
    setPagination({ currentPage: page });
  }, [setPagination]);

  const handlePageSizeChange = useCallback((size) => {
    setPagination({ pageSize: size, currentPage: 1 });
  }, [setPagination]);

  const handleView = (id) => {
    navigate(`/reviews/self-assessments/${id}`);
  };

  const handleDelete = async (e, assessment) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to permanently delete the self-assessment for ${assessment.employee_name || 'this employee'}?`)) {
      setDeletingId(assessment.id);
      try {
        await remove(assessment.id);
        alert('Self-assessment deleted successfully.');
        loadData();
      } catch (err) {
        alert('Failed to delete self-assessment: ' + (err.response?.data?.error || err.message || 'Permission denied'));
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleStartSupervisorReview = (assessment) => {
    const empId = assessment.employee_id || (typeof assessment.employee === 'object' ? assessment.employee?.id : assessment.employee);
    if (empId) {
      navigate(`/reviews/supervisor-reviews/${empId}/form`);
    } else {
      navigate('/reviews/supervisor-reviews/queue');
    }
  };

  if (loading && !displayData.length) return <ReviewLoading size="lg" text="Loading self assessments..." />;
  if (error && !displayData.length) return <ReviewError error={error} onRetry={() => { if (clearErrors) clearErrors(); fetchAll(); }} />;

  // Render an assessment card
  const renderAssessmentCard = (assessment) => (
    <div key={assessment.id} className="self-assessment-list-card" onClick={() => handleView(assessment.id)}>
      <div className="self-assessment-list-card-header">
        <div className="self-assessment-list-card-user">
          <div className="self-assessment-list-card-avatar">
            {assessment.employee_name?.charAt(0) || 'U'}
          </div>
          <div className="self-assessment-list-card-user-info">
            <span className="self-assessment-list-card-name">{assessment.employee_name}</span>
            <span className="self-assessment-list-card-email">{assessment.employee_email}</span>
            {assessment.position_title && (
              <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <Briefcase size={12} />
                {assessment.position_title}
              </span>
            )}
          </div>
        </div>
        <ReviewStatusBadge status={assessment.status} />
      </div>

      <div className="self-assessment-list-card-info" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <span className="self-assessment-list-card-cycle">{assessment.review_cycle_name}</span>
          {assessment.department_name && (
            <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
              {assessment.department_name}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', fontSize: '11px', color: '#64748b' }}>
          <span className="self-assessment-list-card-date">
            {assessment.submitted_at
              ? `Submitted: ${new Date(assessment.submitted_at).toLocaleDateString()}`
              : 'Draft / In Progress'}
          </span>
          {assessment.manager_name && (
            <span>Supervisor: <strong style={{ color: '#334155' }}>{assessment.manager_name}</strong></span>
          )}
        </div>
      </div>

      {assessment.is_late && !assessment.submitted_at && (
        <div className="self-assessment-list-card-warning">
          <AlertCircle size={14} />
          Overdue for Submission
        </div>
      )}

      <div className="self-assessment-list-card-footer" style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="self-assessment-list-card-btn"
          onClick={(e) => { e.stopPropagation(); handleView(assessment.id); }}
          style={{ flex: 1, minWidth: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', padding: '7px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, fontSize: '12px' }}
        >
          <Eye size={14} />
          View
        </button>

        {isStaffOnly && assessment.status === 'draft' && (
          <button
            type="button"
            className="self-assessment-list-card-btn"
            onClick={(e) => { e.stopPropagation(); navigate(`/reviews/self-assessments/${assessment.id}/edit`); }}
            style={{ flex: 1, minWidth: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#2563eb', color: '#ffffff', border: 'none', padding: '7px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}
          >
            <Edit3 size={14} />
            Edit / Submit
          </button>
        )}

        {(isAdmin || isSupervisor || isTeamView) && (
          <>
            <button
              type="button"
              className="self-assessment-list-card-btn"
              onClick={(e) => { e.stopPropagation(); handleStartSupervisorReview(assessment); }}
              style={{ flex: 1.2, minWidth: '105px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#2563eb', color: '#ffffff', border: 'none', padding: '7px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}
              title="Conduct or manage supervisor appraisal for this staff member"
            >
              <CheckCircle size={14} />
              Review
            </button>
            {assessment.status !== 'submitted' && (
              <button
                type="button"
                className="self-assessment-list-card-btn"
                onClick={(e) => { e.stopPropagation(); alert(`Reminder notification sent to ${assessment.employee_name || 'employee'}!`); }}
                style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '7px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Send reminder to complete self-assessment"
              >
                <Send size={13} />
              </button>
            )}
          </>
        )}

        {(assessment.status === 'draft' || isAdmin) && (
          <button
            type="button"
            className="self-assessment-list-card-btn"
            onClick={(e) => handleDelete(e, assessment)}
            disabled={deletingId === assessment.id}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '7px 10px', borderRadius: '6px', cursor: 'pointer' }}
            title="Delete this self assessment"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="self-assessment-list">
      {/* Top Controls Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="self-assessment-list-count" style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', background: '#f1f5f9', padding: '4px 12px', borderRadius: '16px' }}>
            {displayData.length} {isTeamView ? "Team Members' Assessments" : isStaffOnly ? 'My Submissions' : 'Total Records'}
          </span>
          {isTeamView && (
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              (Excluding your own personal submission)
            </span>
          )}
        </div>

        {/* View Mode & Grouping Toggles (For Team View) */}
        {isTeamView && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setGroupByDept(!groupByDept)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid #cbd5e1',
                background: groupByDept ? '#eff6ff' : '#ffffff',
                color: groupByDept ? '#2563eb' : '#475569',
              }}
            >
              <Layers size={14} />
              <span>{groupByDept ? 'Grouped by Department' : 'Flat Grid'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <ReviewSearchBar
            placeholder={isTeamView ? "Search employees by name, email, department..." : isStaffOnly ? "Search by cycle name..." : "Search all records..."}
            onSearch={handleSearch}
            className="self-assessment-search"
          />
        </div>

        {/* Department Filter Dropdown */}
        {isTeamView && availableDepartments.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Building2 size={16} style={{ color: '#64748b' }} />
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                fontWeight: 500,
                color: '#334155',
                background: '#ffffff',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="ALL">All Departments ({availableDepartments.length})</option>
              {availableDepartments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        )}

        {/* Status Filter Dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '13px',
            fontWeight: 500,
            color: '#334155',
            background: '#ffffff',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="ALL">All Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="draft">Draft / In Progress</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
        </select>
      </div>

      {/* Main Content Area */}
      {displayData.length === 0 ? (
        <ReviewEmptyState
          title={isTeamView ? "No Team Assessments Found" : isStaffOnly ? "No Self Assessments Yet" : "No Records Found"}
          description={isTeamView ? "No team members match the selected department or status filters." : isStaffOnly ? "You haven't created any self assessments yet." : "No records match your criteria."}
          icon="📝"
        />
      ) : groupByDept && groupedData ? (
        /* Department Accordion Sections */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {Object.entries(groupedData).map(([deptName, items]) => {
            const isCollapsed = collapsedDepts[deptName];
            const submittedCount = items.filter((i) => i.status === 'submitted').length;
            const completionRate = items.length ? Math.round((submittedCount / items.length) * 100) : 0;

            return (
              <div
                key={deptName}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                {/* Department Section Header */}
                <div
                  onClick={() => toggleDeptCollapse(deptName)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 20px',
                    background: '#f8fafc',
                    borderBottom: isCollapsed ? 'none' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 size={18} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                        {deptName}
                      </h3>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        {items.length} Team Members • {submittedCount} Submitted ({completionRate}%)
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '100px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${completionRate}%`, height: '100%', background: completionRate >= 80 ? '#10b981' : completionRate >= 50 ? '#f59e0b' : '#3b82f6', borderRadius: '3px' }} />
                    </div>
                    {isCollapsed ? <ChevronDown size={18} style={{ color: '#64748b' }} /> : <ChevronUp size={18} style={{ color: '#64748b' }} />}
                  </div>
                </div>

                {/* Department Cards Grid */}
                {!isCollapsed && (
                  <div style={{ padding: '20px' }}>
                    <div className="self-assessment-list-grid" style={{ marginBottom: 0 }}>
                      {items.map(renderAssessmentCard)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Flat Grid View */
        <>
          <div className="self-assessment-list-grid">
            {displayData.map(renderAssessmentCard)}
          </div>

          <ReviewPagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            totalItems={pagination.totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}
    </div>
  );
};

export default SelfAssessmentList;