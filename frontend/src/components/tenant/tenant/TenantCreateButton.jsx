// frontend/src/components/tenant/tenant/TenantCreateButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { openModal } from '../../../store/tenant/slice/tenantUISlice';

const TenantCreateButton = ({ 
    variant = 'primary', 
    size = 'md', 
    className = '',
    fullWidth = false,
    showIcon = true,
    text = 'Create Tenant'
}) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleClick = () => {
        // Navigate to create page
        navigate('/tenants/create');
        
        // Or use modal instead (uncomment if you prefer modal)
        // dispatch(openModal({ modalName: 'createTenant', data: null }));
    };

    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500',
        outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <button
            onClick={handleClick}
            className={`
                inline-flex items-center justify-center
                font-medium rounded-lg
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                ${variants[variant]}
                ${sizes[size]}
                ${fullWidth ? 'w-full' : ''}
                ${className}
            `}
        >
            {showIcon && (
                <svg 
                    className="w-5 h-5 mr-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 4v16m8-8H4" 
                    />
                </svg>
            )}
            {text}
        </button>
    );
};

export default TenantCreateButton;