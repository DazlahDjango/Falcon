import React from 'react';
import PropTypes from 'prop-types';
import styles from './ExecutiveDashboard.module.css';

const KPIOverview = ({ redKPICount, totalKPIs, greenCount, yellowCount, redCount }) => {
    const getPercentage = (count) => {
        if (totalKPIs === 0) return 0;
        return ((count / totalKPIs) * 100).toFixed(1);
    };
    return (
        <div className={styles.kpiOverview}>
            <h4>KPI Overview</h4>
            <div className={styles.kpiStats}>
                <div className={styles.kpiStat}>
                    <div className={styles.statValue}>{totalKPIs || 0}</div>
                    <div className={styles.statLabel}>Total KPIs</div>
                </div>
                <div className={styles.kpiStat}>
                    <div className={`${styles.statValue} ${styles.greenText}`}>
                        {greenCount || 0}
                    </div>
                    <div className={styles.statLabel}>On Track ({getPercentage(greenCount)}%)</div>
                </div>
                <div className={styles.kpiStat}>
                    <div className={`${styles.statValue} ${styles.yellowText}`}>
                        {yellowCount || 0}
                    </div>
                    <div className={styles.statLabel}>At Risk ({getPercentage(yellowCount)}%)</div>
                </div>
                <div className={styles.kpiStat}>
                    <div className={`${styles.statValue} ${styles.redText}`}>
                        {redCount || 0}
                    </div>
                    <div className={styles.statLabel}>Off Track ({getPercentage(redCount)}%)</div>
                </div>
            </div>  
            <div className={styles.progressBar}>
                <div 
                    className={`${styles.progressSegment} ${styles.greenSegment}`}
                    style={{ width: `${getPercentage(greenCount)}%` }}
                />
                <div 
                    className={`${styles.progressSegment} ${styles.yellowSegment}`}
                    style={{ width: `${getPercentage(yellowCount)}%` }}
                />
                <div 
                    className={`${styles.progressSegment} ${styles.redSegment}`}
                    style={{ width: `${getPercentage(redCount)}%` }}
                />
            </div>        
            <div className={styles.kpiNote}>
                {redKPICount > 0 && (
                    <span className={styles.alertNote}>
                        ⚠️ {redKPICount} KPI{redKPICount !== 1 ? 's are' : ' is'} off track and require attention
                    </span>
                )}
            </div>
        </div>
    );
};
KPIOverview.propTypes = {
    redKPICount: PropTypes.number,
    totalKPIs: PropTypes.number,
    greenCount: PropTypes.number,
    yellowCount: PropTypes.number,
    redCount: PropTypes.number,
};
KPIOverview.defaultProps = {
    redKPICount: 0,
    totalKPIs: 0,
    greenCount: 0,
    yellowCount: 0,
    redCount: 0,
};
export default KPIOverview;