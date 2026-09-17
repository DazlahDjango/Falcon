import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiShield,
  FiSmartphone,
  FiKey,
  FiCheck,
  FiCopy,
  FiDownload,
  FiAlertCircle,
  FiCheckCircle,
  FiArrowLeft,
} from 'react-icons/fi';
import { useMFA } from '../../../hooks/accounts/useMFA';
import { useAuth } from '../../../hooks/accounts/useAuth';
import { ACCOUNTS_ROUTES } from '../../../config/constants/accountsRouteConstants';
import { setupMFA } from '../../../services/accounts/api/auth';

export const MFASetupWizard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, verifyMfa } = useAuth();
  const { setupTotp, verifyTotpSetup, isLoading: isHookLoading, error, clearMfaError, backupCodes: hookBackupCodes } = useMFA();

  const mfaToken = location.state?.mfaToken;
  const userEmail = location.state?.email || user?.email || '';

  const [step, setStep] = useState(1);
  const [deviceName, setDeviceName] = useState('Authenticator');
  const [secret, setSecret] = useState('');
  const [provisioningUri, setProvisioningUri] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [preLoginBackupCodes, setPreLoginBackupCodes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef([]);

  const backupCodes = (hookBackupCodes && hookBackupCodes.length > 0) ? hookBackupCodes : preLoginBackupCodes;
  const isLoading = isHookLoading || isSubmitting;

  useEffect(() => {
    if (error) {
      setFormError(error);
    }
  }, [error]);

  const handleSetup = async () => {
    setFormError(null);
    clearMfaError();
    setIsSubmitting(true);

    try {
      if (mfaToken) {
        // Pre-login first-time setup
        const response = await setupMFA({
          device_name: deviceName,
          mfa_token: mfaToken,
        });
        const data = response.data;
        if (data) {
          setSecret(data.secret);
          setProvisioningUri(data.provisioning_uri);
          setQrCodeData(data.qr_code_data);
          setDeviceId(data.device_id);
          if (data.backup_codes) {
            setPreLoginBackupCodes(data.backup_codes);
          }
          setStep(2);
        } else {
          setFormError('Failed to generate MFA setup details');
        }
      } else {
        // Authenticated in-app setup
        const result = await setupTotp({ device_name: deviceName });
        if (result.data) {
          setSecret(result.data.secret);
          setProvisioningUri(result.data.provisioning_uri);
          setQrCodeData(result.data.qr_code_data);
          setDeviceId(result.data.device_id);
          if (result.data.backup_codes) {
            setPreLoginBackupCodes(result.data.backup_codes);
          }
          setStep(2);
        } else {
          setFormError(result.error || 'Failed to setup MFA');
        }
      }
    } catch (err) {
      console.error('MFA setup error:', err);
      setFormError(err.response?.data?.error || err.message || 'Failed to setup MFA');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setFormError('Please enter all 6 digits');
      return;
    }

    setFormError(null);
    clearMfaError();
    setIsSubmitting(true);

    try {
      if (mfaToken) {
        // Pre-login verification with mfaToken -> logs user in!
        const result = await verifyMfa(mfaToken, code);
        if (result.success) {
          setSuccess(true);
          setStep(3);
        } else {
          setFormError(result.error || 'Invalid verification code');
          setOtp(['', '', '', '', '', '']);
          if (inputRefs.current[0]) inputRefs.current[0].focus();
        }
      } else {
        // Authenticated in-app verification
        const result = await verifyTotpSetup({
          otp: code,
          device_id: deviceId,
        });
        if (result.success) {
          setSuccess(true);
          setStep(3);
        } else {
          setFormError(result.error || 'Invalid verification code');
          setOtp(['', '', '', '', '', '']);
          if (inputRefs.current[0]) inputRefs.current[0].focus();
        }
      }
    } catch (err) {
      console.error('MFA verification error:', err);
      setFormError(err.response?.data?.error || err.message || 'Verification failed');
      setOtp(['', '', '', '', '', '']);
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleCopyCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadCodes = () => {
    const blob = new Blob(
      [
        `Falcon PMS Backup Codes\n\n` +
        `Generated: ${new Date().toISOString()}\n` +
        `User: ${userEmail}\n\n` +
        backupCodes.join('\n') +
        `\n\nKeep these codes safe. Each code can only be used once.`,
      ],
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `falcon-backup-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBack = () => {
    if (step === 1) {
      navigate(mfaToken ? ACCOUNTS_ROUTES.LOGIN : ACCOUNTS_ROUTES.SETTINGS);
    } else if (step === 2) {
      setStep(1);
    }
  };

  const handleFinish = () => {
    navigate(ACCOUNTS_ROUTES.DASHBOARD);
  };

  const renderStep1 = () => (
    <>
      <div className="mfa-setup-info">
        <h2>Choose Device Name</h2>
        <p>Give this authenticator app a memorable label to easily identify it.</p>
      </div>

      <div className="form-group">
        <label className="form-label">Device Name</label>
        <input
          type="text"
          className="form-input"
          value={deviceName}
          onChange={(e) => setDeviceName(e.target.value)}
          placeholder="e.g. Work Phone, Google Authenticator"
          disabled={isLoading}
        />
        <span className="form-hint">E.g., Google Authenticator, 1Password, iPhone</span>
      </div>

      <div className="mfa-setup-actions">
        <button className="auth-btn secondary" onClick={handleBack}>
          Cancel
        </button>
        <button
          className="auth-btn primary"
          onClick={handleSetup}
          disabled={isLoading || !deviceName.trim()}
        >
          {isLoading ? (
            <>
              <span className="spinner-sm" />
              Generating QR Code...
            </>
          ) : (
            'Continue to QR Code'
          )}
        </button>
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <div className="mfa-setup-info">
        <h2>Scan QR Code</h2>
        <p>Scan this QR code in Google Authenticator, Authy, or Microsoft Authenticator.</p>
      </div>

      <div className="mfa-qr-container">
        {qrCodeData && (
          <img
            src={qrCodeData}
            alt="QR Code for MFA setup"
            className="mfa-qr-code"
          />
        )}
        <div className="mfa-secret-wrapper">
          <span className="mfa-secret-label">Manual Secret Key</span>
          <div className="mfa-secret-value">
            <code>{secret}</code>
            <button
              className="mfa-copy-btn"
              onClick={() => {
                navigator.clipboard.writeText(secret);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              title="Copy Secret"
            >
              <FiCopy /> {copied ? 'Copied!' : ''}
            </button>
          </div>
          <span className="mfa-secret-hint">
            If you cannot scan the QR code, enter this key manually into your authenticator app.
          </span>
        </div>
      </div>

      <div className="mfa-verify-section">
        <label className="form-label">Enter 6-digit code from your app</label>
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
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              disabled={isLoading || success}
              autoFocus={index === 0}
            />
          ))}
        </div>
      </div>

      <div className="mfa-setup-actions">
        <button className="auth-btn secondary" onClick={handleBack} disabled={isLoading}>
          Back
        </button>
        <button
          className="auth-btn primary"
          onClick={handleVerify}
          disabled={isLoading || otp.some((d) => d === '')}
        >
          {isLoading ? (
            <>
              <span className="spinner-sm" />
              Verifying...
            </>
          ) : (
            <>
              <FiCheck /> Verify & Activate
            </>
          )}
        </button>
      </div>
    </>
  );

  const renderStep3 = () => (
    <>
      <div className="mfa-setup-info">
        <div className="success-icon-wrapper">
          <FiCheckCircle className="success-icon" />
        </div>
        <h2>MFA Enabled Successfully!</h2>
        <p>Save your backup recovery codes in a safe place. You can use them if you lose access to your phone.</p>
      </div>

      {backupCodes.length > 0 && (
        <div className="mfa-backup-codes-container">
          <div className="backup-codes-grid">
            {backupCodes.map((code, index) => (
              <div key={index} className="backup-code-item">
                <code>{code}</code>
              </div>
            ))}
          </div>

          <div className="backup-codes-actions">
            <button className="auth-btn secondary" onClick={handleCopyCodes}>
              <FiCopy /> {copied ? 'Copied!' : 'Copy Codes'}
            </button>
            <button className="auth-btn secondary" onClick={handleDownloadCodes}>
              <FiDownload /> Download TXT
            </button>
          </div>
        </div>
      )}

      <div className="mfa-setup-actions">
        <button className="auth-btn primary full-width" onClick={handleFinish}>
          Go to Dashboard
        </button>
      </div>
    </>
  );

  return (
    <div className="auth-container">
      <div className="auth-card mfa-setup-card">
        <div className="auth-header">
          <div className="mfa-icon-wrapper">
            <FiShield className="mfa-icon" />
          </div>
          <h1 className="auth-title">Two-Factor Authentication Setup</h1>
          <div className="wizard-progress">
            <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
            <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
            <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</div>
          </div>
        </div>

        {formError && (
          <div className="auth-alert error">
            <FiAlertCircle className="alert-icon" />
            <span>{formError}</span>
          </div>
        )}

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default MFASetupWizard;