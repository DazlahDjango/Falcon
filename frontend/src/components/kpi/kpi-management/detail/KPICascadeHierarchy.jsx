import React, { useEffect, useState } from 'react';
import { FiRefreshCw, FiTarget, FiLayers } from 'react-icons/fi';
import useTargets from '../../../../hooks/kpi/useTargets';
import useTargetCascade from '../../../../hooks/kpi/useTargetCascade';
import CascadeHierarchyTree from '../../targets/cascade/CascadeHierarchyTree';
import KPILoading from '../../common/KPILoading';
import KPIError from '../../common/KPIError';
import KPIEmptyState from '../../common/KPIEmptyState';

const KPICascadeHierarchy = ({ kpiId, kpi }) => {
    const [targets, setTargets] = useState([]);
    const [selectedTargetId, setSelectedTargetId] = useState('');
    const [tree, setTree] = useState(null);
    const [loadingTargets, setLoadingTargets] = useState(true);
    const [loadingTree, setLoadingTree] = useState(false);
    const [error, setError] = useState(null);

    const { refresh: loadTargetsFromHook } = useTargets();
    const { getTree } = useTargetCascade();

    const loadTargets = async () => {
        if (!kpiId) return;
        setLoadingTargets(true);
        setError(null);
        try {
            const res = await loadTargetsFromHook({ kpi: kpiId, all: 'true' });
            const raw = res?.data || res;
            const list = Array.isArray(raw)
                ? raw
                : (Array.isArray(raw?.results)
                    ? raw.results
                    : (Array.isArray(res?.results) ? res.results : []));

            const sortedList = [...list].sort((a, b) => Number(b.target_value || 0) - Number(a.target_value || 0));
            setTargets(sortedList);

            if (sortedList.length > 0) {
                const mainRootTarget = sortedList.find(t => (t.is_root || t.parent_target_id === null) && (t.cascades_count || 0) > 0)
                    || sortedList.find(t => t.is_root || t.parent_target_id === null)
                    || sortedList.find(t => (t.cascades_count || 0) > 0)
                    || sortedList[0];
                setSelectedTargetId(mainRootTarget.id);
            }
        } catch (err) {
            console.error('Failed to load targets for hierarchy view:', err);
            const isForbidden = err?.response?.status === 403 || err?.status === 403 || String(err?.message || err).includes('403');
            setError(isForbidden ? 'Cascade Hierarchy view is reserved for Organization Executives and Leads.' : (err?.message || 'Failed to load annual targets.'));
        } finally {
            setLoadingTargets(false);
        }
    };

    const loadTree = async (targetId) => {
        if (!targetId) return;
        setLoadingTree(true);
        setError(null);
        try {
            const res = await getTree(targetId);
            console.log('KPICascadeHierarchy getCascadeTree res:', res);
            const data = (res?.data && typeof res.data === 'object' && 'id' in res.data) ? res.data : (res?.id ? res : (res?.data || res));
            console.log('KPICascadeHierarchy parsed tree:', data);
            setTree(data);
        } catch (err) {
            console.error('Failed to load cascade tree for hierarchy view:', err);
            const isForbidden = err?.response?.status === 403 || err?.status === 403 || String(err?.message || err).includes('403');
            setError(isForbidden ? 'Cascade Hierarchy tree is reserved for Organization Executives and Leads.' : (err?.message || 'Failed to load target cascade hierarchy tree.'));
        } finally {
            setLoadingTree(false);
        }
    };

    useEffect(() => {
        loadTargets();
    }, [kpiId]);

    useEffect(() => {
        if (selectedTargetId) {
            loadTree(selectedTargetId);
        }
    }, [selectedTargetId]);

    if (loadingTargets) {
        return <KPILoading text="Loading target options for hierarchy view..." />;
    }

    if (error && !tree) {
        return <KPIError message={error} onRetry={loadTargets} />;
    }

    if (targets.length === 0) {
        return (
            <KPIEmptyState
                icon="🌳"
                title="No Annual Targets Created"
                description="Set an annual target first under the Targets tab to inspect its structural cascade hierarchy tree."
            />
        );
    }

    const currentTarget = targets.find(t => String(t.id) === String(selectedTargetId)) || targets[0];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header & Target Selector Bar */}
            <div
                style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    padding: '20px 24px',
                    borderRadius: '16px',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                }}
            >
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <FiLayers size={20} color="#38bdf8" />
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                            Executive Structural Cascade Hierarchy
                        </h3>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                        Full organizational breakdown tree across Divisions, Departments, Sections, Units, and Individuals for {kpi?.name}.
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>Root Target:</span>
                        <select
                            value={selectedTargetId}
                            onChange={(e) => setSelectedTargetId(e.target.value)}
                            style={{
                                padding: '8px 14px',
                                borderRadius: '8px',
                                border: '1px solid #334155',
                                background: '#1e293b',
                                color: '#f8fafc',
                                fontSize: '0.88rem',
                                outline: 'none',
                                fontWeight: 600
                            }}
                        >
                            {targets.map((t, idx) => {
                                const formattedVal = kpi?.unit && kpi.unit !== '$' && kpi.unit !== 'USD'
                                    ? `${kpi.unit} ${Number(t.target_value).toLocaleString()}`
                                    : `$${Number(t.target_value).toLocaleString()}`;
                                return (
                                    <option key={t.id} value={t.id}>
                                        {idx === 0 ? '👑 Root Org Target' : (t.user_email ? t.user_email.split('@')[0] : `Target ${t.id}`)} ({t.year}) - {formattedVal} ({t.cascades_count || 0} cascades)
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <button
                        onClick={() => selectedTargetId && loadTree(selectedTargetId)}
                        disabled={loadingTree}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: '1px solid #334155',
                            background: '#334155',
                            color: '#f8fafc',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                        }}
                    >
                        <FiRefreshCw size={14} className={loadingTree ? 'spin' : ''} />
                        Refresh Hierarchy
                    </button>
                </div>
            </div>

            {/* Tree Component Render */}
            {loadingTree ? (
                <KPILoading text="Building multi-level structural tree diagram..." />
            ) : (
                <CascadeHierarchyTree tree={tree} unit={kpi?.unit} onRefresh={() => selectedTargetId && loadTree(selectedTargetId)} />
            )}
        </div>
    );
};

export default KPICascadeHierarchy;
