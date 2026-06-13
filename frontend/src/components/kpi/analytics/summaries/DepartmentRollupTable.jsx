import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';

const DepartmentRollupTable = ({ rollups, loading, onRowClick }) => {
    const getScoreColor = (score) => {
        if (score >= 90) return '#10b981';
        if (score >= 75) return '#3b82f6';
        if (score >= 50) return '#f59e0b';
        return '#ef4444';
    };
    
    if (loading) {
        return <div className="kpi-loading-container">Loading department data...</div>;
    }
    
    if (!rollups || rollups.length === 0) {
        return <div className="kpi-empty-container">No department data available</div>;
    }
    
    return (
        <div className="analytics-table-container">
            <table className="analytics-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Department</th>
                        <th>Overall Score</th>
                        <th>Distribution</th>
                        <th>Employees</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {rollups.map((dept, index) => (
                        <tr 
                            key={`${dept.department_id}-${dept.period}`}
                            className="analytics-table-row"
                            onClick={() => onRowClick?.(dept)}
                        >
                            <td style={{ fontWeight: 700 }}>#{index + 1}</td>
                            <td style={{ fontWeight: 500 }}>{dept.department_name}</td>
                            <td style={{ color: getScoreColor(dept.overall_score), fontWeight: 600 }}>
                                {dept.overall_score}%
                            </td>
                            <td>
                                <div style={{ display: 'flex', gap: 4 }}>
                                    <span style={{ color: 'var(--kpi-success)' }}>🟢 {dept.green_percentage}%</span>
                                    <span style={{ color: 'var(--kpi-warning)' }}>🟡 {dept.yellow_percentage}%</span>
                                    <span style={{ color: 'var(--kpi-danger)' }}>🔴 {dept.red_percentage}%</span>
                                </div>
                            </td>
                            <td>{dept.employee_count}</td>
                            <td>
                                <div style={{ 
                                    width: 80, height: 6, background: '#e5e7eb', borderRadius: 3,
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ 
                                        width: `${dept.green_percentage}%`, height: '100%', 
                                        background: 'var(--kpi-success)', float: 'left' 
                                    }} />
                                    <div style={{ 
                                        width: `${dept.yellow_percentage}%`, height: '100%', 
                                        background: 'var(--kpi-warning)', float: 'left' 
                                    }} />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DepartmentRollupTable;