import React, { useState, useRef, useEffect  } from "react";
import Spinner from '../../../common/UI/Spinner';

const MFASetupForm = ({ onSubmit, isLoading }) => {
    const [otp ,setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);
    const handleChange = (index, value) => {
        if (value.length > 1) return;
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };
    return (
        <form onSubmit={handleSubmit} className="mfa-verify-form">
            <h4>Verify Setup</h4>
            <p>Enter the 6-digit code from your authenticator app to confirm setup</p>
            
            <div className="otp-inputs">
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={el => inputRefs.current[index] = el}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="otp-input"
                        autoComplete="off"
                    />
                ))}
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={isLoading || otp.join('').length !== 6}>
                {isLoading ? <Spinner size="sm" /> : 'Verify and Enable'}
            </button>
        </form>
    );
};
export default MFASetupForm;