// frontend/src/pages/dashboard/StaffDashboard/PendingTasksPanel.jsx

import React from 'react';
import { DashboardCard } from '../../../components/dashboard/common';

export const PendingTasksPanel = ({ data, loading, onRefresh }) => {
  const tasks = data || [];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getDaysLeft = (dueDate) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    return `${diffDays} days left`;
  };

  const activeTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <DashboardCard 
      title={`Tasks (${activeTasks.length} pending)`}
      loading={loading}
      onRefresh={onRefresh}
    >
      {activeTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <p>No pending tasks</p>
        </div>
      ) : (
        <div className="tasks-list">
          {activeTasks.map((task) => (
            <div key={task.id} className="task-item">
              <div className="task-status">
                <input type="checkbox" />
              </div>
              <div className="task-details">
                <div className="task-title">{task.title}</div>
                <div className="task-meta">
                  <span className="task-priority" style={{ color: getPriorityColor(task.priority) }}>
                    {task.priority}
                  </span>
                  <span className="task-due">
                    🕐 {getDaysLeft(task.due_date)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {completedTasks.length > 0 && (
        <details className="completed-tasks">
          <summary>Completed ({completedTasks.length})</summary>
          {completedTasks.map((task) => (
            <div key={task.id} className="task-item completed">
              <div className="task-status">✓</div>
              <div className="task-details">
                <div className="task-title">{task.title}</div>
              </div>
            </div>
          ))}
        </details>
      )}
    </DashboardCard>
  );
};

export default PendingTasksPanel;