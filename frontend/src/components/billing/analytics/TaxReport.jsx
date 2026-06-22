import React from 'react';
import { FiTrendingUp, FiCalendar } from 'react-icons/fi';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import './analytics.css';

export const TaxReport = ({ data = [], totalTax = 0, year = new Date().getFullYear(), loading = false }) => {
    if (loading) return <div className="tax-skeleton"><div className="skeleton skeleton-title"></div><div className="skeleton skeleton-chart"></div></div>;

    const countryBreakdown = data.reduce((acc, item) => { acc[item.country || 'Other'] = (acc[item.country || 'Other'] || 0) + (item.tax || 0); return acc; }, {});

    return (
        <div className="tax-report">
            <div className="tax-header"><h4><FiCalendar /> Tax Report {year}</h4><span className="tax-total">Total Tax Collected: <CurrencyFormatter amount={totalTax} showCents={false} /></span></div>
            <div className="tax-content">
                <div className="tax-table-container">
                    <table className="tax-table">
                        <thead><tr><th>Country</th><th>Tax Rate</th><th>Taxable Amount</th><th>Tax Collected</th></tr></thead>
                        <tbody>
                            {Object.entries(countryBreakdown).map(([country, tax]) => {
                                const taxRate = { KE: 16, NG: 7.5, GH: 12.5, ZA: 15, CI: 18 }[country] || 0;
                                return (<tr key={country}><td>{country}</td><td>{taxRate}%</td><td><CurrencyFormatter amount={tax / (taxRate / 100)} showCents={false} /></td><td><CurrencyFormatter amount={tax} showCents={false} /></td></tr>);
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="tax-summary"><FiTrendingUp /> Tax collected increased by 12% compared to last year</div>
            </div>
        </div>
    );
};

export default TaxReport;