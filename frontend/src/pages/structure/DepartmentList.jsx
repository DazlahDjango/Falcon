import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, Filter, Edit2, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DepartmentCard } from '../../components/structure/department';
import { ConfirmDeleteModal, BulkUploadModal } from '../../components/structure/modals';
import DepartmentFilters from '../../components/structure/department/DepartmentFilters';
import { useDepartments, useDepartmentMutations, useDepartmentStats } from '../../hooks/structure';
// Redux Actions
import {
  fetchDepartments,
  deleteDepartment,
  setDepartmentPage,
  setDepartmentPageSize,
  setDepartmentFilters,
  clearDepartmentFilters,
  openDepartmentModal,
  openConfirmDelete,
  closeConfirmDelete,
  openBulkUpload,
  closeBulkUpload,
  selectDepartments,
  selectDepartmentsLoading,
  selectDepartmentPagination,
  selectDepartmentFilters as selectFilters,
} from '../../store/structure';
// Constants
import { STRUCTURE_ROUTES } from '../../routes/structure.routes';

const DepartmentList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Redux state
  const departments = useSelector(selectDepartments);
  const loading = useSelector(selectDepartmentsLoading);
  const pagination = useSelector(selectDepartmentPagination);
  const filters = useSelector(selectFilters);
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  // Fetch data
  useEffect(() => {
    dispatch(fetchDepartments({
      page: pagination.page,
      pageSize: pagination.pageSize,
      filters: { ...filters, search: searchTerm },
    }));
  }, [dispatch, pagination.page, pagination.pageSize, filters, searchTerm]);
  // Handlers
  const handlePageChange = (newPage) => {
    dispatch(setDepartmentPage(newPage));
  };
  const handlePageSizeChange = (e) => {
    dispatch(setDepartmentPageSize(parseInt(e.target.value)));
  };
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    dispatch(setDepartmentPage(1));
  };
  const handleFilterChange = (newFilters) => {
    dispatch(setDepartmentFilters(newFilters));
    dispatch(setDepartmentPage(1));
  };
  const handleClearFilters = () => {
    dispatch(clearDepartmentFilters());
    setSearchTerm('');
    dispatch(setDepartmentPage(1));
  };
  const handleCreate = () => {
    navigate(STRUCTURE_ROUTES.DEPARTMENT_CREATE);
  };
  const handleEdit = (id) => {
    navigate(STRUCTURE_ROUTES.DEPARTMENT_EDIT(id));
  };
  const handleView = (id) => {
    navigate(STRUCTURE_ROUTES.DEPARTMENT_DETAIL(id));
  };
  const handleDeleteClick = (id, name) => {
    setDeleteTarget({ id, name });
    dispatch(openConfirmDelete({
      title: 'Delete Department',
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      onConfirm: () => handleDeleteConfirm(id),
    }));
  };
  const handleDeleteConfirm = async (id) => {
    await dispatch(deleteDepartment(id)).unwrap();
    setDeleteTarget(null);
  };
  const handleBulkUpload = () => {
    dispatch(openBulkUpload({ type: 'departments' }));
  };
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-500 mt-1">Manage your organizational departments and hierarchy</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            onClick={handleBulkUpload}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Bulk Upload
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            New Department
          </button>
        </div>
      </div>
      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by name or code..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
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
            <DepartmentFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClear={handleClearFilters}
            />
          </div>
        )}
      </div>
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{pagination.total || 0}</div>
          <div className="text-sm text-gray-500">Total Departments</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {departments.filter(d => d.is_active).length}
          </div>
          <div className="text-sm text-gray-500">Active</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-purple-600">
            {departments.filter(d => d.parent === null).length}
          </div>
          <div className="text-sm text-gray-500">Root Departments</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">
            {Math.max(...departments.map(d => d.depth || 0), 0)}
          </div>
          <div className="text-sm text-gray-500">Max Depth</div>
        </div>
      </div>
      {/* Departments Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : departments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No departments found</p>
          <button
            onClick={handleCreate}
            className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Create your first department →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((department) => (
            <DepartmentCard
              key={department.id}
              department={department}
              onClick={() => handleView(department.id)}
              actions={
                <div className="flex gap-1 mt-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleView(department.id); }}
                    className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                    title="View"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(department.id); }}
                    className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(department.id, department.name); }}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              }
            />
          ))}
        </div>
      )}
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Rows per page:</span>
            <select
              value={pagination.pageSize}
              onChange={handlePageSizeChange}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
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
    </div>
  );
};
export default DepartmentList;