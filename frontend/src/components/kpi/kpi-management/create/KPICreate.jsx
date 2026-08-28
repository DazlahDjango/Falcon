import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import KPICreateStep1 from './KPICreateStep1';
import KPICreateStep2 from './KPICreateStep2';
import KPICreateStep3 from './KPICreateStep3';
import KPICreateSuccess from './KPICreateSuccess';
import { createKPI } from '../../../../store/kpi';
import KPILoading from '../../common/KPILoading';

const KPICreate = ({ onComplete, onCancel, initialCategoryId }) => {
    const dispatch = useDispatch();
    const location = useLocation();
    const defaultCategoryId = initialCategoryId || location.state?.categoryId || '';

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        kpi_type: 'PERCENTAGE',
        calculation_logic: 'HIGHER_IS_BETTER',
        measure_type: 'CUMULATIVE',
        unit: '',
        decimal_places: 2,
        target_min: null,
        target_max: null,
        category_id: defaultCategoryId,
        owner_id: '',
        department_id: '',
        strategic_objective: '',
        is_active: true,
        metadata: {}
    });
    
    const handleNext = (stepData) => {
        setFormData(prev => ({ ...prev, ...stepData }));
        setStep(step + 1);
    };
    
    const handleBack = () => {
        setStep(step - 1);
    };
    
    const handleSubmit = async (finalData) => {
        setLoading(true);
        try {
            const completeData = { ...formData, ...finalData };
            const result = await dispatch(createKPI(completeData)).unwrap();
            setSubmitted(true);
            setTimeout(() => {
                if (onComplete) onComplete(result);
            }, 2000);
        } catch (error) {
            console.error('Failed to create KPI:', error);
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) {
        return <KPILoading text="Creating KPI..." />;
    }
    
    if (submitted) {
        return <KPICreateSuccess onClose={onCancel} />;
    }
    
    return (
        <div className="kpi-create-modal-overlay" onClick={onCancel}>
            <div className="kpi-create-modal" onClick={(e) => e.stopPropagation()}>
                <div className="kpi-create-header">
                    <h2>Create New KPI</h2>
                    <button className="kpi-create-close" onClick={onCancel}>
                        <FiX size={20} />
                    </button>
                </div>
                
                <div className="kpi-create-progress">
                    <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                        <div className="step-number">1</div>
                        <div className="step-label">Basic Info</div>
                    </div>
                    <div className="progress-line" />
                    <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                        <div className="step-number">2</div>
                        <div className="step-label">Configuration</div>
                    </div>
                    <div className="progress-line" />
                    <div className={`progress-step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
                        <div className="step-number">3</div>
                        <div className="step-label">Review</div>
                    </div>
                </div>
                
                <div className="kpi-create-content">
                    {step === 1 && (
                        <KPICreateStep1
                            data={formData}
                            onNext={handleNext}
                            onCancel={onCancel}
                        />
                    )}
                    {step === 2 && (
                        <KPICreateStep2
                            data={formData}
                            onNext={handleNext}
                            onBack={handleBack}
                            onCancel={onCancel}
                        />
                    )}
                    {step === 3 && (
                        <KPICreateStep3
                            data={formData}
                            onSubmit={handleSubmit}
                            onBack={handleBack}
                            onCancel={onCancel}
                            loading={loading}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default KPICreate;