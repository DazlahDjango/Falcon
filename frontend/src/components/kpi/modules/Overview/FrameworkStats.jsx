import React from 'react';
import { FiCheckCircle, FiEdit2, FiArchive, FiTrendingUp } from 'react-icons/fi';

const FrameworkStats = ({ frameworks, stats }) => {
    const publishedCount = stats.published;
    const draftCount = stats.draft;
    const archivedCount = stats.archived;
    const total = stats.total;

    const publishRate = total > 0 ? (publishedCount / total * 100).toFixed(1) : 0;

    return (
        <div className="stat-section">
            <div className="section-header">
                <h3 className="section-title">
                    <FiTrendingUp size={18} />
                    Framework Statistics
                </h3>
                <span className="section-badge">{total} Total</span>
            </div>

            <div className="stats-grid">
                <div className="stat-item published">
                    <div className="stat-icon-small">
                        <FiCheckCircle size={16} />
                    </div>
                    <div className="stat-details">
                        <div className="stat-number">{publishedCount}</div>
                        <div className="stat-label">Published</div>
                    </div>
                </div>
                <div className="stat-item draft">
                    <div className="stat-icon-small">
                        <FiEdit2 size={16} />
                    </div>
                    <div className="stat-details">
                        <div className="stat-number">{draftCount}</div>
                        <div className="stat-label">Draft</div>
                    </div>
                </div>
                <div className="stat-item archived">
                    <div className="stat-icon-small">
                        <FiArchive size={16} />
                    </div>
                    <div className="stat-details">
                        <div className="stat-number">{archivedCount}</div>
                        <div className="stat-label">Archived</div>
                    </div>
                </div>
            </div>

            <div className="progress-bar-container">
                <div className="progress-label">
                    <span>Publication Rate</span>
                    <span>{publishRate}%</span>
                </div>
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${publishRate}%` }} />
                </div>
            </div>

            {frameworks.length > 0 && (
                <div className="recent-list">
                    <div className="list-header">Recent Frameworks</div>
                    {frameworks.slice(0, 5).map(fw => (
                        <div key={fw.id} className="list-item">
                            <span className="item-name">{fw.name}</span>
                            <span className={`item-badge ${fw.status.toLowerCase()}`}>
                                {fw.status}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FrameworkStats;