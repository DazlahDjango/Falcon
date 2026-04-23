import React from 'react';
import PropTypes from 'prop-types';
import styles from './KPIReports.module.css';

const KPIReportFilters = ({ filters, onFilterChange, totalCount }) => {
    const handleSearchChange = (e) => {
        onFilterChange({ ...filters, search: e.target.value });
    };
    const handleHealthStatusChange = (e) => {
        onFilterChange({ ...filters, healthStatus: e.target.value });
    };
    const clearFilters = () => {
        onFilterChange({
            search: '',
            sector: '',
            category: '',
            healthStatus: ''
        });
    };
    const hasActiveFilters = filters.search || filters.healthStatus;
    return (
        <div className={styles.filters}>
            <div className={styles.searchBar}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                    type="text"
                    placeholder="Search KPIs..."
                    value={filters.search}
                    onChange={handleSearchChange}
                    className={styles.searchInput}
                />
            </div>
            
            <div className={styles.filterGroup}>
                <select 
                    value={filters.healthStatus} 
                    onChange={handleHealthStatusChange}
                    className={styles.filterSelect}
                >
                    <option value="">All Statuses</option>
                    <option value="EXCELLENT">Excellent</option>
                    <option value="GOOD">Good</option>
                    <option value="FAIR">Fair</option>
                    <option value="POOR">Poor</option>
                </select>
            </div>
            
            {hasActiveFilters && (
                <button onClick={clearFilters} className={styles.clearButton}>
                    Clear Filters
                </button>
            )}
            
            <div className={styles.resultCount}>
                {totalCount} KPI{totalCount !== 1 ? 's' : ''} found
            </div>
        </div>
    );
};
KPIReportFilters.propTypes = {
    filters: PropTypes.shape({
        search: PropTypes.string,
        sector: PropTypes.string,
        category: PropTypes.string,
        healthStatus: PropTypes.string,
    }).isRequired,
    onFilterChange: PropTypes.func.isRequired,
    totalCount: PropTypes.number.isRequired,
};
export default KPIReportFilters;