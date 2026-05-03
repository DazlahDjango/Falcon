// frontend/src/components/tenant/schema/SchemaSizeDisplay.jsx
import React from 'react';
import './schema.css';

export const SchemaSizeDisplay = ({ sizeMb }) => {
    if (!sizeMb && sizeMb !== 0) return <span>-</span>;

    if (sizeMb < 1024) {
        return (
            <div className="schema-size-display">
                <span className="schema-size-value">{sizeMb.toFixed(1)}</span>
                <span className="schema-size-unit">MB</span>
            </div>
        );
    }

    const sizeGb = sizeMb / 1024;
    if (sizeGb < 1024) {
        return (
            <div className="schema-size-display">
                <span className="schema-size-value">{sizeGb.toFixed(2)}</span>
                <span className="schema-size-unit">GB</span>
            </div>
        );
    }

    const sizeTb = sizeGb / 1024;
    return (
        <div className="schema-size-display">
            <span className="schema-size-value">{sizeTb.toFixed(2)}</span>
            <span className="schema-size-unit">TB</span>
        </div>
    );
};