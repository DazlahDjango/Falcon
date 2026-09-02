import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiPlus, FiClock, FiTarget } from 'react-icons/fi';
import { KPIList, KPICreate, StaffKPICreateModal, KPIPendingApprovalsModal } from '../../../components/kpi';
import { useKPIPermissions } from '../../../hooks/kpi';
import { KpiPaths } from '../../../routes/kpi.routes';

const KPIsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { canManageKPIs, canApproveKPI, role, isSuperAdmin } = useKPIPermissions();
    const [showAdminCreateModal, setShowAdminCreateModal] = useState(false);
    const [showStaffCreateModal, setShowStaffCreateModal] = useState(false);
    const [showPendingApprovalsModal, setShowPendingApprovalsModal] = useState(false);

    useEffect(() => {
        if (location.pathname.includes('/create') || location.state?.categoryId || location.state?.openCreate) {
            if (canManageKPIs) {
                setShowAdminCreateModal(true);
            } else {
                setShowStaffCreateModal(true);
            }
        }
    }, [location, canManageKPIs]);

    const handleViewKPI = (id) => {
        navigate(KpiPaths.KPIDetail(id));
    };

    const handleEditKPI = (id) => {
        navigate(KpiPaths.KPIEdit(id));
    };

    const handleCreateAdminComplete = (newKPI) => {
        setShowAdminCreateModal(false);
        if (newKPI?.id) navigate(KpiPaths.KPIDetail(newKPI.id));
    };

    const handleCreateStaffComplete = (newKPI) => {
        setShowStaffCreateModal(false);
        if (newKPI?.id) navigate(KpiPaths.KPIDetail(newKPI.id));
    };

    return (
        <div className="kpi-page-container">
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                marginBottom: '1rem',
                padding: '0 0.5rem'
            }}>
                {canApproveKPI && (
                    <button
                        type="button"
                        onClick={() => setShowPendingApprovalsModal(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.6rem 1.1rem',
                            borderRadius: '8px',
                            border: '1px solid #f59e0b',
                            backgroundColor: '#fffbeb',
                            color: '#b45309',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                    >
                        <FiClock size={16} />
                        <span>Pending KPI Approvals</span>
                    </button>
                )}

                <button
                    type="button"
                    onClick={() => setShowStaffCreateModal(true)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.6rem 1.1rem',
                        borderRadius: '8px',
                        border: '1px solid #0284c7',
                        backgroundColor: '#f0f9ff',
                        color: '#0369a1',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                >
                    <FiTarget size={16} />
                    <span>Propose Staff KPI</span>
                </button>
            </div>

            <KPIList
                onViewKPI={handleViewKPI}
                onCreateKPI={canManageKPIs ? () => setShowAdminCreateModal(true) : () => setShowStaffCreateModal(true)}
                onEditKPI={canManageKPIs ? handleEditKPI : null}
            />

            {showAdminCreateModal && (
                <KPICreate
                    onComplete={handleCreateAdminComplete}
                    onCancel={() => setShowAdminCreateModal(false)}
                />
            )}

            {showStaffCreateModal && (
                <StaffKPICreateModal
                    onComplete={handleCreateStaffComplete}
                    onCancel={() => setShowStaffCreateModal(false)}
                />
            )}

            {showPendingApprovalsModal && (
                <KPIPendingApprovalsModal
                    onClose={() => setShowPendingApprovalsModal(false)}
                />
            )}
        </div>
    );
};

export default KPIsPage;