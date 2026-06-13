import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AggregatedScores, DepartmentRanking } from '../../../components/kpi';
import { fetchAggregatedScores, selectAggregatedScores, selectScoreLoading } from '../../../store/kpi';
import { useKPIPermissions } from '../../../hooks/kpi';
import { Navigate } from 'react-router-dom';
import KPILoading from '../../../components/kpi/common/KPILoading';

const AggregatedScoresPage = () => {
    const dispatch = useDispatch();
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const { isAuthenticated, isExecutive } = useKPIPermissions();
    
    const scores = useSelector(selectAggregatedScores);
    const loading = useSelector(selectScoreLoading);
    
    useEffect(() => {
        dispatch(fetchAggregatedScores({ year, month }));
    }, [dispatch, year, month]);
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    if (!isExecutive) {
        return <Navigate to="/dashboard" replace />;
    }
    
    if (loading && scores.length === 0) {
        return <KPILoading text="Loading aggregated scores..." />;
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
        <div className="kpi-page-container">
            <div className="page-header">
                <h1>Aggregated Scores</h1>
                <p>Organization-wide aggregated performance scores</p>
                <div className="period-selector">
                    <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
                        {months.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            <AggregatedScores scores={scores} loading={loading} />
            
            <div style={{ marginTop: 'var(--kpi-space-6)' }}>
                <DepartmentRanking rankings={scores} loading={loading} />
            </div>
        </div>
    );
};

export default AggregatedScoresPage;