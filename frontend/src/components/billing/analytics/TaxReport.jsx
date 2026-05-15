import React from 'react';
import PropTypes from 'prop-types';

export const TaxReport = ({ data, loading, year, onYearChange }) => {
    if (loading) {
        return <div className="tax-report-skeleton">Loading...</div>;
    }

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const monthlyData = data?.monthly_breakdown || [];

    return (
        <div className="tax-report">
            <div className="tax-report-header">
                <h4>Tax Collection Report</h4>
                <select value={year} onChange={(e) => onYearChange(parseInt(e.target.value))}>
                    {years.map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>

            <div className="tax-report-summary">
                <div className="tax-summary-card">
                    <span>Total Tax Collected</span>
                    <strong>KES {((data?.total_tax_collected || 0) / 100).toLocaleString()}</strong>
                </div>
                <div className="tax-summary-card">
                    <span>Tax Rate</span>
                    <strong>{data?.tax_rate || 16}%</strong>
                </div>
            </div>

            <div className="tax-report-table-container">
                <table className="tax-report-table">
                    <thead>
                        <tr>
                            <th>Month</th>
                            <th>Taxable Amount</th>
                            <th>Tax Collected</th>
                            <th>% of Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {monthlyData.map((item) => (
                            <tr key={item.month}>
                                <td>{new Date(0, item.month - 1).toLocaleString('default', { month: 'long' })}</td>
                                <td>KES {((item.taxable_amount || 0) / 100).toLocaleString()}</td>
                                <td>KES {((item.tax || 0) / 100).toLocaleString()}</td>
                                <td>{((item.tax / data.total_tax_collected) * 100).toFixed(1)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {monthlyData.length === 0 && (
                <div className="tax-report-empty">
                    <p>No tax data available for {year}</p>
                </div>
            )}
        </div>
    );
};

TaxReport.propTypes = {
    data: PropTypes.shape({
        total_tax_collected: PropTypes.number,
        tax_rate: PropTypes.number,
        monthly_breakdown: PropTypes.array,
    }),
    loading: PropTypes.bool,
    year: PropTypes.number,
    onYearChange: PropTypes.func,
};

export default TaxReport;