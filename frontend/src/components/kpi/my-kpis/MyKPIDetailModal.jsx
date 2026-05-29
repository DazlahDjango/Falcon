import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { TrafficLight, ScoreGauge } from '../common';
import { useMyKPIScores, useMyKPIActuals, useMyKPIWeights } from '../../../hooks/kpi/useMyKPIs';
import { formatScore, formatMetricValue, formatKPIType, formatCalculationLogic } from '../../../utils/kpi';
import styles from './MyKPIDetailModal.module.css';

const MyKPIDetailModal = ({ kpi, userId, onClose }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const { data: scores, isLoading: scoresLoading } = useMyKPIScores(userId, selectedYear);
    const { data: actuals, isLoading: actualsLoading } = useMyKPIActuals(userId, selectedYear);
    const { data: weights } = useMyKPIWeights(userId);

    const kpiScores = scores?.filter(s => s.kpi_id === kpi.id) || [];
    const kpiActuals = actuals?.filter(a => a.kpi_id === kpi.id) || [];
    const kpiWeight = weights?.find(w => w.kpi_id === kpi.id)?.weight || 0;

    const currentScore = kpiScores.length > 0 ? kpiScores[kpiScores.length - 1].score : null;
    const currentActual = kpiActuals.length > 0 ? kpiActuals[kpiActuals.length - 1] : null;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📋' },
        { id: 'scores', label: 'Score History', icon: '📈' },
        { id: 'targets', label: 'Targets & Actuals', icon: '🎯' },
        { id: 'details', label: 'Details', icon: 'ℹ️' },
    ];

    return (
        <div className={styles.modal} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div className={styles.headerInfo}>
                        <h2>{kpi.name}</h2>
                        <div className={styles.kpiMeta}>
                            <span className={styles.kpiCode}>{kpi.code}</span>
                            <span className={styles.kpiType}>{formatKPIType(kpi.kpi_type)}</span>
                            {kpiWeight > 0 && (
                                <span className={styles.kpiWeight}>Weight: {kpiWeight}%</span>
                            )}
                        </div>
                    </div>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <div className={styles.scoreSummary}>
                    <div className={styles.scoreGauge}>
                        <ScoreGauge 
                            score={currentScore || 0}
                            size="sm"
                            showDetails={false}
                        />
                    </div>
                    <div className={styles.scoreDetails}>
                        <div className={styles.currentScore}>
                            <span className={styles.scoreLabel}>Current Score</span>
                            <span className={styles.scoreValue}>{formatScore(currentScore || 0)}</span>
                        </div>
                        {currentActual && (
                            <div className={styles.currentActual}>
                                <span className={styles.actualLabel}>Latest Actual</span>
                                <span className={styles.actualValue}>
                                    {formatMetricValue(currentActual.actual_value, kpi.unit, kpi.kpi_type)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.tabs}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className={styles.tabIcon}>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className={styles.tabContent}>
                    {activeTab === 'overview' && (
                        <div className={styles.overviewTab}>
                            <div className={styles.infoSection}>
                                <h4>Description</h4>
                                <p>{kpi.description || 'No description provided.'}</p>
                            </div>
                            <div className={styles.infoSection}>
                                <h4>Calculation Logic</h4>
                                <p>{formatCalculationLogic(kpi.calculation_logic)}</p>
                                <div className={styles.formula}>
                                    Formula: {kpi.calculation_logic === 'HIGHER_IS_BETTER' 
                                        ? '(Actual ÷ Target) × 100' 
                                        : '(Target ÷ Actual) × 100'}
                                </div>
                            </div>
                            {kpi.strategic_objective && (
                                <div className={styles.infoSection}>
                                    <h4>Strategic Objective</h4>
                                    <p>{kpi.strategic_objective}</p>
                                </div>
                            )}
                            {kpi.target_min !== null || kpi.target_max !== null ? (
                                <div className={styles.infoSection}>
                                    <h4>Target Range</h4>
                                    <p>
                                        {kpi.target_min !== null ? kpi.target_min : '—'} 
                                        {' to '}
                                        {kpi.target_max !== null ? kpi.target_max : '—'}
                                    </p>
                                </div>
                            ) : null}
                        </div>
                    )}

                    {activeTab === 'scores' && (
                        <div className={styles.scoresTab}>
                            {scoresLoading ? (
                                <div className={styles.loadingSmall}>Loading scores...</div>
                            ) : kpiScores.length === 0 ? (
                                <div className={styles.noData}>No score data available</div>
                            ) : (
                                <div className={styles.scoresTable}>
                                    <div className={styles.tableHeader}>
                                        <div>Period</div>
                                        <div>Score</div>
                                        <div>Status</div>
                                    </div>
                                    {kpiScores.map(score => (
                                        <div key={score.id} className={styles.tableRow}>
                                            <div>{`${score.year}-${String(score.month).padStart(2, '0')}`}</div>
                                            <div className={styles.scoreCell}>{formatScore(score.score)}</div>
                                            <div>
                                                <TrafficLight 
                                                    status={score.traffic_light?.status || 'YELLOW'} 
                                                    size="sm" 
                                                    showLabel={false}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'targets' && (
                        <div className={styles.targetsTab}>
                            {actualsLoading ? (
                                <div className={styles.loadingSmall}>Loading data...</div>
                            ) : kpiActuals.length === 0 ? (
                                <div className={styles.noData}>No actual data available</div>
                            ) : (
                                <div className={styles.targetsTable}>
                                    <div className={styles.tableHeader}>
                                        <div>Period</div>
                                        <div>Actual</div>
                                        <div>Target</div>
                                        <div>Achievement</div>
                                        <div>Status</div>
                                    </div>
                                    {kpiActuals.map(actual => {
                                        const target = actual.target_value || 0;
                                        const achievement = target > 0 ? (actual.actual_value / target) * 100 : 0;
                                        return (
                                            <div key={actual.id} className={styles.tableRow}>
                                                <div>{`${actual.year}-${String(actual.month).padStart(2, '0')}`}</div>
                                                <div>{formatMetricValue(actual.actual_value, kpi.unit, kpi.kpi_type)}</div>
                                                <div>{formatMetricValue(target, kpi.unit, kpi.kpi_type)}</div>
                                                <div className={styles.achievementCell}>
                                                    <div className={styles.achievementBar}>
                                                        <div 
                                                            className={styles.achievementFill}
                                                            style={{ width: `${Math.min(100, achievement)}%` }}
                                                        />
                                                    </div>
                                                    <span>{achievement.toFixed(1)}%</span>
                                                </div>
                                                <div>
                                                    <TrafficLight 
                                                        status={actual.status === 'APPROVED' ? 'GREEN' : actual.status === 'REJECTED' ? 'RED' : 'YELLOW'} 
                                                        size="sm" 
                                                        showLabel={false}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'details' && (
                        <div className={styles.detailsTab}>
                            <div className={styles.detailsGrid}>
                                <div className={styles.detailItem}>
                                    <label>Created</label>
                                    <span>{new Date(kpi.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <label>Last Updated</label>
                                    <span>{new Date(kpi.updated_at).toLocaleDateString()}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <label>Framework</label>
                                    <span>{kpi.framework_name || '—'}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <label>Sector</label>
                                    <span>{kpi.sector_name || '—'}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <label>Category</label>
                                    <span>{kpi.category_name || '—'}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <label>Owner</label>
                                    <span>{kpi.owner_email || kpi.owner}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <label>Department</label>
                                    <span>{kpi.department_name || '—'}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <label>Status</label>
                                    <span className={kpi.is_active ? styles.activeStatus : styles.inactiveStatus}>
                                        {kpi.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    <button onClick={onClose} className={styles.closeModalButton}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

MyKPIDetailModal.propTypes = {
    kpi: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        code: PropTypes.string,
        kpi_type: PropTypes.string,
        calculation_logic: PropTypes.string,
        description: PropTypes.string,
        strategic_objective: PropTypes.string,
        target_min: PropTypes.number,
        target_max: PropTypes.number,
        unit: PropTypes.string,
        is_active: PropTypes.bool,
        created_at: PropTypes.string,
        updated_at: PropTypes.string,
        framework_name: PropTypes.string,
        sector_name: PropTypes.string,
        category_name: PropTypes.string,
        owner_email: PropTypes.string,
        owner: PropTypes.string,
        department_name: PropTypes.string,
    }).isRequired,
    userId: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default MyKPIDetailModal;