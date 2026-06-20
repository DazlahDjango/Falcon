import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHeatmap, selectHeatmap, selectAnalyticsLoading } from '../../../../store/kpi';
import KPILoading from '../../common/KPILoading';

const PerformanceHeatmap = ({ year, month }) => {
    const dispatch = useDispatch();
    const heatmap = useSelector(selectHeatmap);
    const loading = useSelector(selectAnalyticsLoading);
    
    useEffect(() => {
        dispatch(fetchHeatmap({ year, month }));
    }, [dispatch, year, month]);
    
    if (loading) {
        return <KPILoading size="sm" text="Loading heatmap..." />;
    }
    
    const data = heatmap?.data || [];
    const departments = data.map(d => d.department_name);
    const kpis = data[0]?.kpis?.map(k => k.kpi_name) || [];
    
    const getScoreClass = (score) => {
        if (score >= 90) return 'heatmap-score-high';
        if (score >= 50) return 'heatmap-score-medium';
        return 'heatmap-score-low';
    };
    
    if (data.length === 0) {
        return (
            <div className="analytics-card">
                <div className="analytics-card-header">
                    <h3>Performance Heatmap</h3>
                </div>
                <div style={{ textAlign: 'center', padding: 'var(--kpi-space-8)', color: 'var(--kpi-gray-500)' }}>
                    No heatmap data available for selected period
                </div>
            </div>
        );
    }
    
    return (
        <div className="analytics-card">
            <div className="analytics-card-header">
                <h3>Performance Heatmap</h3>
                <span className="count">{departments.length} departments × {kpis.length} KPIs</span>
            </div>
            
            <div className="heatmap-container">
                <div className="heatmap-grid">
                    <div className="heatmap-row heatmap-header">
                        <div className="heatmap-cell header">Department / KPI</div>
                        {kpis.map(kpi => (
                            <div key={kpi} className="heatmap-cell header">{kpi}</div>
                        ))}
                    </div>
                    
                    {data.map(dept => (
                        <div key={dept.department_name} className="heatmap-row">
                            <div className="heatmap-cell header">{dept.department_name}</div>
                            {dept.kpis.map(kpi => (
                                <div key={kpi.kpi_name} className="heatmap-cell">
                                    <span className={`heatmap-score ${getScoreClass(kpi.average_score)}`}>
                                        {kpi.average_score}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PerformanceHeatmap;