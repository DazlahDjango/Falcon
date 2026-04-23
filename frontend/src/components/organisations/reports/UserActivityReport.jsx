import React, { useState, useEffect } from 'react';
import ReportFilters from './components/ReportFilters';
import ExportReportModal from './components/ExportReportModal';
import { userApi, departmentApi } from '../../../services/organisations';
import toast from 'react-hot-toast';

const UserActivityReport = () => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({
    date_range: '30',
    department: '',
    format: 'pdf',
  });

  useEffect(() => {
    fetchDepartments();
    generateReport();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await departmentApi.getAll();
      setDepartments(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.date_range && filters.date_range !== 'custom') {
        params.days = filters.date_range;
      }
      if (filters.department) params.department = filters.department;
      
      const response = await userApi.getActivityReport(params);
      setReportData(response.data);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      date_range: '30',
      department: '',
      format: 'pdf',
    });
    generateReport();
  };

  const handleGenerate = () => {
    generateReport();
  };

  const handleExport = async (exportOptions) => {
    setGenerating(true);
    try {
      const params = {
        format: exportOptions.format,
        include_charts: exportOptions.include_charts,
        include_raw_data: exportOptions.include_raw_data,
        email: exportOptions.email_report ? exportOptions.email : undefined,
        ...filters,
      };
      
      const response = await userApi.exportActivityReport(params);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `user-activity-${new Date().toISOString()}.${exportOptions.format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Report exported successfully');
      setShowExportModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Export failed');
    } finally {
      setGenerating(false);
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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Activity Report</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track user engagement and activity across your organisation
          </p>
        </div>
        <button
          onClick={() => setShowExportModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          📥 Export Report
        </button>
      </div>

      {/* Filters */}
      <ReportFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        onGenerate={handleGenerate}
        loading={loading}
        departments={departments.map(d => ({ value: d.id, label: d.name }))}
      />

      {reportData && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.total_users || 0}</p>
            </div>
            <div className="bg-green-50 rounded-lg shadow p-4">
              <p className="text-sm text-green-600">Active Users</p>
              <p className="text-2xl font-bold text-green-600">{reportData.active_users || 0}</p>
            </div>
            <div className="bg-blue-50 rounded-lg shadow p-4">
              <p className="text-sm text-blue-600">New Users</p>
              <p className="text-2xl font-bold text-blue-600">{reportData.new_users || 0}</p>
            </div>
            <div className="bg-purple-50 rounded-lg shadow p-4">
              <p className="text-sm text-purple-600">Total Logins</p>
              <p className="text-2xl font-bold text-purple-600">{reportData.total_logins || 0}</p>
            </div>
          </div>

          {/* Activity Chart Summary */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Activity Summary</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Avg. Logins per User</p>
                  <p className="text-3xl font-bold text-gray-900">{reportData.avg_logins_per_user || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">User Engagement Rate</p>
                  <p className="text-3xl font-bold text-gray-900">{reportData.engagement_rate || 0}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Most Active Day</p>
                  <p className="text-3xl font-bold text-gray-900">{reportData.most_active_day || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">User Activity Details</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Login Count</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">KPI Updates</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.users?.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 text-sm font-medium">
                              {user.name?.charAt(0) || user.email?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{user.name || 'No name'}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{user.department_name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 capitalize">{user.role || 'staff'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{user.login_count || 0}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{user.kpi_updates || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportReportModal
          onExport={handleExport}
          onClose={() => setShowExportModal(false)}
          loading={generating}
          reportData={reportData}
        />
      )}
    </div>
  );
};

export default UserActivityReport;