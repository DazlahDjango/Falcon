import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, Filter, Eye, Edit2, Trash2, ChevronLeft, ChevronRight, GitBranch } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ReportingLineCard } from '../../components/structure/reporting';
import { ConfirmDeleteModal } from '../../components/structure/modals';
import { useReportingLine, useReportingLineMutations } from '../../hooks/structure';
import { fetchReportingLines, deleteReportingLine, setReportingPage } from '../../store/structure';
import { selectReportingLines, selectReportingLinesLoading, selectReportingPagination } from '../../store/structure/slice/structureSelectors';
import { STRUCTURE_ROUTES } from '../../routes/structure.routes';
import { REPORTING_RELATION_TYPE_LABELS } from '../../config/constants/structureConstants';

const ReportingLineList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reportingLines = useSelector(selectReportingLines);
  const loading = useSelector(selectReportingLinesLoading);
  const pagination = useSelector(selectReportingPagination);
  const [searchTerm, setSearchTerm] = useState('');
  const [relationFilter, setRelationFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  useEffect(() => {
    dispatch(fetchReportingLines({
      page: pagination.page,
      pageSize: pagination.pageSize,
      filters: { search: searchTerm, relation_type: relationFilter },
    }));
  }, [dispatch, pagination.page, pagination.pageSize, searchTerm, relationFilter]);
  const handlePageChange = (newPage) => {
    dispatch(setReportingPage(newPage));
  };
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    dispatch(setReportingPage(1));
  };
  const handleCreate = () => {
    navigate(STRUCTURE_ROUTES.REPORTING_LINE_CREATE);
  };
  const handleEdit = (id) => {
    navigate(STRUCTURE_ROUTES.REPORTING_LINE_EDIT(id));
  };
  const handleView = (id) => {
  };
  const handleDeleteConfirm = async (id) => {
    await dispatch(deleteReportingLine(id)).unwrap();
    setDeleteTarget(null);
  };
  const solidCount = reportingLines.filter(r => r.relation_type === 'solid').length;
  const dottedCount = reportingLines.filter(r => r.relation_type === 'dotted').length;
  const interimCount = reportingLines.filter(r => r.relation_type === 'interim').length;

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reporting Lines</h1>
          <p className="text-gray-500 mt-1">Manage manager-employee reporting relationships</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            New Reporting Line
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{solidCount}</div>
          <div className="text-sm text-gray-500">{REPORTING_RELATION_TYPE_LABELS.solid}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{dottedCount}</div>
          <div className="text-sm text-gray-500">{REPORTING_RELATION_TYPE_LABELS.dotted}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{interimCount}</div>
          <div className="text-sm text-gray-500">{REPORTING_RELATION_TYPE_LABELS.interim}</div>
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
              placeholder="Search by employee or manager ID..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <select
            value={relationFilter}
            onChange={(e) => setRelationFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Relations</option>
            <option value="solid">Solid Line</option>
            <option value="dotted">Dotted Line</option>
            <option value="interim">Interim</option>
            <option value="project">Project-Based</option>
            <option value="matrix">Matrix</option>
          </select>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : reportingLines.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <GitBranch size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No reporting lines found</p>
          <button
            onClick={handleCreate}
            className="mt-3 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            Create your first reporting line →
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {reportingLines.map((line) => (
              <ReportingLineCard
                key={line.id}
                reportingLine={line}
                onEdit={() => handleEdit(line.id)}
                onDelete={() => setDeleteTarget({ id: line.id, name: `${line.employee_user_id} → ${line.manager_user_id}` })}
              />
            ))}
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                >
                  Next
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
        title="Delete Reporting Line"
        message={`Are you sure you want to delete the reporting relationship "${deleteTarget?.name}"?`}
        itemName={deleteTarget?.name}
      />
    </div>
  );
};
export default ReportingLineList;