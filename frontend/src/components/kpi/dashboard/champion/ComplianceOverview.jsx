import React from 'react';
import PropTypes from 'prop-types';
import styles from './ChampionDashboard.module.css';

const ComplianceOverview = ({ 
    organizationSubmissionRate, 
    pendingEscalations, 
    unvalidatedEntries 
}) => {
    const getComplianceColor = () => {
        if (organizationSubmissionRate >= 90) return styles.excellent;
        if (organizationSubmissionRate >= 70) return styles.good;
        if (organizationSubmissionRate >= 50) return styles.fair;
        return styles.poor;
    };
    return (
        <div className={styles.overviewContainer}>
            <h4>Compliance Overview</h4>
            <div className={styles.overviewGrid}>
                <div className={styles.overviewCard}>
                    <div className={styles.overviewIcon}>📊</div>
                    <div className={styles.overviewContent}>
                        <div className={`${styles.overviewValue} ${getComplianceColor()}`}>
                            {organizationSubmissionRate?.toFixed(1)}%
                        </div>
                        <div className={styles.overviewLabel}>Submission Rate</div>
                        <div className={styles.overviewSub}>Organization-wide</div>
                    </div>
                </div>
                <div className={styles.overviewCard}>
                    <div className={styles.overviewIcon}>⏳</div>
                    <div className={styles.overviewContent}>
                        <div className={`${styles.overviewValue} ${unvalidatedEntries > 10 ? styles.warning : ''}`}>
                            {unvalidatedEntries || 0}
                        </div>
                        <div className={styles.overviewLabel}>Unvalidated Entries</div>
                        <div className={styles.overviewSub}>Pending review</div>
                    </div>
                </div>
                <div className={styles.overviewCard}>
                    <div className={styles.overviewIcon}>⚠️</div>
                    <div className={styles.overviewContent}>
                        <div className={`${styles.overviewValue} ${pendingEscalations > 0 ? styles.critical : ''}`}>
                            {pendingEscalations || 0}
                        </div>
                        <div className={styles.overviewLabel}>Open Escalations</div>
                        <div className={styles.overviewSub}>Require attention</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
ComplianceOverview.propTypes = {
    organizationSubmissionRate: PropTypes.number,
    pendingEscalations: PropTypes.number,
    unvalidatedEntries: PropTypes.number,
};
ComplianceOverview.defaultProps = {
    organizationSubmissionRate: 0,
    pendingEscalations: 0,
    unvalidatedEntries: 0,
};
export default ComplianceOverview;