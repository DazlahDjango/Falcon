import React, { useState } from 'react';
import { useBillingAnalytics } from '../../../hooks/billing';
import { TaxReport } from '../../../components/billing/analytics/TaxReport';
import { BillingLayout } from '../../../components/billing/shared/BillingLayout';
import { LoadingSkeleton } from '../../../components/billing/shared/LoadingSkeleton';

export const TaxReportPage = () => {
    const [year, setYear] = useState(new Date().getFullYear());
    const { taxReport, loading, fetchTaxReport } = useBillingAnalytics();

    React.useEffect(() => {
        fetchTaxReport(year);
    }, [year]);

    if (loading) {
        return (
            <BillingLayout title="Tax Report">
                <LoadingSkeleton type="card" />
            </BillingLayout>
        );
    }

    return (
        <BillingLayout 
            title="Tax Report"
            subtitle="View tax collection details"
            actions={
                <button className="btn-secondary" onClick={() => fetchTaxReport(year)}>
                    Refresh
                </button>
            }
        >
            <TaxReport 
                data={taxReport}
                loading={loading}
                year={year}
                onYearChange={setYear}
            />
        </BillingLayout>
    );
};

export default TaxReportPage;