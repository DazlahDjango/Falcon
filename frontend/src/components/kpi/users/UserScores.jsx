import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiCalendar, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { fetchUserScores, selectUserScores, selectScoreLoading } from '../../../store/kpi';
import KPILoading from '../common/KPILoading';
import KPIEmptyState from '../common/KPIEmptyState';
import TrafficLightIcon from '../scores/TrafficLightIcon';

const UserScores = ({ userId }) => {
    const dispatch = useDispatch();
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    
    const scores = useSelector(state => selectUserScores(userId)(state));
    const loading = useSelector(selectScoreLoading);
    
    useEffect(() => {
        if (userId) {
            dispatch(fetchUserScores({ userId, params: { year: selectedYear, month: selectedMonth } }));
        }
    }, [dispatch, userId, selectedYear, selectedMonth]);
    
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 3 }, (_, i) => currentYear - 1 + i);
    const months = [
        { value: 1, label: 'January' }, { value: 2, label: 'February' },
        { value: 3, label: 'March' }, { value: 4, label: 'April' },
        { value: 5, label: 'May' }, { value: 6, label: 'June' },
        { value: 7, label: 'July' }, { value: 8, label: 'August' },
        { value: 9, label: 'September' }, { value: 10, label: 'October' },
        { value: 11, label: 'November' }, { value: 12, label: 'December' }
    ];
    
    const getScoreColor = (score) => {
        if (score >= 90) return 'score-high';
        if (score >= 75) return 'score-good';
        if (score >= 50) return 'score-fair';
        return 'score-poor';
    };
    
    if (loading) {
        return <KPILoading size="sm" text="Loading user scores..." />;
    }
    
    if (!scores || scores.length === 0) {
        return (
            <KPIEmptyState 
                icon="📈"
                title="No Scores"
                description="No scores have been calculated for this period"
            />
        );
    }
    
    return (
        <div className="kpi-user-scores">
            <div className="user-scores-header">
                <h3>Performance Scores</h3>
                <div className="period-selector">
                    <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
                        {months.map(month => (
                            <option key={month.value} value={month.value}>{month.label}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="user-scores-grid">
                {scores.map(score => (
                    <div key={score.id} className="user-score-card">
                        <div className="user-score-header">
                            <h4>{score.kpi_name}</h4>
                            <TrafficLightIcon status={score.traffic_light_status?.status} />
                        </div>
                        
                        <div className={`user-score-value ${getScoreColor(score.score)}`}>
                            {score.score}%
                        </div>
                        
                        <div className="user-score-details">
                            <div className="detail-row">
                                <span className="label">Actual:</span>
                                <span className="value">{score.actual_value}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Target:</span>
                                <span className="value">{score.target_value}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Achievement:</span>
                                <span className="value">{score.achievement_percentage}%</span>
                            </div>
                        </div>
                        
                        {score.traffic_light_status?.display && (
                            <div className="user-score-status">
                                {score.traffic_light_status.display}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserScores;