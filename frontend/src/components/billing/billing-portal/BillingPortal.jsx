import React from 'react';
import PropTypes from 'prop-types';
import { BillingOverview } from './BillingOverview';
import { useBillingPortal } from '../../../hooks/billing';

/** Overview dashboard — section nav lives in BillingShell sidebar. */
export const BillingPortal = ({ className = '' }) => {
    const { refresh } = useBillingPortal();

    return (
        <div className={`billing-portal billing-portal--overview ${className}`}>
            <div className="billing-portal-content">
                <BillingOverview onRefresh={refresh} />
            </div>
        </div>
    );
};

BillingPortal.propTypes = {
    className: PropTypes.string,
};

export default BillingPortal;