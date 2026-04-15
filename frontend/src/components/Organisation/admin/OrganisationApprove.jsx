import React, { useState, useEffect } from 'react';
import { organisationApi } from '../../../services/organisation';
import toast from 'react-hot-toast';

const OrganisationApprove = () => {
  const [pendingOrgs, setPendingOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedOrgs, setSelectedOrgs] = useState(new Set());
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    fetchPendingOrganisations();
  }, []);

  const fetchPendingOrganisations = async () => {
    try {
      setLoading(true);
      const response = await organisationApi.getAll({ status: 'pending' });
      setPendingOrgs(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching pending organisations:', error);
      toast.error('Failed to load pending organisations');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orgId) => {
    setProcessing(true);
    try {
      await organisationApi.approve(orgId);
      toast.success('Organisation approved successfully');
      fetchPendingOrganisations();
      setSelectedOrgs(new Set());
    } catch (error) {
      toast.error(error.response?.data?.message || 'Approval failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedOrgs.size === 0) {
      toast.error('No organisations selected');
      return;
    }
    
    setProcessing(true);
    try {
      const promises = Array.from(selectedOrgs).map(id => organisationApi.approve(id));
      await Promise.all(promises);
      toast.success(`${selectedOrgs.size} organisations approved successfully`);
      fetchPendingOrganisations();
      setSelectedOrgs(new Set());
    } catch (error) {
      toast.error(error.response?.data?.message || 'Bulk approval failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (orgId) => {
    if (!confirm('Are you sure you want to reject this organisation?')) return;
    
    setProcessing(true);
    try {
      await organisationApi.reject(orgId);
      toast.success('Organisation rejected');
      fetchPendingOrganisations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Rejection failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleReview = (org) => {
    setSelectedOrg(org);
    setReviewNotes('');
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    setProcessing(true);
    try {
      await organisationApi.submitReview(selectedOrg.id, { notes: reviewNotes });
      toast.success('Review submitted');
      setShowReviewModal(false);
      fetchPendingOrganisations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setProcessing(false);
    }
  };

  const toggleSelect = (orgId) => {
    const newSelected = new Set(selectedOrgs);
    if (newSelected.has(orgId)) {
      newSelected.delete(orgId);
    } else {
      newSelected.add(orgId);
    }
    setSelectedOrgs(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedOrgs.size === pendingOrgs.length) {
      setSelectedOrgs(new Set());
    } else {
      setSelectedOrgs(new Set(pendingOrgs.map(org => org.id)));
    }
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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and approve new organisation registrations
          </p>
        </div>
        {selectedOrgs.size > 0 && (
          <button
            onClick={handleBulkApprove}
            disabled={processing}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Approve Selected ({selectedOrgs.size})
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{pendingOrgs.length}</p>
          <p className="text-xs text-yellow-600">Pending Approval</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {pendingOrgs.filter(o => o.is_verified).length}
          </p>
          <p className="text-xs text-blue-600">Pre-verified</p>
        </div>
        <div className="bg-purple-50 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">
            {pendingOrgs.filter(o => new Date(o.created_at) > new Date(Date.now() - 7 * 86400000)).length}
          </p>
          <p className="text-xs text-purple-600">Last 7 days</p>
        </div>
      </div>

      {/* Organisations Table */}
      {pendingOrgs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
          <p className="mt-1 text-sm text-gray-500">All caught up! No organisations waiting for approval.</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedOrgs.size === pendingOrgs.length && pendingOrgs.length > 0}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organisation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Industry</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingOrgs.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedOrgs.has(org.id)}
                        onChange={() => toggleSelect(org.id)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{org.name}</div>
                      <div className="text-xs text-gray-500">{org.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{org.contact_email}</div>
                      <div className="text-xs text-gray-500">{org.contact_phone || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{org.industry || 'Not specified'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(org.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => handleReview(org)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Review
                      </button>
                      <button
                        onClick={() => handleApprove(org.id)}
                        disabled={processing}
                        className="text-green-600 hover:text-green-900"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(org.id)}
                        disabled={processing}
                        className="text-red-600 hover:text-red-900"
                      >
                        Reject
                      </button>
                    </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedOrg && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Review Organisation</h2>
              <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-gray-500 text-2xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">{selectedOrg.name}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">Email:</span> {selectedOrg.contact_email}</div>
                  <div><span className="text-gray-500">Phone:</span> {selectedOrg.contact_phone || 'N/A'}</div>
                  <div><span className="text-gray-500">Website:</span> {selectedOrg.website || 'N/A'}</div>
                  <div><span className="text-gray-500">Industry:</span> {selectedOrg.industry || 'N/A'}</div>
                  <div className="col-span-2"><span className="text-gray-500">Address:</span> {selectedOrg.address || 'N/A'}</div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Review Notes</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Add any notes about this organisation..."
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={processing}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganisationApprove;