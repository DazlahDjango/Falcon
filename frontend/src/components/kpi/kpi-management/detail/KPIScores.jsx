import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchScores, selectScores, selectScoreLoading } from '../../../../store/kpi';
import KPILoading from '../../common/KPILoading';
import KPIEmptyState from '../../common/KPIEmptyState';
import TrafficLightIcon from '../../scores/TrafficLightIcon';

const KPIScores = ({ kpiId }) => {
    const dispatch = useDispatch();
    const [year, setYear] = useState(new Date().getFullYear());
    
    const scores = useSelector(selectScores);
    const loading = useSelector(selectScoreLoading);
    
    useEffect(() => {
        dispatch(fetchScores({ kpi: kpiId, year }));
    }, [dispatch, kpiId, year]);
    
    const getScoreColor = (score) => {
        if (score >= 90) return 'success';
        if (score >= 75) return 'primary';
        if (score >= 50) return 'warning';
        return 'danger';
    };
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const scoresByMonth = {};
    scores.forEach(score => {
        scoresByMonth[score.month] = score;
    });
    
    if (loading) {
        return <KPILoading size="sm" text="Loading scores..." />;
    }
    
    return (
        <div className="kpi-scores-section">
            <div className="section-header">
                <h3>Performance Scores</h3>
                <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
                    {[2023, 2024, 2025, 2026].map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>
            
            {scores.length === 0 ? (
                <KPIEmptyState 
                    icon="📊"
                    title="No Scores"
                    description="No scores have been calculated for this KPI yet"
                />
            ) : (
                <div className="scores-grid">
                    {months.map(month => {
                        const score = scoresByMonth[months.indexOf(month) + 1];
                        const scoreValue = score?.score || 0;
                        const hasScore = !!score;
                        
                        return (
                            <div key={month} className="score-card">
                                <div className="score-month">{month}</div>
                                {hasScore ? (
                                    <>
                                        <div className={`score-value score-${getScoreColor(scoreValue)}`}>
                                            {scoreValue}%
                                        </div>
                                        <div className="score-traffic">
                                            <TrafficLightIcon status={score.traffic_light_status?.status} size="sm" />
                                        </div>
                                        <div className="score-detail">
                                            Actual: {score.actual_value}<br/>
                                            Target: {score.target_value}
                                        </div>
                                    </>
                                ) : (
                                    <div className="score-empty">—</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default KPIScores;