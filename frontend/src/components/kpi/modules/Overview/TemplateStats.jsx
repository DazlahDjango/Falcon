import React from 'react';
import { FiFileText, FiCheckCircle, FiTrendingUp, FiStar } from 'react-icons/fi';

const TemplateStats = ({ templates, stats }) => {
    const publicationRate = stats.total > 0 ? (stats.published / stats.total * 100).toFixed(1) : 0;
    const avgUsage = stats.total > 0 ? (stats.totalUsage / stats.total).toFixed(1) : 0;

    // Find most used template
    const mostUsedTemplate = templates.reduce((max, t) =>
        (t.usage_count || 0) > (max?.usage_count || 0) ? t : max, null);

    // Group by difficulty
    const difficultyCounts = templates.reduce((acc, t) => {
        const diff = t.difficulty || 'INTERMEDIATE';
        acc[diff] = (acc[diff] || 0) + 1;
        return acc;
    }, {});

    const difficultyLabels = {
        BEGINNER: 'Beginner',
        INTERMEDIATE: 'Intermediate',
        ADVANCED: 'Advanced',
    };

    const difficultyColors = {
        BEGINNER: '#10b981',
        INTERMEDIATE: '#f59e0b',
        ADVANCED: '#ef4444',
    };

    return (
        <div className="stat-section">
            <div className="section-header">
                <h3 className="section-title">
                    <FiFileText size={18} />
                    Template Insights
                </h3>
                <span className="section-badge">{stats.total} Templates</span>
            </div>

            <div className="stats-grid three-col">
                <div className="stat-item">
                    <div className="stat-number">{stats.published}</div>
                    <div className="stat-label">Published</div>
                </div>
                <div className="stat-item">
                    <div className="stat-number">{stats.totalUsage}</div>
                    <div className="stat-label">Total Uses</div>
                </div>
                <div className="stat-item">
                    <div className="stat-number">{avgUsage}</div>
                    <div className="stat-label">Avg Uses/Template</div>
                </div>
            </div>

            <div className="progress-bar-container">
                <div className="progress-label">
                    <span>Publication Rate</span>
                    <span>{publicationRate}%</span>
                </div>
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${publicationRate}%` }} />
                </div>
            </div>

            {mostUsedTemplate && (
                <div className="highlight-card">
                    <div className="highlight-icon">
                        <FiStar size={20} color="#f59e0b" />
                    </div>
                    <div className="highlight-content">
                        <div className="highlight-label">Most Used Template</div>
                        <div className="highlight-name">{mostUsedTemplate.name}</div>
                        <div className="highlight-value">{mostUsedTemplate.usage_count || 0} uses</div>
                    </div>
                </div>
            )}

            <div className="difficulty-distribution">
                <div className="list-header">By Difficulty Level</div>
                <div className="difficulty-list">
                    {Object.entries(difficultyCounts).map(([level, count]) => (
                        <div key={level} className="difficulty-item">
                            <span className="difficulty-dot" style={{ backgroundColor: difficultyColors[level] }} />
                            <span className="difficulty-name">{difficultyLabels[level]}</span>
                            <div className="difficulty-bar-container">
                                <div
                                    className="difficulty-bar"
                                    style={{
                                        width: `${(count / stats.total * 100)}%`,
                                        backgroundColor: difficultyColors[level]
                                    }}
                                />
                            </div>
                            <span className="difficulty-count">{count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TemplateStats;