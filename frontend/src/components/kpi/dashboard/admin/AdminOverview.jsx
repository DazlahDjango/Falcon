import React from 'react';
import { FiTarget, FiFolder, FiBookOpen, FiUsers, FiCheckCircle, FiXCircle, FiTrendingUp, FiBarChart2 } from 'react-icons/fi';

const AdminOverview = ({ overview }) => {
    const sections = [
        {
            title: 'Frameworks',
            icon: <FiTarget size={20} />,
            color: '#4f46e5',
            stats: [
                { label: 'Total', value: overview?.frameworks?.total || 0 },
                { label: 'Published', value: overview?.frameworks?.published || 0 },
                { label: 'Draft', value: overview?.frameworks?.draft || 0 },
                { label: 'Archived', value: overview?.frameworks?.archived || 0 }
            ],
            completion: overview?.frameworks?.completion_rate || 0
        },
        {
            title: 'Categories',
            icon: <FiFolder size={20} />,
            color: '#10b981',
            stats: [
                { label: 'Total', value: overview?.categories?.total || 0 },
                { label: 'Active', value: overview?.categories?.active || 0 },
                { label: 'With KPIs', value: overview?.categories?.with_kpis || 0 }
            ],
            utilization: overview?.categories?.utilization_rate || 0
        },
        {
            title: 'Templates',
            icon: <FiBookOpen size={20} />,
            color: '#f59e0b',
            stats: [
                { label: 'Total', value: overview?.templates?.total || 0 },
                { label: 'Published', value: overview?.templates?.published || 0 },
                { label: 'Total Usage', value: overview?.templates?.total_usage || 0 }
            ],
            publication: overview?.templates?.publication_rate || 0
        },
        {
            title: 'KPIs',
            icon: <FiBarChart2 size={20} />,
            color: '#ef4444',
            stats: [
                { label: 'Total', value: overview?.kpis?.total || 0 },
                { label: 'Active', value: overview?.kpis?.active || 0 },
                { label: 'Inactive', value: overview?.kpis?.inactive || 0 }
            ],
            activation: overview?.kpis?.activation_rate || 0
        }
    ];
    
    const kpiByType = overview?.kpis?.by_type || [];
    const kpiByFramework = overview?.kpis?.by_framework || [];
    const kpiBySector = overview?.kpis?.by_sector || [];
    
    const formatTypeLabel = (type) => {
        const labels = {
            COUNT: 'Count',
            PERCENTAGE: 'Percentage',
            FINANCIAL: 'Financial',
            MILESTONE: 'Milestone',
            TIME: 'Time',
            IMPACT: 'Impact'
        };
        return labels[type] || type;
    };
    
    return (
        <div className="admin-overview">
            <div className="overview-sections">
                {sections.map((section, index) => (
                    <div key={index} className="overview-card">
                        <div className="overview-card-header">
                            <div className="card-icon" style={{ background: `${section.color}10`, color: section.color }}>
                                {section.icon}
                            </div>
                            <h3>{section.title}</h3>
                        </div>
                        <div className="overview-stats">
                            {section.stats.map((stat, i) => (
                                <div key={i} className="stat-item">
                                    <span className="stat-value">{stat.value}</span>
                                    <span className="stat-label">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                        {section.completion !== undefined && (
                            <div className="overview-progress">
                                <div className="progress-label">
                                    <span>Completion Rate</span>
                                    <span>{section.completion}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${section.completion}%`, background: section.color }} />
                                </div>
                            </div>
                        )}
                        {section.utilization !== undefined && (
                            <div className="overview-progress">
                                <div className="progress-label">
                                    <span>Utilization Rate</span>
                                    <span>{section.utilization}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${section.utilization}%`, background: section.color }} />
                                </div>
                            </div>
                        )}
                        {section.publication !== undefined && (
                            <div className="overview-progress">
                                <div className="progress-label">
                                    <span>Publication Rate</span>
                                    <span>{section.publication}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${section.publication}%`, background: section.color }} />
                                </div>
                            </div>
                        )}
                        {section.activation !== undefined && (
                            <div className="overview-progress">
                                <div className="progress-label">
                                    <span>Activation Rate</span>
                                    <span>{section.activation}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${section.activation}%`, background: section.color }} />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            <div className="overview-charts">
                <div className="chart-card">
                    <h3>KPIs by Type</h3>
                    <div className="chart-list">
                        {kpiByType.map((item, index) => (
                            <div key={index} className="chart-item">
                                <span className="item-label">{formatTypeLabel(item.kpi_type)}</span>
                                <div className="item-bar-container">
                                    <div className="item-bar" style={{ width: `${(item.count / (overview?.kpis?.total || 1)) * 100}%` }} />
                                </div>
                                <span className="item-value">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="chart-card">
                    <h3>KPIs by Sector</h3>
                    <div className="chart-list">
                        {kpiBySector.slice(0, 5).map((item, index) => (
                            <div key={index} className="chart-item">
                                <span className="item-label">{item.sector__name || 'Unknown'}</span>
                                <div className="item-bar-container">
                                    <div className="item-bar" style={{ width: `${(item.count / (overview?.kpis?.total || 1)) * 100}%` }} />
                                </div>
                                <span className="item-value">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {overview?.recent_activity && overview.recent_activity.length > 0 && (
                <div className="recent-activity-card">
                    <h3>Recent Activity</h3>
                    <div className="activity-timeline">
                        {overview.recent_activity.slice(0, 10).map((activity, index) => (
                            <div key={index} className="activity-timeline-item">
                                <div className="timeline-dot" />
                                <div className="timeline-content">
                                    <div className="activity-action">{activity.action}</div>
                                    <div className="activity-details">
                                        {activity.kpi_name} - by {activity.performed_by}
                                    </div>
                                    <div className="activity-time">
                                        {new Date(activity.performed_at).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOverview;