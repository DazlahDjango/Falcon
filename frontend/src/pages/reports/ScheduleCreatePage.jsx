// frontend/src/pages/reports/ScheduleCreatePage.jsx
import React from 'react';
import { ScheduleCreate } from '../../components/reports/schedules';
import './reports.css';

export const ScheduleCreatePage = () => {
    return (
        <div className="schedule-create-page">
            <ScheduleCreate />
        </div>
    );
};

export default ScheduleCreatePage;