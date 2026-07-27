// frontend/src/pages/reports/ScheduleDetailPage.jsx
import React from 'react';
import { ScheduleDetail } from '../../components/reports/schedules';
import './reports.css';

export const ScheduleDetailPage = () => {
    return (
        <div className="schedule-detail-page">
            <ScheduleDetail />
        </div>
    );
};

export default ScheduleDetailPage;