// frontend/src/components/reports/widgets/HeatmapWidget.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './widgets.css';

export const HeatmapWidget = ({ widget, data }) => {
    const labels = data?.labels || [];
    const values = data?.values || [];
    const minVal = data?.min || 0;
    const maxVal = data?.max || 100;
    const xLabels = data?.x_labels || [];
    const yLabels = data?.y_labels || [];

    const getColor = (value) => {
        const normalized = (value - minVal) / (maxVal - minVal);
        const r = Math.round(255 * (1 - normalized));
        const g = Math.round(255 * normalized);
        const b = 100;
        return `rgb(${r}, ${g}, ${b})`;
    };

    const getCellLabel = (value) => {
        if (value === undefined || value === null) return '-';
        if (typeof value === 'number') return value.toFixed(1);
        return String(value);
    };

    if (!data || values.length === 0) {
        return (
            <div className="heatmap-placeholder">
                <p>No heatmap data available</p>
            </div>
        );
    }

    return (
        <div className="heatmap-widget">
            <div className="heatmap-grid">
                <div className="heatmap-header">
                    <div className="heatmap-corner" />
                    {xLabels.map((label, idx) => (
                        <div key={idx} className="heatmap-x-label">
                            {label}
                        </div>
                    ))}
                </div>
                <div className="heatmap-body">
                    {yLabels.map((rowLabel, rowIdx) => (
                        <React.Fragment key={rowIdx}>
                            <div className="heatmap-y-label">{rowLabel}</div>
                            {Array.isArray(values[rowIdx]) ? (
                                values[rowIdx].map((cell, colIdx) => (
                                    <div
                                        key={colIdx}
                                        className="heatmap-cell"
                                        style={{ backgroundColor: getColor(cell) }}
                                        title={`${rowLabel} - ${xLabels[colIdx] || colIdx}: ${getCellLabel(cell)}`}
                                    >
                                        {getCellLabel(cell)}
                                    </div>
                                ))
                            ) : (
                                <div
                                    className="heatmap-cell"
                                    style={{ backgroundColor: getColor(values[rowIdx]) }}
                                >
                                    {getCellLabel(values[rowIdx])}
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
            <div className="heatmap-legend">
                <span>{minVal}</span>
                <div className="heatmap-gradient" />
                <span>{maxVal}</span>
            </div>
        </div>
    );
};

HeatmapWidget.propTypes = {
    widget: PropTypes.object.isRequired,
    data: PropTypes.object,
};