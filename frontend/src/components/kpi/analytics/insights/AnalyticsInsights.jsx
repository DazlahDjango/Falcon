import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInsights, fetchPredictions, selectInsights, selectPredictions, selectAnalyticsLoading } from '../../../../store/kpi';
import InsightsOverview from './InsightsOverview';
import TrendAnalysis from './TrendAnalysis';
import TopDepartments from './TopDepartments';
import AreasForImprovement from './AreasForImprovement';
import RiskPredictions from './RiskPredictions';
import PerformanceHeatmap from './PerformanceHeatmap';
import KPILoading from '../../common/KPILoading';

const AnalyticsInsights = () => {
    const dispatch = useDispatch();
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    
    const insights = useSelector(selectInsights);
    const predictions = useSelector(selectPredictions);
    const loading = useSelector(selectAnalyticsLoading);
    
    useEffect(() => {
        dispatch(fetchInsights({ year, month }));
        dispatch(fetchPredictions());
    }, [dispatch, year, month]);
    
    if (loading) {
        return <KPILoading text="Loading analytics insights..." />;
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
                <h2>Analytics Insights</h2>
                <p>AI-powered insights and performance predictions</p>
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
                    dispatch(fetchInsights({ year, month }));
                    dispatch(fetchPredictions());
                }}>
                    Refresh Insights
                </button>
            </div>
            
            <InsightsOverview insights={insights} />
            
            <div className="analytics-two-col">
                <TrendAnalysis insights={insights} />
                <TopDepartments insights={insights} />
            </div>
            
            <div className="analytics-two-col">
                <AreasForImprovement insights={insights} />
                <RiskPredictions predictions={predictions} />
            </div>
            
            <PerformanceHeatmap year={year} month={month} />
        </div>
    );
};

export default AnalyticsInsights;