// frontend/src/components/reports/distributions/DistributionPicker.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiUsers, FiPlus, FiCheck } from 'react-icons/fi';
import { useDistributions } from '../../../hooks/reports';
import { DistributionListModal } from './DistributionListModal';
import './distributions.css';

export const DistributionPicker = ({
    selectedDistributionId = null,
    onSelectDistribution,
    onRecipientsImported,
    className = '',
}) => {
    const { distributions, loading, fetchDistributions } = useDistributions({ autoFetch: true });
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSelectChange = (e) => {
        const id = e.target.value;
        onSelectDistribution?.(id || null);
        if (id) {
            const selected = distributions.find((d) => d.id === id);
            if (selected?.recipients && onRecipientsImported) {
                onRecipientsImported(selected.recipients);
            }
        }
    };

    const handleModalSuccess = (newDist) => {
        fetchDistributions();
        if (newDist?.id) {
            onSelectDistribution?.(newDist.id);
            if (newDist.recipients && onRecipientsImported) {
                onRecipientsImported(newDist.recipients);
            }
        }
    };

    const selectedDist = distributions.find((d) => d.id === selectedDistributionId);

    return (
        <div className={`distribution-picker-container ${className}`}>
            <div className="distribution-picker-header">
                <label className="distribution-picker-label">
                    <FiUsers size={16} />
                    Distribution List
                </label>
                <button
                    type="button"
                    className="distribution-picker-add-btn"
                    onClick={() => setIsModalOpen(true)}
                >
                    <FiPlus size={14} /> New List
                </button>
            </div>

            <select
                className="distribution-select"
                value={selectedDistributionId || ''}
                onChange={handleSelectChange}
                disabled={loading}
            >
                <option value="">Select a saved distribution list...</option>
                {distributions.map((d) => (
                    <option key={d.id} value={d.id}>
                        {d.name} ({d.recipients?.length || 0} recipients)
                    </option>
                ))}
            </select>

            {selectedDist && (
                <div className="distribution-preview-box">
                    <div className="distribution-preview-header">
                        <span>Includes {selectedDist.recipients?.length || 0} recipients:</span>
                    </div>
                    <div className="distribution-recipients-tags">
                        {selectedDist.recipients?.map((email) => (
                            <span key={email} className="distribution-recipient-chip">
                                <FiCheck size={10} /> {email}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <DistributionListModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
};

DistributionPicker.propTypes = {
    selectedDistributionId: PropTypes.string,
    onSelectDistribution: PropTypes.func,
    onRecipientsImported: PropTypes.func,
    className: PropTypes.string,
};

export default DistributionPicker;
