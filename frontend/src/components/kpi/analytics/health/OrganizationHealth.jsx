import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrganizationHealth, fetchOrganizationHealthHistory, selectOrganizationHealth, selectOrganizationHealthHistory, selectAnalyticsLoading } from '../../../../store/kpi';
import HealthScoreCard from './HealthScoreCard';
import HealthHistoryChart from './HealthHistoryChart';
import KPIGauge from './KPIGauge';
import KPILoading from '../../common/KPILoading';

const OrganizationHealth = () => {
    const dispatch = useDispatch();
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    
    const health = useSelector(selectOrganizationHealth);
    const history = useSelector(selectOrganizationHealthHistory);
    const loading = useSelector(selectAnalyticsLoading);
    
    useEffect(() => {
        dispatch(fetchOrganizationHealth({ year, month }));
        dispatch(fetchOrganizationHealthHistory(12));
    }, [dispatch, year, month]);
    
    if (loading) {
        return <KPILoading text="Loading organization health data..." />;
    }
    
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 3 }, (_, i) => currentYear - i);
    const months = [
        { value: 1, label: 'January' }, { value: 2, label: 'February' },
        { value: 3, label: 'March' }, { value: 4, label: 'April' },
        { value: 5, label: 'May' }, { value: 6, label: 'June' },
        { value: 7, label: 'July' }, { value: 8, label: 'August' },
        { value: 9, label: 'September' }, { value: 10, label: 'October' },
        { value: 11, label: 'November' }, { value: 12, label: 'December' }
    ];
    
    return (
        <div className="kpi-analytics-container">
            <div className="analytics-section-header">
                <h2>Organization Health</h2>
                <p>Overall KPI performance and compliance metrics</p>
            </div>
            
            <div className="analytics-toolbar">
                <div className="analytics-filters">
                    <div className="analytics-filter-group">
                        <label>Year</label>
                        <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
                            {years.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <div className="analytics-filter-group">
                        <label>Month</label>
                        <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
                            {months.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <button className="analytics-refresh-btn" onClick={() => {
                    dispatch(fetchOrganizationHealth({ year, month }));
                    dispatch(fetchOrganizationHealthHistory(12));
                }}>
                    Refresh
                </button>
            </div>
            
            <HealthScoreCard health={health} />
            
            <div className="analytics-two-col">
                <HealthHistoryChart history={history} />
                <KPIGauge health={health} />
            </div>
        </div>
    );
};

export default OrganizationHealth;