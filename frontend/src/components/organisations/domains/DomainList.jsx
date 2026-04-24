import React, { useState, useEffect } from 'react';
import DomainCard from './components/DomainCard';
import AddDomainForm from './components/AddDomainForm';
import { domainApi } from '../../../services/organisations';
import toast from 'react-hot-toast';

const DomainList = () => {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      setLoading(true);
      const response = await domainApi.getAll();
      setDomains(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching domains:', error);
      toast.error('Failed to load domains');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (data) => {
    setFormLoading(true);
    try {
      await domainApi.create(data);
      toast.success('Domain added successfully');
      setShowAddForm(false);
      fetchDomains();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add domain');
    } finally {
      setFormLoading(false);
    }
  };

  const handleVerify = async (domain) => {
    try {
      await domainApi.verify(domain.id);
      toast.success(`Verification started for ${domain.domain_name}`);
      fetchDomains();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    }
  };

  const handleSetPrimary = async (domain) => {
    try {
      await domainApi.setPrimary(domain.id);
      toast.success(`${domain.domain_name} is now the primary domain`);
      fetchDomains();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to set primary domain');
    }
  };

  const handleDelete = async (domain) => {
    if (!confirm(`Are you sure you want to delete ${domain.domain_name}?`)) return;
    try {
      await domainApi.delete(domain.id);
      toast.success('Domain deleted successfully');
      fetchDomains();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const primaryDomain = domains.find(d => d.is_primary);
  const otherDomains = domains.filter(d => !d.is_primary);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Custom Domains</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage custom domains for your organisation
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          + Add Domain
        </button>
      </div>

      {/* Info Box */}
      <div className="mb-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800">About Custom Domains</h3>
        <p className="text-sm text-blue-700 mt-1">
          Add your own domain to access Falcon PMS at a custom URL like pms.yourcompany.com.
          You'll need to verify domain ownership by adding a TXT record to your DNS.
        </p>
      </div>

      {/* Primary Domain Section */}
      {primaryDomain && (
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">⭐ Primary Domain</h2>
          <DomainCard
            domain={primaryDomain}
            onVerify={handleVerify}
            onSetPrimary={handleSetPrimary}
            onDelete={handleDelete}
          />
        </div>
      )}

      {/* Other Domains Section */}
      {otherDomains.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Domains</h2>
          <div className="space-y-4">
            {otherDomains.map((domain) => (
              <DomainCard
                key={domain.id}
                domain={domain}
                onVerify={handleVerify}
                onSetPrimary={handleSetPrimary}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {domains.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.66 0 3-4 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4-3-9s1.34-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No custom domains</h3>
          <p className="mt-1 text-sm text-gray-500">Add your first custom domain to get started.</p>
        </div>
      )}

      {/* Add Domain Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add Custom Domain</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-500 text-2xl"
              >
                ×
              </button>
            </div>
            <AddDomainForm
              onSubmit={handleAdd}
              onCancel={() => setShowAddForm(false)}
              loading={formLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DomainList;