import React, { useState } from 'react';
import toast from 'react-hot-toast';

const MFASection = ({ mfaEnabled, onToggle, onSetup, onVerify }) => {
  const [showSetup, setShowSetup] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [backupCodes, setBackupCodes] = useState(null);

  const handleEnableMFA = async () => {
    const response = await onSetup();
    if (response) {
      setQrCode(response.qr_code);
      setBackupCodes(response.backup_codes);
      setShowSetup(true);
    }
  };

  const handleVerify = async () => {
    const verified = await onVerify(verificationCode);
    if (verified) {
      toast.success('MFA enabled successfully!');
      setShowSetup(false);
      onToggle(true);
    } else {
      toast.error('Invalid verification code');
    }
  };

  if (mfaEnabled) {
    return (
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-800">✅ MFA is enabled</p>
            <p className="text-xs text-green-600">Your account is protected with multi-factor authentication</p>
          </div>
          <button
            onClick={() => onToggle(false)}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Disable MFA
          </button>
        </div>
      </div>
    );
  }

  if (showSetup && qrCode) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-yellow-800">🔐 Set up MFA</p>
          <p className="text-xs text-yellow-600 mt-1">
            Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
          </p>
        </div>

        <div className="flex justify-center">
          <img src={qrCode} alt="QR Code" className="border p-2 rounded-lg" />
        </div>

        {backupCodes && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Backup Codes</p>
            <p className="text-xs text-gray-500 mb-2">Save these codes in a safe place. You can use them if you lose access to your authenticator.</p>
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, idx) => (
                <code key={idx} className="text-xs font-mono bg-white p-1 rounded text-center">{code}</code>
              ))}
            </div>
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

        <div className="flex space-x-3">
          <button
            onClick={() => setShowSetup(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleVerify}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Verify & Enable
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">🔒 MFA is disabled</p>
          <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
        </div>
        <button
          onClick={handleEnableMFA}
          className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Enable MFA
        </button>
      </div>
    </div>
  );
};

export default MFASection;