import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, Filter, Edit2, Trash2, Eye, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PositionCard, VacantPositionBadge, PositionLevelTag } from '../../components/structure/position';
import { ConfirmDeleteModal } from '../../components/structure/modals';
import { usePositions, usePositionMutations, usePositionStats } from '../../hooks/structure';
import { fetchPositions, deletePosition, setPositionPage, setPositionPageSize, setPositionFilters, clearPositionFilters } from '../../store/structure';
import { selectPositions, selectPositionsLoading, selectPositionPagination, selectPositionFilters as selectFilters } from '../../store/structure/slice/structureSelectors';
import { STRUCTURE_ROUTES } from '../../routes/structure.routes';

const PositionList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const positions = useSelector(selectPositions);
  const loading = useSelector(selectPositionsLoading);
  const pagination = useSelector(selectPositionPagination);
  const filters = useSelector(selectFilters);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  useEffect(() => {
    dispatch(fetchPositions({
      page: pagination.page,
      pageSize: pagination.pageSize,
      filters: { ...filters, search: searchTerm },
    }));
  }, [dispatch, pagination.page, pagination.pageSize, filters, searchTerm]);
  const handlePageChange = (newPage) => {
    dispatch(setPositionPage(newPage));
  };
  const handlePageSizeChange = (e) => {
    dispatch(setPositionPageSize(parseInt(e.target.value)));
  };
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    dispatch(setPositionPage(1));
  };
  const handleFilterChange = (newFilters) => {
    dispatch(setPositionFilters(newFilters));
    dispatch(setPositionPage(1));
  };
  const handleClearFilters = () => {
    dispatch(clearPositionFilters());
    setSearchTerm('');
    dispatch(setPositionPage(1));
  };
  const handleCreate = () => {
    navigate(STRUCTURE_ROUTES.POSITION_CREATE);
  };
  const handleEdit = (id) => {
    navigate(STRUCTURE_ROUTES.POSITION_EDIT(id));
  };
  const handleView = (id) => {
    navigate(STRUCTURE_ROUTES.POSITION_DETAIL(id));
  };
  const handleDeleteConfirm = async (id) => {
    await dispatch(deletePosition(id)).unwrap();
    setDeleteTarget(null);
  };
  const vacantCount = positions.filter(p => p.current_incumbents_count === 0).length;

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Positions</h1>
          <p className="text-gray-500 mt-1">Manage job positions and roles</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            New Position
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{pagination.total || 0}</div>
          <div className="text-sm text-gray-500">Total Positions</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-amber-600">{vacantCount}</div>
          <div className="text-sm text-gray-500">Vacant Positions</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">{positions.length - vacantCount}</div>
          <div className="text-sm text-gray-500">Occupied</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">
            {positions.filter(p => p.is_single_incumbent).length}
          </div>
          <div className="text-sm text-gray-500">Single Incumbent</div>
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
              placeholder="Search by title or job code..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${
              showFilters ? 'bg-purple-50 border-purple-300 text-purple-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter size={16} />
            Filters
          </button>
        </div>
        {showFilters && (
          <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                value={filters.level || ''}
                onChange={(e) => handleFilterChange({ level: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Levels</option>
                {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(l => (
                  <option key={l} value={l}>Level {l}</option>
                ))}
              </select>
              <select
                value={filters.grade || ''}
                onChange={(e) => handleFilterChange({ grade: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Grades</option>
                <option value="P4">P4</option>
                <option value="P5">P5</option>
                <option value="M1">M1</option>
                <option value="M2">M2</option>
                <option value="M3">M3</option>
                <option value="D1">D1</option>
                <option value="D2">D2</option>
              </select>
              <select
                value={filters.is_vacant || ''}
                onChange={(e) => handleFilterChange({ is_vacant: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Positions</option>
                <option value="true">Vacant Only</option>
                <option value="false">Occupied Only</option>
              </select>
            </div>
            <button
              onClick={handleClearFilters}
              className="mt-3 text-sm text-gray-500 hover:text-gray-700"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
        </div>
      ) : positions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Briefcase size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No positions found</p>
          <button
            onClick={handleCreate}
            className="mt-3 text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            Create your first position →
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {positions.map((position) => (
              <PositionCard
                key={position.id}
                position={position}
                onClick={() => handleView(position.id)}
                actions={
                  <div className="flex gap-1 mt-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleView(position.id); }}
                      className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                      title="View"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(position.id); }}
                      className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: position.id, name: position.title }); }}
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
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm text-gray-600">Page {pagination.page} of {pagination.totalPages}</span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
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
        title="Delete Position"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        itemName={deleteTarget?.name}
      />
    </div>
  );
};
export default PositionList;