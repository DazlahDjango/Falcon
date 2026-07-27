import React from 'react';

export const ReportScheduleTable = ({ schedules, onToggle, onDelete }) => {
  return (
    <div className="reporting-table-container">
      <table className="reporting-table">
        <thead>
          <tr>
            <th>Schedule Name</th>
            <th>Frequency</th>
            <th>Format</th>
            <th>Status</th>
            <th>Next Execution</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {schedules.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>
                No active report schedules.
              </td>
            </tr>
          ) : (
            schedules.map((item) => (
              <tr key={item.id}>
                <td style={{ fontWeight: 600, color: '#f8fafc' }}>{item.name}</td>
                <td style={{ textTransform: 'capitalize' }}>{item.frequency}</td>
                <td>
                  <span className="reporting-badge reporting-badge-format">
                    {(item.format || 'pdf').toUpperCase()}
                  </span>
                </td>
                <td>
                  <span className={`reporting-badge ${item.is_active ? 'reporting-badge-completed' : 'reporting-badge-failed'}`}>
                    {item.is_active ? 'Active' : 'Paused'}
                  </span>
                </td>
                <td style={{ fontSize: 13, color: '#94a3b8' }}>
                  {item.next_run_at ? new Date(item.next_run_at).toLocaleString() : 'Scheduled'}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="reporting-btn reporting-btn-secondary"
                      style={{ padding: '4px 10px', fontSize: 12 }}
                      onClick={() => onToggle(item.id)}
                    >
                      {item.is_active ? 'Pause' : 'Activate'}
                    </button>
                    {onDelete && (
                      <button
                        className="reporting-btn reporting-btn-danger"
                        style={{ padding: '4px 10px', fontSize: 12 }}
                        onClick={() => onDelete(item.id)}
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

export default ReportScheduleTable;
