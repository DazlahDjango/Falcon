import React from 'react';
import PropTypes from 'prop-types';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';
import { renderBillingIcon } from '../shared/BillingIcons';

export const MRRCard = ({ mrr, previousMrr, loading }) => {
    if (loading) {
        return <div className="mrr-card-skeleton">Loading...</div>;
    }

    const calculateChange = () => {
        if (!previousMrr || previousMrr === 0) return { value: 0, isPositive: true };
        const change = ((mrr - previousMrr) / previousMrr) * 100;
        return {
            value: Math.abs(change).toFixed(1),
            isPositive: change >= 0,
        };
    };

    const change = calculateChange();
    const TrendIcon = change.isPositive ? FiTrendingUp : change.value > 0 ? FiTrendingDown : FiMinus;

    return (
        <div className="mrr-card">
            <div className="mrr-card-header">
                <span className="mrr-card-title">Monthly Recurring Revenue</span>
                <span className="mrr-card-icon">{renderBillingIcon('totalRevenue', { size: 22 })}</span>
            </div>
            <div className="mrr-card-value">
                KES {(mrr / 100).toLocaleString()}
            </div>
            {previousMrr && (
                <div className="mrr-card-change">
                    <TrendIcon size={16} className={change.isPositive ? 'trend-up' : 'trend-down'} />
                    <span className={change.isPositive ? 'text-success' : 'text-error'}>
                        {change.value}% from last month
                    </span>
                </div>
            )}
            <div className="mrr-card-footer">
                <span>Projected Annual: KES {((mrr * 12) / 100).toLocaleString()}</span>
            </div>
        </div>
    );
};

MRRCard.propTypes = {
    mrr: PropTypes.number.isRequired,
    previousMrr: PropTypes.number,
    loading: PropTypes.bool,
};

export default MRRCard;