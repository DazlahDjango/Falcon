import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTarget, fetchPhasing, phaseTarget, selectCurrentTarget, selectMonthlyPhasing } from '../../../store/kpi';
import { MonthlyPhasing } from '../../../components/kpi';
import KPILoading from '../../../components/kpi/common/KPILoading';
import { useKPIPermissions } from '../../../hooks/kpi';

const TargetPhasingPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { canManageKPIs } = useKPIPermissions();
    
    const target = useSelector(selectCurrentTarget);
    const phasing = useSelector(state => selectMonthlyPhasing(id)(state));
    const loading = useSelector(state => state.target.loading);
    
    useEffect(() => {
        if (id) {
            dispatch(fetchTarget(id));
            dispatch(fetchPhasing(id));
        }
    }, [dispatch, id]);
    
    const handleGeneratePhasing = async (strategy, params) => {
        await dispatch(phaseTarget({ id, strategy, strategyParams: params })).unwrap();
        dispatch(fetchPhasing(id));
    };
    
    const handleSavePhasing = async (updatedPhasing) => {
        // Save individual monthly values
        for (const item of updatedPhasing) {
            await dispatch(updateMonthlyPhasing({ id: item.id, data: { target_value: item.target_value } })).unwrap();
        }
        dispatch(fetchPhasing(id));
    };
    
    const handleLockPhasing = async () => {
        await dispatch(lockPhasingCycle(target?.year?.toString())).unwrap();
        dispatch(fetchPhasing(id));
    };
    
    if (loading) {
        return <KPILoading text="Loading phasing data..." />;
    }
    
    return (
        <div className="kpi-page-container">
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate('/targets')}>← Back</button>
                <h1>Monthly Phasing: {target?.kpi_name}</h1>
            </div>
            
            <MonthlyPhasing 
                target={target}
                phasing={phasing}
                onGeneratePhasing={canManageKPIs ? handleGeneratePhasing : null}
                onSave={canManageKPIs ? handleSavePhasing : null}
                onLock={canManageKPIs ? handleLockPhasing : null}
                canEdit={canManageKPIs}
                canLock={canManageKPIs}
            />
        </div>
    );
};

export default TargetPhasingPage;