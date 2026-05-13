import React from 'react';
import PropTypes from 'prop-types';
import { 
    CreditCardIcon, 
    BanknotesIcon, 
    DevicePhoneMobileIcon,
    CheckCircleIcon,
    TrashIcon,
    StarIcon 
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const getMethodIcon = (methodType) => {
    switch (methodType) {
        case 'card':
            return CreditCardIcon;
        case 'bank_account':
            return BanknotesIcon;
        case 'mobile_money':
            return DevicePhoneMobileIcon;
        default:
            return CreditCardIcon;
    }
};
const getCardBrandLogo = (brand) => {
    const logos = {
        visa: '/assets/images/payment/visa.svg',
        mastercard: '/assets/images/payment/mastercard.svg',
        amex: '/assets/images/payment/amex.svg',
        discover: '/assets/images/payment/discover.svg',
    };
    return logos[brand.toLowerCase()] || null;
};
const PaymentMethodCard = ({ 
    method, 
    isDefault, 
    onSetDefault, 
    onDelete,
    showActions = true,
}) => {
    const IconComponent = getMethodIcon(method.method_type);
    const isExpiring = method.is_expiring_soon;
    const brandLogo = method.method_type === 'card' ? getCardBrandLogo(method.brand) : null;
    const formatExpiry = () => {
        if (!method.exp_month || !method.exp_year) return null;
        return `${method.exp_month.toString().padStart(2, '0')}/${method.exp_year}`;
    };

    return (
        <div className={`border rounded-xl p-4 transition-all ${
            isDefault ? 'border-primary-300 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
        }`}>
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg">
                        {brandLogo ? (
                            <img src={brandLogo} alt={method.brand} className="w-8 h-8 object-contain" />
                        ) : (
                            <IconComponent className="w-6 h-6 text-gray-500" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">
                                {method.method_type === 'card' 
                                    ? `${method.brand?.toUpperCase()} •••• ${method.last4}`
                                    : method.method_type === 'mobile_money'
                                        ? `${method.provider || 'Mobile Money'} •••• ${method.phone_number?.slice(-4)}`
                                        : method.billing_name || 'Payment Method'
                                }
                            </p>
                            {isDefault && (
                                <span className="inline-flex items-center gap-0.5 text-xs text-primary-700 bg-primary-100 px-2 py-0.5 rounded-full">
                                    <StarSolidIcon className="w-3 h-3" />
                                    Default
                                </span>
                            )}
                            {isExpiring && (
                                <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                                    Expiring soon
                                </span>
                            )}
                        </div>  
                        <div className="flex gap-3 mt-1 text-sm text-gray-500">
                            {method.billing_email && (
                                <span>{method.billing_email}</span>
                            )}
                            {method.method_type === 'card' && formatExpiry() && (
                                <span>Expires {formatExpiry()}</span>
                            )}
                        </div>
                    </div>
                </div>
                {showActions && (
                    <div className="flex items-center gap-2">
                        {!isDefault && (
                            <button
                                onClick={() => onSetDefault?.(method.id)}
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Set as Default
                            </button>
                        )}
                        <button
                            onClick={() => onDelete?.(method.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

PaymentMethodCard.propTypes = {
    method: PropTypes.shape({
        id: PropTypes.string.isRequired,
        method_type: PropTypes.string.isRequired,
        last4: PropTypes.string,
        brand: PropTypes.string,
        exp_month: PropTypes.number,
        exp_year: PropTypes.number,
        billing_email: PropTypes.string,
        billing_name: PropTypes.string,
        provider: PropTypes.string,
        phone_number: PropTypes.string,
        is_default: PropTypes.bool,
        is_expiring_soon: PropTypes.bool,
    }).isRequired,
    isDefault: PropTypes.bool,
    onSetDefault: PropTypes.func,
    onDelete: PropTypes.func,
    showActions: PropTypes.bool,
};
PaymentMethodCard.defaultProps = {
    isDefault: false,
    showActions: true,
};
export default PaymentMethodCard;