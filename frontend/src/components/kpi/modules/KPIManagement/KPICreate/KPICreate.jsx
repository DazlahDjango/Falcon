import React, { useState } from 'react';
import PropTypes from 'prop-types';
import KPICreateStep1 from './KPICreateStep1';
import KPICreateStep2 from './KPICreateStep2';
import KPICreateStep3 from './KPICreateStep3';
import kpiService from '../../../../../services/kpi/kpi.service';
import styles from './KPICreate.module.css';

const KPICreate = ({ onComplete, onCancel, onError }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        kpiType: 'COUNT',
        calculationLogic: 'HIGHER_IS_BETTER',
        measureType: 'CUMULATIVE',
        unit: '',
        decimalPlaces: 2,
        targetMin: '',
        targetMax: '',
        frameworkId: '',
        sectorId: '',
        categoryId: '',
        ownerId: '',
        departmentId: '',
        strategicObjective: '',
        isActive: true,
        metadata: {}
    });
    const [loading, setLoading] = useState(false);
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
            const newKpi = await kpiService.createKPI(completeData);
            if (onComplete) onComplete(newKpi);
        } catch (error) {
            console.error('Failed to create KPI:', error);
            if (onError) onError(error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className={styles.kpiCreate}>
            <div className={styles.header}>
                <h2>Create New KPI</h2>
                <p>Step {step} of 3</p>
            </div>
            
            <div className={styles.progressBar}>
                <div className={`${styles.progressStep} ${step >= 1 ? styles.completed : ''}`}>
                    <span className={styles.stepNumber}>1</span>
                    <span>Basic Info</span>
                </div>
                <div className={`${styles.progressStep} ${step >= 2 ? styles.completed : ''}`}>
                    <span className={styles.stepNumber}>2</span>
                    <span>Target Settings</span>
                </div>
                <div className={`${styles.progressStep} ${step >= 3 ? styles.completed : ''}`}>
                    <span className={styles.stepNumber}>3</span>
                    <span>Review & Create</span>
                </div>
            </div>

            <div className={styles.formContainer}>
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
    );
};
KPICreate.propTypes = {
    onComplete: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onError: PropTypes.func,
};
export default KPICreate;
