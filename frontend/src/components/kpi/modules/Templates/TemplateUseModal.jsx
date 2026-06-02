import React, { useState } from 'react';
import { FiX, FiCheckCircle } from 'react-icons/fi';

const TemplateUseModal = ({ template, frameworks, onConfirm, onClose }) => {
    const [selectedFramework, setSelectedFramework] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleConfirm = async () => {
        if (!selectedFramework) {
            setError('Please select a framework');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        try {
            await onConfirm(template.id, selectedFramework);
        } catch (err) {
            setError(err.message || 'Failed to create KPI from template');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">Create KPI from Template</h3>
                    <button className="modal-close" onClick={onClose}>
                        <FiX size={18} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="template-info">
                        <div className="template-icon">{template.difficulty === 'BEGINNER' ? '🌱' : template.difficulty === 'INTERMEDIATE' ? '📈' : '🚀'}</div>
                        <div>
                            <div className="template-name">{template.name}</div>
                            <div className="template-code">{template.code}</div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Select Framework <span className="required">*</span></label>
                        <select
                            value={selectedFramework}
                            onChange={(e) => setSelectedFramework(e.target.value)}
                            className="form-select"
                        >
                            <option value="">Select a framework</option>
                            {frameworks.filter(f => f.status === 'PUBLISHED').map(fw => (
                                <option key={fw.id} value={fw.id}>
                                    {fw.name} ({fw.code})
                                </option>
                            ))}
                        </select>
                    </div>

                    {error && (
                        <div className="alert-error">
                            <span className="alert-icon">⚠️</span>
                            {error}
                        </div>
                    )}

                    <div className="modal-info">
                        <p>This will create a new KPI with the following pre-filled values:</p>
                        <ul>
                            <li>✓ KPI Type: {template.kpi_definition?.kpi_type}</li>
                            <li>✓ Calculation Logic: {template.kpi_definition?.calculation_logic === 'HIGHER_IS_BETTER' ? 'Higher is Better' : 'Lower is Better'}</li>
                            <li>✓ Measure Type: {template.kpi_definition?.measure_type === 'CUMULATIVE' ? 'Cumulative (YTD)' : 'Non-Cumulative'}</li>
                            {template.kpi_definition?.unit && <li>✓ Unit: {template.kpi_definition.unit}</li>}
                        </ul>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="btn-primary" onClick={handleConfirm} disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : (
                            <>
                                <FiCheckCircle size={14} />
                                Create KPI
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TemplateUseModal;