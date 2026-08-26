import React from 'react';
import { FiArrowUp, FiArrowDown, FiMinus } from 'react-icons/fi';
import TrafficLightIcon from './TrafficLightIcon';
import KPIPagination from '../common/KPIPagination';

const ScoreTable = ({ 
    scores, 
    loading, 
    pagination = {}, 
    onPageChange, 
    onPageSizeChange,
    onRowClick 
}) => {
    if (loading && (!scores || scores.length === 0)) {
        return <div className="kpi-loading-container">Loading scores...</div>;
    }

    return (
        <div className="kpi-score-table-container">
            <table className="kpi-score-table">
                <thead>
                    <tr>
                        <th>KPI</th>
                        <th>User</th>
                        <th>Period</th>
                        <th>Target</th>
                        <th>Actual</th>
                        <th>Score</th>
                        <th>Status</th>
                        <th>Achievement</th>
                    </tr>
                </thead>
                <tbody>
                    {scores?.map(score => (
                        <tr 
                            key={score.id} 
                            className="kpi-score-table-row"
                            onClick={() => onRowClick?.(score)}
                        >
                            <td className="kpi-score-table-kpi">
                                {score.kpi_name || score.kpi?.name}
                            </td>
                            <td>{score.user_email?.split('@')[0] || score.user?.email?.split('@')[0]}</td>
                            <td>{score.period || `${score.year}-${String(score.month).padStart(2, '0')}`}</td>
                            <td>{score.target_value}</td>
                            <td>{score.actual_value}</td>
                            <td className="kpi-score-table-score">
                                <span className="kpi-score-table-score-value">
                                    {score.score}%
                                </span>
                            </td>
                            <td>
                                <TrafficLightIcon status={score.traffic_light_status?.status || score.status} />
                            </td>
                            <td>
                                <div className="kpi-score-table-achievement">
                                    <div 
                                        className="kpi-score-table-achievement-bar"
                                        style={{ width: `${score.achievement_percentage || score.achievement || 0}%` }}
                                    />
                                    <span className="kpi-score-table-achievement-text">
                                        {score.achievement_percentage || score.achievement || 0}%
                                    </span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {scores && scores.length > 0 && (
                <KPIPagination 
                    currentPage={pagination.page || pagination.currentPage || 1}
                    pageSize={pagination.pageSize || 20}
                    total={pagination.total || scores.length}
                    totalPages={pagination.totalPages || 1}
                    itemCount={scores.length}
                    isLoading={loading}
                    onPageChange={onPageChange}
                    onPageSizeChange={onPageSizeChange}
                />
            )}
        </div>
    );
};

export default ScoreTable;