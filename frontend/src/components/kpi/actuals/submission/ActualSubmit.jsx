import React, { useState } from 'react';
import { FiUpload, FiSave, FiSend, FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import ActualForm from './ActualForm';
import EvidenceUpload from './EvidenceUpload';
import KPILoading from '../../common/KPILoading';
import KPISuccess from '../../common/KPISuccess';

const ActualSubmit = ({ 
    kpis, 
    onSubmit, 
    loading,
    onCancel 
}) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        kpi_id: '',
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        actual_value: '',
        notes: ''
    });
    const [evidenceFiles, setEvidenceFiles] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [validationError, setValidationError] = useState(null);

    const handleFormChange = (data) => {
        setFormData({ ...formData, ...data });
    };

    const handleEvidenceChange = (files) => {
        setEvidenceFiles(files);
    };

    const handleNext = () => {
        if (step === 1 && !formData.kpi_id) {
            setValidationError('Please select a KPI before continuing.');
            return;
        }
        if (step === 1 && (formData.actual_value === '' || formData.actual_value === null || formData.actual_value === undefined)) {
            setValidationError('Please enter the actual value before continuing.');
            return;
        }
        setValidationError(null);
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleSubmit = async () => {
        const result = await onSubmit(formData, evidenceFiles);
        if (result) {
            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                onCancel();
            }, 2000);
        }
    };

    if (loading) {
        return <KPILoading text="Submitting actual data..." />;
    }

    if (submitted) {
        return <KPISuccess title="Success!" message="Actual data submitted successfully." />;
    }

    return (
        <div className="kpi-actual-submit">
            <div className="kpi-actual-submit-header">
                <h2>Submit Actual Performance</h2>
                <button className="kpi-actual-submit-close" onClick={onCancel}>
                    <FiX size={20} />
                </button>
            </div>
            
            <div className="kpi-actual-submit-steps">
                <div className={`kpi-actual-step ${step >= 1 ? 'active' : ''}`}>
                    <div className="kpi-actual-step-number">1</div>
                    <div className="kpi-actual-step-label">Enter Value</div>
                </div>
                <div className="kpi-actual-step-line" />
                <div className={`kpi-actual-step ${step >= 2 ? 'active' : ''}`}>
                    <div className="kpi-actual-step-number">2</div>
                    <div className="kpi-actual-step-label">Upload Evidence</div>
                </div>
                <div className="kpi-actual-step-line" />
                <div className={`kpi-actual-step ${step >= 3 ? 'active' : ''}`}>
                    <div className="kpi-actual-step-number">3</div>
                    <div className="kpi-actual-step-label">Review & Submit</div>
                </div>
            </div>
            
            <div className="kpi-actual-submit-content">
                {step === 1 && (
                    <ActualForm 
                        data={formData}
                        kpis={kpis}
                        onChange={handleFormChange}
                    />
                )}
                
                {step === 2 && (
                    <EvidenceUpload 
                        files={evidenceFiles}
                        onChange={handleEvidenceChange}
                    />
                )}
                
                {step === 3 && (
                    <div className="kpi-actual-review">
                        <h3>Review Your Submission</h3>
                        <div className="kpi-actual-review-item">
                            <span className="kpi-actual-review-label">KPI:</span>
                            <span className="kpi-actual-review-value">
                                {kpis.find(k => k.id === formData.kpi_id)?.name || formData.kpi_id}
                            </span>
                        </div>
                        <div className="kpi-actual-review-item">
                            <span className="kpi-actual-review-label">Period:</span>
                            <span className="kpi-actual-review-value">
                                {formData.month}/{formData.year}
                            </span>
                        </div>
                        <div className="kpi-actual-review-item">
                            <span className="kpi-actual-review-label">Actual Value:</span>
                            <span className="kpi-actual-review-value">{formData.actual_value}</span>
                        </div>
                        {formData.notes && (
                            <div className="kpi-actual-review-item">
                                <span className="kpi-actual-review-label">Notes:</span>
                                <span className="kpi-actual-review-value">{formData.notes}</span>
                            </div>
                        )}
                        <div className="kpi-actual-review-item">
                            <span className="kpi-actual-review-label">Evidence:</span>
                            <span className="kpi-actual-review-value">
                                {evidenceFiles.length} file(s) attached
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {validationError && (
                <div className="kpi-actual-validation-error">
                    <FiAlertCircle size={14} />
                    {validationError}
                </div>
            )}

            <div className="kpi-actual-submit-footer">
                {step > 1 && (
                    <button className="kpi-actual-back-btn" onClick={handleBack}>
                        Back
                    </button>
                )}
                {step < 3 && (
                    <button className="kpi-actual-next-btn" onClick={handleNext}>
                        Continue
                    </button>
                )}
                {step === 3 && (
                    <button className="kpi-actual-submit-btn" onClick={handleSubmit}>
                        <FiSend size={14} />
                        Submit Actual
                    </button>
                )}
            </div>
        </div>
    );
};

export default ActualSubmit;