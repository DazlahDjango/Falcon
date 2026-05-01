import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, Filter, Edit2, Trash2, Eye, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LocationCard, LocationMap } from '../../components/structure/location';
import { ConfirmDeleteModal } from '../../components/structure/modals';
import { useLocations, useLocationMutations } from '../../hooks/structure';
import { fetchLocations, deleteLocation, setLocationPage, setLocationPageSize } from '../../store/structure';
import { selectLocations, selectLocationLoading, selectLocationPagination } from '../../store/structure';
import { STRUCTURE_ROUTES } from '../../routes/structure.routes';
import { LOCATION_TYPE_LABELS } from '../../config/constants/structureConstants';

const LocationList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const locations = useSelector(selectLocations);
  const loading = useSelector(selectLocationLoading);
  const pagination = useSelector(selectLocationPagination);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  useEffect(() => {
    dispatch(fetchLocations({
      page: pagination.page,
      pageSize: pagination.pageSize,
      filters: { search: searchTerm, type: typeFilter },
    }));
  }, [dispatch, pagination.page, pagination.pageSize, searchTerm, typeFilter]);
  const handlePageChange = (newPage) => {
    dispatch(setLocationPage(newPage));
  };
  const handlePageSizeChange = (e) => {
    dispatch(setLocationPageSize(parseInt(e.target.value)));
  };
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    dispatch(setLocationPage(1));
  };
  const handleCreate = () => {
    navigate(STRUCTURE_ROUTES.LOCATION_CREATE);
  };
  const handleEdit = (id) => {
    navigate(STRUCTURE_ROUTES.LOCATION_EDIT(id));
  };
  const handleView = (id) => {
  };
  const handleDeleteConfirm = async (id) => {
    await dispatch(deleteLocation(id)).unwrap();
    setDeleteTarget(null);
  };
  const headquarters = locations.find(l => l.is_headquarters);
  const countries = [...new Set(locations.map(l => l.country).filter(Boolean))];

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
          <p className="text-gray-500 mt-1">Manage office locations and facilities</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            onClick={() => setShowMap(!showMap)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1"
          >
            <MapPin size={14} /> {showMap ? 'Hide Map' : 'Show Map'}
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            New Location
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{pagination.total || 0}</div>
          <div className="text-sm text-gray-500">Total Locations</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">{locations.filter(l => l.is_active).length}</div>
          <div className="text-sm text-gray-500">Active</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{countries.length}</div>
          <div className="text-sm text-gray-500">Countries</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-amber-600">
            {locations.reduce((sum, l) => sum + (l.seating_capacity || 0), 0)}
          </div>
          <div className="text-sm text-gray-500">Total Capacity</div>
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
              placeholder="Search by name, city, or country..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Types</option>
            {Object.entries(LOCATION_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>
      {showMap && (
        <div className="mb-6">
          <LocationMap
            locations={locations}
            height={300}
          />
        </div>
      )}
      {headquarters && !showMap && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
          <span className="text-2xl">🏢</span>
          <div>
            <span className="font-medium text-amber-800">Headquarters:</span>
            <span className="text-amber-700 ml-2">{headquarters.name} - {headquarters.city}, {headquarters.country}</span>
          </div>
        </div>
      )}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
        </div>
      ) : locations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <MapPin size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No locations found</p>
          <button
            onClick={handleCreate}
            className="mt-3 text-teal-600 hover:text-teal-700 text-sm font-medium"
          >
            Add your first location →
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                onClick={() => handleView(location.id)}
                actions={
                  <div className="flex gap-1 mt-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(location.id); }}
                      className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: location.id, name: location.name }); }}
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
        title="Delete Location"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        itemName={deleteTarget?.name}
      />
    </div>
  );
};
export default LocationList;