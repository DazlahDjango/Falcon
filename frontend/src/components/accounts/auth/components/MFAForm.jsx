import React, { useState, useRef, useEffect } from "react";
import { FiLock } from "react-icons/fi";
import { Spinner } from '../../../common/UI/Spinner';

const MFAForm = ({ onSubmit, isLoading, timeLeft, canResend, onResend }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
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
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (/^\d+$/.test(pastedData)) {
            const newOtp = pastedData.split('');
            while (newOtp.length < 6) newOtp.push('');
            setOtp(newOtp);
            inputRefs.current[5].focus();
        }
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length === 6) {
            onSubmit({ otp: code });
        }
    };
    return (
        <form onSubmit={handleSubmit} className="auth-form mfa-form">
            <div className="mfa-instructions">
                <p>Enter the 6-digit code from your authenticator app</p>
            </div>
            
            <div className="otp-inputs" onPaste={handlePaste}>
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
            
            {timeLeft > 0 && (
                <div className="mfa-timer">
                    <FiLock size={14} />
                    <span>Code expires in {timeLeft}s</span>
                </div>
            )}
            
            {canResend && (
                <div className="mfa-resend">
                    <button type="button" onClick={onResend} className="resend-btn">
                        Didn't receive code? Resend
                    </button>
                </div>
            )}
            
            <button type="submit" className="btn btn-primary btn-block" disabled={isLoading || otp.join('').length !== 6}>
                {isLoading ? <Spinner size="sm" /> : 'Verify'}
            </button>
        </form>
    );
};
export { MFAForm };