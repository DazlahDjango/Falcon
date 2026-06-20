import React from 'react';

const ExportOptions = ({ type, filters, data }) => {
    const getOptionDescription = () => {
        if (type === 'kpi') {
            return `Exporting ${data?.length || 'all'} KPIs with current filters`;
        }
        if (type === 'score') {
            return `Exporting scores for ${filters?.year}/${filters?.month}`;
        }
        return 'Exporting performance report';
    };
    
    return (
        <div className="export-options-section">
            <h4>Export Options</h4>
            <div className="export-summary">
                <p>{getOptionDescription()}</p>
                {filters && Object.keys(filters).length > 0 && (
                    <div className="export-filters">
                        <strong>Applied Filters:</strong>
                        <ul>
                            {Object.entries(filters).map(([key, value]) => (
                                value && <li key={key}>{key}: {String(value)}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExportOptions;