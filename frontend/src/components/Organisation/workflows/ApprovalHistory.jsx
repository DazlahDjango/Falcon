import React, { useState, useEffect } from 'react';
import ApprovalCard from './components/ApprovalCard';
import { approvalApi } from '../../../services/organisation';
import toast from 'react-hot-toast';

const ApprovalHistory = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    fetchHistory();
  }, [filter, dateRange]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = {
        status: filter !== 'all' ? filter : undefined,
        days: dateRange,
      };
      const response = await approvalApi.getHistory(params);
      setApprovals(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching approval history:', error);
      toast.error('Failed to load approval history');
    } finally {
      setLoading(false);
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'in_review', label: 'In Review' },
  ];

  const dateRangeOptions = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' },
    { value: '365', label: 'Last year' },
    { value: 'all', label: 'All time' },
  ];

  const filteredApprovals = approvals.filter(approval => {
    if (!searchTerm) return true;
    return (
      approval.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.submitted_by_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.submitted_by_email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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
        <h1 className="text-2xl font-bold text-gray-900">Approval History</h1>
        <p className="mt-1 text-sm text-gray-500">
          View past approval requests and decisions
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {filterOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {dateRangeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or submitter..."
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg shadow p-3 text-center">
          <p className="text-xl font-bold text-green-600">
            {approvals.filter(a => a.status === 'approved').length}
          </p>
          <p className="text-xs text-green-600">Approved</p>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-3 text-center">
          <p className="text-xl font-bold text-red-600">
            {approvals.filter(a => a.status === 'rejected').length}
          </p>
          <p className="text-xs text-red-600">Rejected</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-3 text-center">
          <p className="text-xl font-bold text-blue-600">
            {approvals.filter(a => a.status === 'in_review').length}
          </p>
          <p className="text-xs text-blue-600">In Review</p>
        </div>
      </div>

      {/* Approval List */}
      {filteredApprovals.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No approval history found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your filters or date range.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApprovals.map((approval) => (
            <div key={approval.id} className="bg-white shadow rounded-lg overflow-hidden">
              <ApprovalCard approval={approval} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApprovalHistory;