// src/pages/reviews/PredictionsPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePredictions } from '../../hooks/reviews';
import { ReviewHighRiskList } from '../../components/reviews/reviewAnalytics';
import { REVIEW_ROUTES, RISK_LEVELS, RISK_LEVEL_LABELS, RISK_LEVEL_COLORS } from '../../config/constants';

const PredictionsPage = () => {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState('staff');
    const [filterRisk, setFilterRisk] = useState('');
    
    const {
        loading,
        predictions,
        highRiskEmployees,
        fetchPredictions,
        fetchHighRiskEmployees,
        filterByRiskLevel,
        getRiskLevelCounts,
    } = usePredictions({ autoFetch: true });

    useEffect(() => {
        setUserRole(localStorage.getItem('user_role') || 'staff');
    }, []);

    const canView = userRole === 'super_admin' || userRole === 'client_admin' || userRole === 'dashboard_champion' || userRole === 'executive' || userRole === 'supervisor' || userRole === 'manager' || userRole === 'hr';

    const riskLevels = [
        { value: '', label: 'All Risks' },
        { value: RISK_LEVELS.CRITICAL, label: RISK_LEVEL_LABELS[RISK_LEVELS.CRITICAL], color: RISK_LEVEL_COLORS[RISK_LEVELS.CRITICAL] },
        { value: RISK_LEVELS.HIGH, label: RISK_LEVEL_LABELS[RISK_LEVELS.HIGH], color: RISK_LEVEL_COLORS[RISK_LEVELS.HIGH] },
        { value: RISK_LEVELS.MEDIUM, label: RISK_LEVEL_LABELS[RISK_LEVELS.MEDIUM], color: RISK_LEVEL_COLORS[RISK_LEVELS.MEDIUM] },
        { value: RISK_LEVELS.LOW, label: RISK_LEVEL_LABELS[RISK_LEVELS.LOW], color: RISK_LEVEL_COLORS[RISK_LEVELS.LOW] },
    ];

    const riskCounts = getRiskLevelCounts();

    const handleEmployeeClick = (employeeId) => {
        navigate(`${REVIEW_ROUTES.REVIEW_PIPS}?employee=${employeeId}`);
    };

    const handleFilterChange = (riskLevel) => {
        setFilterRisk(riskLevel);
        filterByRiskLevel(riskLevel);
    };

    const handleClearFilters = () => {
        setFilterRisk('');
        filterByRiskLevel('');
    };

    const handleExport = async () => {
        const { analyticsExportService } = await import('../../services/reviews');
        const blob = await analyticsExportService.exportPredictionsAnalytics('pdf', {
            risk_level: filterRisk || undefined,
        });
        analyticsExportService.downloadBlob(blob, `predictions_${Date.now()}.pdf`);
    };

    if (!canView) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ef4444', marginBottom: '0.5rem' }}>Access Denied</h2>
                <p style={{ color: '#6b7280', marginBottom: '1rem' }}>You don't have permission to view predictions.</p>
                <button className="btn-primary" onClick={() => navigate(REVIEW_ROUTES.REVIEW_DASHBOARD)}>Go to Dashboard</button>
            </div>
        );
    }

    return (
        <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>Flight Risk Predictions</h1>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    AI-powered predictions to identify employees at risk of leaving
                </p>
            </div>

            {/* Stats Summary */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: '1rem', 
                marginBottom: '1.5rem' 
            }}>
                {riskLevels.filter(r => r.value).map(risk => (
                    <div 
                        key={risk.value}
                        onClick={() => handleFilterChange(risk.value)}
                        style={{ 
                            background: 'white', 
                            padding: '1rem', 
                            borderRadius: '0.5rem',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            cursor: 'pointer',
                            border: filterRisk === risk.value ? `2px solid ${risk.color}` : '1px solid #e5e7eb',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: risk.color }}>
                            {riskCounts[risk.value] || 0}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{risk.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ 
                display: 'flex', 
                gap: '0.75rem', 
                marginBottom: '1.5rem',
                flexWrap: 'wrap'
            }}>
                <button
                    onClick={handleClearFilters}
                    style={{
                        padding: '0.5rem 1rem',
                        background: '#f3f4f6',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                    }}
                >
                    Clear Filters
                </button>

                <button
                    onClick={handleExport}
                    style={{
                        padding: '0.5rem 1rem',
                        background: '#4f46e5',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        marginLeft: 'auto'
                    }}
                >
                    Export Report
                </button>
            </div>

            {/* High Risk List */}
            <ReviewHighRiskList
                employees={filterRisk ? highRiskEmployees.filter(e => e.risk_level === filterRisk) : highRiskEmployees}
                onEmployeeClick={handleEmployeeClick}
                loading={loading}
            />
        </div>
    );
};

export default PredictionsPage;