import React, { useState, useEffect } from 'react';
import OrganisationCard from './components/OrganisationCard';
import OrganisationFilters from './components/OrganisationFilters';
import OrganisationDetailModal from './components/OrganisationDetailModal';
import { organisationApi } from '../../../services/organisation';
import toast from 'react-hot-toast';

const OrganisationList = () => {
  const [organisations, setOrganisations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [selectedOrganisation, setSelectedOrganisation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    sector: '',
    date_range: '',
  });

  useEffect(() => {
    fetchOrganisations();
  }, [filters]);

  const fetchOrganisations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.sector) params.sector = filters.sector;
      if (filters.date_range) params.days = filters.date_range;
      
      const response = await organisationApi.getAll(params);
      setOrganisations(response.data.results || response.data || []);
      setTotal(response.data.count || response.data.length || 0);
    } catch (error) {
      console.error('Error fetching organisations:', error);
      toast.error('Failed to load organisations');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (organisation) => {
    try {
      await organisationApi.approve(organisation.id);
      toast.success(`${organisation.name} approved successfully`);
      fetchOrganisations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Approval failed');
    }
  };

  const handleSuspend = async (organisation) => {
    if (!confirm(`Are you sure you want to suspend ${organisation.name}?`)) return;
    try {
      await organisationApi.suspend(organisation.id);
      toast.success(`${organisation.name} suspended`);
      fetchOrganisations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Suspend failed');
    }
  };

  const handleActivate = async (organisation) => {
    try {
      await organisationApi.activate(organisation.id);
      toast.success(`${organisation.name} activated`);
      fetchOrganisations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Activation failed');
    }
  };

  const handleView = (organisation) => {
    setSelectedOrganisation(organisation);
    setShowDetailModal(true);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: '',
      sector: '',
      date_range: '',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Organisations</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage all organisations in the Falcon PMS platform
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{total}</p>
          <p className="text-xs text-gray-500">Total Organisations</p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {organisations.filter(o => o.status === 'pending').length}
          </p>
          <p className="text-xs text-yellow-600">Pending Approval</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {organisations.filter(o => o.status === 'active').length}
          </p>
          <p className="text-xs text-green-600">Active</p>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-red-600">
            {organisations.filter(o => o.status === 'suspended').length}
          </p>
          <p className="text-xs text-red-600">Suspended</p>
        </div>
      </div>

      {/* Filters */}
      <OrganisationFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Organisation List */}
      {organisations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No organisations found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {organisations.map((org) => (
            <OrganisationCard
              key={org.id}
              organisation={org}
              onApprove={handleApprove}
              onSuspend={handleSuspend}
              onActivate={handleActivate}
              onView={handleView}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && (
        <OrganisationDetailModal
          organisation={selectedOrganisation}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedOrganisation(null);
          }}
        />
      )}
    </div>
  );
};

export default OrganisationList;