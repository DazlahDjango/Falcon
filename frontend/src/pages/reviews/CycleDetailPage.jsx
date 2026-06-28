// src/pages/reviews/CycleDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCycles } from '../../hooks/reviews';
import { CycleDetail } from '../../components/reviews/cycles';
import { REVIEW_ROUTES } from '../../config/constants';

const CycleDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getCycle, fetchCycleProgress, progress, loading, activateCycle, closeCycle, archiveCycle } = useCycles();
    const [cycle, setCycle] = useState(null);
    const [userRole, setUserRole] = useState('staff');

    useEffect(() => {
        loadCycle();
        setUserRole(localStorage.getItem('user_role') || 'staff');
    }, [id]);

    const loadCycle = async () => {
        const data = await getCycle(id);
        setCycle(data);
        await fetchCycleProgress(id);
    };

    const canManage = userRole === 'super_admin' || userRole === 'client_admin' || userRole === 'dashboard_champion' || userRole === 'executive' || userRole === 'hr';

    const handleEdit = () => {
        navigate(REVIEW_ROUTES.REVIEW_CYCLES_EDIT(id));
    };

    const handleActivate = async () => {
        if (window.confirm('Are you sure you want to activate this cycle?')) {
            await activateCycle(id);
            loadCycle();
        }
    };

    const handleClose = async () => {
        if (window.confirm('Are you sure you want to close this cycle?')) {
            await closeCycle(id);
            loadCycle();
        }
    };

    const handleArchive = async () => {
        if (window.confirm('Are you sure you want to archive this cycle?')) {
            await archiveCycle(id);
            navigate(REVIEW_ROUTES.REVIEW_CYCLES);
        }
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>Loading cycle details...</div>;
    }

    if (!cycle) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ef4444', marginBottom: '0.5rem' }}>Cycle Not Found</h2>
                <p style={{ color: '#6b7280', marginBottom: '1rem' }}>The review cycle you're looking for doesn't exist.</p>
                <button className="btn-primary" onClick={() => navigate(REVIEW_ROUTES.REVIEW_CYCLES)}>Back to Cycles</button>
            </div>
        );
    }

    return (
        <CycleDetail 
            cycle={cycle}
            progress={progress}
            onEdit={handleEdit}
            onActivate={handleActivate}
            onClose={handleClose}
            onArchive={handleArchive}
            canManage={canManage}
        />
    );
};

export default CycleDetailPage;