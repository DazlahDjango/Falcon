import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import KPIListHeader from './KPIListHeader';
import KPIListItem from './KPIListItem';
import kpiService from '../../../../../services/kpi/kpi.service';
import styles from './KPIList.module.css';

const KPIList = ({ onKpiSelect, onCreateNew, refreshTrigger, onError }) => {
    const [kpis, setKpis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ count: 0, next: null, previous: null, currentPage: 1, pageSize: 20 });
    const [filters, setFilters] = useState({
        search: '',
        framework: '',
        sector: '',
        isActive: true,
        kpiType: ''
    });
    useEffect(() => {
        fetchKPIs();
    }, [pagination.currentPage, pagination.pageSize, filters, refreshTrigger]);
    const fetchKPIs = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.currentPage,
                page_size: pagination.pageSize,
                ...filters
            };
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === undefined) {
                    delete params[key];
                }
            });
            const response = await kpiService.getKPIs(params);
            setKpis(response.results || []);
            setPagination(prev => ({
                ...prev,
                count: response.count,
                next: response.next,
                previous: response.previous
            }));
        } catch (error) {
            console.error('Failed to fetch KPIs:', error);
            if (onError) onError(error);
        } finally {
            setLoading(false);
        }
    };
    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, currentPage: newPage }));
    };
    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };
    const handleClearFilters = () => {
        setFilters({
            search: '',
            framework: '',
            sector: '',
            isActive: true,
            kpiType: ''
        });
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };
    const totalPages = Math.ceil(pagination.count / pagination.pageSize);
    return (
        <div className={styles.kpiList}>
            <KPIListHeader
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                onCreateNew={onCreateNew}
                totalCount={pagination.count}
            />
            
            <div className={styles.listContainer}>
                {loading ? (
                    <div className={styles.loadingState}>
                        <div className={styles.spinner} />
                        <p>Loading KPIs...</p>
                    </div>
                ) : kpis.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📊</div>
                        <p>No KPIs found</p>
                        <button onClick={onCreateNew} className={styles.createButton}>
                            Create Your First KPI
                        </button>
                    </div>
                ) : (
                    <>
                        <div className={styles.tableHeader}>
                            <div className={styles.headerCell}>Name / Code</div>
                            <div className={styles.headerCell}>Type</div>
                            <div className={styles.headerCell}>Owner</div>
                            <div className={styles.headerCell}>Status</div>
                            <div className={styles.headerCell}>Actions</div>
                        </div>
                        {kpis.map(kpi => (
                            <KPIListItem
                                key={kpi.id}
                                kpi={kpi}
                                onSelect={() => onKpiSelect(kpi.id)}
                            />
                        ))}
                    </>
                )}
            </div>

            {!loading && kpis.length > 0 && (
                <div className={styles.pagination}>
                    <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={!pagination.previous}
                        className={styles.pageButton}
                    >
                        Previous
                    </button>
                    <span className={styles.pageInfo}>
                        Page {pagination.currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={!pagination.next}
                        className={styles.pageButton}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};
KPIList.propTypes = {
    onKpiSelect: PropTypes.func.isRequired,
    onCreateNew: PropTypes.func.isRequired,
    refreshTrigger: PropTypes.number,
    onError: PropTypes.func,
};
export default KPIList;