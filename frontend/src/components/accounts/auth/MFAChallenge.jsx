import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiShield,
  FiKey,
  FiAlertCircle,
  FiCheckCircle,
  FiArrowLeft,
  FiSmartphone,
  FiRefreshCw,
} from 'react-icons/fi';
import { useAuth } from '../../../hooks/accounts/useAuth';
import { ACCOUNTS_ROUTES } from '../../../config/constants/accountsRouteConstants';

export const MFAChallenge = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyMfa, isLoading, error, clearAuthError, user } = useAuth();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);

  const mfaToken = location.state?.mfaToken;

  useEffect(() => {
    if (!mfaToken) {
      navigate(ACCOUNTS_ROUTES.LOGIN);
    }
  }, [mfaToken, navigate]);

  useEffect(() => {
    if (error) {
      setFormError(error);
    }
  }, [error]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    if (newOtp.every((digit) => digit !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    if (pastedData.length === 6) {
      const digits = pastedData.split('');
      setOtp(digits);
      digits.forEach((digit, i) => {
        if (inputRefs.current[i]) {
          inputRefs.current[i].value = digit;
        }
      });
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (code) => {
    if (code.length !== 6) {
      setFormError('Please enter all 6 digits');
      return;
    }

    setFormError(null);
    clearAuthError();

    const result = await verifyMfa(mfaToken, code);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate(ACCOUNTS_ROUTES.DASHBOARD);
      }, 1500);
    } else {
      setFormError(result.error || 'Invalid verification code');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    }
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setResendCooldown(30);
    setFormError(null);
  };

  const handleBack = () => {
    navigate(ACCOUNTS_ROUTES.LOGIN);
  };

  return (
    <div className="auth-container">
      <div className="auth-card mfa-card">
        <button className="auth-back-btn" onClick={handleBack}>
          <FiArrowLeft /> Back to Login
        </button>

        <div className="auth-header">
          <div className="mfa-icon-wrapper">
            <FiShield className="mfa-icon" />
          </div>
          <h1 className="auth-title">Two-Factor Authentication</h1>
          <p className="auth-subtitle">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        {success && (
          <div className="auth-alert success">
            <FiCheckCircle className="alert-icon" />
            <span>Verification successful! Redirecting...</span>
          </div>
        )}

        {formError && (
          <div className="auth-alert error">
            <FiAlertCircle className="alert-icon" />
            <span>{formError}</span>
          </div>
        )}

        <div className="mfa-otp-container">
          <div className="mfa-otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className={`mfa-otp-input ${digit ? 'filled' : ''} ${
                  formError ? 'error' : ''
                }`}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={isLoading || success}
                autoFocus={index === 0}
              />
            ))}
          </div>
        </div>

        <div className="mfa-actions">
          <button
            className="auth-btn primary"
            onClick={() => handleVerify(otp.join(''))}
            disabled={isLoading || success || otp.some((d) => d === '')}
          >
            {isLoading ? (
              <>
                <span className="spinner-sm" />
                Verifying...
              </>
            ) : (
              <>
                <FiKey /> Verify
              </>
            )}
          </button>
        </div>

        <div className="mfa-footer">
          <p className="mfa-info">
            <FiSmartphone className="mfa-info-icon" />
            Open your authenticator app to get your code
          </p>
          <button
            className="mfa-resend-btn"
            onClick={handleResend}
            disabled={resendCooldown > 0}
          >
            <FiRefreshCw className={resendCooldown > 0 ? 'spinning' : ''} />
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
          </button>
          <Link to={ACCOUNTS_ROUTES.MFA_RECOVER} className="mfa-recover-link">
            Lost access to your authenticator?
          </Link>
        </div>
      </div>
    </div>
  );
};
export default MFAChallenge;