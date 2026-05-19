// src/pages/reviews/PIPDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePIPs } from '../../hooks/reviews';
import { PIPDetail } from '../../components/reviews/pip';
import { REVIEW_ROUTES } from '../../config/constants';

const PIPDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getPIP, fetchPIPProgress, progress, loading, approvePIP, completePIP, getActionsForPIP, getReviewsForPIP } = usePIPs();
    const [pip, setPip] = useState(null);
    const [actions, setActions] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [userRole, setUserRole] = useState('staff');

    useEffect(() => {
        loadData();
        setUserRole(localStorage.getItem('user_role') || 'staff');
    }, [id]);

    const loadData = async () => {
        const data = await getPIP(id);
        setPip(data);
        await fetchPIPProgress(id);
        const actionsData = await getActionsForPIP(id);
        setActions(actionsData);
        const reviewsData = await getReviewsForPIP(id);
        setReviews(reviewsData);
    };

    const canManage = userRole === 'supervisor' || userRole === 'super_admin' || userRole === 'client_admin' || userRole === 'dashboard_champion' || userRole === 'executive';
    const isSupervisor = userRole === 'supervisor';
    const isHr = userRole === 'hr' || userRole === 'admin';

    const handleEdit = () => {
        navigate(REVIEW_ROUTES.REVIEW_PIPS_EDIT(id));
    };

    const handleApprove = async () => {
        if (window.confirm('Are you sure you want to approve this PIP?')) {
            await approvePIP(id);
            loadData();
        }
    };

    const handleComplete = async () => {
        const outcome = window.confirm('Was this PIP completed successfully?') ? 'successful' : 'failed';
        const notes = prompt('Enter outcome notes (optional):');
        await completePIP(id, outcome, notes || '');
        loadData();
    };

    const handleExtend = () => {
        const newDate = prompt('Enter new end date (YYYY-MM-DD):', pip.end_date);
        if (newDate) {
            const reason = prompt('Reason for extension:');
            // await extendPIP(id, newDate, reason);
            loadData();
        }
    };

    const handleAddAction = async (data) => {
        // await createPIPAction({ ...data, pip_id: id });
        loadData();
    };

    const handleCompleteAction = async (actionId) => {
        // await completePIPAction(actionId);
        loadData();
    };

    const handleAddReview = async (pipId, data) => {
        // await createPIPReview({ ...data, pip_id: pipId });
        loadData();
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>Loading PIP details...</div>;
    }

    if (!pip) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ef4444', marginBottom: '0.5rem' }}>PIP Not Found</h2>
                <p style={{ color: '#6b7280', marginBottom: '1rem' }}>The Performance Improvement Plan you're looking for doesn't exist.</p>
                <button className="btn-primary" onClick={() => navigate(REVIEW_ROUTES.REVIEW_PIPS)}>Back to PIPs</button>
            </div>
        );
    }

    return (
        <PIPDetail 
            pip={pip}
            actions={actions}
            reviews={reviews}
            onEdit={handleEdit}
            onApprove={handleApprove}
            onExtend={handleExtend}
            onComplete={handleComplete}
            onAddAction={handleAddAction}
            onCompleteAction={handleCompleteAction}
            onAddReview={handleAddReview}
            canManage={canManage}
            isManager={isManager}
            isHr={isHr}
        />
    );
};

export default PIPDetailPage;