import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiSave, FiSend, FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import ActualForm from './ActualForm';
import EvidenceUpload from './EvidenceUpload';
import KPILoading from '../../common/KPILoading';
import KPISuccess from '../../common/KPISuccess';
import { fetchUserKPIs, createActual, selectUserKPIs } from '../../../../store/kpi';

const ActualSubmit = ({ 
    kpis: propKpis, 
    onSubmit, 
    loading: propLoading,
    onCancel 
}) => {
    const dispatch = useDispatch();
    const userKpis = useSelector(state => selectUserKPIs()(state)) || [];
    
    useEffect(() => {
        if (!propKpis || propKpis.length === 0) {
            dispatch(fetchUserKPIs({ params: { for_actuals: true } }));
        }
    }, [dispatch, propKpis]);

    const activeKpis = (propKpis && propKpis.length > 0) ? propKpis : userKpis;
    const rawKpiList = Array.isArray(activeKpis) ? activeKpis : (activeKpis?.results || []);
    
    // Filter to only approved and active KPIs owned by/issued to the user
    const kpiList = rawKpiList.filter(k => 
        k.is_active !== false && 
        k.approval_status === 'APPROVED'
    );

    const [formData, setFormData] = useState({
        kpi_id: '',
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        actual_value: '',
        notes: ''
    });
    const [evidenceFiles, setEvidenceFiles] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [validationError, setValidationError] = useState(null);

    const handleFormChange = (data) => {
        setFormData({ ...formData, ...data });
    };

    const handleEvidenceChange = (files) => {
        setEvidenceFiles(files);
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        
        if (!formData.kpi_id) {
            setValidationError('Please select a KPI before submitting.');
            return;
        }
        if (formData.actual_value === '' || formData.actual_value === null || formData.actual_value === undefined || isNaN(formData.actual_value)) {
            setValidationError('Please enter a valid actual value before submitting.');
            return;
        }

        try {
            setSubmitting(true);
            setValidationError(null);
            const payloadData = {
                kpi: formData.kpi_id,
                kpi_id: formData.kpi_id,
                year: Number(formData.year),
                month: Number(formData.month),
                actual_value: parseFloat(formData.actual_value),
                notes: formData.notes || ''
            };
            if (onSubmit) {
                await onSubmit(payloadData, evidenceFiles);
            } else {
                await dispatch(createActual({
                    data: payloadData,
                    evidenceFile: evidenceFiles.length > 0 ? evidenceFiles[0] : null
                })).unwrap();
            }
            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                if (onCancel) onCancel();
            }, 1800);
        } catch (err) {
            setValidationError(typeof err === 'string' ? err : (err?.detail || err?.message || 'Failed to submit actual value.'));
        } finally {
            setSubmitting(false);
        }
    };

    if (propLoading || submitting) {
        return (
            <div className="kpi-modal-overlay" style={overlayStyle}>
                <div className="kpi-actual-submit" style={containerStyle}>
                    <KPILoading text="Submitting actual data..." />
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="kpi-modal-overlay" style={overlayStyle}>
                <div className="kpi-actual-submit" style={containerStyle}>
                    <KPISuccess title="Success!" message="Actual data submitted successfully." />
                </div>
            </div>
        );
    }

    return (
        <div className="kpi-modal-overlay" style={overlayStyle}>
            <div className="kpi-actual-submit" style={containerStyle}>
                <div className="kpi-actual-submit-header">
                    <h2>Submit Monthly Actual Performance</h2>
                    <button className="kpi-actual-submit-close" onClick={onCancel}>
                        <FiX size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="kpi-actual-submit-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {validationError && (
                            <div className="kpi-actual-validation-error">
                                <FiAlertCircle size={16} />
                                {validationError}
                            </div>
                        )}

                        <ActualForm 
                            data={formData}
                            kpis={kpiList}
                            onChange={handleFormChange}
                        />
                        
                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                            <EvidenceUpload 
                                files={evidenceFiles}
                                onChange={handleEvidenceChange}
                            />
                        </div>
                    </div>

                    <div className="kpi-actual-submit-footer">
                        <button 
                            type="button" 
                            className="kpi-actual-back-btn" 
                            onClick={onCancel}
                            style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="kpi-actual-submit-btn" 
                            style={{ 
                                padding: '0.6rem 1.5rem', 
                                borderRadius: '8px', 
                                border: 'none', 
                                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', 
                                color: '#ffffff', 
                                fontWeight: 600, 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.5rem', 
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
                            }}
                        >
                            <FiSend size={16} />
                            Submit Actual Data
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem'
};

const containerStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '650px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: '1px solid #e2e8f0',
    padding: '1.5rem',
    position: 'relative'
};

export default ActualSubmit;