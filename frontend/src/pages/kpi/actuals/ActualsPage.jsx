import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ActualList, ActualDetail, ActualSubmit } from '../../../components/kpi';
import { useKPIPermissions } from '../../../hooks/kpi';
import {
    fetchActuals,
    setActualFilters,
    selectActuals,
    selectActualLoading,
    selectActualPagination,
    selectActualFilters
} from '../../../store/kpi';

const ActualsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { canValidateActuals, canManageKPIs, isManager, isExecutive, isSupervisor } = useKPIPermissions();
    const canValidate = canValidateActuals || canManageKPIs || isManager || isExecutive || isSupervisor;

    const [selectedActualId, setSelectedActualId] = useState(null);
    const [showSubmitModal, setShowSubmitModal] = useState(() => 
        location.pathname.includes('/submit') || location.pathname.endsWith('/submit')
    );

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
        dispatch(fetchActuals({
            page: pagination.page || 1,
            page_size: pagination.pageSize || 20,
            ...filters
        }));
    }, [dispatch, pagination.page, pagination.pageSize, filters]);

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
        if (location.pathname.includes('/submit')) {
            navigate('/kpi/actuals');
        }
        dispatch(fetchActuals());
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
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a' }}>Actual Performance Submissions</h1>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                        Log and track monthly performance actuals against target benchmarks
                    </p>
                </div>
                <button
                    className="submit-btn"
                    onClick={() => setShowSubmitModal(true)}
                    style={{
                        padding: '0.65rem 1.25rem',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)'
                    }}
                >
                    + Submit Monthly Actual
                </button>
            </div>

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
                canValidate={canValidate}
            />

            {showSubmitModal && (
                <ActualSubmit
                    onComplete={handleModalClose}
                    onCancel={handleModalClose}
                />
            )}
        </div>
    );
};

export default ActualsPage;