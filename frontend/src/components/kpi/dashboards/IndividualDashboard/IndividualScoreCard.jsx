import React from 'react';
import PropTypes from 'prop-types';
import styles from './IndividualDashboard.module.css';

const IndividualScoreCard = ({ overallScore, kpiCount }) => {
    const getScoreColor = () => {
        if (overallScore >= 90) return styles.scoreExcellent;
        if (overallScore >= 70) return styles.scoreGood;
        if (overallScore >= 50) return styles.scoreFair;
        return styles.scorePoor;
    };
    const getScoreMessage = () => {
        if (overallScore >= 90) return 'Excellent! Keep up the great work!';
        if (overallScore >= 70) return 'Good performance. Keep pushing!';
        if (overallScore >= 50) return 'Fair. Room for improvement.';
        return 'Needs attention. Let\'s work on it!';
    };
    return (
        <div className={styles.scoreCard}>
            <div className={styles.scoreCardHeader}>
                <h3>Performance Overview</h3>
            </div>
            <div className={styles.scoreValue}>
                <span className={`${styles.scoreNumber} ${getScoreColor()}`}>
                    {overallScore?.toFixed(1) || 0}%
                </span>
            </div>
            <div className={styles.scoreMessage}>
                {getScoreMessage()}
            </div>
            <div className={styles.scoreStats}>
                <div className={styles.stat}>
                    <span className={styles.statValue}>{kpiCount}</span>
                    <span className={styles.statLabel}>Active KPIs</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statValue}>
                        {overallScore >= 90 ? '🏆' : overallScore >= 50 ? '📈' : '⚠️'}
                    </span>
                    <span className={styles.statLabel}>Status</span>
                </div>
            </div>
        </div>
    );
};
IndividualScoreCard.propTypes = {
    overallScore: PropTypes.number,
    kpiCount: PropTypes.number,
};
IndividualScoreCard.defaultProps = {
    overallScore: 0,
    kpiCount: 0,
};
export default IndividualScoreCard;