import React from 'react';
import { FiBarChart2, FiActivity, FiTarget, FiTrendingUp, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const KPIStats = ({ stats }) => {
    const activationRate = stats.total > 0 ? (stats.active / stats.total * 100).toFixed(1) : 0;

    return (
        <div className="stat-section">
            <div className="section-header">
                <h3 className="section-title">
                    <FiBarChart2 size={18} />
                    KPI Overview
                </h3>
                <span className="section-badge">{stats.total} Total KPIs</span>
            </div>

            <div className="stats-grid two-col">
                <div className="stat-item active">
                    <div className="stat-icon-large">
                        <FiCheckCircle size={32} />
                    </div>
                    <div className="stat-details">
                        <div className="stat-number-large">{stats.active}</div>
                        <div className="stat-label">Active KPIs</div>
                    </div>
                </div>
                <div className="stat-item inactive">
                    <div className="stat-icon-large">
                        <FiAlertCircle size={32} />
                    </div>
                    <div className="stat-details">
                        <div className="stat-number-large">{stats.total - stats.active}</div>
                        <div className="stat-label">Inactive KPIs</div>
                    </div>
                </div>
            </div>

            <div className="progress-bar-container">
                <div className="progress-label">
                    <span>Activation Rate</span>
                    <span>{activationRate}%</span>
                </div>
                <div className="progress-bar">
                    <div className="progress-fill success" style={{ width: `${activationRate}%` }} />
                </div>
            </div>

            {stats.byFramework && stats.byFramework.length > 0 && (
                <div className="framework-distribution">
                    <div className="list-header">KPIs by Framework</div>
                    <div className="framework-list">
                        {stats.byFramework.slice(0, 5).map((item, index) => (
                            <div key={index} className="framework-item">
                                <span className="framework-name">{item.framework__name || item.framework_name}</span>
                                <span className="framework-count">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="kpi-trend">
                <div className="trend-item">
                    <FiTarget size={14} />
                    <span>Average KPIs per Framework: </span>
                    <strong>
                        {stats.byFramework && stats.byFramework.length > 0
                            ? (stats.total / stats.byFramework.length).toFixed(1)
                            : '0'}
                    </strong>
                </div>
                <div className="trend-item">
                    <FiActivity size={14} />
                    <span>KPIs needing attention: </span>
                    <strong className="warning">—</strong>
                </div>
            </div>
        </div>
    );
};

export default KPIStats;