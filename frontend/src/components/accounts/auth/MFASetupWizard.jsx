import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

export const MFASetupWizard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setupTotp, verifyTotpSetup, isLoading, error, clearMfaError, backupCodes } = useMFA();

  const [step, setStep] = useState(1);
  const [deviceName, setDeviceName] = useState('Authenticator');
  const [secret, setSecret] = useState('');
  const [provisioningUri, setProvisioningUri] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [codesRevealed, setCodesRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (error) {
      setFormError(error);
    }
  }, [error]);

  const handleSetup = async () => {
    setFormError(null);
    clearMfaError();

    const result = await setupTotp({ device_name: deviceName });

    if (result.data) {
      setSecret(result.data.secret);
      setProvisioningUri(result.data.provisioning_uri);
      setQrCodeData(result.data.qr_code_data);
      setDeviceId(result.data.device_id);
      setStep(2);
    } else {
      setFormError(result.error || 'Failed to setup MFA');
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
      inputRefs.current[0].focus();
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
        `User: ${user?.email}\n\n` +
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
      navigate(ACCOUNTS_ROUTES.MFA_DEVICES);
    } else {
      setStep(step - 1);
    }
  };

  const handleDone = () => {
    navigate(ACCOUNTS_ROUTES.MFA_DEVICES);
  };

  const renderStep1 = () => (
    <>
      <div className="mfa-setup-info">
        <div className="mfa-setup-icon-wrapper">
          <FiShield className="mfa-setup-icon" />
        </div>
        <h2>Set up Two-Factor Authentication</h2>
        <p>
          Add an extra layer of security to your account by requiring a
          verification code from your authenticator app.
        </p>
        <ul className="mfa-setup-list">
          <li>
            <FiSmartphone />
            <span>Install an authenticator app like Google Authenticator or Authy</span>
          </li>
          <li>
            <FiKey />
            <span>Scan the QR code or enter the secret key manually</span>
          </li>
          <li>
            <FiCheck />
            <span>Enter the 6-digit code from the app to verify</span>
          </li>
        </ul>
      </div>

      <div className="form-group">
        <label htmlFor="deviceName" className="form-label">
          Device Name
        </label>
        <input
          id="deviceName"
          type="text"
          className="form-input"
          placeholder="e.g., Google Authenticator"
          value={deviceName}
          onChange={(e) => setDeviceName(e.target.value)}
        />
        <span className="form-hint">Give your device a name for easy identification</span>
      </div>

      <div className="mfa-setup-actions">
        <button className="auth-btn secondary" onClick={handleBack}>
          Cancel
        </button>
        <button
          className="auth-btn primary"
          onClick={handleSetup}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner-sm" />
              Generating...
            </>
          ) : (
            'Continue'
          )}
        </button>
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <div className="mfa-setup-info">
        <h2>Scan QR Code</h2>
        <p>Scan the QR code with your authenticator app</p>
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
          <span className="mfa-secret-label">Secret Key</span>
          <div className="mfa-secret-value">
            <code>{secret}</code>
            <button
              className="mfa-copy-btn"
              onClick={() => {
                navigator.clipboard.writeText(secret);
              }}
            >
              <FiCopy />
            </button>
          </div>
          <span className="mfa-secret-hint">
            If you can't scan the QR code, enter this key manually in your app
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
              disabled={isLoading}
              autoFocus={index === 0}
            />
          ))}
        </div>
        {formError && (
          <span className="form-error">{formError}</span>
        )}
      </div>

      <div className="mfa-setup-actions">
        <button className="auth-btn secondary" onClick={handleBack}>
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
            'Verify & Continue'
          )}
        </button>
      </div>
    </>
  );

  const renderStep3 = () => (
    <>
      <div className="mfa-setup-success">
        <FiCheckCircle className="success-icon" />
        <h2>MFA Enabled Successfully!</h2>
        <p>Your account is now protected with two-factor authentication.</p>
      </div>

      <div className="mfa-backup-codes">
        <h3>Backup Codes</h3>
        <p className="backup-codes-info">
          Save these backup codes in a secure place. Each code can only be used once.
          You can use them to access your account if you lose your authenticator device.
        </p>

        <div className="backup-codes-grid">
          {backupCodes.map((code, index) => (
            <div key={index} className="backup-code-item">
              <span className="backup-code-number">{index + 1}.</span>
              <code className="backup-code-value">{code}</code>
            </div>
          ))}
        </div>

        <div className="backup-codes-actions">
          <button
            className="auth-btn secondary"
            onClick={handleCopyCodes}
          >
            <FiCopy /> {copied ? 'Copied!' : 'Copy Codes'}
          </button>
          <button
            className="auth-btn secondary"
            onClick={handleDownloadCodes}
          >
            <FiDownload /> Download
          </button>
        </div>

        <div className="backup-codes-warning">
          <FiAlertCircle />
          <span>
            These codes will only be shown once. Make sure to save them before continuing.
          </span>
        </div>
      </div>

      <div className="mfa-setup-actions">
        <button className="auth-btn primary" onClick={handleDone}>
          Done
        </button>
      </div>
    </>
  );

  return (
    <div className="auth-container">
      <div className="auth-card mfa-setup-card">
        <button className="auth-back-btn" onClick={handleBack}>
          <FiArrowLeft /> {step === 1 ? 'Back to Security' : 'Back'}
        </button>

        <div className="mfa-setup-progress">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Setup</span>
          </div>
          <div className={`progress-line ${step >= 2 ? 'active' : ''}`} />
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Verify</span>
          </div>
          <div className={`progress-line ${step >= 3 ? 'active' : ''}`} />
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Complete</span>
          </div>
        </div>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
};
export default MFASetupWizard;