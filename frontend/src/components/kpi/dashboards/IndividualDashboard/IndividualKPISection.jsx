import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { KPICard } from '../../common';
import styles from './IndividualDashboard.module.css';

const IndividualKPISection = ({ kpis, onKpiClick }) => {
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const getStatusFilter = (status) => {
        switch (filter) {
            case 'green':
                return status === 'GREEN';
            case 'yellow':
                return status === 'YELLOW';
            case 'red':
                return status === 'RED';
            default:
                return true;
        }
    };
    const filteredkpis = kpis.filter(kpi => {
        const matchesStatus = getStatusFilter(kpi.status);
        const matchesSearch = kpi.kpiName.toLowerCase().includes(searchTerm.toLowerCase()) || kpi.kpiCode?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });
    const getStatusCount = (status) => {
        return kpis.filter(k => k.status === status).length;
    };
    return (
        <div className={styles.kpiSection}>
            <div className={styles.kpiHeader}>
                <h3>My KPIs</h3>
                <div className={styles.kpiControls}>
                    <input
                        type="text"
                        placeholder="Search KPIs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                    <div className={styles.filterButtons}>
                        <button
                            className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All ({kpis.length})
                        </button>
                        <button
                            className={`${styles.filterButton} ${styles.greenFilter} ${filter === 'green' ? styles.active : ''}`}
                            onClick={() => setFilter('green')}
                        >
                            🟢 On Track ({getStatusCount('GREEN')})
                        </button>
                        <button
                            className={`${styles.filterButton} ${styles.yellowFilter} ${filter === 'yellow' ? styles.active : ''}`}
                            onClick={() => setFilter('yellow')}
                        >
                            🟡 At Risk ({getStatusCount('YELLOW')})
                        </button>
                        <button
                            className={`${styles.filterButton} ${styles.redFilter} ${filter === 'red' ? styles.active : ''}`}
                            onClick={() => setFilter('red')}
                        >
                            🔴 Off Track ({getStatusCount('RED')})
                        </button>
                    </div>
                </div>
            </div>

            {filteredKpis.length === 0 ? (
                <div className={styles.noResults}>
                    <p>No KPIs match your search.</p>
                </div>
            ) : (
                <div className={styles.kpiGrid}>
                    {filteredKpis.map(kpi => (
                        <KPICard
                            key={kpi.kpiId}
                            kpi={{
                                id: kpi.kpiId,
                                name: kpi.kpiName,
                                code: kpi.kpiCode,
                                kpiType: kpi.kpiType,
                                category: kpi.category,
                            }}
                            score={kpi.score}
                            status={kpi.status}
                            trend={kpi.trend}
                            actual={kpi.actualValue}
                            target={kpi.targetValue}
                            unit={kpi.unit}
                            onClick={() => onKpiClick(kpi.kpiId)}
                            showDetails={true}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
IndividualKPISection.propTypes = {
    kpis: PropTypes.arrayOf(PropTypes.shape({
        kpiId: PropTypes.string,
        kpiName: PropTypes.string,
        kpiCode: PropTypes.string,
        kpiType: PropTypes.string,
        score: PropTypes.number,
        status: PropTypes.string,
        trend: PropTypes.object,
        actualValue: PropTypes.number,
        targetValue: PropTypes.number,
        unit: PropTypes.string,
        category: PropTypes.object,
    })),
    onKpiClick: PropTypes.func,
};
IndividualKPISection.defaultProps = {
    kpis: [],
    onKpiClick: () => {},
};
export default IndividualKPISection;