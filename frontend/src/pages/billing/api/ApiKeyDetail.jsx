import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import { FiArrowLeft, FiEdit, FiTrash2, FiEye, FiEyeOff, FiCopy } from 'react-icons/fi';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const mockKey = {
    id: '1',
    name: 'Production Key',
    key: 'fp_live_abc123def456ghi789jkl',
    created_at: '2024-01-15T10:30:00Z',
    last_used: '2024-06-10T14:23:00Z',
    permissions: ['read', 'write'],
    expires_at: '2025-01-15T10:30:00Z',
    active: true,
    usage_stats: {
        total_calls: 15234,
        avg_calls_per_day: 85,
        last_24h: 92,
    },
};

const ApiKeyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showKeyValue, setShowKeyValue] = useState(false);
    const [keyName, setKeyName] = useState(mockKey.name);
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };
    const handleCopyKey = () => {
        navigator.clipboard.writeText(mockKey.key);
    };
    const handleSaveEdit = () => {
        setIsEditing(false);
    };
    const handleDelete = () => {
        setShowDeleteConfirm(false);
        navigate(BILLING_ROUTES.API_KEYS);
    };
    
    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate(BILLING_ROUTES.API_KEYS)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <FiArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={keyName}
                                onChange={(e) => setKeyName(e.target.value)}
                                className="text-2xl font-bold border border-gray-300 rounded-lg px-3 py-1"
                            />
                            <button
                                onClick={handleSaveEdit}
                                className="px-3 py-1 bg-primary-600 text-white rounded-lg text-sm"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setKeyName(mockKey.name);
                                }}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-900">{mockKey.name}</h1>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FiEdit className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    <p className="text-gray-500 mt-1">API Key details and usage statistics</p>
                </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">API Key</p>
                        <div className="flex items-center gap-2 mt-1">
                            <code className="text-sm font-mono">
                                {showKeyValue ? mockKey.key : mockKey.key.substring(0, 30) + '...'}
                            </code>
                            <button
                                onClick={() => setShowKeyValue(!showKeyValue)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                {showKeyValue ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={handleCopyKey}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FiCopy className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Information</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Created</p>
                        <p className="font-medium text-gray-900">{formatDate(mockKey.created_at)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Last Used</p>
                        <p className="font-medium text-gray-900">{formatDate(mockKey.last_used)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Expires</p>
                        <p className="font-medium text-gray-900">{formatDate(mockKey.expires_at)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Permissions</p>
                        <div className="flex gap-1 mt-1">
                            {mockKey.permissions.map(perm => (
                                <span key={perm} className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                                    {perm}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h2>
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{mockKey.usage_stats.total_calls.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">Total API Calls</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{mockKey.usage_stats.avg_calls_per_day}</p>
                        <p className="text-sm text-gray-500">Avg Calls/Day</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{mockKey.usage_stats.last_24h}</p>
                        <p className="text-sm text-gray-500">Last 24 Hours</p>
                    </div>
                </div>
            </div>
            <div className="border border-red-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Danger Zone</h3>
                <p className="text-sm text-red-600 mb-4">
                    Deleting this API key will immediately revoke access for any applications using it.
                </p>
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                    Delete API Key
                </button>
            </div>          
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Delete API Key"
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            >
                <p className="text-gray-600">
                    Are you sure you want to delete the API key "{mockKey.name}"? This action cannot be undone.
                </p>
            </ConfirmDialog>
        </div>
    );
};
export default ApiKeyDetail;