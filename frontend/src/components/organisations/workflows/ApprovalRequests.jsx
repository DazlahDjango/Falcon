import React, { useState, useEffect } from 'react';
import ApprovalCard from './components/ApprovalCard';
import ApprovalActions from './components/ApprovalActions';
import { approvalApi } from '../../../services/organisations';
import toast from 'react-hot-toast';

const ApprovalRequests = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    in_review: 0,
  });

  useEffect(() => {
    fetchApprovals();
  }, [filter]);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await approvalApi.getRequests(params);
      const data = response.data.results || response.data || [];
      setApprovals(data);
      
      // Calculate stats
      setStats({
        pending: data.filter(a => a.status === 'pending').length,
        approved: data.filter(a => a.status === 'approved').length,
        rejected: data.filter(a => a.status === 'rejected').length,
        in_review: data.filter(a => a.status === 'in_review').length,
      });
    } catch (error) {
      console.error('Error fetching approvals:', error);
      toast.error('Failed to load approval requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approval, comment) => {
    setActionLoading(true);
    try {
      await approvalApi.approve(approval.id, { comment });
      toast.success('Request approved successfully');
      fetchApprovals();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (approval, comment) => {
    setActionLoading(true);
    try {
      await approvalApi.reject(approval.id, { comment });
      toast.success('Request rejected');
      fetchApprovals();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestChanges = async (approval, comment) => {
    setActionLoading(true);
    try {
      await approvalApi.requestChanges(approval.id, { comment });
      toast.success('Changes requested');
      fetchApprovals();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request changes');
    } finally {
      setActionLoading(false);
    }
  };

  const pendingApprovals = approvals.filter(a => a.status === 'pending');
  const otherApprovals = approvals.filter(a => a.status !== 'pending');

  const filterOptions = [
    { value: 'all', label: 'All Requests' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'in_review', label: 'In Review' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Approval Requests</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and manage pending approval requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-xs text-yellow-600">Pending</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          <p className="text-xs text-green-600">Approved</p>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          <p className="text-xs text-red-600">Rejected</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.in_review}</p>
          <p className="text-xs text-blue-600">In Review</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                filter === option.value
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {option.label}
              {option.value !== 'all' && (
                <span className="ml-2 text-xs">
                  ({stats[option.value] || 0})
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Pending Approvals Section */}
      {filter === 'all' && pendingApprovals.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">⚠️ Awaiting Your Review</h2>
          <div className="space-y-4">
            {pendingApprovals.map((approval) => (
              <div key={approval.id} className="bg-white shadow rounded-lg overflow-hidden">
                <ApprovalCard
                  approval={approval}
                  onApprove={() => handleApprove(approval)}
                  onReject={() => handleReject(approval)}
                  loading={actionLoading}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Approvals List */}
      {(filter !== 'all' ? approvals : otherApprovals).length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No approval requests</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all' ? 'All caught up! No pending approvals.' : `No ${filter} requests found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {(filter !== 'all' ? approvals : otherApprovals).map((approval) => (
            <div key={approval.id} className="bg-white shadow rounded-lg overflow-hidden">
              <ApprovalCard
                approval={approval}
                onApprove={() => handleApprove(approval)}
                onReject={() => handleReject(approval)}
                loading={actionLoading}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApprovalRequests;