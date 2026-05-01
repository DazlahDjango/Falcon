import React from 'react';
import { Clock, Calendar } from 'lucide-react';

const InterimManagerBadge = ({ reportingLine, showDates = true, className = '' }) => {
  if (!reportingLine || reportingLine.relation_type !== 'interim') return null;
  const isActive = reportingLine.is_active;
  const isExpired = reportingLine.effective_to && new Date(reportingLine.effective_to) < new Date();
  if (!isActive || isExpired) return null;

  return (
    <div className={`inline-flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs ${className}`}>
      <Clock size={10} />
      <span>Interim Manager</span>
      {showDates && reportingLine.effective_to && (
        <span className="flex items-center gap-0.5 ml-1 text-orange-600">
          <Calendar size={8} />
          <span>until {new Date(reportingLine.effective_to).toLocaleDateString()}</span>
        </span>
      )}
    </div>
  );
};
export default InterimManagerBadge;