import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useMFA } from '../../../hooks/accounts/useMfa';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import QRCode from '../auth/components/QRCode';
import Spinner from '../../common/UI/Spinner';
import { FiCopy, FiCheck } from 'react-icons/fi';

const MFATotpSetup = ({ onSuccess, onCancel }) => {
    const dispatch = useDispatch();
    const { initTotpSetup, completeTotpSetup, totpSetupLoading, totpSetupError } = useMFA();

    const [step, setStep] = useState(1);
    const [setupData, setSetupData] = useState(null);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [copied, setCopied] = useState(false);

    const handleInitSetup = async () => {
        try {
            const data = await initTotpSetup();
            setSetupData(data.data || data);
            setStep(2);
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error || 'Failed to setup TOTP' }));
        }
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            document.getElementById(`totp-input-${index + 1}`)?.focus();
        }
    };

    const handleVerify = async () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            dispatch(showAlert({ type: 'error', message: 'Please enter a valid 6-digit code' }));
            return;
        }

        try {
            await completeTotpSetup(otpCode, setupData?.device_id);
            dispatch(showAlert({ type: 'success', message: 'MFA device verified successfully!' }));

            if (setupData?.backup_codes?.length > 0) {
                setStep(3);
            } else {
                onSuccess();
            }
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error || 'Invalid verification code' }));
        }
    };

    const copyToClipboard = async (text, type) => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        dispatch(showAlert({ type: 'success', message: `${type} copied to clipboard!` }));
    };

    // Step 1: Start setup
    if (step === 1) {
        return (
            <div className="mfa-totp-setup">
                <h3>Set up Authenticator App</h3>
                <p>Add an extra layer of security to your account</p>

                <div className="setup-info">
                    <div className="info-step">
                        <span className="step-number">1</span>
                        <div>
                            <strong>Download an authenticator app</strong>
                            <p>Google Authenticator, Microsoft Authenticator, or Authy</p>
                        </div>
                    </div>
                    <div className="info-step">
                        <span className="step-number">2</span>
                        <div>
                            <strong>Scan QR code or enter secret key</strong>
                            <p>Link the app to your account</p>
                        </div>
                    </div>
                    <div className="info-step">
                        <span className="step-number">3</span>
                        <div>
                            <strong>Enter verification code</strong>
                            <p>Confirm setup by entering the 6-digit code</p>
                        </div>
                    </div>
                </div>

                <div className="setup-actions">
                    <button className="btn btn-primary" onClick={handleInitSetup} disabled={totpSetupLoading}>
                        {totpSetupLoading ? <Spinner size="sm" /> : 'Get Started'}
                    </button>
                    <button className="btn btn-secondary" onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    // Step 2: QR Code and verification
    if (step === 2 && setupData) {
        return (
            <div className="mfa-totp-setup step-2">
                <h3>Scan QR Code</h3>

                <div className="qr-section">
                    <QRCode value={setupData.provisioning_uri || setupData.qr_code_data} size={200} />

                    <div className="secret-section">
                        <p>Can't scan? Enter this code manually:</p>
                        <div className="secret-code">
                            <code>{setupData.secret}</code>
                            <button onClick={() => copyToClipboard(setupData.secret, 'Secret key')}>
                                {copied ? <FiCheck /> : <FiCopy />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="verify-section">
                    <p>Enter the 6-digit code from your authenticator app</p>
                    <div className="otp-inputs">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                id={`totp-input-${index}`}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                className="otp-input"
                                autoComplete="off"
                            />
                        ))}
                    </div>

                    {totpSetupError && (
                        <div className="error-message">{totpSetupError}</div>
                    )}

                    <div className="verify-actions">
                        <button className="btn btn-primary" onClick={handleVerify} disabled={totpSetupLoading}>
                            {totpSetupLoading ? <Spinner size="sm" /> : 'Verify & Enable'}
                        </button>
                        <button className="btn btn-secondary" onClick={() => setStep(1)}>
                            Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Step 3: Backup codes
    return (
        <div className="mfa-totp-setup step-3">
            <h3>Save Your Backup Codes</h3>
            <p>These codes can be used to access your account if you lose your device</p>

            <div className="backup-codes-container">
                <div className="backup-codes-grid">
                    {setupData?.backup_codes?.map((code, index) => (
                        <code key={index} className="backup-code">{code}</code>
                    ))}
                </div>

                <div className="backup-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={() => copyToClipboard(setupData?.backup_codes.join('\n'), 'Backup codes')}
                    >
                        <FiCopy /> Copy All Codes
                    </button>
                </div>

                <div className="warning-message">
                    <strong>⚠️ Important:</strong>
                    <ul>
                        <li>Save these codes in a secure location</li>
                        <li>Each code can only be used once</li>
                        <li>You can generate new codes anytime</li>
                    </ul>
                </div>
            </div>

            <button className="btn btn-primary" onClick={onSuccess}>
                Done
            </button>
        </div>
    );
};

export default MFATotpSetup;