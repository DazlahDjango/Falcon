import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { TrafficLight } from '../common';
import { formatScore, formatMetricValue, getTrafficLightFromScore } from '../../../utils/kpi';
import styles from './MyKPIsTable.module.css';

const MyKPIsTable = ({ kpis, weights, isLoading, onViewDetails }) => {
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p>Loading your KPIs...</p>
            </div>
        );
    }

    if (!kpis || kpis.length === 0) {
        return (
            <div className={styles.emptyContainer}>
                <div className={styles.emptyIcon}>📊</div>
                <h3>No KPIs Assigned</h3>
                <p>You don't have any KPIs assigned yet. Contact your manager to set up your performance metrics.</p>
            </div>
        );
    }

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field) => {
        if (sortField !== field) return '↕️';
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    const sortedKpis = [...kpis].sort((a, b) => {
        let aVal, bVal;
        switch (sortField) {
            case 'name':
                aVal = a.name;
                bVal = b.name;
                return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            case 'type':
                aVal = a.kpi_type;
                bVal = b.kpi_type;
                return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            case 'weight':
                aVal = weights[a.id] || 0;
                bVal = weights[b.id] || 0;
                return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
            default:
                return 0;
        }
    });

    const getKpiTypeLabel = (type) => {
        const types = {
            COUNT: 'Count',
            PERCENTAGE: 'Percentage',
            FINANCIAL: 'Financial',
            MILESTONE: 'Milestone',
            TIME: 'Time',
            IMPACT: 'Impact'
        };
        return types[type] || type;
    };

    return (
        <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
                <div className={styles.headerCell} onClick={() => handleSort('name')}>
                    KPI Name {getSortIcon('name')}
                </div>
                <div className={styles.headerCell} onClick={() => handleSort('type')}>
                    Type {getSortIcon('type')}
                </div>
                <div className={styles.headerCell} onClick={() => handleSort('weight')}>
                    Weight {getSortIcon('weight')}
                </div>
                <div className={styles.headerCell}>Current Score</div>
                <div className={styles.headerCell}>Status</div>
                <div className={styles.headerCell}>Actions</div>
            </div>

            <div className={styles.tableBody}>
                {sortedKpis.map(kpi => {
                    const weight = weights[kpi.id] || 0;
                    // For demo, use a sample score - in real app, fetch from scores endpoint
                    const sampleScore = 75;
                    const trafficLight = getTrafficLightFromScore(sampleScore);

                    return (
                        <div key={kpi.id} className={styles.tableRow}>
                            <div className={styles.cell}>
                                <div className={styles.kpiName}>{kpi.name}</div>
                                <div className={styles.kpiCode}>{kpi.code}</div>
                            </div>
                            <div className={styles.cell}>
                                <span className={styles.kpiType}>{getKpiTypeLabel(kpi.kpi_type)}</span>
                            </div>
                            <div className={styles.cell}>
                                <div className={styles.weightDisplay}>
                                    <span className={styles.weightValue}>{weight}%</span>
                                    <div className={styles.weightBarContainer}>
                                        <div 
                                            className={styles.weightBar}
                                            style={{ width: `${weight}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className={styles.cell}>
                                <span className={styles.scoreValue}>{formatScore(sampleScore)}</span>
                            </div>
                            <div className={styles.cell}>
                                <TrafficLight status={trafficLight.value} size="sm" />
                            </div>
                            <div className={styles.cell}>
                                <button 
                                    className={styles.viewButton}
                                    onClick={() => onViewDetails(kpi)}
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

MyKPIsTable.propTypes = {
    kpis: PropTypes.array,
    weights: PropTypes.object,
    isLoading: PropTypes.bool,
    onViewDetails: PropTypes.func.isRequired,
};

MyKPIsTable.defaultProps = {
    kpis: [],
    weights: {},
    isLoading: false,
};

export default MyKPIsTable;