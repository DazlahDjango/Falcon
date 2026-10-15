// frontend/src/components/reports/presets/PresetTable.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiBookmark, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { PresetStatusBadge } from './PresetStatusBadge';
import './presets.css';

export const PresetTable = ({
    presets = [],
    onEdit,
    onDelete,
    onApply,
}) => {
    return (
        <div className="preset-table-container">
            <table className="preset-table">
                <thead>
                    <tr>
                        <th>Preset Name</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Filter Criteria</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {presets.length === 0 ? (
                        <tr>
                            <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                                No filter presets found.
                            </td>
                        </tr>
                    ) : (
                        presets.map((preset) => (
                            <tr key={preset.id}>
                                <td>
                                    <strong style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <FiBookmark size={14} color="#2563eb" />
                                        {preset.name}
                                    </strong>
                                </td>
                                <td>{preset.description || '-'}</td>
                                <td>
                                    <PresetStatusBadge isDefault={preset.is_default} />
                                </td>
                                <td>
                                    <code style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
                                        {preset.filters ? `${Object.keys(preset.filters).length} active filters` : 'None'}
                                    </code>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        {onApply && (
                                            <button
                                                type="button"
                                                className="btn btn-outline btn-sm"
                                                onClick={() => onApply(preset)}
                                                style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                                            >
                                                Apply
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            className="action-btn edit"
                                            onClick={() => onEdit?.(preset)}
                                            title="Edit"
                                        >
                                            <FiEdit2 size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            className="action-btn delete"
                                            onClick={() => onDelete?.(preset)}
                                            title="Delete"
                                        >
                                            <FiTrash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

PresetTable.propTypes = {
    presets: PropTypes.array,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    onApply: PropTypes.func,
};

export default PresetTable;
