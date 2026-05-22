import api from '../api';
import { API_ENDPOINTS } from '../api/endpoints';

const reportFilename = (report, format, year, month) => {
    const period = year && month
        ? `${year}_${String(month).padStart(2, '0')}`
        : 'current';

    const ext =
        format === 'excel' || format === 'xlsx'
            ? 'xlsx'
            : format === 'pdf'
                ? 'pdf'
                : 'csv';

    return `kpi_${report}_${period}.${ext}`;
};

class ExportService {
    async downloadKpiReport({
        format = 'pdf',
        report = 'performance',
        year,
        month,
    }) {
        const type = format === 'xlsx' ? 'excel' : format;

        const response = await api.get(API_ENDPOINTS.EXPORT.REPORTS, {
            params: {
                type,
                report,
                year,
                month,
            },
            responseType: 'blob',
        });

        const blob = new Blob([response.data]);

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');

        link.href = url;
        link.download = reportFilename(report, type, year, month);

        document.body.appendChild(link);

        link.click();

        link.remove();

        window.URL.revokeObjectURL(url);

        return true;
    }

    async downloadScoreExport(year, month) {
        const response = await api.get(API_ENDPOINTS.EXPORT.SCORES, {
            params: { year, month },
            responseType: 'blob',
        });

        const blob = new Blob([response.data], {
            type: 'text/csv',
        });

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');

        link.href = url;

        link.download = `scores_${year}_${String(month).padStart(2, '0')}.csv`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        window.URL.revokeObjectURL(url);

        return true;
    }
}

export default new ExportService();