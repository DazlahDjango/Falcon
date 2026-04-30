import React from 'react';
import { User, Calendar, CheckCircle, XCircle } from 'lucide-react';
import EmployeeAvatar from '../common/EmployeeAvatar';
import ReportingBadge from '../common/ReportingBadge';
import { REPORTING_RELATION_TYPE } from '../../../config/constants/structureConstants';

const ReportingLineCard = ({ reportingLine, onEdit, onDelete, className = '' }) => {
  if (!reportingLine) return null;
  const getCardClass = () => {
    switch (reportingLine.relation_type) {
      case REPORTING_RELATION_TYPE.SOLID:
        return 'reporting-line-card-solid';
      case REPORTING_RELATION_TYPE.DOTTED:
        return 'reporting-line-card-dotted';
      case REPORTING_RELATION_TYPE.INTERIM:
        return 'reporting-line-card-interim';
      default:
        return '';
    }
  };
  const isActive = reportingLine.is_active;
  const hasExpired = reportingLine.effective_to && new Date(reportingLine.effective_to) < new Date();

  return (
    <div className={`reporting-line-card ${getCardClass()} ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <ReportingBadge reportingLine={reportingLine} size="sm" showWeight />
            {!isActive && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Inactive</span>
            )}
            {hasExpired && isActive && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Expiring Soon</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500">Employee</div>
              <div className="flex items-center gap-2">
                <EmployeeAvatar user={reportingLine.employee} size="sm" />
                <span className="text-sm">{reportingLine.employee?.name || reportingLine.employee_user_id}</span>
              </div>
            </div>
            <div className="text-gray-400">→</div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500">Manager</div>
              <div className="flex items-center gap-2">
                <EmployeeAvatar user={reportingLine.manager} size="sm" />
                <span className="text-sm font-medium">{reportingLine.manager?.name || reportingLine.manager_user_id}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>Effective: {reportingLine.effective_from ? new Date(reportingLine.effective_from).toLocaleDateString() : 'N/A'}</span>
            </div>
            {reportingLine.effective_to && (
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>Until: {new Date(reportingLine.effective_to).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          <div className="approval-permissions">
            <div className="permission-toggle">
              {reportingLine.can_approve_kpi ? (
                <CheckCircle size={12} className="text-green-500" />
              ) : (
                <XCircle size={12} className="text-gray-300" />
              )}
              <span className="text-xs">KPI Approval</span>
            </div>
            <div className="permission-toggle">
              {reportingLine.can_conduct_review ? (
                <CheckCircle size={12} className="text-green-500" />
              ) : (
                <XCircle size={12} className="text-gray-300" />
              )}
              <span className="text-xs">Review Access</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(reportingLine)}
              className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
              title="Edit"
            >
              ✏️
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(reportingLine)}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              title="Delete"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default ReportingLineCard;