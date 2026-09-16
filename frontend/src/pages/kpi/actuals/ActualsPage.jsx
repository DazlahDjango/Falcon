import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiTrash2, FiAlertTriangle, FiGrid, FiList, FiPlus } from 'react-icons/fi';
import { ActualList, ActualDetail, ActualSubmit, ActualMatrixGrid } from '../../../components/kpi';
import { useKPIPermissions } from '../../../hooks/kpi';
import { useAuthContext } from '../../../contexts/accounts/AuthContext';
import {
    fetchActuals,
    fetchUserKPIs,
    fetchKPIs,
    fetchTargets,
    deleteActual,
    setActualFilters,
    selectActuals,
    selectActualLoading,
    selectActualPagination,
    selectActualFilters,
    selectUserKPIs,
    selectKPIs,
    selectTargets
} from '../../../store/kpi';

const ActualsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { user: authUser } = useAuthContext();
    const { canValidateActuals, canManageKPIs, isManager, isExecutive, isSupervisor, isClientAdmin, isSuperAdmin, isDashboardChampion } = useKPIPermissions();
    const canValidate = canValidateActuals || canManageKPIs || isManager || isExecutive || isSupervisor || isClientAdmin || isSuperAdmin || isDashboardChampion;

    const [viewMode, setViewMode] = useState('matrix'); // 'matrix' | 'list'
    const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
    const [selectedActualId, setSelectedActualId] = useState(null);
    const [editingActual, setEditingActual] = useState(null);
    const [deletingActual, setDeletingActual] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(() => 
        location.pathname.includes('/submit') || location.pathname.endsWith('/submit')
    );

    const scope = new URLSearchParams(location.search).get('scope') || 'my';

    const userKpis = useSelector(state => selectUserKPIs(authUser?.id)(state)) || [];
    const allKpis = useSelector(selectKPIs) || [];
    const targets = useSelector(selectTargets) || [];

    useEffect(() => {
        if (scope === 'team') {
            dispatch(fetchKPIs({ scope: 'team', page_size: 100 }));
            dispatch(fetchTargets({ scope: 'team', year: selectedYear, pageSize: 200 }));
        } else {
            if (authUser?.id) {
                dispatch(fetchUserKPIs({ userId: authUser.id, params: { for_actuals: true } }));
            }
            dispatch(fetchKPIs({ scope: 'my', page_size: 100 }));
            dispatch(fetchTargets({ scope: 'my', year: selectedYear, pageSize: 200 }));
        }
    }, [dispatch, authUser?.id, selectedYear, scope]);

    useEffect(() => {
        if (location.pathname.includes('/submit')) {
            setShowSubmitModal(true);
        }
    }, [location.pathname]);


    const actuals = useSelector(selectActuals) || [];
    const loading = useSelector(selectActualLoading);
    const pagination = useSelector(selectActualPagination);
    const filters = useSelector(selectActualFilters) || {};

    const loadActuals = useCallback(() => {
        if (viewMode === 'list') {
            dispatch(fetchActuals({
                page: pagination.page || 1,
                page_size: pagination.pageSize || 20,
                ...filters,
                ...(scope ? { scope } : {})
            }));
        } else {
            dispatch(fetchActuals({
                scope,
                year: selectedYear,
                page_size: 200
            }));
        }
    }, [dispatch, pagination.page, pagination.pageSize, filters, scope, viewMode, selectedYear]);

    useEffect(() => {
        loadActuals();
    }, [loadActuals]);

    const handleViewActual = (actualOrId) => {
        const id = typeof actualOrId === 'object' ? actualOrId?.id : actualOrId;
        if (id) setSelectedActualId(id);
    };

    const handleBackToList = () => {
        setSelectedActualId(null);
    };

    const handleEditActual = (actual) => {
        setEditingActual(actual);
        setShowSubmitModal(true);
    };

    const handleDeleteClick = (actual) => {
        setDeletingActual(actual);
    };

    const handleConfirmDelete = async () => {
        if (!deletingActual) return;
        try {
            setIsDeleting(true);
            await dispatch(deleteActual(deletingActual.id)).unwrap();
            setDeletingActual(null);
            dispatch(fetchActuals({
                page: pagination.page || 1,
                page_size: pagination.pageSize || 20,
                ...filters,
                ...(scope ? { scope } : {})
            }));
        } catch (err) {
            alert(typeof err === 'string' ? err : (err?.error || err?.detail || 'Failed to delete actual.'));
        } finally {
            setIsDeleting(false);
        }
    };

    const handleFilterChange = (key, value) => {
        dispatch(setActualFilters({ [key]: value }));
    };

    const handleClearFilters = () => {
        dispatch(setActualFilters({ status: null, year: null, month: null, search: '' }));
    };

    const handlePageChange = (page) => {
        dispatch(fetchActuals({ page, page_size: pagination.pageSize || 20, ...filters }));
    };

    const handlePageSizeChange = (pageSize) => {
        dispatch(fetchActuals({ page: 1, page_size: pageSize, ...filters }));
    };

    const handleModalClose = () => {
        setShowSubmitModal(false);
        setEditingActual(null);
        if (location.pathname.includes('/submit')) {
            navigate('/kpi/actuals');
        }
        dispatch(fetchActuals());
    };

    const handleAddFromMatrix = ({ kpi_id, year, month, user_id }) => {
        setEditingActual({
            kpi_id,
            year,
            month,
            user_id: user_id || authUser?.id,
            actual_value: '',
            notes: ''
        });
        setShowSubmitModal(true);
    };

    if (selectedActualId) {
        return (
            <ActualDetail
                actualId={selectedActualId}
                onBack={handleBackToList}
                canValidate={canValidate}
            />
        );
    }

    return (
        <div className="kpi-page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a' }}>
                        {scope === 'team' ? 'Team Actual Submissions' : 'My Actual Submissions'}
                    </h1>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                        {scope === 'team' 
                            ? 'Monitor and validate month-by-month performance actuals for all team direct reports'
                            : 'Log and track your personal monthly performance actuals against target benchmarks'
                        }
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {/* View Switcher Toggle */}
                    <div style={{
                        display: 'flex',
                        background: '#f1f5f9',
                        padding: '3px',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <button
                            type="button"
                            onClick={() => setViewMode('matrix')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '0.45rem 0.9rem',
                                borderRadius: '7px',
                                border: 'none',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                background: viewMode === 'matrix' ? '#ffffff' : 'transparent',
                                color: viewMode === 'matrix' ? '#0284c7' : '#64748b',
                                boxShadow: viewMode === 'matrix' ? '0 2px 5px rgba(0,0,0,0.06)' : 'none'
                            }}
                        >
                            <FiGrid size={14} />
                            Monthly Matrix
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('list')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '0.45rem 0.9rem',
                                borderRadius: '7px',
                                border: 'none',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                background: viewMode === 'list' ? '#ffffff' : 'transparent',
                                color: viewMode === 'list' ? '#0284c7' : '#64748b',
                                boxShadow: viewMode === 'list' ? '0 2px 5px rgba(0,0,0,0.06)' : 'none'
                            }}
                        >
                            <FiList size={14} />
                            List View
                        </button>
                    </div>

                    <button
                        className="submit-btn"
                        onClick={() => {
                            setEditingActual(null);
                            setShowSubmitModal(true);
                        }}
                        style={{
                            padding: '0.6rem 1.25rem',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#0284c7',
                            color: '#ffffff',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)'
                        }}
                    >
                        <FiPlus size={16} />
                        Submit Monthly Actual
                    </button>
                </div>
            </div>

            {viewMode === 'matrix' ? (
                <ActualMatrixGrid 
                    actuals={actuals}
                    kpis={scope === 'team' ? (allKpis.length > 0 ? allKpis : userKpis) : (userKpis.length > 0 ? userKpis : allKpis)}
                    targets={targets}
                    selectedYear={selectedYear}
                    onYearChange={setSelectedYear}
                    onCellClick={handleViewActual}
                    onAddClick={handleAddFromMatrix}
                    loading={loading}
                />
            ) : (
                <ActualList
                    actuals={actuals}
                    loading={loading}
                    pagination={pagination}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    onRowClick={handleViewActual}
                    onStatusClick={handleViewActual}
                    onEdit={handleEditActual}
                    onDelete={handleDeleteClick}
                    canValidate={canValidate}
                />
            )}

            {showSubmitModal && (
                <ActualSubmit
                    initialData={editingActual}
                    onComplete={handleModalClose}
                    onCancel={handleModalClose}
                />
            )}

            {/* Confirm Delete Dialog */}
            {deletingActual && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.65)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1300,
                        backdropFilter: 'blur(4px)',
                        padding: '20px'
                    }}
                >
                    <div
                        style={{
                            background: '#ffffff',
                            borderRadius: '16px',
                            maxWidth: '440px',
                            width: '100%',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            overflow: 'hidden',
                            animation: 'modalSlideIn 0.2s ease-out'
                        }}
                    >
                        <div style={{ padding: '24px 24px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    backgroundColor: '#fee2e2',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#dc2626'
                                }}>
                                    <FiAlertTriangle size={20} />
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 600 }}>
                                    Delete Submission
                                </h3>
                            </div>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem', lineHeight: 1.5 }}>
                                Are you sure you want to delete this actual submission for <strong>{deletingActual?.kpi_name || deletingActual?.kpi?.name}</strong>? This action cannot be undone.
                            </p>
                        </div>
                        <div style={{
                            padding: '16px 24px',
                            backgroundColor: '#f8fafc',
                            borderTop: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '10px'
                        }}>
                            <button
                                type="button"
                                onClick={() => setDeletingActual(null)}
                                disabled={isDeleting}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    border: '1px solid #cbd5e1',
                                    backgroundColor: '#ffffff',
                                    color: '#475569',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                style={{
                                    padding: '0.5rem 1.25rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: '#dc2626',
                                    color: '#ffffff',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <FiTrash2 size={14} />
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActualsPage;