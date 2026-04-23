import React from 'react';
import PropTypes from 'prop-types';
import styles from './ManagerDashboard.module.css';

const TeamSummary = ({ managerScore, teamSize, teamAvgScore, statusDistribution }) => {
    const getScoreColor = (score) => {
        if (score >= 90) return styles.scoreExcellent;
        if (score >= 70) return styles.scoreGood;
        if (score >= 50) return styles.scoreFair;
        return styles.scorePoor;
    };
    return (
        <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
                <div className={styles.summaryIcon}>👤</div>
                <div className={styles.summaryContent}>
                    <div className={styles.summaryLabel}>My Score</div>
                    <div className={`${styles.summaryValue} ${getScoreColor(managerScore)}`}>
                        {managerScore?.toFixed(1) || 0}%
                    </div>
                </div>
            </div>

            <div className={styles.summaryCard}>
                <div className={styles.summaryIcon}>👥</div>
                <div className={styles.summaryContent}>
                    <div className={styles.summaryLabel}>Team Size</div>
                    <div className={styles.summaryValue}>{teamSize || 0}</div>
                </div>
            </div>

            <div className={styles.summaryCard}>
                <div className={styles.summaryIcon}>📊</div>
                <div className={styles.summaryContent}>
                    <div className={styles.summaryLabel}>Team Average</div>
                    <div className={`${styles.summaryValue} ${getScoreColor(teamAvgScore)}`}>
                        {teamAvgScore?.toFixed(1) || 0}%
                    </div>
                </div>
            </div>

            <div className={styles.summaryCard}>
                <div className={styles.summaryIcon}>🎯</div>
                <div className={styles.summaryContent}>
                    <div className={styles.summaryLabel}>Status Distribution</div>
                    <div className={styles.statusDistribution}>
                        <span className={styles.greenDot}>●</span> {statusDistribution?.GREEN || 0}
                        <span className={styles.yellowDot}>●</span> {statusDistribution?.YELLOW || 0}
                        <span className={styles.redDot}>●</span> {statusDistribution?.RED || 0}
                    </div>
                </div>
            </div>
        </div>
    );
};
TeamSummary.propTypes = {
    managerScore: PropTypes.number,
    teamSize: PropTypes.number,
    teamAvgScore: PropTypes.number,
    statusDistribution: PropTypes.shape({
        GREEN: PropTypes.number,
        YELLOW: PropTypes.number,
        RED: PropTypes.number,
    }),
};
TeamSummary.defaultProps = {
    managerScore: 0,
    teamSize: 0,
    teamAvgScore: 0,
    statusDistribution: { GREEN: 0, YELLOW: 0, RED: 0 },
};
export default TeamSummary;