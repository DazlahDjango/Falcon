import React from 'react';
import { FiCheckCircle, FiX } from 'react-icons/fi';

const KPICreateSuccess = ({ onClose }) => {
    return (
        <div className="kpi-create-success-overlay" onClick={onClose}>
            <div className="kpi-create-success" onClick={(e) => e.stopPropagation()}>
                <div className="success-icon">
                    <FiCheckCircle size={48} />
                </div>
                <h3>Performance Indicator Created Successfully!</h3>
                <p>Your new Performance Indicator has been created and is now ready to use.</p>
                <button className="success-close-btn" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default KPICreateSuccess;