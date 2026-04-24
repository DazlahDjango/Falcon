import React from 'react';
import PropTypes from 'prop-types';
import { ScoreGauge } from '../../common';
import styles from './ExecutiveDashboard.module.css';

const OrganizationHealthCard = ({ 
    overallHealth, 
    redKPICount, 
    redKPIPercentage, 
    validationCompliance 
}) => {
    const getRiskLevel = () => {
        if (overallHealth >= 85) return { level: 'Low', color: '#22c55e', text: 'Stable' };
        if (overallHealth >= 60) return { level: 'Medium', color: '#eab308', text: 'Monitor' };
        return { level: 'High', color: '#ef4444', text: 'Immediate Action Required' };
    };
    const risk = getRiskLevel();
    return (
        <div className={styles.healthCard}>
            <div className={styles.healthGauge}>
                <ScoreGauge 
                    score={overallHealth || 0}
                    title="Organization Health"
                    size="lg"
                    showDetails={true}
                />
            </div>
            <div className={styles.healthMetrics}>
                <div className={styles.metric}>
                    <div className={styles.metricValue}>{redKPICount}</div>
                    <div className={styles.metricLabel}>Red KPIs</div>
                    <div className={styles.metricSub}>{redKPIPercentage}% of total</div>
                </div>
                <div className={styles.metric}>
                    <div className={styles.metricValue}>{validationCompliance}%</div>
                    <div className={styles.metricLabel}>Compliance Rate</div>
                    <div className={styles.metricSub}>Data validation</div>
                </div>
                <div className={styles.metric}>
                    <div className={styles.metricValue} style={{ color: risk.color }}>
                        {risk.level}
                    </div>
                    <div className={styles.metricLabel}>Risk Level</div>
                    <div className={styles.metricSub}>{risk.text}</div>
                </div>
            </div>
        </div>
    );
};
OrganizationHealthCard.propTypes = {
    overallHealth: PropTypes.number,
    redKPICount: PropTypes.number,
    redKPIPercentage: PropTypes.number,
    validationCompliance: PropTypes.number,
};
OrganizationHealthCard.defaultProps = {
    overallHealth: 0,
    redKPICount: 0,
    redKPIPercentage: 0,
    validationCompliance: 0,
};
export default OrganizationHealthCard;