import React from 'react';
import PropTypes from 'prop-types';
import styles from './MyKPIsFilter.module.css';

const MyKPIsFilter = ({ filters, onFilterChange, onRefresh, isLoading }) => {
    const statusOptions = [
        { value: 'all', label: 'All KPIs', icon: '📊' },
        { value: 'GREEN', label: 'On Track', icon: '🟢' },
        { value: 'YELLOW', label: 'At Risk', icon: '🟡' },
        { value: 'RED', label: 'Off Track', icon: '🔴' },
    ];

    const handleSearchChange = (e) => {
        onFilterChange({ search: e.target.value });
    };

    const handleStatusChange = (status) => {
        onFilterChange({ status });
    };

    const handleClearFilters = () => {
        onFilterChange({ search: '', status: 'all', category: '' });
    };

    const hasActiveFilters = filters.search !== '' || filters.status !== 'all';

    return (
        <div className={styles.filterContainer}>
            <div className={styles.searchBar}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                    type="text"
                    placeholder="Search by KPI name or code..."
                    value={filters.search}
                    onChange={handleSearchChange}
                    className={styles.searchInput}
                />
            </div>

            <div className={styles.statusFilters}>
                {statusOptions.map(option => (
                    <button
                        key={option.value}
                        className={`${styles.statusButton} ${filters.status === option.value ? styles.active : ''}`}
                        onClick={() => handleStatusChange(option.value)}
                    >
                        <span className={styles.statusIcon}>{option.icon}</span>
                        <span>{option.label}</span>
                    </button>
                ))}
            </div>

            <div className={styles.actions}>
                {hasActiveFilters && (
                    <button onClick={handleClearFilters} className={styles.clearButton}>
                        Clear Filters
                    </button>
                )}
                <button onClick={onRefresh} className={styles.refreshButton} disabled={isLoading}>
                    {isLoading ? 'Refreshing...' : '⟳ Refresh'}
                </button>
            </div>
        </div>
    );
};

MyKPIsFilter.propTypes = {
    filters: PropTypes.shape({
        search: PropTypes.string,
        status: PropTypes.string,
        category: PropTypes.string,
    }).isRequired,
    onFilterChange: PropTypes.func.isRequired,
    onRefresh: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
};

export default MyKPIsFilter;