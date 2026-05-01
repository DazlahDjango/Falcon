import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, Filter, Edit2, Trash2, Eye, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TeamCard } from '../../components/structure/team';
import { ConfirmDeleteModal } from '../../components/structure/modals';
import { TeamFilters }from '../../components/structure/team';
import { useTeams, useTeamMutations } from '../../hooks/structure';
import { fetchTeams, deleteTeam, setTeamPage, setTeamPageSize, setTeamFilters, clearTeamFilters } from '../../store/structure';
import { selectTeams, selectTeamsLoading, selectTeamPagination, selectTeamFilters as selectFilters } from '../../store/structure/slice/structureSelectors';
import { STRUCTURE_ROUTES } from '../../routes/structure.routes';

const TeamList = ({ departmentId = null }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const teams = useSelector(selectTeams);
  const loading = useSelector(selectTeamsLoading);
  const pagination = useSelector(selectTeamPagination);
  const filters = useSelector(selectFilters);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  useEffect(() => {
    const appliedFilters = { ...filters, search: searchTerm };
    if (departmentId) appliedFilters.department_id = departmentId;
    dispatch(fetchTeams({
      page: pagination.page,
      pageSize: pagination.pageSize,
      filters: appliedFilters,
    }));
  }, [dispatch, pagination.page, pagination.pageSize, filters, searchTerm, departmentId]);
  const handlePageChange = (newPage) => {
    dispatch(setTeamPage(newPage));
  };
  const handlePageSizeChange = (e) => {
    dispatch(setTeamPageSize(parseInt(e.target.value)));
  };
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    dispatch(setTeamPage(1));
  };
  const handleFilterChange = (newFilters) => {
    dispatch(setTeamFilters(newFilters));
    dispatch(setTeamPage(1));
  };
  const handleClearFilters = () => {
    dispatch(clearTeamFilters());
    setSearchTerm('');
    dispatch(setTeamPage(1));
  };
  const handleCreate = () => {
    navigate(STRUCTURE_ROUTES.TEAM_CREATE, { state: { departmentId } });
  };
  const handleEdit = (id) => {
    navigate(STRUCTURE_ROUTES.TEAM_EDIT(id));
  };
  const handleView = (id) => {
    navigate(STRUCTURE_ROUTES.TEAM_DETAIL(id));
  };
  const handleDeleteConfirm = async (id) => {
    await dispatch(deleteTeam(id)).unwrap();
    setDeleteTarget(null);
  };
  
  return (
    <div className={departmentId ? '' : 'p-6'}>
      {!departmentId && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
              <p className="text-gray-500 mt-1">Manage your organizational teams</p>
            </div>
            <div className="flex gap-2 mt-4 sm:mt-0">
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                New Team
              </button>
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
                <TeamFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClear={handleClearFilters}
                />
              </div>
            )}
          </div>
        </>
      )}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Users size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No teams found</p>
          {!departmentId && (
            <button
              onClick={handleCreate}
              className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Create your first team →
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onClick={() => handleView(team.id)}
                memberCount={team.member_count || 0}
                actions={
                  <div className="flex gap-1 mt-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleView(team.id); }}
                      className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                      title="View"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(team.id); }}
                      className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: team.id, name: team.name }); }}
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
        title="Delete Team"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        itemName={deleteTarget?.name}
      />
    </div>
  );
};
export default TeamList;