import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { TargetList, TargetCreate, CascadeRules, CascadeMapping, CascadeTreeModal, TargetPhasingModal } from '../../../components/kpi';
import { useKPIPermissions, useTargets, useCascadeRules } from '../../../hooks/kpi';
import { fetchTarget, createCascadeMap, phaseTarget, bulkUpdateMonthlyPhasing, lockPhasingCycle } from '../../../store/kpi';

const TargetsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { canManageKPIs, canCascadeTargets } = useKPIPermissions();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [cascadeTarget, setCascadeTarget] = useState(null);
    const [loadingCascadeTarget, setLoadingCascadeTarget] = useState(false);
    const [viewTreeTarget, setViewTreeTarget] = useState(null);
    const [phasingTarget, setPhasingTarget] = useState(null);

    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const scope = queryParams.get('scope');
    const targetParams = useMemo(() => (scope ? { scope } : {}), [scope]);

    const { targets, loading, remove, refresh } = useTargets(targetParams);
    const cascadeRules = useCascadeRules();

    const targetIdFromQuery = queryParams.get('targetId');

    useEffect(() => {
        if (targetIdFromQuery) {
            setLoadingCascadeTarget(true);
            dispatch(fetchTarget(targetIdFromQuery))
                .unwrap()
                .then(res => {
                    setCascadeTarget(res);
                })
                .catch(err => console.error(err))
                .finally(() => setLoadingCascadeTarget(false));
        } else {
            setCascadeTarget(null);
        }
    }, [dispatch, targetIdFromQuery]);

    const handleViewTarget = (id) => {
        navigate(`/targets/${id}`);
    };

    const handleEditTarget = (target) => {
        navigate(`/targets/${target.id}/edit`);
    };

    const handleCreateTarget = () => {
        setShowCreateModal(true);
    };

    const handleCascadeTrigger = (target) => {
        navigate(`/kpi/targets/cascade?targetId=${target.id}`);
    };

    const handleCascadeAction = async (cascadeData) => {
        try {
            await dispatch(createCascadeMap(cascadeData)).unwrap();
            alert('Target cascaded successfully!');
            navigate('/kpi/targets');
        } catch (err) {
            alert('Failed to cascade: ' + (err.error || err.message || JSON.stringify(err)));
        }
    };

    const [filters, setFilters] = useState({ year: '', status: '', search: '' });

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleClearFilters = () => {
        setFilters({ year: '', status: '', search: '' });
    };

    const filteredTargets = (targets || []).filter(t => {
        if (filters.year && String(t.year) !== String(filters.year)) return false;
        if (filters.status && (t.status || '').toLowerCase() !== filters.status.toLowerCase()) return false;
        if (filters.search) {
            const q = filters.search.toLowerCase();
            const kpiName = (t.kpi_name || t.kpi?.name || '').toLowerCase();
            const userName = (t.user_name || t.user?.email || t.user_email || '').toLowerCase();
            if (!kpiName.includes(q) && !userName.includes(q)) return false;
        }
        return true;
    });

    const currentTab = location.pathname === '/kpi/targets/cascade/rules'
        ? 'rules'
        : location.pathname === '/kpi/targets/cascade'
            ? 'cascade'
            : 'list';

    return (
        <div className="kpi-page-container">
            <div className="kpi-page-header" style={{ marginBottom: '20px' }}>
                <div className="kpi-page-title-section">
                    <h2>Target Management</h2>
                    <p className="kpi-page-subtitle">Configure annual targets, cascade objectives, and manage splits</p>
                </div>
            </div>

            <div className="kpi-detail-tabs" style={{ marginBottom: '25px', display: 'flex', borderBottom: '1px solid var(--kpi-gray-200)' }}>
                <button
                    className={`kpi-detail-tab ${currentTab === 'list' ? 'active' : ''}`}
                    onClick={() => navigate('/kpi/targets')}
                    style={{ padding: '12px 24px', background: 'transparent', border: 'none', borderBottom: currentTab === 'list' ? '2px solid var(--kpi-primary)' : 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                    Annual Targets
                </button>
                {canCascadeTargets && (
                    <>
                        <button
                            className={`kpi-detail-tab ${currentTab === 'cascade' ? 'active' : ''}`}
                            onClick={() => navigate('/kpi/targets/cascade')}
                            style={{ padding: '12px 24px', background: 'transparent', border: 'none', borderBottom: currentTab === 'cascade' ? '2px solid var(--kpi-primary)' : 'none', cursor: 'pointer', fontWeight: 600 }}
                        >
                            Cascade Targets
                        </button>
                        <button
                            className={`kpi-detail-tab ${currentTab === 'rules' ? 'active' : ''}`}
                            onClick={() => navigate('/kpi/targets/cascade/rules')}
                            style={{ padding: '12px 24px', background: 'transparent', border: 'none', borderBottom: currentTab === 'rules' ? '2px solid var(--kpi-primary)' : 'none', cursor: 'pointer', fontWeight: 600 }}
                        >
                            Cascade Rules
                        </button>
                    </>
                )}
            </div>

            <div className="kpi-page-content">
                {currentTab === 'rules' && (
                    <CascadeRules
                        rules={cascadeRules.rules}
                        loading={cascadeRules.loading}
                        onCreate={cascadeRules.create}
                        onUpdate={cascadeRules.update}
                        onDelete={cascadeRules.remove}
                        onSetDefault={cascadeRules.setDefault}
                        canManage={canCascadeTargets}
                    />
                )}

                {currentTab === 'cascade' && (
                    <>
                        {loadingCascadeTarget ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>Loading organization target details...</div>
                        ) : cascadeTarget ? (
                            <CascadeMapping
                                orgTarget={cascadeTarget}
                                onCascade={handleCascadeAction}
                                loading={loadingCascadeTarget}
                            />
                        ) : (
                            <div style={{ padding: '40px', background: 'white', borderRadius: '8px', textAlign: 'center' }}>
                                <h3>Select a target to cascade</h3>
                                <p style={{ color: 'var(--kpi-gray-500)', marginBottom: '20px' }}>Please go to the Annual Targets tab and click the Cascade icon on any target to begin the wizard.</p>
                                <button
                                    className="kpi-cascade-add-btn"
                                    style={{ margin: '0 auto' }}
                                    onClick={() => navigate('/kpi/targets')}
                                >
                                    Go to Targets List
                                </button>
                            </div>
                        )}
                    </>
                )}

                {currentTab === 'list' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                            {canManageKPIs && (
                                <button className="kpi-cascade-add-btn" onClick={handleCreateTarget}>
                                    Create Target
                                </button>
                            )}
                        </div>
                        <TargetList
                            targets={filteredTargets}
                            loading={loading}
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onClearFilters={handleClearFilters}
                            onRowClick={handleViewTarget}
                            onEdit={handleEditTarget}
                            onDelete={remove}
                            onCascade={handleCascadeTrigger}
                            onViewTree={(t) => setViewTreeTarget(t)}
                            onPhase={(t) => setPhasingTarget(t)}
                            canEdit={canManageKPIs}
                            canDelete={canManageKPIs}
                            canCascade={canCascadeTargets}
                        />
                    </>
                )}
            </div>

            {showCreateModal && (
                <TargetCreate
                    onComplete={() => {
                        setShowCreateModal(false);
                        refresh();
                    }}
                    onCancel={() => setShowCreateModal(false)}
                />
            )}

            {/* Cascade Tree Modal */}
            {viewTreeTarget && (
                <CascadeTreeModal
                    targetId={viewTreeTarget.id}
                    targetName={`${viewTreeTarget.kpi_name || viewTreeTarget.kpi?.name || 'KPI Target'} (${viewTreeTarget.year})`}
                    onClose={() => setViewTreeTarget(null)}
                />
            )}

            {/* Target Phasing Modal */}
            {phasingTarget && (
                <TargetPhasingModal
                    target={phasingTarget}
                    onClose={() => setPhasingTarget(null)}
                    onSave={async ({ targetId, strategy, monthlyValues }) => {
                        try {
                            if (strategy && strategy !== 'CUSTOM') {
                                await dispatch(phaseTarget({ id: targetId, strategy, overwrite: true })).unwrap();
                            } else if (monthlyValues && monthlyValues.length === 12) {
                                await dispatch(bulkUpdateMonthlyPhasing({ annualTargetId: targetId, months: monthlyValues })).unwrap();
                            }
                            alert('Monthly target phasing saved successfully!');
                            setPhasingTarget(null);
                            refresh();
                        } catch (err) {
                            alert('Failed to save phasing: ' + (err.message || err.error || JSON.stringify(err)));
                        }
                    }}
                    onLock={async (targetId, cycleName) => {
                        try {
                            await dispatch(lockPhasingCycle({ performanceCycle: cycleName || `FY${phasingTarget.year}` })).unwrap();
                            alert('Phasing cycle locked successfully!');
                            setPhasingTarget(null);
                            refresh();
                        } catch (err) {
                            alert('Failed to lock cycle: ' + (err.message || err.error || JSON.stringify(err)));
                        }
                    }}
                    readOnly={!canManageKPIs}
                />
            )}
        </div>
    );
};

export default TargetsPage;