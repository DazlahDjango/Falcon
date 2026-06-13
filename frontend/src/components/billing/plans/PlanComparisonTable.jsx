import React from 'react';
import { FiX, FiCheck } from 'react-icons/fi';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import './plans.css';

export const PlanComparisonTable = ({ plans, onClose }) => {
    const allFeatures = [...new Set(plans.flatMap(p => p.features_list_display || []))];
    const featureCategories = {
        Core: ['Users', 'KPIs', 'Departments', 'Storage'],
        Features: ['Custom Branding', 'API Access', 'SSO Enabled', 'Advanced Analytics', 'Custom Reports', 'Priority Support'],
        Limits: ['Unlimited Users', 'Unlimited KPIs']
    };

    const getFeatureValue = (plan, featureKey) => {
        const featureMap = {
            'Users': plan.max_users === -1 ? 'Unlimited' : `${plan.max_users}`,
            'KPIs': plan.max_kpis === -1 ? 'Unlimited' : `${plan.max_kpis}`,
            'Departments': plan.max_departments === -1 ? 'Unlimited' : `${plan.max_departments}`,
            'Storage': plan.max_storage_mb === -1 ? 'Unlimited' : `${plan.max_storage_mb} MB`,
            'Custom Branding': plan.custom_branding ? <FiCheck className="check-icon" /> : '—',
            'API Access': plan.api_access ? <FiCheck className="check-icon" /> : '—',
            'SSO Enabled': plan.sso_enabled ? <FiCheck className="check-icon" /> : '—',
            'Advanced Analytics': plan.advanced_analytics ? <FiCheck className="check-icon" /> : '—',
            'Custom Reports': plan.custom_reports ? <FiCheck className="check-icon" /> : '—',
            'Priority Support': plan.priority_support ? <FiCheck className="check-icon" /> : '—',
            'Unlimited Users': plan.max_users === -1 ? <FiCheck className="check-icon" /> : '—',
            'Unlimited KPIs': plan.max_kpis === -1 ? <FiCheck className="check-icon" /> : '—'
        };
        return featureMap[featureKey] || (plan.features_list_display?.includes(featureKey) ? <FiCheck className="check-icon" /> : '—');
    };

    return (
        <div className="comparison-modal-overlay" onClick={onClose}>
            <div className="comparison-modal" onClick={(e) => e.stopPropagation()}>
                <div className="comparison-modal-header">
                    <h3>Compare Plans</h3>
                    <button className="close-btn" onClick={onClose}><FiX /></button>
                </div>
                <div className="comparison-modal-body">
                    <div className="comparison-table-wrapper">
                        <table className="comparison-table">
                            <thead>
                                <tr>
                                    <th className="feature-column">Feature</th>
                                    {plans.map(plan => (<th key={plan.id} className={`plan-column ${plan.plan_type}`}><div className="plan-name">{plan.name}</div><div className="plan-price"><CurrencyFormatter amount={plan.price} currency={plan.currency} showCents={false} /><span>/mo</span></div></th>))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="section-header"><td colSpan={plans.length + 1}>Pricing</td></tr>
                                <tr><td className="feature-name">Monthly Price</td>{plans.map(plan => (<td key={plan.id}><CurrencyFormatter amount={plan.price} currency={plan.currency} /></td>))}</tr>
                                <tr><td className="feature-name">Yearly Price</td>{plans.map(plan => (<td key={plan.id}>{plan.yearly_price ? <CurrencyFormatter amount={plan.yearly_price} currency={plan.currency} /> : '—'}</td>))}</tr>

                                <tr className="section-header"><td colSpan={plans.length + 1}>Core Limits</td></tr>
                                <tr><td className="feature-name">Maximum Users</td>{plans.map(plan => (<td key={plan.id}>{plan.max_users === -1 ? 'Unlimited' : plan.max_users}</td>))}</tr>
                                <tr><td className="feature-name">Maximum KPIs</td>{plans.map(plan => (<td key={plan.id}>{plan.max_kpis === -1 ? 'Unlimited' : plan.max_kpis}</td>))}</tr>
                                <tr><td className="feature-name">Maximum Departments</td>{plans.map(plan => (<td key={plan.id}>{plan.max_departments === -1 ? 'Unlimited' : plan.max_departments}</td>))}</tr>
                                <tr><td className="feature-name">Storage</td>{plans.map(plan => (<td key={plan.id}>{plan.max_storage_mb === -1 ? 'Unlimited' : `${plan.max_storage_mb} MB`}</td>))}</tr>

                                <tr className="section-header"><td colSpan={plans.length + 1}>Features</td></tr>
                                <tr><td className="feature-name">Custom Branding</td>{plans.map(plan => (<td key={plan.id}>{plan.custom_branding ? <FiCheck className="check-icon" /> : '—'}</td>))}</tr>
                                <tr><td className="feature-name">API Access</td>{plans.map(plan => (<td key={plan.id}>{plan.api_access ? <FiCheck className="check-icon" /> : '—'}</td>))}</tr>
                                <tr><td className="feature-name">Single Sign-On (SSO)</td>{plans.map(plan => (<td key={plan.id}>{plan.sso_enabled ? <FiCheck className="check-icon" /> : '—'}</td>))}</tr>
                                <tr><td className="feature-name">Advanced Analytics</td>{plans.map(plan => (<td key={plan.id}>{plan.advanced_analytics ? <FiCheck className="check-icon" /> : '—'}</td>))}</tr>
                                <tr><td className="feature-name">Custom Reports</td>{plans.map(plan => (<td key={plan.id}>{plan.custom_reports ? <FiCheck className="check-icon" /> : '—'}</td>))}</tr>
                                <tr><td className="feature-name">Priority Support</td>{plans.map(plan => (<td key={plan.id}>{plan.priority_support ? <FiCheck className="check-icon" /> : '—'}</td>))}</tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="comparison-modal-footer">
                    <button className="close-comparison-btn" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default PlanComparisonTable;