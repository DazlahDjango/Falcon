import React from 'react';
import { ScheduleList } from '../../components/config/schedule/ScheduleList';
import { ConfigBreadcrumb } from '../../components/config/common/ConfigBreadcrumb';
import { FiClock } from 'react-icons/fi';

export const SchedulePage = () => {
  return (
    <div className="p-6">
      <div className="mb-4">
        <ConfigBreadcrumb />
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FiClock className="text-blue-600" />
          Scheduled Tasks
        </h1>
        <p className="text-gray-500 mt-1">Manage automated backup and maintenance schedules</p>
      </div>

      <ScheduleList />
    </div>
  );
};
export default SchedulePage;