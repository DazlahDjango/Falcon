import React from 'react';
import PropTypes from 'prop-types';
import styles from './ExecutiveDashboard.module.css';

const RiskIndicators = ({ indicators }) => {
    if (!indicators) {
        return null;
    }
    const {
        highRiskDepartments = [],
        decliningKPIs = [],
        consecutiveRedAlerts = 0
    } = indicators;
    const hasRisks = highRiskDepartments.length > 0 || decliningKPIs.length > 0 || consecutiveRedAlerts > 0;
    if (!hasRisks) {
        return (
            <div className={styles.riskContainer}>
                <h4>Risk Indicators</h4>
                <div className={styles.noRisks}>
                    <span className={styles.checkIcon}>✓</span>
                    <p>No significant risks detected</p>
                </div>
            </div>
        );
    }
    return (
        <div className={styles.riskContainer}>
            <h4>Risk Indicators & Warnings</h4>
            
            {consecutiveRedAlerts > 0 && (
                <div className={`${styles.riskCard} ${styles.criticalRisk}`}>
                    <div className={styles.riskIcon}>⚠️</div>
                    <div className={styles.riskContent}>
                        <div className={styles.riskTitle}>Critical Alert</div>
                        <div className={styles.riskDescription}>
                            {consecutiveRedAlerts} KPI{consecutiveRedAlerts !== 1 ? 's have' : ' has'} been in red status for 2+ consecutive months.
                            Immediate attention required.
                        </div>
                    </div>
                </div>
            )}
            {highRiskDepartments.length > 0 && (
                <div className={`${styles.riskCard} ${styles.highRisk}`}>
                    <div className={styles.riskIcon}>🏢</div>
                    <div className={styles.riskContent}>
                        <div className={styles.riskTitle}>High Risk Departments</div>
                        <div className={styles.riskList}>
                            {highRiskDepartments.map((dept, idx) => (
                                <span key={idx} className={styles.riskTag}>{dept}</span>
                            ))}
                        </div>
                        <div className={styles.riskDescription}>
                            These departments are underperforming and require immediate intervention.
                        </div>
                    </div>
                </div>
            )}
            {decliningKPIs.length > 0 && (
                <div className={`${styles.riskCard} ${styles.mediumRisk}`}>
                    <div className={styles.riskIcon}>📉</div>
                    <div className={styles.riskContent}>
                        <div className={styles.riskTitle}>Declining KPIs</div>
                        <div className={styles.riskList}>
                            {decliningKPIs.slice(0, 5).map((kpi, idx) => (
                                <span key={idx} className={styles.riskTag}>{kpi}</span>
                            ))}
                            {decliningKPIs.length > 5 && (
                                <span className={styles.riskTag}>+{decliningKPIs.length - 5} more</span>
                            )}
                        </div>
                        <div className={styles.riskDescription}>
                            These KPIs show a downward trend. Review and take corrective action.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
RiskIndicators.propTypes = {
    indicators: PropTypes.shape({
        highRiskDepartments: PropTypes.arrayOf(PropTypes.string),
        decliningKPIs: PropTypes.arrayOf(PropTypes.string),
        consecutiveRedAlerts: PropTypes.number,
    }),
};
export default RiskIndicators;