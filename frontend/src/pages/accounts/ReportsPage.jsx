import React, { useState, useEffect } from 'react';
import { useReports } from '../../hooks/accounts/useReports';
import { 
  FiFileText, FiDownload, FiCalendar, FiFilter, 
  FiUsers, FiShield, FiActivity, FiKey, FiAlertCircle 
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const REPORTS_LIST = [
  // User Reports
  { id: 'user-directory', name: 'User Directory', type: 'user', icon: FiUsers, endpoint: 'user-directory', desc: 'Complete list of all users with details' },
  { id: 'role-distribution', name: 'User Role Distribution', type: 'user', icon: FiKey, endpoint: 'role-distribution', desc: 'Breakdown of users by role' },
  { id: 'department-distribution', name: 'User Department Distribution', type: 'user', icon: FiUsers, endpoint: 'department-distribution', desc: 'Breakdown of users by department' },
  { id: 'inactive-users', name: 'Inactive Users', type: 'user', icon: FiAlertCircle, endpoint: 'inactive-users', desc: 'Users who haven\'t logged in for a period' },
  { id: 'recently-added', name: 'Recently Added Users', type: 'user', icon: FiActivity, endpoint: 'recently-added', desc: 'Users created in a specific date range' },
  { id: 'activity-summary', name: 'User Activity Summary', type: 'user', icon: FiActivity, endpoint: 'activity-summary', desc: 'Overall user engagement metrics' },
  
  // Audit Reports
  { id: 'audit-trail', name: 'Audit Trail', type: 'audit', icon: FiFileText, endpoint: 'audit-trail', desc: 'All actions performed on users' },
  { id: 'login-activity', name: 'Login Activity', type: 'audit', icon: FiShield, endpoint: 'login-activity', desc: 'User login history and success/failure status' },
  { id: 'password-changes', name: 'Password Changes', type: 'audit', icon: FiKey, endpoint: 'password-changes', desc: 'History of password changes' },
  { id: 'role-changes', name: 'Role Change History', type: 'audit', icon: FiShield, endpoint: 'role-changes', desc: 'When and who changed user roles' },
  { id: 'suspension-log', name: 'Suspension/Activation Log', type: 'audit', icon: FiAlertCircle, endpoint: 'suspension-log', desc: 'Users suspended or activated logs' },
  { id: 'compliance-summary', name: 'Compliance Summary', type: 'audit', icon: FiShield, endpoint: 'compliance-summary', desc: 'MFA, password age and login compliance' },
];

export const ReportsPage = () => {
  const {
    isLoading,
    error,
    getUserDirectory,
    getRoleDistribution,
    getDepartmentDistribution,
    getInactiveUsers,
    getRecentlyAdded,
    getActivitySummary,
    getAuditTrail,
    getLoginActivity,
    getPasswordChanges,
    getRoleChanges,
    getSuspensionLog,
    getComplianceSummary,
    downloadReport
  } = useReports();

  const [activeTab, setActiveTab] = useState('user');
  const [selectedReport, setSelectedReport] = useState(REPORTS_LIST[0]);
  const [reportData, setReportData] = useState(null);
  
  // Filters
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [days, setDays] = useState(30);

  const fetchSelectedReport = async () => {
    try {
      let data;
      const params = {};
      
      // Add custom parameters based on report types
      if (selectedReport.id === 'inactive-users' || selectedReport.id === 'activity-summary') {
        params.days = days;
      }
      if (selectedReport.id === 'recently-added' || selectedReport.id === 'audit-trail') {
        params.start_date = startDate;
        params.end_date = endDate;
      }

      switch (selectedReport.id) {
        case 'user-directory':
          data = await getUserDirectory(params);
          break;
        case 'role-distribution':
          data = await getRoleDistribution(params);
          break;
        case 'department-distribution':
          data = await getDepartmentDistribution(params);
          break;
        case 'inactive-users':
          data = await getInactiveUsers(params);
          break;
        case 'recently-added':
          data = await getRecentlyAdded(params);
          break;
        case 'activity-summary':
          data = await getActivitySummary(params);
          break;
        case 'audit-trail':
          data = await getAuditTrail(params);
          break;
        case 'login-activity':
          data = await getLoginActivity(params);
          break;
        case 'password-changes':
          data = await getPasswordChanges(params);
          break;
        case 'role-changes':
          data = await getRoleChanges(params);
          break;
        case 'suspension-log':
          data = await getSuspensionLog(params);
          break;
        case 'compliance-summary':
          data = await getComplianceSummary(params);
          break;
        default:
          break;
      }
      setReportData(data);
    } catch (err) {
      toast.error(err || 'Failed to fetch report data');
    }
  };

  useEffect(() => {
    fetchSelectedReport();
  }, [selectedReport]);

  const handleDownload = async (format) => {
    try {
      const params = {};
      if (selectedReport.id === 'inactive-users' || selectedReport.id === 'activity-summary') {
        params.days = days;
      }
      if (selectedReport.id === 'recently-added' || selectedReport.id === 'audit-trail') {
        params.start_date = startDate;
        params.end_date = endDate;
      }
      
      toast.loading(`Downloading ${format.toUpperCase()}...`, { id: 'download-toast' });
      await downloadReport(selectedReport.endpoint, format, params);
      toast.success('Downloaded successfully!', { id: 'download-toast' });
    } catch (err) {
      toast.error('Download failed', { id: 'download-toast' });
    }
  };

  const filteredReports = REPORTS_LIST.filter(r => r.type === activeTab);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Reporting Center</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Generate, preview and export system activity and compliance reports.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Report Selection */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl shadow border border-slate-200 dark:border-slate-800 p-4 space-y-4">
          <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
            <button
              onClick={() => setActiveTab('user')}
              className={`flex-1 text-center py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'user'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              User Reports
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex-1 text-center py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'audit'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Audit Reports
            </button>
          </div>

          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {filteredReports.map((report) => {
              const Icon = report.icon;
              const isSelected = selectedReport.id === report.id;
              return (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`w-full flex items-start text-left p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-400'
                      : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-sm">{report.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{report.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Filters and Preview */}
        <div className="lg:col-span-3 space-y-6">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow border border-slate-200 dark:border-slate-800 p-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300">
              <FiFilter className="mr-2 h-4 w-4" /> Filters
            </div>

            {(selectedReport.id === 'recently-added' || selectedReport.id === 'audit-trail') && (
              <>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Start Date</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 text-sm p-1.5 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">End Date</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 text-sm p-1.5 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </>
            )}

            {(selectedReport.id === 'inactive-users' || selectedReport.id === 'activity-summary') && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">Days Inactive</span>
                <input
                  type="number"
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value) || 30)}
                  className="w-16 rounded border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 text-sm p-1.5 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white"
                />
              </div>
            )}

            <button
              onClick={fetchSelectedReport}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm ml-auto"
            >
              Apply Filters
            </button>
          </div>

          {/* Report Preview */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedReport.name} Preview</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{selectedReport.desc}</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownload('pdf')}
                  className="flex items-center px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 transition"
                >
                  <FiDownload className="mr-1.5 h-4 w-4" /> PDF
                </button>
                <button
                  onClick={() => handleDownload('xlsx')}
                  className="flex items-center px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 transition"
                >
                  <FiDownload className="mr-1.5 h-4 w-4" /> Excel
                </button>
                <button
                  onClick={() => handleDownload('csv')}
                  className="flex items-center px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 transition"
                >
                  <FiDownload className="mr-1.5 h-4 w-4" /> CSV
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="h-64 flex flex-col items-center justify-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent" />
                <span className="text-sm text-slate-500">Generating preview...</span>
              </div>
            ) : reportData && reportData.headers ? (
              <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800">
                <table className="w-full text-left border-collapse text-sm text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      {reportData.headers.map((header, idx) => (
                        <th key={idx} className="p-3 whitespace-nowrap">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-transparent">
                    {reportData.data && reportData.data.length > 0 ? (
                      reportData.data.map((row, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          {row.map((cell, cellIdx) => (
                            <td key={cellIdx} className="p-3 max-w-xs truncate">{cell}</td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={reportData.headers.length} className="p-8 text-center text-slate-400">
                          No matching records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center space-y-2 text-slate-400">
                <FiFileText size={40} className="stroke-1" />
                <span className="text-sm">Click "Apply Filters" to load preview</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
