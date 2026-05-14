import React from 'react';
import PropTypes from 'prop-types';
import { FiDollarSign, FiFileText, FiCreditCard, FiAlertTriangle } from 'react-icons/fi';

const StatCard = ({ title, value, subValue, icon: Icon, color, onClick }) => (
    <div 
        className={`bg-white rounded-xl border border-gray-200 p-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
        onClick={onClick}
    >
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center`} style={{ backgroundColor: `${color}15` }}>
                <Icon className="w-5 h-5" style={{ color }} />
            </div>
        </div>
    </div>
);
StatCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.node.isRequired,
    subValue: PropTypes.node,
    icon: PropTypes.elementType.isRequired,
    color: PropTypes.string,
    onClick: PropTypes.func,
};

const BillingSummaryCard = ({ summary, onViewInvoices, onViewPayments }) => {
    const defaultColor = '#3B82F6';  
    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return 'KES 0';
        return `KES ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };
    
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Total Billed"
                value={formatCurrency(summary?.total_amount)}
                subValue="Lifetime"
                icon={FiDollarSign}
                color="#10B981"
                onClick={onViewInvoices}
            />
            <StatCard
                title="Outstanding"
                value={formatCurrency(summary?.total_outstanding)}
                subValue={summary?.overdue_count > 0 ? `${summary.overdue_count} overdue` : 'All paid'}
                icon={FiFileText}
                color={summary?.total_outstanding > 0 ? '#F59E0B' : '#6B7280'}
                onClick={onViewInvoices}
            />
            <StatCard
                title="Total Paid"
                value={formatCurrency(summary?.total_paid)}
                subValue="Successful payments"
                icon={FiCreditCard}
                color="#3B82F6"
                onClick={onViewPayments}
            />
            <StatCard
                title="Payment Success Rate"
                value={`${summary?.payment_success_rate || 100}%`}
                subValue={summary?.failed_payments > 0 ? `${summary.failed_payments} failed` : 'No failures'}
                icon={FiAlertTriangle}
                color={summary?.failed_payments > 0 ? '#EF4444' : '#10B981'}
            />
        </div>
    );
};
BillingSummaryCard.propTypes = {
    summary: PropTypes.shape({
        total_amount: PropTypes.number,
        total_paid: PropTypes.number,
        total_outstanding: PropTypes.number,
        overdue_count: PropTypes.number,
        failed_payments: PropTypes.number,
        payment_success_rate: PropTypes.number,
    }),
    onViewInvoices: PropTypes.func,
    onViewPayments: PropTypes.func,
};
export default BillingSummaryCard;