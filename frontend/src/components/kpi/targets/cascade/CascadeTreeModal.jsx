import React, { useEffect, useState } from 'react';
import { FiX, FiRefreshCw, FiTool, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import CascadeTree from './CascadeTree';
import KPILoading from '../../common/KPILoading';
import KPIError from '../../common/KPIError';
import { useTargetCascade } from '../../../../hooks/kpi';

const CascadeTreeModal = ({ targetId, kpiId, year = 2026, targetName, onClose }) => {
    const { 
        cascadeTree, 
        loading, 
        submitting, 
        error, 
        integrityReport, 
        repairResult, 
        loadCascadeTree, 
        repairCascade, 
        verifyCascadeIntegrity 
    } = useTargetCascade();

    const [statusMessage, setStatusMessage] = useState(null);

    const handleRefresh = () => {
        if (targetId) {
            loadCascadeTree(targetId);
        }
    };

    const handleVerifyIntegrity = async () => {
        if (!targetId) return;
        try {
            const report = await verifyCascadeIntegrity(targetId);
            if (report?.valid) {
                setStatusMessage({ type: 'success', text: `Integrity 100% Valid (${report.total_contribution}% total contribution)` });
            } else {
                setStatusMessage({ type: 'warning', text: `Integrity Issue: ${report?.issues?.[0]?.reason || 'Check split percentages'}` });
            }
        } catch (err) {
            setStatusMessage({ type: 'error', text: err?.message || 'Integrity check failed' });
        }
    };

    const handleRepair = async () => {
        if (!kpiId) {
            setStatusMessage({ type: 'warning', text: 'KPI ID required for repair' });
            return;
        }
        try {
            const result = await repairCascade(kpiId, year);
            setStatusMessage({ type: 'success', text: `Repaired! ${result.maps_created} maps rebuilt across ${result.parents} parents.` });
            if (targetId) loadCascadeTree(targetId);
        } catch (err) {
            setStatusMessage({ type: 'error', text: err?.message || 'Repair failed' });
        }
    };

    useEffect(() => {
        if (targetId) {
            loadCascadeTree(targetId);
        }
    }, [targetId, loadCascadeTree]);

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1300,
                backdropFilter: 'blur(5px)',
                padding: '20px'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    width: '95%',
                    maxWidth: '950px',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
                    overflow: 'hidden'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div
                    style={{
                        padding: '18px 24px',
                        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid #334155'
                    }}
                >
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                            Cascade Breakdown Tree
                        </h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                            {targetName ? `Target: ${targetName}` : 'View target allocations down to individual levels'}
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                            onClick={handleVerifyIntegrity}
                            disabled={loading || submitting}
                            style={{
                                background: '#1e293b',
                                border: '1px solid #475569',
                                color: '#38bdf8',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 600
                            }}
                            title="Verify Split Integrity"
                        >
                            <FiCheckCircle size={14} />
                            Verify Integrity
                        </button>
                        <button
                            onClick={handleRepair}
                            disabled={loading || submitting}
                            style={{
                                background: '#1e293b',
                                border: '1px solid #475569',
                                color: '#f59e0b',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 600
                            }}
                            title="Self-heal reporting relationships"
                        >
                            <FiTool size={14} />
                            Repair Structure
                        </button>
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            style={{
                                background: '#334155',
                                border: 'none',
                                color: '#f8fafc',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '0.8rem'
                            }}
                            title="Refresh Tree"
                        >
                            <FiRefreshCw size={14} className={loading ? 'spin' : ''} />
                            Refresh
                        </button>
                        <button
                            onClick={onClose}
                            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                        >
                            <FiX size={22} />
                        </button>
                    </div>
                </div>

                {/* Status Message Banner */}
                {statusMessage && (
                    <div style={{
                        padding: '10px 24px',
                        background: statusMessage.type === 'success' ? '#dcfce7' : statusMessage.type === 'warning' ? '#fef3c7' : '#fee2e2',
                        color: statusMessage.type === 'success' ? '#15803d' : statusMessage.type === 'warning' ? '#b45309' : '#b91c1c',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        borderBottom: '1px solid #e2e8f0'
                    }}>
                        {statusMessage.type === 'success' ? <FiCheckCircle size={16} /> : <FiAlertTriangle size={16} />}
                        <span>{statusMessage.text}</span>
                    </div>
                )}

                {/* Modal Body */}
                <div style={{ padding: '24px', overflowY: 'auto', flex: 1, background: '#f8fafc' }}>
                    {loading ? (
                        <KPILoading text="Loading cascade tree..." />
                    ) : error ? (
                        <KPIError message={typeof error === 'string' ? error : (error?.message || 'Failed to load target cascade tree.')} onRetry={handleRefresh} />
                    ) : (
                        <CascadeTree tree={cascadeTree} />
                    )}
                </div>

                {/* Modal Footer */}
                <div
                    style={{
                        padding: '14px 24px',
                        background: '#ffffff',
                        borderTop: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'flex-end'
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{
                            padding: '8px 20px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#334155',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CascadeTreeModal;

