import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, Filter, Edit2, Trash2, Eye, ChevronLeft, ChevronRight, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CostCenterCard, CostCenterTree } from '../../components/structure/cost-center';
import { ConfirmDeleteModal } from '../../components/structure/modals';
import { useCostCenters, useCostCenterMutations } from '../../hooks/structure';
import { fetchCostCenters, deleteCostCenter, setCostCenterPage, setCostCenterPageSize } from '../../store/structure';
import { selectCostCenters, selectCostCentersLoading, selectCostCenterPagination } from '../../store/structure/slice/structureSelectors';
import { STRUCTURE_ROUTES } from '../../routes/structure.routes';

const CostCenterList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const costCenters = useSelector(selectCostCenters);
  const loading = useSelector(selectCostCentersLoading);
  const pagination = useSelector(selectCostCenterPagination);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'tree'
  const [deleteTarget, setDeleteTarget] = useState(null);
  useEffect(() => {
    dispatch(fetchCostCenters({
      page: pagination.page,
      pageSize: pagination.pageSize,
      filters: { search: searchTerm },
    }));
  }, [dispatch, pagination.page, pagination.pageSize, searchTerm]);
  const handlePageChange = (newPage) => {
    dispatch(setCostCenterPage(newPage));
  };
  const handlePageSizeChange = (e) => {
    dispatch(setCostCenterPageSize(parseInt(e.target.value)));
  };
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    dispatch(setCostCenterPage(1));
  };
  const handleCreate = () => {
    navigate(STRUCTURE_ROUTES.COST_CENTER_CREATE);
  };
  const handleEdit = (id) => {
    navigate(STRUCTURE_ROUTES.COST_CENTER_EDIT(id));
  };
  const handleView = (id) => {
    // View logic - could navigate to detail page
  };
  const handleDeleteConfirm = async (id) => {
    await dispatch(deleteCostCenter(id)).unwrap();
    setDeleteTarget(null);
  };
  const totalBudget = costCenters.reduce((sum, cc) => sum + (cc.budget_amount || 0), 0);
  const activeCount = costCenters.filter(cc => cc.is_active).length;

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cost Centers</h1>
          <p className="text-gray-500 mt-1">Manage financial cost centers and budgets</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600'}`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1.5 text-sm ${viewMode === 'tree' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600'}`}
            >
              Tree
            </button>
          </div>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            New Cost Center
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{pagination.total || 0}</div>
          <div className="text-sm text-gray-500">Total Cost Centers</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          <div className="text-sm text-gray-500">Active</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">
            {costCenters.filter(cc => cc.is_shared).length}
          </div>
          <div className="text-sm text-gray-500">Shared Services</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-purple-600">
            ${totalBudget.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Total Budget</div>
        </div>
      </div>
      <div className="mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search by code or name..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
        </div>
      ) : viewMode === 'tree' ? (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <CostCenterTree
            costCenters={costCenters}
            onSelect={(cc) => handleView(cc.id)}
          />
        </div>
      ) : costCenters.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <DollarSign size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No cost centers found</p>
          <button
            onClick={handleCreate}
            className="mt-3 text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            Create your first cost center →
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {costCenters.map((costCenter) => (
              <CostCenterCard
                key={costCenter.id}
                costCenter={costCenter}
                onClick={() => handleView(costCenter.id)}
                actions={
                  <div className="flex gap-1 mt-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(costCenter.id); }}
                      className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: costCenter.id, name: costCenter.name }); }}
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
        title="Delete Cost Center"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        itemName={deleteTarget?.name}
      />
    </div>
  );
};
export default CostCenterList;