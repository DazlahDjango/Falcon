import React from 'react';
import { useReportSchedules } from '../../hooks/reporting';
import { ReportScheduleTable } from '../../components/reporting';

export const ReportSchedulesPage = () => {
  const { schedules, toggleSchedule, deleteSchedule, loadSchedules } = useReportSchedules(true);

  return (
    <div className="reporting-app">
      <div className="reporting-header">
        <div>
          <h1 className="reporting-title">Automated Report Schedules</h1>
          <p className="reporting-subtitle">
            Configure automated daily, weekly, and monthly report distributions
          </p>
        </div>
        <button className="reporting-btn reporting-btn-secondary" onClick={() => loadSchedules()}>
          Refresh Schedules
        </button>
      </div>

      <ReportScheduleTable
        schedules={schedules}
        onToggle={toggleSchedule}
        onDelete={deleteSchedule}
      />
    </div>
  );
};

export default ReportSchedulesPage;
