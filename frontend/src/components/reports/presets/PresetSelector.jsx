// frontend/src/components/reports/presets/PresetSelector.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiBookmark, FiChevronDown, FiPlus, FiTrash2 } from 'react-icons/fi';
import { usePresets } from '../../../hooks/reports';
import { PresetSaveModal } from './PresetSaveModal';
import './presets.css';

export const PresetSelector = ({
    reportId = null,
    currentFilters = {},
    selectedPresetId = null,
    onSelectPreset,
    className = '',
}) => {
    const { presets, loading, fetchPresets, deletePreset } = usePresets({ autoFetch: true });
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

    const relevantPresets = reportId
        ? presets.filter((p) => !p.report || p.report === reportId)
        : presets;

    const handleSelectChange = (e) => {
        const id = e.target.value;
        if (id === '__NEW__') {
            setIsSaveModalOpen(true);
            return;
        }

        const chosen = relevantPresets.find((p) => p.id === id);
        onSelectPreset?.(id || null, chosen?.filters || null);
    };

    const handleModalSuccess = (newPreset) => {
        fetchPresets();
        if (newPreset?.id) {
            onSelectPreset?.(newPreset.id, newPreset.filters);
        }
    };

    return (
        <div className={`preset-selector-container ${className}`}>
            <div className="preset-select-wrapper">
                <FiBookmark className="preset-icon-left" size={14} />
                <select
                    className="preset-select"
                    value={selectedPresetId || ''}
                    onChange={handleSelectChange}
                    disabled={loading}
                    title="Select a saved filter preset"
                >
                    <option value="">Preset Views...</option>
                    {relevantPresets.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name} {p.is_default ? '★' : ''}
                        </option>
                    ))}
                    <option value="__NEW__">+ Save Current Filters as Preset...</option>
                </select>
                <FiChevronDown className="preset-icon-right" size={12} />
            </div>

            <button
                type="button"
                className="preset-btn-save"
                onClick={() => setIsSaveModalOpen(true)}
                title="Save current filters as a preset"
            >
                <FiPlus size={13} />
                Save Preset
            </button>

            <PresetSaveModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onSuccess={handleModalSuccess}
                reportId={reportId}
                currentFilters={currentFilters}
            />
        </div>
    );
};

PresetSelector.propTypes = {
    reportId: PropTypes.string,
    currentFilters: PropTypes.object,
    selectedPresetId: PropTypes.string,
    onSelectPreset: PropTypes.func,
    className: PropTypes.string,
};

export default PresetSelector;
