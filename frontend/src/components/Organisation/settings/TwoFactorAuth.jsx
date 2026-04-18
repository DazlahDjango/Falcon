import React, { useState, useEffect } from 'react';
import { authApi } from '../../../services/organisation';
import toast from 'react-hot-toast';

const TwoFactorAuth = () => {
  const [loading, setLoading] = useState(true);
  const [settingUp, setSettingUp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  useEffect(() => {
    fetchMFAStatus();
  }, []);

  const fetchMFAStatus = async () => {
    try {
      setLoading(true);
      const response = await authApi.getMFAStatus();
      setMfaEnabled(response.data.enabled);
    } catch (error) {
      console.error('Error fetching MFA status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnableMFA = async () => {
    setSettingUp(true);
    try {
      const response = await authApi.setupMFA();
      setQrCode(response.data.qr_code);
      setBackupCodes(response.data.backup_codes);
      setShowSetup(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to setup MFA');
    } finally {
      setSettingUp(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode) {
      toast.error('Please enter verification code');
      return;
    }
    
    setVerifying(true);
    try {
      await authApi.verifyMFA({ code: verificationCode });
      toast.success('MFA enabled successfully');
      setMfaEnabled(true);
      setShowSetup(false);
      setShowBackupCodes(true);
      setVerificationCode('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid verification code');
    } finally {
      setVerifying(false);
    }
  };

  const handleDisableMFA = async () => {
    if (!confirm('Are you sure you want to disable MFA? This will make your account less secure.')) return;
    
    setVerifying(true);
    try {
      await authApi.disableMFA();
      toast.success('MFA disabled successfully');
      setMfaEnabled(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to disable MFA');
    } finally {
      setVerifying(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    setVerifying(true);
    try {
      const response = await authApi.regenerateBackupCodes();
      setBackupCodes(response.data.backup_codes);
      toast.success('New backup codes generated');
      setShowBackupCodes(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to regenerate backup codes');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add an extra layer of security to your account
        </p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {!showSetup && !showBackupCodes && (
          <div className="p-6">
            {mfaEnabled ? (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <p className="text-sm font-medium text-green-800">MFA is enabled</p>
                      <p className="text-xs text-green-600 mt-1">
                        Your account is protected with two-factor authentication
                      </p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleRegenerateBackupCodes}
                  className="w-full px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50"
                >
                  Regenerate Backup Codes
                </button>
                
                <button
                  onClick={handleDisableMFA}
                  disabled={verifying}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {verifying ? 'Disabling...' : 'Disable MFA'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <p className="text-sm font-medium text-yellow-800">MFA is disabled</p>
                      <p className="text-xs text-yellow-600 mt-1">
                        Enable two-factor authentication to protect your account
                      </p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleEnableMFA}
                  disabled={settingUp}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {settingUp ? 'Setting up...' : 'Enable MFA'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Setup Wizard */}
        {showSetup && !showBackupCodes && (
          <div className="p-6 space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
            </div>

            {qrCode && (
              <div className="flex justify-center">
                <img src={qrCode} alt="QR Code" className="border p-2 rounded-lg" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowSetup(false);
                  setQrCode(null);
                  setBackupCodes([]);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                disabled={verifying || !verificationCode}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {verifying ? 'Verifying...' : 'Verify & Enable'}
              </button>
            </div>
          </div>
        )}

        {/* Backup Codes Display */}
        {showBackupCodes && (
          <div className="p-6 space-y-4">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium">Save your backup codes!</p>
              <p className="text-xs text-yellow-600 mt-1">
                These codes can be used to access your account if you lose your authenticator device.
                Store them in a safe place.
              </p>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, idx) => (
                  <code key={idx} className="text-sm font-mono bg-white p-2 rounded text-center">
                    {code}
                  </code>
                ))}
              </div>
            </div>

            <div className="flex justify-between space-x-3">
              <button
                onClick={() => {
                  setShowBackupCodes(false);
                  setShowSetup(false);
                }}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                I've Saved My Codes
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">How it works</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Download an authenticator app (Google Authenticator, Authy, Microsoft Authenticator)</li>
          <li>• Scan the QR code with the app</li>
          <li>• Enter the 6-digit code from the app to verify</li>
          <li>• Save your backup codes in a secure location</li>
        </ul>
      </div>
    </div>
  );
};

export default TwoFactorAuth;