import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';

const KPISummaryTable = ({ summaries, loading, onRowClick }) => {
    const getTrendIcon = (current, previous) => {
        if (!previous) return null;
        const change = current - previous;
        if (change > 0) return <FiTrendingUp size={12} color="var(--kpi-success)" />;
        if (change < 0) return <FiTrendingDown size={12} color="var(--kpi-danger)" />;
        return <FiMinus size={12} color="var(--kpi-warning)" />;
    };
    
    const getHealthClass = (score) => {
        if (score >= 90) return 'health-excellent';
        if (score >= 75) return 'health-good';
        if (score >= 50) return 'health-fair';
        return 'health-poor';
    };
    
    if (loading) {
        return <div className="kpi-loading-container">Loading summaries...</div>;
    }
    
    if (!summaries || summaries.length === 0) {
        return <div className="kpi-empty-container">No KPI summary data available</div>;
    }
    
    return (
        <div className="analytics-table-container">
            <table className="analytics-table">
                <thead>
                    <tr>
                        <th>KPI Name</th>
                        <th>Code</th>
                        <th>Period</th>
                        <th>Avg Score</th>
                        <th>Distribution</th>
                        <th>Health</th>
                        <th>Users</th>
                    </tr>
                </thead>
                <tbody>
                    {summaries.map(summary => (
                        <tr 
                            key={`${summary.kpi}-${summary.period}`}
                            className="analytics-table-row"
                            onClick={() => onRowClick?.(summary)}
                        >
                            <td>{summary.kpi_name}</td>
                            <td>{summary.kpi_code}</td>
                            <td>{summary.period}</td>
                            <td style={{ fontWeight: 600 }}>
                                {summary.average_score}%
                                {getTrendIcon(summary.average_score, summary.previous_score)}
                            </td>
                            <td>
                                <div style={{ display: 'flex', gap: 4 }}>
                                    <span style={{ color: 'var(--kpi-success)' }}>🟢 {summary.green_count}</span>
                                    <span style={{ color: 'var(--kpi-warning)' }}>🟡 {summary.yellow_count}</span>
                                    <span style={{ color: 'var(--kpi-danger)' }}>🔴 {summary.red_count}</span>
                                </div>
                            </td>
                            <td>
                                <span className={`health-badge ${getHealthClass(summary.average_score)}`}>
                                    {summary.health_status}
                                </span>
                            </td>
                            <td>{summary.total_users}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default KPISummaryTable;