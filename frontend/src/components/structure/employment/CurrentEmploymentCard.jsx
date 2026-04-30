import React from 'react';
import { Building2, Users, Calendar, Briefcase, ExternalLink } from 'lucide-react';
import PositionBadge from '../common/PositionBadge';
import DepartmentBadge from '../common/DepartmentBadge';
import TeamBadge from '../common/TeamBadge';
import EmploymentStatusBadge from './EmploymentStatusBadge';

const CurrentEmploymentCard = ({ employment, onViewDetails, className = '' }) => {
  if (!employment) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
        <Briefcase size={32} className="text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">No current employment record</p>
        <p className="text-sm text-gray-400">Please contact HR for assistance</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase size={18} className="text-blue-600" />
            <h3 className="font-semibold text-gray-900">Current Employment</h3>
          </div>
          <EmploymentStatusBadge employment={employment} />
        </div>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider">Position</label>
            <div className="mt-1">
              <PositionBadge position={employment.position} size="lg" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider">Department</label>
            <div className="mt-1">
              <DepartmentBadge department={employment.department} size="lg" />
            </div>
          </div>
          {employment.team && (
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Team</label>
              <div className="mt-1">
                <TeamBadge team={employment.team} size="lg" />
              </div>
            </div>
          )}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider">Employment Type</label>
            <div className="mt-1">
              <span className="inline-block px-2 py-1 bg-gray-100 rounded-md text-sm">
                {employment.employment_type?.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>Since {employment.effective_from ? new Date(employment.effective_from).toLocaleDateString() : 'N/A'}</span>
            </div>
            {employment.is_manager && (
              <div className="flex items-center gap-1 text-blue-600">
                <Users size={14} />
                <span>Manager</span>
              </div>
            )}
            {employment.is_executive && (
              <div className="flex items-center gap-1 text-purple-600">
                <Building2 size={14} />
                <span>Executive</span>
              </div>
            )}
          </div>
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(employment)}
              className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
            >
              View Details <ExternalLink size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default CurrentEmploymentCard;