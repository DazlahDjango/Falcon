import React from 'react';
import ReportStatusBadge from '../common/ReportStatusBadge';

export const GeneratedReportTable = ({ reports, onDownload, onDelete }) => {
  return (
    <div className="reporting-table-container">
      <table className="reporting-table">
        <thead>
          <tr>
            <th>Title & Type</th>
            <th>Format</th>
            <th>Status</th>
            <th>Category</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>
                No generated reports found.
              </td>
            </tr>
          ) : (
            reports.map((report) => (
              <tr key={report.id}>
                <td>
                  <div style={{ fontWeight: 600, color: '#f8fafc' }}>{report.title}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{report.report_type}</div>
                </td>
                <td>
                  <span className="reporting-badge reporting-badge-format">
                    {(report.format || 'pdf').toUpperCase()}
                  </span>
                </td>
                <td>
                  <ReportStatusBadge status={report.status} />
                </td>
                <td style={{ textTransform: 'capitalize' }}>{report.category || 'production'}</td>
                <td style={{ fontSize: 13, color: '#94a3b8' }}>
                  {new Date(report.created_at).toLocaleString()}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {report.status === 'completed' && (
                      <button
                        className="reporting-btn reporting-btn-primary"
                        style={{ padding: '4px 10px', fontSize: 12 }}
                        onClick={() => onDownload(report.id, `${report.report_type}.${report.format}`)}
                      >
                        Download
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className="reporting-btn reporting-btn-danger"
                        style={{ padding: '4px 10px', fontSize: 12 }}
                        onClick={() => onDelete(report.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default GeneratedReportTable;
