import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, Filter, Eye, RefreshCw, ChevronLeft, ChevronRight, Users, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmploymentCard, EmploymentFilters } from '../../components/structure/employment';
import { ConfirmDeleteModal, ExportOptionsModal } from '../../components/structure/modals';
import { useEmployments, useEmploymentMutations } from '../../hooks/structure';
import { 
  fetchEmployments, 
  deleteEmployment, 
  setEmploymentPage, 
  setEmploymentPageSize, 
  setEmploymentFilters, 
  clearEmploymentFilters,
  fetchCurrentEmployments,
  exportOrgChart
} from '../../store/structure';
import { 
  selectEmployments, 
  selectEmploymentsLoading, 
  selectEmploymentPagination, 
  selectEmploymentFilters as selectFilters,
  selectCurrentEmployment
} from '../../store/structure';
import { STRUCTURE_ROUTES } from '../../routes/structure.routes';

const EmploymentList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const employments = useSelector(selectEmployments);
  const loading = useSelector(selectEmploymentsLoading);
  const pagination = useSelector(selectEmploymentPagination);
  const filters = useSelector(selectFilters);
  const currentUserEmployment = useSelector(selectCurrentEmployment);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showCurrentOnly, setShowCurrentOnly] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  useEffect(() => {
    const appliedFilters = { ...filters, search: searchTerm };
    if (showCurrentOnly) appliedFilters.is_current = 'true';
    dispatch(fetchEmployments({
      page: pagination.page,
      pageSize: pagination.pageSize,
      filters: appliedFilters,
    }));
  }, [dispatch, pagination.page, pagination.pageSize, filters, searchTerm, showCurrentOnly]);
  const handlePageChange = (newPage) => {
    dispatch(setEmploymentPage(newPage));
  };
  const handlePageSizeChange = (e) => {
    dispatch(setEmploymentPageSize(parseInt(e.target.value)));
  };
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    dispatch(setEmploymentPage(1));
  };
  const handleFilterChange = (newFilters) => {
    dispatch(setEmploymentFilters(newFilters));
    dispatch(setEmploymentPage(1));
  };
  const handleClearFilters = () => {
    dispatch(clearEmploymentFilters());
    setSearchTerm('');
    dispatch(setEmploymentPage(1));
  };
  const handleCreate = () => {
    navigate(STRUCTURE_ROUTES.EMPLOYMENT_CREATE);
  };
  const handleView = (id) => {
    navigate(STRUCTURE_ROUTES.EMPLOYMENT_DETAIL(id));
  };
  const handleRefresh = () => {
    dispatch(fetchEmployments({
      page: pagination.page,
      pageSize: pagination.pageSize,
      filters: { ...filters, search: searchTerm, is_current: showCurrentOnly ? 'true' : undefined },
    }));
    dispatch(fetchCurrentEmployments());
  };
  const handleDeleteConfirm = async (id) => {
    await dispatch(deleteEmployment(id)).unwrap();
    setDeleteTarget(null);
    handleRefresh();
  };
  const handleExport = async ({ format, include_inactive, max_depth }) => {
    setIsExporting(true);
    try {
      const result = await dispatch(exportOrgChart({
        format,
        includeInactive: include_inactive,
        maxDepth: max_depth,
      })).unwrap();
      if (result.data?.data) {
        let blob;
        let filename;
        if (format === 'json') {
          const dataStr = JSON.stringify(result.data.data, null, 2);
          blob = new Blob([dataStr], { type: 'application/json' });
          filename = `employments-export-${Date.now()}.json`;
        } else if (format === 'csv') {
          const headers = ['ID', 'User ID', 'Position', 'Department', 'Team', 'Type', 'Status', 'Effective From', 'Effective To'];
          const rows = employments.map(emp => [
            emp.id,
            emp.user_id,
            emp.position?.title || '',
            emp.department?.name || '',
            emp.team?.name || '',
            emp.employment_type,
            emp.is_active && emp.is_current ? 'Active' : 'Inactive',
            emp.effective_from,
            emp.effective_to || ''
          ]);
          const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
          blob = new Blob([csvContent], { type: 'text/csv' });
          filename = `employments-export-${Date.now()}.csv`;
        } else {
          blob = result.data;
          filename = `employments-export-${Date.now()}.${format}`;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      setShowExportModal(false);
    }
  };
  const currentCount = employments.filter(e => e.is_current && e.is_active).length;
  const activeCount = employments.filter(e => e.is_active).length;
  const managerCount = employments.filter(e => e.is_manager && e.is_current).length;

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employments</h1>
          <p className="text-gray-500 mt-1">Manage employee assignments and positions</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            onClick={() => setShowExportModal(true)}
            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-1"
          >
            <Download size={14} /> Export
          </button>
          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            New Employment
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{pagination.total || 0}</div>
          <div className="text-sm text-gray-500">Total Employments</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">{currentCount}</div>
          <div className="text-sm text-gray-500">Current Active</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{managerCount}</div>
          <div className="text-sm text-gray-500">Managers</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-purple-600">
            {employments.filter(e => e.is_executive && e.is_current).length}
          </div>
          <div className="text-sm text-gray-500">Executives</div>
        </div>
      </div>
      <div className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by user ID or position..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showCurrentOnly}
                onChange={(e) => setShowCurrentOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Current Only
            </label>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${
              showFilters ? 'bg-blue-50 border-blue-300 text-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter size={16} />
            Filters
          </button>
        </div>
        {showFilters && (
          <div className="mt-3">
            <EmploymentFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              departments={[]} // Will be populated from API
            />
          </div>
        )}
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : employments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Users size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No employments found</p>
          <button
            onClick={handleCreate}
            className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Create your first employment →
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {employments.map((employment) => (
              <EmploymentCard
                key={employment.id}
                employment={employment}
                onSelect={() => handleView(employment.id)}
              />
            ))}
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Rows per page:</span>
                <select
                  value={pagination.pageSize}
                  onChange={handlePageSizeChange}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {((pagination.page - 1) * pagination.pageSize) + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDeleteConfirm(deleteTarget?.id)}
        title="Delete Employment Record"
        message={`Are you sure you want to delete the employment record for "${deleteTarget?.name || deleteTarget?.user_id}"?`}
        itemName={deleteTarget?.name || deleteTarget?.user_id}
      />
      <ExportOptionsModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        isExporting={isExporting}
      />
    </div>
  );
};
export default EmploymentList;