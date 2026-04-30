import React from 'react';
import { Users, Target, Calendar } from 'lucide-react';
import EmployeeAvatar from '../common/EmployeeAvatar';
import ReportingBadge from '../common/ReportingBadge';

const ReportingMatrix = ({ employee, reportingLines, onSelectManager, className = '' }) => {
  if (!employee) return null;
  const solidLine = reportingLines?.find(r => r.relation_type === 'solid');
  const dottedLines = reportingLines?.filter(r => r.relation_type !== 'solid');

  return (
    <div className={`reporting-matrix ${className}`}>
      {/* Solid Line Manager Card */}
      <div className="matrix-card">
        <div className="matrix-header flex items-center gap-2">
          <Users size={16} />
          <span>Primary Manager (Solid Line)</span>
        </div>
        <div className="p-3">
          {solidLine ? (
            <div
              onClick={() => onSelectManager?.(solidLine.manager_user_id)}
              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
            >
              <EmployeeAvatar user={solidLine.manager} size="md" />
              <div>
                <div className="font-medium">{solidLine.manager?.name || solidLine.manager_user_id}</div>
                <div className="text-xs text-gray-500">
                  {solidLine.manager?.position_title || 'Manager'}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Weight: {Math.round(solidLine.reporting_weight * 100)}%
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">No solid line manager assigned</div>
          )}
        </div>
      </div>
      {/* Dotted/Matrix Managers Card */}
      <div className="matrix-card">
        <div className="matrix-header flex items-center gap-2">
          <Target size={16} />
          <span>Functional Managers (Dotted/Matrix)</span>
        </div>
        <div className="p-3">
          {dottedLines && dottedLines.length > 0 ? (
            dottedLines.map((line, idx) => (
              <div
                key={idx}
                onClick={() => onSelectManager?.(line.manager_user_id)}
                className="dotted-line-manager cursor-pointer hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <EmployeeAvatar user={line.manager} size="sm" />
                  <div>
                    <div className="font-medium text-sm">{line.manager?.name || line.manager_user_id}</div>
                    <div className="text-xs text-gray-500">{line.manager?.position_title}</div>
                  </div>
                </div>
                <div className="text-right">
                  <ReportingBadge reportingLine={line} size="sm" showWeight />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">No functional managers assigned</div>
          )}
        </div>
      </div>
      {/* Summary Section */}
      <div className="matrix-card">
        <div className="matrix-header flex items-center gap-2">
          <Calendar size={16} />
          <span>Reporting Summary</span>
        </div>
        <div className="p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total Managers:</span>
            <span className="font-medium">{(solidLine ? 1 : 0) + (dottedLines?.length || 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Reporting Weight Total:</span>
            <span className="font-medium">
              {Math.round((
                (solidLine?.reporting_weight || 0) +
                (dottedLines?.reduce((sum, l) => sum + (l.reporting_weight || 0), 0) || 0)
              ) * 100)}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Active Relationships:</span>
            <span className="font-medium text-green-600">
              {reportingLines?.filter(r => r.is_active).length || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ReportingMatrix;