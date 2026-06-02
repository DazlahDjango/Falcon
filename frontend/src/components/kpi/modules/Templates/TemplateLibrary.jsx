import React, { useState } from 'react';
import { FiSearch, FiChevronRight } from 'react-icons/fi';

const DIFFICULTY_CONFIG = {
    BEGINNER: { label: 'Beginner', color: '#10b981', icon: '🌱' },
    INTERMEDIATE: { label: 'Intermediate', color: '#f59e0b', icon: '📈' },
    ADVANCED: { label: 'Advanced', color: '#ef4444', icon: '🚀' },
};

const TemplateLibrary = ({ templates, loading, onView, onUse }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSector, setSelectedSector] = useState(null);

    if (loading) {
        return (
            <div className="template-loading">
                <div className="spinner"></div>
                <p>Loading templates...</p>
            </div>
        );
    }

    if (templates.length === 0) {
        return (
            <div className="template-empty">
                <div className="empty-icon">📚</div>
                <h3>No Templates Found</h3>
                <p>Create templates to help users quickly set up KPIs.</p>
            </div>
        );
    }

    // Group templates by sector
    const groupedTemplates = templates.reduce((acc, template) => {
        const sector = template.sector_name || 'Uncategorized';
        if (!acc[sector]) acc[sector] = [];
        acc[sector].push(template);
        return acc;
    }, {});

    return (
        <div className="template-library">
            <div className="library-search">
                <FiSearch className="search-icon" size={18} />
                <input
                    type="text"
                    placeholder="Search templates by name, code, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="library-search-input"
                />
            </div>

            <div className="library-sections">
                {Object.entries(groupedTemplates).map(([sectorName, sectorTemplates]) => (
                    <div key={sectorName} className="library-section">
                        <div className="section-header">
                            <h2 className="section-title">{sectorName}</h2>
                            <span className="section-count">{sectorTemplates.length} templates</span>
                        </div>
                        <div className="template-shelf">
                            {sectorTemplates
                                .filter(t => !searchTerm ||
                                    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    t.code.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map(template => (
                                    <div key={template.id} className="template-book">
                                        <div
                                            className="template-book-cover"
                                            style={{
                                                background: `linear-gradient(135deg, ${DIFFICULTY_CONFIG[template.difficulty]?.color}20, ${DIFFICULTY_CONFIG[template.difficulty]?.color}40)`,
                                                borderBottomColor: DIFFICULTY_CONFIG[template.difficulty]?.color
                                            }}
                                        >
                                            <div className="template-book-icon">
                                                {DIFFICULTY_CONFIG[template.difficulty]?.icon || '📋'}
                                            </div>
                                            <div className="template-book-title">{template.name}</div>
                                            <div className="template-book-code">{template.code}</div>
                                        </div>
                                        <div className="template-book-info">
                                            <div className="template-book-stats">
                                                <span className="stat">
                                                    <span className="stat-label">Used</span>
                                                    <span className="stat-value">{template.usage_count || 0}</span>
                                                </span>
                                                <span className="stat">
                                                    <span className="stat-label">Difficulty</span>
                                                    <span className="stat-value" style={{ color: DIFFICULTY_CONFIG[template.difficulty]?.color }}>
                                                        {DIFFICULTY_CONFIG[template.difficulty]?.label}
                                                    </span>
                                                </span>
                                            </div>
                                            <div className="template-book-actions">
                                                <button
                                                    className="btn-preview"
                                                    onClick={() => onView(template)}
                                                >
                                                    Preview
                                                </button>
                                                <button
                                                    className="btn-use"
                                                    onClick={() => onUse(template)}
                                                >
                                                    Use Template
                                                    <FiChevronRight size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TemplateLibrary;