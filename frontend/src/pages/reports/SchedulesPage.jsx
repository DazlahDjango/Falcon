// frontend/src/pages/reports/SchedulesPage.jsx
import React from 'react';
import { ScheduleList } from '../../components/reports/schedules';
import './reports.css';

export const SchedulesPage = () => {
    return (
        <div className="schedules-page">
            <ScheduleList />
        </div>
    );
};

export default SchedulesPage;