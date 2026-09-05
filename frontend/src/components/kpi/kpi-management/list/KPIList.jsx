import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { FiPlus, FiFilter, FiGrid, FiList } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import KPICard from './KPICard';
import KPITable from './KPITable';
import KPIFilters from './KPIFilters';
import KPISearch from './KPISearch';
import KPIPagination from '../../common/KPIPagination';
import KPILoading from '../../common/KPILoading';
import KPIEmptyState from '../../common/KPIEmptyState';
import { 
    fetchKPIs, 
    setFilters,
    setKpiPagination,
    selectKPIs,
    selectKPILoading,
    selectKPIPagination,
    selectKPIFilters,
    selectKPIError
} from '../../../../store/kpi';
import useKPIPermissions from '../../../../hooks/kpi/useKPIPermissions';

const KPIList = ({ onViewKPI, onCreateKPI, onEditKPI }) => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { canManageKPIs, canApproveKPI, isManager, isExecutive } = useKPIPermissions();
    const canManageOrApprove = canManageKPIs || canApproveKPI || isManager || isExecutive;
    
    const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
    const scope = new URLSearchParams(location.search).get('scope');
    
    const kpis = useSelector(selectKPIs);
    const loading = useSelector(selectKPILoading);
    const pagination = useSelector(selectKPIPagination);
    const filters = useSelector(selectKPIFilters);
    const error = useSelector(selectKPIError);
    
    const loadKPIs = useCallback(() => {
        const params = {
            page: pagination.page,
            page_size: pagination.pageSize,
            ...filters,
            search: filters.search,
            ...(scope ? { scope } : {})
        };

        Object.keys(params).forEach(key => {
            const value = params[key];
            const isUndefined = value === undefined;
            const isEmptyString = value === '';
            const isNull = value === null;

            if (isUndefined || isEmptyString || isNull) {
                delete params[key];
            }
        });

        dispatch(fetchKPIs(params));
    }, [dispatch, pagination.page, pagination.pageSize, filters]);
    
    useEffect(() => {
        loadKPIs();
    }, [loadKPIs]);
    
    const handleFilterChange = (key, value) => {
        dispatch(setFilters({ [key]: value }));
        dispatch(setKpiPagination({ page: 1 }));
    };
    
    const handleClearFilters = () => {
        dispatch(setFilters({ 
            framework: null, 
            category: null, 
            sector: null, 
            kpi_type: null, 
            is_active: null,
            search: ''
        }));
        dispatch(setKpiPagination({ page: 1 }));
    };
    
    const handlePageChange = (page) => {
        dispatch(setKpiPagination({ page }));
    };

    const handlePageSizeChange = (pageSize) => {
        dispatch(setKpiPagination({ page: 1, pageSize }));
    };
    
    if (loading && kpis.length === 0) {
        return <KPILoading text="Loading Performance Indicators..." />;
    }
    
    if (error && kpis.length === 0) {
        return <div className="kpi-error-state">Error loading Performance Indicators. Please try again.</div>;
    }
    
    return (
        <div className="kpi-list-container">
            <div className="kpi-list-header">
                <div>
                    <h2>Performance Indicator Management</h2>
                    <p>Manage and monitor all Key Performance Indicators</p>
                </div>
                <div className="kpi-list-actions">
                    <div className="kpi-view-toggle">
                        <button 
                            className={`view-btn ${viewMode === 'card' ? 'active' : ''}`}
                            onClick={() => setViewMode('card')}
                        >
                            <FiGrid size={16} />
                        </button>
                        <button 
                            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                            onClick={() => setViewMode('table')}
                        >
                            <FiList size={16} />
                        </button>
                    </div>
                    {canManageKPIs && (
                        <button className="kpi-create-btn" onClick={onCreateKPI}>
                            <FiPlus size={16} />
                            Create Performance Indicator
                        </button>
                    )}
                </div>
            </div>
            
            <div className="kpi-list-toolbar">
                <KPISearch 
                    value={filters.search || ''}
                    onSearch={(value) => handleFilterChange('search', value)}
                />
                <KPIFilters 
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                />
            </div>
            
            {kpis.length === 0 ? (
                <KPIEmptyState 
                    icon="📊"
                    title="No Performance Indicators Found"
                    description={filters.search ? "No Performance Indicators match your search criteria" : "No Performance Indicators have been created yet"}
                    actionText={canManageKPIs ? "Create Your First Performance Indicator" : null}
                    onAction={canManageKPIs ? onCreateKPI : null}
                />
            ) : viewMode === 'card' ? (
                <div className="kpi-cards-grid">
                    {kpis.map(kpi => (
                        <KPICard 
                            key={kpi.id}
                            kpi={kpi}
                            onView={() => onViewKPI(kpi.id)}
                            onEdit={() => onEditKPI(kpi.id)}
                            canManage={canManageOrApprove}
                        />
                    ))}
                </div>
            ) : (
                <KPITable 
                    kpis={kpis}
                    onView={onViewKPI}
                    onEdit={onEditKPI}
                    canManage={canManageOrApprove}
                />
            )}
            
            {kpis.length > 0 && (
                <KPIPagination 
                    currentPage={pagination.page}
                    pageSize={pagination.pageSize}
                    total={pagination.total}
                    totalPages={pagination.totalPages}
                    itemCount={kpis.length}
                    isLoading={loading}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            )}
        </div>
    );
};

export default KPIList;