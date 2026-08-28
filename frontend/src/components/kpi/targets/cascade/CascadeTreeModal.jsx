import React, { useEffect, useState } from 'react';
import { FiX, FiRefreshCw } from 'react-icons/fi';
import CascadeTree from './CascadeTree';
import KPILoading from '../../common/KPILoading';
import KPIError from '../../common/KPIError';
import { targetService } from '../../../../services/kpi/target.service';

const CascadeTreeModal = ({ targetId, targetName, onClose }) => {
    const [tree, setTree] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadTree = async () => {
        if (!targetId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await targetService.getCascadeTree(targetId);
            setTree(data?.data && typeof data.data === 'object' && 'id' in data.data ? data.data : data);
        } catch (err) {
            console.error('Failed to load cascade tree:', err);
            setError(err?.message || err?.error || 'Failed to load target cascade tree.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTree();
    }, [targetId]);

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
                    maxWidth: '900px',
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                            onClick={loadTree}
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

                {/* Modal Body */}
                <div style={{ padding: '24px', overflowY: 'auto', flex: 1, background: '#f8fafc' }}>
                    {loading ? (
                        <KPILoading text="Loading cascade tree..." />
                    ) : error ? (
                        <KPIError message={error} onRetry={loadTree} />
                    ) : (
                        <CascadeTree tree={tree} />
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
