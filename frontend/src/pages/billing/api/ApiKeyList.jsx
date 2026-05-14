import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import { FiPlus, FiKey, FiTrash2, FiCopy, FiEye, FiEyeOff } from 'react-icons/fi';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const mockApiKeys = [
    { id: '1', name: 'Production Key', key: 'fp_live_abc123...xyz', created_at: '2024-01-15', last_used: '2024-06-10', active: true },
    { id: '2', name: 'Development Key', key: 'fp_test_def456...uvw', created_at: '2024-02-20', last_used: '2024-06-09', active: true },
];

const ApiKeyList = () => {
    const navigate = useNavigate();
    const [apiKeys, setApiKeys] = useState(mockApiKeys);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [showNewKey, setShowNewKey] = useState(null);
    const [showKeyValue, setShowKeyValue] = useState({});
    
    const handleCreateKey = () => {
        const newKey = {
            id: Date.now().toString(),
            name: 'New API Key',
            key: `fp_live_${Math.random().toString(36).substring(2, 15)}`,
            created_at: new Date().toISOString().split('T')[0],
            last_used: null,
            active: true,
        };
        setApiKeys([newKey, ...apiKeys]);
        setShowNewKey(newKey.key);
        setTimeout(() => setShowNewKey(null), 10000);
    };
    const handleDeleteKey = () => {
        if (deleteTarget) {
            setApiKeys(apiKeys.filter(k => k.id !== deleteTarget));
            setShowDeleteConfirm(false);
            setDeleteTarget(null);
        }
    };
    const handleCopyKey = (key) => {
        navigator.clipboard.writeText(key);
    };
    const toggleShowKey = (id) => {
        setShowKeyValue(prev => ({ ...prev, [id]: !prev[id] }));
    };
    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString();
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
                    <p className="text-gray-500 mt-1">Manage API keys for programmatic access to Falcon PMS</p>
                </div>
                <button
                    onClick={handleCreateKey}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                    <FiPlus className="w-5 h-5" />
                    Create API Key
                </button>
            </div>
            {showNewKey && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-800">New API Key Created</p>
                            <p className="text-sm text-green-700 mt-1">
                                Make sure to copy your new API key now. You won't be able to see it again!
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                                <code className="px-3 py-1 bg-white rounded-lg text-sm font-mono">
                                    {showNewKey}
                                </code>
                                <button
                                    onClick={() => handleCopyKey(showNewKey)}
                                    className="text-green-700 hover:text-green-900"
                                >
                                    <FiCopy className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowNewKey(null)}
                            className="text-green-700 hover:text-green-900"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
            {apiKeys.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <FiKey className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No API Keys</h3>
                    <p className="text-gray-500 mb-4">Create your first API key to start using the Falcon PMS API.</p>
                    <button
                        onClick={handleCreateKey}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        Create API Key
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">API Key</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Used</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {apiKeys.map((key) => (
                                <tr key={key.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-gray-900">{key.name}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <code className="text-sm font-mono text-gray-600">
                                                {showKeyValue[key.id] ? key.key : key.key.substring(0, 20) + '...'}
                                            </code>
                                            <button
                                                onClick={() => toggleShowKey(key.id)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                {showKeyValue[key.id] ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleCopyKey(key.key)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <FiCopy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(key.created_at)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(key.last_used)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => {
                                                setDeleteTarget(key.id);
                                                setShowDeleteConfirm(true);
                                            }}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <FiTrash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                    📚 Need help with the API? Check out our <a href="/docs/api" className="text-blue-700 font-medium hover:underline">API Documentation</a>
                </p>
            </div>
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(false);
                    setDeleteTarget(null);
                }}
                onConfirm={handleDeleteKey}
                title="Delete API Key"
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            >
                <p className="text-gray-600">
                    Are you sure you want to delete this API key? Any applications using this key will lose access immediately.
                </p>
            </ConfirmDialog>
        </div>
    );
};
export default ApiKeyList;