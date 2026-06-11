import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
    FiShield, FiLock, FiCheckCircle, FiXCircle,
    FiAlertCircle, FiClock
} from 'react-icons/fi';
import { useAdminMFA } from '../../../hooks/accounts/useAdminMFA';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import Spinner from '../../common/UI/Spinner';

const StepUpVerifyView = ({ action, onSuccess, onCancel, actionLabel, isOpen = true }) => {
    const dispatch = useDispatch();
    const { verifyStepUp, stepUpVerifying } = useAdminMFA();

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(30);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (timeLeft <= 0) {
            setCanResend(true);
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        if (value && index < 5) {
            document.getElementById(`stepup-otp-${index + 1}`)?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`stepup-otp-${index - 1}`)?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (/^\d+$/.test(pastedData)) {
            const newOtp = pastedData.split('');
            while (newOtp.length < 6) newOtp.push('');
            setOtp(newOtp);
            document.getElementById('stepup-otp-5')?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }

        try {
            const result = await verifyStepUp(action, otpCode);
            dispatch(showAlert({ 
                type: 'success', 
                message: `Verified for ${actionLabel || action}` 
            }));
            onSuccess?.();
        } catch (error) {
            setError(error || 'Invalid verification code. Please try again.');
        }
    };

    const handleResend = () => {
        setTimeLeft(30);
        setCanResend(false);
        setError('');
        dispatch(showAlert({ 
            type: 'info', 
            message: 'New verification code sent to your authenticator app' 
        }));

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    if (!isOpen) return null;

    return (
        <div className="stepup-modal-overlay">
            <div className="stepup-modal">
                <div className="stepup-header">
                    <div className="stepup-icon">
                        <FiShield />
                    </div>
                    <h2>Step-Up Authentication Required</h2>
                    <p>Please verify your identity to continue</p>
                </div>

                <div className="stepup-content">
                    <div className="action-info">
                        <FiLock className="action-icon" />
                        <span>Action: {actionLabel || action}</span>
                    </div>

                    <form onSubmit={handleSubmit} onPaste={handlePaste}>
                        <div className="stepup-otp-inputs">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`stepup-otp-${index}`}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="stepup-otp-input"
                                    autoComplete="off"
                                    disabled={stepUpVerifying}
                                />
                            ))}
                        </div>

                        {error && (
                            <div className="stepup-error">
                                <FiAlertCircle />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="stepup-timer">
                            {timeLeft > 0 ? (
                                <>
                                    <FiClock />
                                    <span>Code expires in {timeLeft}s</span>
                                </>
                            ) : canResend ? (
                                <button type="button" className="resend-btn" onClick={handleResend}>
                                    Resend Code
                                </button>
                            ) : (
                                <span className="expired">Code expired</span>
                            )}
                        </div>

                        <div className="stepup-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onCancel}
                                disabled={stepUpVerifying}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={stepUpVerifying || otp.join('').length !== 6}
                            >
                                {stepUpVerifying ? <Spinner size="sm" /> : <FiCheckCircle />}
                                Verify
                            </button>
                        </div>
                    </form>

                    <div className="stepup-note">
                        <p>A verification code has been sent to your authenticator app.</p>
                        <p className="note-small">This code expires in 30 seconds for security.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StepUpVerifyView;