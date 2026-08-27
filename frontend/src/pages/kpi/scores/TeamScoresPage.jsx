import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ScoreTable, ScoreFilters } from '../../../components/kpi';
import { fetchTeamScores, selectTeamScores, selectScoreLoading } from '../../../store/kpi';
import { useKPIPermissions } from '../../../hooks/kpi';
import { Navigate } from 'react-router-dom';
import KPILoading from '../../../components/kpi/common/KPILoading';

const TeamScoresPage = () => {
    const dispatch = useDispatch();
    const { isAuthenticated, isManager, isSuperAdmin, isClientAdmin, isExecutive } = useKPIPermissions();
    const canView = isManager || isSuperAdmin || isClientAdmin || isExecutive;
    const [filters, setFilters] = useState({
        year: 2026,
        month: 6
    });
    
    const scores = useSelector(selectTeamScores);
    const loading = useSelector(selectScoreLoading);
    
    useEffect(() => {
        if (canView) {
            dispatch(fetchTeamScores(filters));
        }
    }, [dispatch, canView, filters]);
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    if (!canView) {
        return <Navigate to="/dashboard" replace />;
    }
    
    if (loading && scores.length === 0) {
        return <KPILoading text="Loading team scores..." />;
    }
    
    return (
        <div className="kpi-page-container">
            <div className="page-header">
                <h1>Team Scores</h1>
                <p>Your team's KPI performance scores</p>
            </div>
            
            <ScoreFilters 
                filters={filters}
                onFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
                onClearFilters={() => setFilters({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 })}
            />
            
            <ScoreTable scores={scores} loading={loading} />
        </div>
    );
};

export default TeamScoresPage;