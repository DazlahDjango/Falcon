import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './KPIList.module.css';

const KPIListHeader = ({ filters, onFilterChange, onClearFilters, onCreateNew, totalCount }) => {
    const [showFilters, setShowFilters] = useState(false);
    const kpiTypes = [
        { value: '', label: 'All Types' },
        { value: 'COUNT', label: 'Count / Number' },
        { value: 'PERCENTAGE', label: 'Percentage' },
        { value: 'FINANCIAL', label: 'Financial' },
        { value: 'MILESTONE', label: 'Milestone' },
        { value: 'TIME', label: 'Time' },
        { value: 'IMPACT', label: 'Impact' }
    ];
    const handleSearchChange = (e) => {
        onFilterChange({ search: e.target.value });
    };
    const handleTypeChange = (e) => {
        onFilterChange({ kpiType: e.target.value });
    };
    const handleActiveChange = (e) => {
        onFilterChange({ isActive: e.target.checked });
    };
    const hasActiveFilters = filters.search || filters.kpiType;
    return (
        <div className={styles.header}>
            <div className={styles.headerTop}>
                <div className={styles.titleSection}>
                    <h2>KPI Management</h2>
                    <span className={styles.count}>{totalCount} total</span>
                </div>
                <div className={styles.actions}>
                    <div className={styles.searchBar}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search by name or code..."
                            value={filters.search}
                            onChange={handleSearchChange}
                            className={styles.searchInput}
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`${styles.filterButton} ${showFilters ? styles.active : ''}`}
                    >
                        Filter
                    </button>
                    <button onClick={onCreateNew} className={styles.createButton}>
                        + Create KPI
                    </button>
                </div>
            </div>
            
            {showFilters && (
                <div className={styles.filtersPanel}>
                    <div className={styles.filterRow}>
                        <div className={styles.filterGroup}>
                            <label>KPI Type</label>
                            <select
                                value={filters.kpiType}
                                onChange={handleTypeChange}
                                className={styles.filterSelect}
                            >
                                {kpiTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.filterGroup}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={filters.isActive}
                                    onChange={handleActiveChange}
                                />
                                Active Only
                            </label>
                        </div>
                        {hasActiveFilters && (
                            <button onClick={onClearFilters} className={styles.clearButton}>
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
KPIListHeader.propTypes = {
    filters: PropTypes.shape({
        search: PropTypes.string,
        kpiType: PropTypes.string,
        isActive: PropTypes.bool,
    }).isRequired,
    onFilterChange: PropTypes.func.isRequired,
    onClearFilters: PropTypes.func.isRequired,
    onCreateNew: PropTypes.func.isRequired,
    totalCount: PropTypes.number,
};
export default KPIListHeader;