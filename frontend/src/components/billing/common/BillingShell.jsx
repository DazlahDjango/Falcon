import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BillingBreadcrumb } from './BillingBreadcrumb';
import { BillingNavSidebar } from '../billing-portal/BillingNavSidebar';
import { AdminNavSidebar } from '../billing-portal/AdminNavSidebar';
import {
    BILLING_ROUTES,
    BILLING_MINIMAL_CHROME_PATHS,
} from '../../../config/constants/billingRouteConstants';

const isAdminSection = (pathname) => pathname.startsWith(BILLING_ROUTES.ADMIN_BASE);

const isMinimalChrome = (pathname) => BILLING_MINIMAL_CHROME_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
);

export const BillingShell = () => {
    const { pathname } = useLocation();
    const admin = isAdminSection(pathname);
    const minimal = isMinimalChrome(pathname);

    if (minimal) {
        return (
            <div className="billing-shell billing-shell--minimal">
                <div className="billing-shell-minimal-inner">
                    <BillingBreadcrumb />
                    <Outlet />
                </div>
            </div>
        );
    }

    return (
        <div className={`billing-shell ${admin ? 'billing-shell--admin' : ''}`}>
            <aside className="billing-shell-aside">
                {admin ? <AdminNavSidebar /> : <BillingNavSidebar />}
            </aside>
            <div className="billing-shell-main">
                <header className="billing-shell-header">
                    <BillingBreadcrumb />
                </header>
                <div className="billing-shell-body">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default BillingShell;
