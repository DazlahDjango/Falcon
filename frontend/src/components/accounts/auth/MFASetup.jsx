import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import MFASetupForm from './components/MFASetupForm';
import QRCode from './components/QRCode';
import { setupMfa, verifyMfaSetup, disableMfa } from '../../../store/accounts/slice/authSlice';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import Spinner from '../../common/UI/Spinner';

const MFASetup = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, isLoading } = useSelector((state) => state.auth);
    const [step, setStep] = useState(1);
    const [setupData, setSetupData] = useState(null);
    const [backupCodes, setBackupCodes] = useState([]);
    useEffect(() => {
        if (user?.mfa_enabled) {
            navigate('/security');
        }
    }, [user, navigate]);
    const handleSetup = async () => {
        try {
            const result = await dispatch(setupMfa()).unwrap();
            setSetupData(result);
            setBackupCodes(result.backup_codes);
            setStep(2);
        } catch (err) {
            dispatch(showAlert({ type: 'error', message: err.message || 'MFA setup failed' }));
        }
    };
    const handleVerify = async (otp) => {
        try {
            await dispatch(verifyMfaSetup({ otp, device_id: setupData?.device_id })).unwrap();
            dispatch(showAlert({ type: 'success', message: 'MFA enabled successfully!' }));
            navigate('/security');
        } catch (err) {
            dispatch(showAlert({ type: 'error', message: err.message || 'Invalid verification code' }));
        }
    };
    const handleSkip = async () => {
        if (window.confirm('Are you sure you want to skip MFA Setup? You can enable it later from security settings')) {
            navigate('/dashboard');
        }
    };
    if (step === 1) {
        return (
            <div className="auth-page mfa-setup-page">
                <div className="auth-header-text">
                    <h2>Secure Your Account</h2>
                    <p>Enable two-factor authentication for extra security</p>
                </div>
                
                <div className="mfa-setup-intro">
                    <div className="mfa-benefits">
                        <h3>Why enable MFA?</h3>
                        <ul>
                            <li>✓ Extra layer of security for your account</li>
                            <li>✓ Protects against unauthorized access</li>
                            <li>✓ Required for admin and executive roles</li>
                        </ul>
                    </div>
                    
                    <div className="mfa-setup-actions">
                        <button 
                            className="btn btn-primary btn-lg"
                            onClick={handleSetup}
                            disabled={isLoading}
                        >
                            {isLoading ? <Spinner size="sm" /> : 'Get Started'}
                        </button>
                        <button 
                            className="btn btn-secondary"
                            onClick={handleSkip}
                        >
                            Skip for now
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="auth-page mfa-setup-page">
            <div className="auth-header-text">
                <h2>Setup Authenticator App</h2>
                <p>Scan the QR code with your authenticator app</p>
            </div>
            
            <div className="mfa-setup-content">
                <div className="qr-code-section">
                    <QRCode 
                        value={setupData?.qr_code_data} 
                        size={200}
                        label="Scan with Google Authenticator, Microsoft Authenticator, or any TOTP app"
                    />
                    <div className="secret-key">
                        <p>Or enter this key manually:</p>
                        <code>{setupData?.secret}</code>
                        <button 
                            className="btn-copy" 
                            onClick={() => {
                                navigator.clipboard.writeText(setupData?.secret);
                                dispatch(showAlert({ type: 'success', message: 'Secret copied!' }));
                            }}
                        >
                            Copy
                        </button>
                    </div>
                </div>
                
                <div className="verify-section">
                    <MFASetupForm onSubmit={handleVerify} isLoading={isLoading} />
                </div>
                
                {backupCodes.length > 0 && (
                    <div className="backup-codes-section">
                        <h3>Backup Codes</h3>
                        <p>Save these backup codes in a secure place. You can use them if you lose access to your authenticator app.</p>
                        <div className="backup-codes-grid">
                            {backupCodes.map((code, index) => (
                                <code key={index} className="backup-code">{code}</code>
                            ))}
                        </div>
                        <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                                navigator.clipboard.writeText(backupCodes.join('\n'));
                                dispatch(showAlert({ type: 'success', message: 'Backup codes copied!' }));
                            }}
                        >
                            Copy all codes
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
export default MFASetup;