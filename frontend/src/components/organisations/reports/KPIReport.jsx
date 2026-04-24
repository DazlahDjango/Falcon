import React, { useState, useEffect } from 'react';
import ReportFilters from './components/ReportFilters';
import ExportReportModal from './components/ExportReportModal';
import { kpiApi, departmentApi } from '../../../services/organisations';
import toast from 'react-hot-toast';

const KPIReport = () => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({
    date_range: '30',
    department: '',
    status: '',
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
      if (filters.status) params.status = filters.status;
      
      const response = await kpiApi.getReport(params);
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
      status: '',
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
      
      const response = await kpiApi.exportReport(params);
      
      // Download file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `kpi-report-${new Date().toISOString()}.${exportOptions.format}`);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'on_track': return 'bg-green-100 text-green-800';
      case 'at_risk': return 'bg-yellow-100 text-yellow-800';
      case 'off_track': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'on_track': return '✅';
      case 'at_risk': return '⚠️';
      case 'off_track': return '🔴';
      default: return '📊';
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
          <h1 className="text-2xl font-bold text-gray-900">KPI Performance Report</h1>
          <p className="mt-1 text-sm text-gray-500">
            Analyze KPI performance across your organisation
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

      {/* Summary Stats */}
      {reportData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Total KPIs</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.total_kpis || 0}</p>
            </div>
            <div className="bg-green-50 rounded-lg shadow p-4">
              <p className="text-sm text-green-600">On Track</p>
              <p className="text-2xl font-bold text-green-600">{reportData.on_track || 0}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg shadow p-4">
              <p className="text-sm text-yellow-600">At Risk</p>
              <p className="text-2xl font-bold text-yellow-600">{reportData.at_risk || 0}</p>
            </div>
            <div className="bg-red-50 rounded-lg shadow p-4">
              <p className="text-sm text-red-600">Off Track</p>
              <p className="text-2xl font-bold text-red-600">{reportData.off_track || 0}</p>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Overall Performance</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Average Performance Score</span>
                <span className="text-sm font-medium text-gray-900">{reportData.average_score || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-indigo-600 h-3 rounded-full"
                  style={{ width: `${reportData.average_score || 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* KPIs Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">KPI Details</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">KPI Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actual</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.kpis?.map((kpi) => (
                    <tr key={kpi.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{kpi.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{kpi.department_name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{kpi.target_value}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{kpi.actual_value || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                kpi.progress >= 90 ? 'bg-green-500' :
                                kpi.progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${kpi.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{kpi.progress || 0}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-semibold leading-5 rounded-full ${getStatusColor(kpi.status)}`}>
                          <span>{getStatusIcon(kpi.status)}</span>
                          <span>{kpi.status?.replace('_', ' ')}</span>
                        </span>
                      </td>
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

export default KPIReport;