import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ScoreList, ScoreFilters } from '../../../components/kpi';
import { fetchMyScores, selectMyScores, selectScoreLoading } from '../../../store/kpi';
import { useAuthContext } from '../../../contexts/accounts/AuthContext';
import { Navigate } from 'react-router-dom';
import KPILoading from '../../../components/kpi/common/KPILoading';

const MyScoresPage = () => {
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useAuthContext();
    const [filters, setFilters] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1
    });
    
    const scores = useSelector(selectMyScores);
    const loading = useSelector(selectScoreLoading);
    
    useEffect(() => {
        if (user?.id) {
            dispatch(fetchMyScores(filters));
        }
    }, [dispatch, user?.id, filters]);
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    if (loading && scores.length === 0) {
        return <KPILoading text="Loading your scores..." />;
    }
    
    return (
        <div className="kpi-page-container">
            <div className="page-header">
                <h1>My Scores</h1>
                <p>Your personal KPI performance scores</p>
            </div>
            
            <ScoreFilters 
                filters={filters}
                onFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
                onClearFilters={() => setFilters({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 })}
            />
            
            <ScoreList scores={scores} loading={loading} />
        </div>
    );
};

export default MyScoresPage;