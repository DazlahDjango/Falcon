import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ApprovalActions from './components/ApprovalActions';
import { approvalApi } from '../../../services/organisations';
import toast from 'react-hot-toast';

const ApprovalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [approval, setApproval] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchApproval();
  }, [id]);

  const fetchApproval = async () => {
    try {
      setLoading(true);
      const response = await approvalApi.getById(id);
      setApproval(response.data);
    } catch (error) {
      console.error('Error fetching approval:', error);
      toast.error('Failed to load approval details');
      navigate('/workflows/requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approvalData, comment) => {
    setActionLoading(true);
    try {
      await approvalApi.approve(approvalData.id, { comment });
      toast.success('Request approved successfully');
      fetchApproval();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (approvalData, comment) => {
    setActionLoading(true);
    try {
      await approvalApi.reject(approvalData.id, { comment });
      toast.success('Request rejected');
      fetchApproval();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestChanges = async (approvalData, comment) => {
    setActionLoading(true);
    try {
      await approvalApi.requestChanges(approvalData.id, { comment });
      toast.success('Changes requested');
      fetchApproval();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request changes');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
      in_review: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Review' },
    };
    const c = config[status] || config.pending;
    return <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!approval) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Approval not found</p>
        <Link to="/workflows/requests" className="text-indigo-600 hover:text-indigo-900 mt-2 inline-block">
          Back to Approvals
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/workflows/requests" className="text-sm text-indigo-600 hover:text-indigo-900">
          ← Back to Approvals
        </Link>
        <div className="flex justify-between items-center mt-2">
          <h1 className="text-2xl font-bold text-gray-900">{approval.title}</h1>
          {getStatusBadge(approval.status)}
        </div>
      </div>

      {/* Approval Details */}
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">Request Information</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Type</dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">{approval.type}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Submitted By</dt>
                <dd className="mt-1 text-sm text-gray-900">{approval.submitted_by_name || approval.submitted_by_email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Submitted On</dt>
                <dd className="mt-1 text-sm text-gray-900">{new Date(approval.created_at).toLocaleString()}</dd>
              </div>
              {approval.due_date && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Due Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">{new Date(approval.due_date).toLocaleDateString()}</dd>
                </div>
              )}
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{approval.description || 'No description provided'}</dd>
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        {approval.details && Object.keys(approval.details).length > 0 && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">Request Details</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(approval.details).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-sm font-medium text-gray-500">{key.replace(/_/g, ' ')}</dt>
                    <dd className="mt-1 text-sm text-gray-900">{value}</dd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Comments/History */}
        {approval.comments && approval.comments.length > 0 && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">Comments & History</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {approval.comments.map((comment, idx) => (
                <div key={idx} className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 text-sm">{comment.user_name?.charAt(0) || '?'}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{comment.user_name || comment.user_email}</span>
                        <span className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{comment.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons (for pending approvals) */}
        {approval.status === 'pending' && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">Actions</h2>
            </div>
            <div className="p-6">
              <ApprovalActions
                approval={approval}
                onApprove={handleApprove}
                onReject={handleReject}
                onRequestChanges={handleRequestChanges}
                loading={actionLoading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalDetail;